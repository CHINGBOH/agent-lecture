from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any

from .trace import TraceRecorder, extract_quality_gate_summary, parse_tool_result_payload
from .tools import JsonDict, ToolRegistry, ToolSpec, extract_json_object, to_json_text, validate_schema


@dataclass
class Message:
    role: str
    content: str | None = None
    name: str | None = None
    tool_call_id: str | None = None
    tool_calls: list[JsonDict] | None = None

    def to_dict(self) -> JsonDict:
        payload: JsonDict = {"role": self.role}
        if self.content is not None or self.tool_calls is not None:
            payload["content"] = self.content
        if self.name is not None:
            payload["name"] = self.name
        if self.tool_call_id is not None:
            payload["tool_call_id"] = self.tool_call_id
        if self.tool_calls is not None:
            payload["tool_calls"] = self.tool_calls
        return payload


@dataclass
class ParsedToolCall:
    id: str
    name: str
    arguments: JsonDict
    origin: str


@dataclass
class ChatExchange:
    body: JsonDict
    request_payload: JsonDict
    response_ms: int
    fallback_used: bool


class LlamaCppClient:
    def __init__(self, base_url: str, model: str, timeout: int = 180) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def _post(self, payload: JsonDict) -> JsonDict:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(
            f"{self.base_url}/v1/chat/completions",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=self.timeout) as response:
            return json.loads(response.read().decode("utf-8"))

    def chat(self, messages: list[Message], tools: list[ToolSpec] | None = None) -> ChatExchange:
        started_at = time.time()
        payload: JsonDict = {
            "model": self.model,
            "messages": [message.to_dict() for message in messages],
            "temperature": 0.1,
            "max_tokens": 1200,
            "stream": False,
        }

        if tools:
            payload["tools"] = [tool.to_openai_tool() for tool in tools]
            payload["tool_choice"] = "auto"

        try:
            body = self._post(payload)
            return ChatExchange(
                body=body,
                request_payload=json.loads(json.dumps(payload, ensure_ascii=False)),
                response_ms=int((time.time() - started_at) * 1000),
                fallback_used=False,
            )
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            lowered = detail.lower()
            if tools and ("tool" in lowered or "function" in lowered or "schema" in lowered):
                payload.pop("tools", None)
                payload.pop("tool_choice", None)
                body = self._post(payload)
                return ChatExchange(
                    body=body,
                    request_payload=json.loads(json.dumps(payload, ensure_ascii=False)),
                    response_ms=int((time.time() - started_at) * 1000),
                    fallback_used=True,
                )
            raise RuntimeError(f"llama.cpp HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"cannot reach llama.cpp server at {self.base_url}: {exc}") from exc


class ContextCompactor:
    def __init__(self, client: LlamaCppClient, max_chars: int = 24000, keep_last: int = 8) -> None:
        self.client = client
        self.max_chars = max_chars
        self.keep_last = keep_last

    def maybe_compact(self, messages: list[Message]) -> list[Message]:
        total = sum(len(json.dumps(message.to_dict(), ensure_ascii=False)) for message in messages)
        if total <= self.max_chars or len(messages) <= self.keep_last + 2:
            return messages

        older = messages[1:-self.keep_last]
        recent = messages[-self.keep_last:]
        summary_request = [
            Message(
                role="system",
                content=(
                    "Summarize earlier conversation for continued coding-agent execution. "
                    "Keep only user goal, files touched, tool outcomes, errors, constraints, and unresolved work."
                ),
            ),
            Message(role="user", content=to_json_text([message.to_dict() for message in older])),
        ]
        exchange = self.client.chat(summary_request, tools=None)
        text = exchange.body["choices"][0]["message"].get("content", "").strip() or "No summary."
        return [messages[0], Message(role="assistant", content=f"Earlier summary:\n{text}"), *recent]


def build_system_prompt(tools: list[ToolSpec]) -> str:
    blocks = []
    for tool in tools:
        blocks.append(
            "\n".join(
                [
                    f"TOOL: {tool.name}",
                    f"DESCRIPTION: {tool.description}",
                    f"SCHEMA: {json.dumps(tool.parameters, ensure_ascii=False)}",
                ]
            )
        )

    return "\n\n".join(
        [
            "You are a local coding agent running on the user's machine.",
            "Use tools when filesystem or verification state matters.",
            "Prefer small safe edits, then focused validation.",
            "If native tool calling is supported, use it.",
            'If native tool calling is not supported, and you need a tool, reply with exactly one JSON object:',
            '{"type":"tool_call","name":"<tool_name>","arguments":{...}}',
            "Do not wrap tool JSON in markdown fences.",
            "When the task is complete, answer in normal Chinese.",
            "Available tools:",
            "\n\n".join(blocks),
        ]
    )


def parse_assistant_response(body: JsonDict) -> tuple[Message, list[ParsedToolCall], str]:
    choices = body.get("choices") or []
    if not choices:
        raise RuntimeError(f"unexpected model response: {body}")

    payload = choices[0].get("message") or {}
    content = payload.get("content") or ""
    if not isinstance(content, str):
        content = to_json_text(content)

    native_calls = payload.get("tool_calls") or []
    parsed_calls: list[ParsedToolCall] = []

    for index, call in enumerate(native_calls):
        function_payload = call.get("function") or {}
        raw_arguments = function_payload.get("arguments") or "{}"
        arguments = json.loads(raw_arguments) if isinstance(raw_arguments, str) else raw_arguments
        if not isinstance(arguments, dict):
            raise RuntimeError("tool arguments must decode to an object")
        parsed_calls.append(
            ParsedToolCall(
                id=call.get("id") or f"call_{int(time.time() * 1000)}_{index}",
                name=function_payload.get("name", ""),
                arguments=arguments,
                origin="native",
            )
        )

    if parsed_calls:
        return Message(role="assistant", content=content, tool_calls=native_calls), parsed_calls, content

    maybe_json = extract_json_object(content)
    if maybe_json and maybe_json.get("type") == "tool_call":
        arguments = maybe_json.get("arguments", {})
        if not isinstance(arguments, dict):
            raise RuntimeError("fallback tool_call.arguments must be an object")
        parsed = ParsedToolCall(
            id=f"json_{int(time.time() * 1000)}",
            name=str(maybe_json.get("name", "")),
            arguments=arguments,
            origin="json",
        )
        return Message(role="assistant", content=content), [parsed], content

    return Message(role="assistant", content=content), [], content


class HandmadeCodingAgent:
    def __init__(
        self,
        client: LlamaCppClient,
        registry: ToolRegistry,
        max_steps: int = 10,
        verbose: bool = True,
        tracer: TraceRecorder | None = None,
    ) -> None:
        self.client = client
        self.registry = registry
        self.max_steps = max_steps
        self.verbose = verbose
        self.tracer = tracer
        self.compactor = ContextCompactor(client)
        self.messages = [Message(role="system", content=build_system_prompt(registry.list()))]

    def _execute_tool(self, tool_call: ParsedToolCall) -> str:
        tool = self.registry.get(tool_call.name)
        if tool is None:
            return to_json_text({"ok": False, "error": f"unknown tool: {tool_call.name}"})
        try:
            validate_schema(tool_call.arguments, tool.parameters)
            result = tool.handler(**tool_call.arguments)
            return to_json_text({"ok": True, "tool": tool_call.name, "result": result})
        except Exception as exc:
            return to_json_text({"ok": False, "tool": tool_call.name, "error": str(exc)})

    def ask(self, user_text: str) -> str:
        run_id = self.tracer.new_run_id() if self.tracer else None
        run_started_at = time.time()

        try:
            if self.tracer and run_id:
                self.tracer.record(
                    "run_started",
                    run_id=run_id,
                    prompt=user_text,
                    max_steps=self.max_steps,
                    tool_names=[tool.name for tool in self.registry.list()],
                )

            before_compaction = len(self.messages)
            self.messages = self.compactor.maybe_compact(self.messages)
            if self.tracer and run_id and len(self.messages) != before_compaction:
                self.tracer.record(
                    "context_compacted",
                    run_id=run_id,
                    before_messages=before_compaction,
                    after_messages=len(self.messages),
                )

            self.messages.append(Message(role="user", content=user_text))

            for step in range(1, self.max_steps + 1):
                cached_tool_results: dict[str, tuple[str, str]] = {}
                exchange = self.client.chat(self.messages, self.registry.list())
                if self.tracer and run_id:
                    self.tracer.record(
                        "llm_request",
                        run_id=run_id,
                        step=step,
                        fallback_used=exchange.fallback_used,
                        request=exchange.request_payload,
                    )
                    self.tracer.record(
                        "llm_response",
                        run_id=run_id,
                        step=step,
                        response_ms=exchange.response_ms,
                        response=exchange.body,
                    )

                assistant_message, tool_calls, raw_content = parse_assistant_response(exchange.body)
                self.messages.append(assistant_message)

                if self.verbose:
                    preview = raw_content if raw_content else "<tool_call>"
                    print(f"[step {step}] assistant -> {preview[:400]}", file=sys.stderr)

                if not tool_calls:
                    if self.tracer and run_id:
                        self.tracer.record(
                            "final_answer",
                            run_id=run_id,
                            step=step,
                            answer=raw_content.strip(),
                        )
                        self.tracer.record(
                            "run_finished",
                            run_id=run_id,
                            status="completed",
                            duration_ms=int((time.time() - run_started_at) * 1000),
                        )
                    return raw_content.strip()

                for tool_call in tool_calls:
                    args_text = json.dumps(tool_call.arguments, ensure_ascii=False, sort_keys=True)
                    tool_signature = f"{tool_call.origin}:{tool_call.name}:{args_text}"
                    if tool_signature in cached_tool_results:
                        reused_from_tool_call_id, result_text = cached_tool_results[tool_signature]
                        if self.tracer and run_id:
                            self.tracer.record(
                                "tool_call_duplicate",
                                run_id=run_id,
                                step=step,
                                tool_name=tool_call.name,
                                tool_call_id=tool_call.id,
                                origin=tool_call.origin,
                                arguments=tool_call.arguments,
                                reused_from_tool_call_id=reused_from_tool_call_id,
                            )
                        if self.verbose:
                            print(
                                f"[step {step}] tool ~= {tool_call.name} {args_text} (reused {reused_from_tool_call_id})",
                                file=sys.stderr,
                            )

                        if tool_call.origin == "native":
                            self.messages.append(Message(role="tool", tool_call_id=tool_call.id, content=result_text))
                        else:
                            self.messages.append(
                                Message(
                                    role="user",
                                    content=(
                                        f"TOOL RESULT for {tool_call.name}:\n{result_text}\n\n"
                                        "If another tool is needed, output JSON only. Otherwise answer normally."
                                    ),
                                )
                            )
                        continue

                    if self.tracer and run_id:
                        self.tracer.record(
                            "tool_call",
                            run_id=run_id,
                            step=step,
                            tool_name=tool_call.name,
                            tool_call_id=tool_call.id,
                            origin=tool_call.origin,
                            arguments=tool_call.arguments,
                        )

                    result_text = self._execute_tool(tool_call)
                    cached_tool_results[tool_signature] = (tool_call.id, result_text)
                    result_payload = parse_tool_result_payload(result_text)
                    if self.tracer and run_id:
                        self.tracer.record(
                            "tool_result",
                            run_id=run_id,
                            step=step,
                            tool_name=tool_call.name,
                            tool_call_id=tool_call.id,
                            origin=tool_call.origin,
                            result=result_payload,
                        )
                        quality_gate_summary = extract_quality_gate_summary(result_payload)
                        if quality_gate_summary is not None:
                            self.tracer.record(
                                "quality_gate",
                                run_id=run_id,
                                step=step,
                                tool_call_id=tool_call.id,
                                summary=quality_gate_summary,
                            )

                    if self.verbose:
                        print(f"[step {step}] tool -> {tool_call.name} {args_text}", file=sys.stderr)
                        print(f"[step {step}] tool <- {result_text[:400]}", file=sys.stderr)

                    if tool_call.origin == "native":
                        self.messages.append(Message(role="tool", tool_call_id=tool_call.id, content=result_text))
                    else:
                        self.messages.append(
                            Message(
                                role="user",
                                content=(
                                    f"TOOL RESULT for {tool_call.name}:\n{result_text}\n\n"
                                    "If another tool is needed, output JSON only. Otherwise answer normally."
                                ),
                            )
                        )

            raise RuntimeError(f"max_steps={self.max_steps} reached")
        except Exception as exc:
            if self.tracer and run_id:
                self.tracer.record(
                    "run_failed",
                    run_id=run_id,
                    error=str(exc),
                    duration_ms=int((time.time() - run_started_at) * 1000),
                )
            raise
