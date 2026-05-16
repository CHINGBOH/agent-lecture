from __future__ import annotations

import atexit
import json
import os
import subprocess
import time
import urllib.request
from pathlib import Path


class LocalServerHandle:
    def __init__(
        self,
        binary_path: Path,
        model_path: Path,
        base_url: str,
        ctx_size: int,
        gpu_layers: int | None,
        reasoning: str | None,
        log_path: Path,
    ) -> None:
        self.binary_path = binary_path.resolve()
        self.model_path = model_path.resolve()
        self.base_url = base_url.rstrip("/")
        self.ctx_size = ctx_size
        self.gpu_layers = gpu_layers
        self.reasoning = reasoning
        self.log_path = log_path.resolve()
        self.process: subprocess.Popen[str] | None = None

    def start(self) -> None:
        if not self.binary_path.exists():
            raise FileNotFoundError(f"llama-server binary not found: {self.binary_path}")
        if not self.model_path.exists():
            raise FileNotFoundError(f"model file not found: {self.model_path}")

        host, port_text = self.base_url.replace("http://", "").split(":", 1)
        port = int(port_text)

        env = os.environ.copy()
        lib_dir = self.binary_path.parent
        current_ld = env.get("LD_LIBRARY_PATH", "")
        env["LD_LIBRARY_PATH"] = f"{lib_dir}:{current_ld}" if current_ld else str(lib_dir)

        cmd = [
            str(self.binary_path),
            "-m",
            str(self.model_path),
            "--host",
            host,
            "--port",
            str(port),
            "--ctx-size",
            str(self.ctx_size),
            "--jinja",
            "--parallel",
            "1",
            "-n",
            "-1",
        ]
        if self.gpu_layers is not None:
            cmd.extend(["--n-gpu-layers", str(self.gpu_layers)])
        if self.reasoning:
            cmd.extend(["--reasoning", self.reasoning])

        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        log_file = self.log_path.open("w", encoding="utf-8")
        self.process = subprocess.Popen(cmd, stdout=log_file, stderr=subprocess.STDOUT, text=True, env=env)
        atexit.register(self.close)
        self._wait_until_ready(timeout_seconds=180)

    def _wait_until_ready(self, timeout_seconds: int = 180) -> None:
        deadline = time.time() + timeout_seconds
        last_error: Exception | None = None
        while time.time() < deadline:
            if self.process is not None and self.process.poll() is not None:
                raise RuntimeError(f"llama-server exited before becoming ready; see {self.log_path}")
            try:
                request = urllib.request.Request(url=f"{self.base_url}/health", method="GET")
                with urllib.request.urlopen(request, timeout=15) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                if payload.get("status") == "ok":
                    return
            except Exception as exc:
                last_error = exc
            time.sleep(1.0)
        raise RuntimeError(f"Timed out waiting for llama-server at {self.base_url}: {last_error}")

    def close(self) -> None:
        if self.process is None:
            return
        if self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait(timeout=5)


def detect_free_vram_mb() -> int:
    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=memory.free", "--format=csv,noheader,nounits"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        line = result.stdout.strip().splitlines()[0]
        return int(line)
    except Exception:
        return 0


def choose_gpu_layers(model_path: Path) -> int:
    free_vram = detect_free_vram_mb()
    model_name = model_path.name.lower()
    if "14b" in model_name:
        if free_vram >= 9000:
            return 999
        if free_vram >= 7500:
            return 42
        if free_vram >= 6000:
            return 36
        return 28
    if "7b" in model_name:
        if free_vram >= 5000:
            return 999
        if free_vram >= 3500:
            return 20
        return 0
    if "1.5b" in model_name or "0.5b" in model_name:
        return 999 if free_vram >= 1500 else 0
    return 0
