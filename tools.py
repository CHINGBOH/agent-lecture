from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

JsonDict = dict[str, Any]
ToolHandler = Callable[..., Any]


class SchemaValidationError(ValueError):
    pass


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def to_jsonable(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, Path):
        return str(value)
    if isinstance(value, list):
        return [to_jsonable(item) for item in value]
    if isinstance(value, dict):
        return {str(key): to_jsonable(item) for key, item in value.items()}
    return str(value)


def to_json_text(value: Any) -> str:
    return json.dumps(to_jsonable(value), ensure_ascii=False, indent=2)


def validate_schema(value: Any, schema: JsonDict, path: str = "$") -> None:
    schema_type = schema.get("type")

    if schema_type == "object":
        if not isinstance(value, dict):
            raise SchemaValidationError(f"{path} must be an object")

        properties = schema.get("properties", {})
        required = schema.get("required", [])
        allow_extra = schema.get("additionalProperties", True)

        for key in required:
            if key not in value:
                raise SchemaValidationError(f"{path}.{key} is required")

        if allow_extra is False:
            extras = set(value.keys()) - set(properties.keys())
            if extras:
                raise SchemaValidationError(
                    f"{path} has unsupported keys: {', '.join(sorted(extras))}"
                )

        for key, sub_schema in properties.items():
            if key in value:
                validate_schema(value[key], sub_schema, f"{path}.{key}")
        return

    if schema_type == "array":
        if not isinstance(value, list):
            raise SchemaValidationError(f"{path} must be an array")
        item_schema = schema.get("items")
        if item_schema:
            for index, item in enumerate(value):
                validate_schema(item, item_schema, f"{path}[{index}]")
        return

    if schema_type == "string":
        if not isinstance(value, str):
            raise SchemaValidationError(f"{path} must be a string")
        enum_values = schema.get("enum")
        if enum_values is not None and value not in enum_values:
            raise SchemaValidationError(f"{path} must be one of {enum_values}")
        return

    if schema_type == "integer":
        if not isinstance(value, int) or isinstance(value, bool):
            raise SchemaValidationError(f"{path} must be an integer")
        minimum = schema.get("minimum")
        maximum = schema.get("maximum")
        if minimum is not None and value < minimum:
            raise SchemaValidationError(f"{path} must be >= {minimum}")
        if maximum is not None and value > maximum:
            raise SchemaValidationError(f"{path} must be <= {maximum}")
        return

    if schema_type == "boolean":
        if not isinstance(value, bool):
            raise SchemaValidationError(f"{path} must be a boolean")
        return


def extract_json_object(text: str) -> JsonDict | None:
    stripped = text.strip()
    if not stripped:
        return None

    if stripped.startswith("```"):
        parts = stripped.split("```")
        for part in parts:
            candidate = part.strip()
            if candidate.startswith("json"):
                candidate = candidate[4:].strip()
            if candidate.startswith("{") and candidate.endswith("}"):
                stripped = candidate
                break

    try:
        data = json.loads(stripped)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        first = stripped.find("{")
        last = stripped.rfind("}")
        if first >= 0 and last > first:
            try:
                data = json.loads(stripped[first : last + 1])
                return data if isinstance(data, dict) else None
            except json.JSONDecodeError:
                return None
    return None


@dataclass
class ToolSpec:
    name: str
    description: str
    parameters: JsonDict
    handler: ToolHandler

    def to_openai_tool(self) -> JsonDict:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, ToolSpec] = {}

    def register(self, tool: ToolSpec) -> None:
        self._tools[tool.name] = tool

    def get(self, name: str) -> ToolSpec | None:
        return self._tools.get(name)

    def list(self) -> list[ToolSpec]:
        return list(self._tools.values())


class WorkspaceGuard:
    def __init__(self, root: Path) -> None:
        self.root = root.resolve()

    def resolve(self, raw_path: str, must_exist: bool = False) -> Path:
        candidate = Path(raw_path)
        if not candidate.is_absolute():
            candidate = (self.root / candidate).resolve()
        else:
            candidate = candidate.resolve()

        if candidate != self.root and self.root not in candidate.parents:
            raise ValueError(f"path escapes workspace: {candidate}")
        if must_exist and not candidate.exists():
            raise ValueError(f"path does not exist: {candidate}")
        return candidate


class CommandPolicy:
    SAFE_GIT = {"status", "diff", "rev-parse", "ls-files", "show", "branch"}
    SAFE_BINARIES = {
        "python",
        "python3",
        "pytest",
        "ruff",
        "bandit",
        "radon",
        "vulture",
        "git",
        "pnpm",
        "npm",
        "go",
        "golangci-lint",
        "staticcheck",
        "trivy",
    }

    def __init__(self, root: Path, extra_allowed_binary_paths: set[Path] | None = None) -> None:
        self.root = root.resolve()
        self.extra_allowed_binary_paths = {path.resolve() for path in (extra_allowed_binary_paths or set())}

    def validate(self, argv: list[str], cwd: Path) -> None:
        if not argv:
            raise ValueError("argv must be non-empty")
        if cwd != self.root and self.root not in cwd.parents:
            raise ValueError(f"cwd escapes workspace: {cwd}")
        binary = argv[0]
        binary_name = Path(binary).name
        if binary_name not in self.SAFE_BINARIES:
            raise ValueError(f"binary not allowed: {binary}")
        if binary == binary_name:
            resolved_binary = shutil.which(binary)
            if resolved_binary is None:
                raise ValueError(f"binary not installed: {binary}")
        else:
            resolved_binary = str(Path(binary).resolve())
            if not Path(resolved_binary).exists():
                raise ValueError(f"binary not installed: {binary}")
            if Path(resolved_binary) not in self.extra_allowed_binary_paths:
                raise ValueError(f"binary path not allowed: {binary}")

        if binary_name in {"python", "python3"}:
            if len(argv) < 3 or argv[1] != "-m" or argv[2] not in {"py_compile", "pytest"}:
                raise ValueError("python only allows '-m py_compile' or '-m pytest'")

        if binary_name == "git":
            if len(argv) < 2 or argv[1] not in self.SAFE_GIT:
                raise ValueError(f"unsafe git command: {' '.join(argv)}")

        if binary_name in {"pnpm", "npm"}:
            if len(argv) < 3 or argv[1] != "exec" or argv[2] not in {"eslint", "tsc", "vitest", "jest"}:
                raise ValueError(f"unsafe {binary} command: {' '.join(argv)}")

        if binary_name == "go" and (len(argv) < 2 or argv[1] not in {"test", "vet", "list"}):
            raise ValueError(f"unsafe go command: {' '.join(argv)}")

    def run(self, argv: list[str], cwd: Path, timeout: int = 60, max_output: int = 20000) -> JsonDict:
        self.validate(argv, cwd)
        result = subprocess.run(
            argv,
            cwd=str(cwd),
            shell=False,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return {
            "argv": argv,
            "cwd": str(cwd),
            "exit_code": result.returncode,
            "ok": result.returncode == 0,
            "stdout": result.stdout[:max_output],
            "stderr": result.stderr[:max_output],
            "stdout_truncated": len(result.stdout) > max_output,
            "stderr_truncated": len(result.stderr) > max_output,
        }


class WorkspaceTools:
    PYTHON_ENV_BINARIES = {"ruff", "pytest", "bandit", "radon", "vulture"}
    PATCH_EDIT_SCHEMA = {
        "type": "object",
        "properties": {
            "old": {"type": "string"},
            "new": {"type": "string"},
            "expected_count": {"type": "integer", "minimum": 1},
            "replace_all": {"type": "boolean"},
        },
        "required": ["old", "new"],
        "additionalProperties": False,
    }

    def __init__(self, root: Path, python_executable: str) -> None:
        self.root = root.resolve()
        self.guard = WorkspaceGuard(self.root)
        configured_python = Path(python_executable).expanduser()
        if not configured_python.is_absolute():
            configured_python = (self.root / configured_python).absolute()
        self.python_executable = str(configured_python)
        self.python_bin_dir = configured_python.parent
        extra_allowed_binary_paths = {configured_python.resolve()}
        for binary_name in CommandPolicy.SAFE_BINARIES:
            candidate = self.python_bin_dir / binary_name
            if candidate.exists():
                extra_allowed_binary_paths.add(candidate.resolve())
        self.policy = CommandPolicy(self.root, extra_allowed_binary_paths=extra_allowed_binary_paths)

    def _resolve_binary(self, binary: str) -> str | None:
        binary_path = Path(binary)
        if binary_path.is_absolute() and binary_path.exists():
            return str(binary_path)
        local_binary = self.python_bin_dir / binary
        if local_binary.exists():
            return str(local_binary)
        if binary in self.PYTHON_ENV_BINARIES:
            return None
        return binary if shutil.which(binary) else None

    def list_dir(self, path: str = ".") -> JsonDict:
        target = self.guard.resolve(path, must_exist=True)
        if not target.is_dir():
            raise ValueError(f"not a directory: {target}")
        entries = [child.name + ("/" if child.is_dir() else "") for child in sorted(target.iterdir())]
        return {"path": str(target), "entries": entries[:200], "truncated": len(entries) > 200}

    def read_file(self, path: str, start_line: int = 1, end_line: int = 200) -> JsonDict:
        target = self.guard.resolve(path, must_exist=True)
        if not target.is_file():
            raise ValueError(f"not a file: {target}")
        text = target.read_text(encoding="utf-8", errors="replace")
        lines = text.splitlines()
        start = max(1, start_line)
        end = min(len(lines), end_line)
        content = "\n".join(f"{idx}: {lines[idx - 1]}" for idx in range(start, end + 1))
        return {
            "path": str(target),
            "start_line": start,
            "end_line": end,
            "line_count": len(lines),
            "content": content,
        }

    def write_file(self, path: str, content: str, mode: str = "overwrite") -> JsonDict:
        target = self.guard.resolve(path)
        target.parent.mkdir(parents=True, exist_ok=True)

        if mode == "overwrite":
            self._validate_candidate_content(target, content)
            target.write_text(content, encoding="utf-8")
        elif mode == "append":
            old = target.read_text(encoding="utf-8", errors="replace") if target.exists() else ""
            combined = old + content
            self._validate_candidate_content(target, combined)
            with target.open("a", encoding="utf-8") as handle:
                handle.write(content)
        else:
            raise ValueError("mode must be overwrite or append")

        return {"path": str(target), "mode": mode, "chars_written": len(content)}

    def grep_text(self, query: str, path: str = ".", is_regex: bool = False, max_results: int = 50) -> JsonDict:
        base = self.guard.resolve(path, must_exist=True)
        files = [base] if base.is_file() else [item for item in base.rglob("*") if item.is_file()]
        pattern = re.compile(query, re.IGNORECASE) if is_regex else None
        matches = []

        for file_path in files:
            try:
                text = file_path.read_text(encoding="utf-8", errors="replace")
            except Exception:
                continue
            for line_no, line in enumerate(text.splitlines(), start=1):
                ok = bool(pattern.search(line)) if pattern else query.lower() in line.lower()
                if ok:
                    matches.append({"path": str(file_path), "line": line_no, "content": line[:300]})
                    if len(matches) >= max_results:
                        return {"matches": matches, "truncated": True}
        return {"matches": matches, "truncated": False}

    def apply_patch(self, path: str, edits: list[JsonDict], before_sha256: str | None = None) -> JsonDict:
        target = self.guard.resolve(path, must_exist=True)
        if not target.is_file():
            raise ValueError(f"not a file: {target}")
        original = target.read_text(encoding="utf-8", errors="replace")
        if before_sha256 and sha256_text(original) != before_sha256:
            raise ValueError("before_sha256 mismatch")

        updated = original
        applied = []
        for index, edit in enumerate(edits, start=1):
            validate_schema(edit, self.PATCH_EDIT_SCHEMA, f"edits[{index}]")
            old = edit["old"]
            new = edit["new"]
            expected_count = edit.get("expected_count", 1)
            replace_all = edit.get("replace_all", False)

            if not old:
                raise ValueError("empty 'old' is not allowed")

            count = updated.count(old)
            if count != expected_count:
                raise ValueError(f"patch #{index} expected {expected_count} matches, got {count}")

            if replace_all:
                updated = updated.replace(old, new)
                replaced = count
            else:
                updated = updated.replace(old, new, 1)
                replaced = 1
            applied.append({"index": index, "replaced": replaced})

        self._validate_candidate_content(target, updated)
        target.write_text(updated, encoding="utf-8")
        return {
            "path": str(target),
            "old_sha256": sha256_text(original),
            "new_sha256": sha256_text(updated),
            "edits": applied,
        }

    def run_command(self, argv: list[str], cwd: str = ".", timeout: int = 60) -> JsonDict:
        target_cwd = self.guard.resolve(cwd, must_exist=True)
        if not target_cwd.is_dir():
            raise ValueError(f"cwd is not a directory: {target_cwd}")
        return self.policy.run(argv, target_cwd, timeout=timeout)

    def run_quality_gate(self, paths: list[str] | None = None, level: str = "fast") -> JsonDict:
        selected = [self.guard.resolve(path, must_exist=True) for path in (paths or [])]
        py_files = [str(path) for path in selected if path.suffix == ".py"]
        python_targets = [str(path) for path in selected if path.suffix == ".py" or path.is_dir()]
        js_ts = any(path.suffix in {".js", ".jsx", ".ts", ".tsx"} for path in selected)
        go_files = any(path.suffix == ".go" for path in selected)
        results = []

        def maybe_run(argv: list[str], cwd: str = ".") -> None:
            binary = argv[0]
            resolved_binary = self._resolve_binary(binary)
            if resolved_binary:
                resolved_argv = [resolved_binary, *argv[1:]]
                results.append(self.run_command(argv=resolved_argv, cwd=cwd, timeout=180))
            else:
                results.append({"argv": argv, "ok": False, "skipped": True, "reason": f"{binary} not installed"})

        if py_files:
            maybe_run([self.python_executable, "-m", "py_compile", *py_files[:100]])
            maybe_run(["ruff", "check", *py_files[:100]])
            if level == "full":
                maybe_run(["pytest", "-q"])
                scoped_targets = python_targets or ["."]
                for target in scoped_targets:
                    if Path(target).is_dir():
                        maybe_run(["bandit", "-q", "-r", target])
                    else:
                        maybe_run(["bandit", "-q", target])
                maybe_run(["radon", "cc", *scoped_targets, "-a"])
                maybe_run(["vulture", *scoped_targets])

        if js_ts and (self.root / "package.json").exists():
            if (self.root / "tsconfig.json").exists():
                maybe_run(["pnpm", "exec", "tsc", "--noEmit", "-p", "tsconfig.json"])
            maybe_run(["pnpm", "exec", "eslint", "."])

        if go_files:
            maybe_run(["go", "test", "./..."])
            maybe_run(["golangci-lint", "run"])
            maybe_run(["staticcheck", "./..."])

        if level == "full":
            if (self.root / ".git").exists():
                maybe_run(["git", "diff", "--stat"])
            else:
                results.append({
                    "argv": ["git", "diff", "--stat"],
                    "ok": False,
                    "skipped": True,
                    "reason": "not a git repository",
                })

            scan_targets = [str(path) for path in selected] or ["."]
            maybe_run(["trivy", "fs", *scan_targets])

        return {"level": level, "results": results}

    def _validate_candidate_content(self, path: Path, content: str) -> None:
        if path.suffix == ".py":
            compile(content, str(path), "exec")
        elif path.suffix == ".json":
            json.loads(content)


def build_registry(root: Path, python_executable: str) -> ToolRegistry:
    ws = WorkspaceTools(root, python_executable=python_executable)
    registry = ToolRegistry()

    registry.register(
        ToolSpec(
            name="list_dir",
            description="List entries in a directory inside the workspace.",
            parameters={
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "additionalProperties": False,
            },
            handler=ws.list_dir,
        )
    )
    registry.register(
        ToolSpec(
            name="read_file",
            description="Read a UTF-8 text file by line range inside the workspace.",
            parameters={
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "start_line": {"type": "integer", "minimum": 1},
                    "end_line": {"type": "integer", "minimum": 1},
                },
                "required": ["path"],
                "additionalProperties": False,
            },
            handler=ws.read_file,
        )
    )
    registry.register(
        ToolSpec(
            name="write_file",
            description="Write or append text inside the workspace.",
            parameters={
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                    "mode": {"type": "string", "enum": ["overwrite", "append"]},
                },
                "required": ["path", "content"],
                "additionalProperties": False,
            },
            handler=ws.write_file,
        )
    )
    registry.register(
        ToolSpec(
            name="grep_text",
            description="Search plain text or regex across files.",
            parameters={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "path": {"type": "string"},
                    "is_regex": {"type": "boolean"},
                    "max_results": {"type": "integer", "minimum": 1},
                },
                "required": ["query"],
                "additionalProperties": False,
            },
            handler=ws.grep_text,
        )
    )
    registry.register(
        ToolSpec(
            name="apply_patch",
            description="Apply safe structured find/replace edits to one file.",
            parameters={
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "before_sha256": {"type": "string"},
                    "edits": {"type": "array", "items": WorkspaceTools.PATCH_EDIT_SCHEMA},
                },
                "required": ["path", "edits"],
                "additionalProperties": False,
            },
            handler=ws.apply_patch,
        )
    )
    registry.register(
        ToolSpec(
            name="run_command",
            description="Run a safe allowlisted verification command with shell disabled.",
            parameters={
                "type": "object",
                "properties": {
                    "argv": {"type": "array", "items": {"type": "string"}},
                    "cwd": {"type": "string"},
                    "timeout": {"type": "integer", "minimum": 1},
                },
                "required": ["argv"],
                "additionalProperties": False,
            },
            handler=ws.run_command,
        )
    )
    registry.register(
        ToolSpec(
            name="run_quality_gate",
            description="Auto-detect Python/TS/Go checks and run installed validators.",
            parameters={
                "type": "object",
                "properties": {
                    "paths": {"type": "array", "items": {"type": "string"}},
                    "level": {"type": "string", "enum": ["fast", "full"]},
                },
                "additionalProperties": False,
            },
            handler=ws.run_quality_gate,
        )
    )
    return registry
