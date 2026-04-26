#!/usr/bin/env python3
"""
Qwen Runner — 读取 ops/*.md prompt 文件，分发给 Qwen Code CLI 执行

用法:
    python scripts/qwen_runner.py <ops_file.md> [--model <model>] [--output <log_file>]

示例:
    python scripts/qwen_runner.py ops/QWEN_FRESH_CONTENT_BATCH_PROMPT.md
    python scripts/qwen_runner.py ops/TASK.md --model qwen-max --output logs/qwen_output.log

依赖:
    - Qwen CLI: pip install dashrunner 或通过阿里云百炼 SDK
    - 或使用 curl 调用 Qwen API（默认模式）

环境变量:
    DASHSCOPE_API_KEY   - 阿里云百炼 API Key
    QWEN_MODEL          - 默认模型 (默认: qwen-max)
    QWEN_API_BASE       - API 端点 (默认: https://dashscope.aliyuncs.com/api/v1)
"""

import argparse
import os
import sys
import json
import subprocess
import datetime
import re
from pathlib import Path

# ── 配置 ────────────────────────────────────────────────────────────────
DEFAULT_MODEL = os.getenv("QWEN_MODEL", "qwen-max")
API_BASE = os.getenv("QWEN_API_BASE", "https://dashscope.aliyuncs.com/api/v1")
LOG_DIR = Path(__file__).parent.parent / "logs"
DEFAULT_OPS_DIR = Path(__file__).parent.parent / "ops"

# ── 日志 ────────────────────────────────────────────────────────────────
def log(msg: str, file=None):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    if file:
        with open(file, "a", encoding="utf-8") as f:
            f.write(line + "\n")

def log_section(title: str, log_file: str):
    sep = "=" * 60
    log(sep, log_file)
    log(f"  {title}", log_file)
    log(sep, log_file)

# ── 读取 prompt 文件 ───────────────────────────────────────────────────
def load_prompt(ops_path: Path) -> str:
    if not ops_path.exists():
        raise FileNotFoundError(f"Prompt 文件不存在: {ops_path}")
    content = ops_path.read_text(encoding="utf-8")
    # 去掉 frontmatter (YAML) 如果有
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            content = parts[2].strip()
    return content.strip()

# ── 从 prompt 提取任务描述 ──────────────────────────────────────────────
def extract_task_name(prompt: str) -> str:
    # 尝试从第一行非空行提取任务名
    for line in prompt.splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            return line[:80]
        if line.startswith("#"):
            return line.lstrip("#").strip()[:80]
    return "untitled_task"

# ── 调用 Qwen API ──────────────────────────────────────────────────────
def call_qwen_api(prompt: str, model: str, api_key: str, temperature: float = 0.7,
                  max_tokens: int = 2048) -> dict:
    """
    通过阿里云百炼 API 调用 Qwen
    返回: {"success": bool, "content": str, "error": str}
    """
    import urllib.request
    import urllib.error

    url = f"{API_BASE}/services/aigc/text-generation/generation"

    payload = {
        "model": model,
        "input": {
            "messages": [
                {"role": "system", "content": "You are a helpful fashion AI assistant."},
                {"role": "user", "content": prompt}
            ]
        },
        "parameters": {
            "temperature": temperature,
            "max_tokens": max_tokens,
            "result_format": "message"
        }
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))
        if result.get("output"):
            return {"success": True, "content": result["output"]["choices"][0]["message"]["content"], "error": ""}
        elif result.get("code"):
            return {"success": False, "content": "", "error": f"API error {result.get('code')}: {result.get('message', '')}"}
        else:
            return {"success": False, "content": "", "error": f"Unknown response: {str(result)[:200]}"}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        try:
            err_json = json.loads(body)
            msg = err_json.get("message", body[:300])
        except Exception:
            msg = body[:300]
        return {"success": False, "content": "", "error": f"HTTP {e.code}: {msg}"}
    except Exception as e:
        return {"success": False, "content": "", "error": str(e)}

# ── 调用 Qwen CLI（如果可用）─────────────────────────────────────────────
def call_qwen_cli(prompt: str, model: str, cli_path: str = "qwen") -> dict:
    """
    尝试调用 qwen CLI 工具
    """
    try:
        result = subprocess.run(
            [cli_path, "--model", model, prompt],
            capture_output=True,
            text=True,
            timeout=120,
            env={**os.environ, "QWEN_MODEL": model}
        )
        if result.returncode == 0:
            return {"success": True, "content": result.stdout.strip(), "error": ""}
        else:
            return {"success": False, "content": "", "error": result.stderr.strip()[:300]}
    except FileNotFoundError:
        return {"success": False, "content": "", "error": f"CLI '{cli_path}' not found"}
    except subprocess.TimeoutExpired:
        return {"success": False, "content": "", "error": "CLI timeout (>120s)"}
    except Exception as e:
        return {"success": False, "content": "", "error": str(e)}

# ── 保存结果 ─────────────────────────────────────────────────────────────
def save_result(task_name: str, prompt: str, response: dict, log_file: Path):
    result_dir = LOG_DIR / "qwen_results"
    result_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = re.sub(r"[^\w\-]", "_", task_name[:40])
    result_file = result_dir / f"{safe_name}_{ts}.md"

    status = "✅ SUCCESS" if response["success"] else "❌ FAILURE"

    content = f"""# Qwen Runner 结果

**任务**: {task_name}
**时间**: {datetime.datetime.now().isoformat()}
**状态**: {status}

---

## Prompt (输入)

```
{prompt}
```

---

## Response (输出)

```
{response.get("content", "N/A")}
```

---

## Error (如果有)

```
{response.get("error", "无")}
```

---

*此文件由 qwen_runner.py 自动生成*
"""
    result_file.write_text(content, encoding="utf-8")
    return result_file

# ── 主流程 ──────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Qwen Runner — 分发 ops prompt 给 Qwen")
    parser.add_argument("ops_file", help="ops/*.md prompt 文件路径")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Qwen 模型 (默认: {DEFAULT_MODEL})")
    parser.add_argument("--output", "-o", help="输出日志文件路径 (默认: logs/qwen_<task>_<ts>.log)")
    parser.add_argument("--temperature", type=float, default=0.7, help="temperature (默认: 0.7)")
    parser.add_argument("--max-tokens", type=int, default=2048, help="最大 token 数 (默认: 2048)")
    parser.add_argument("--cli", action="store_true", help="优先使用 Qwen CLI 而非 API")
    parser.add_argument("--api-key", default=os.getenv("DASHSCOPE_API_KEY", ""), help="API Key (默认: DASHSCOPE_API_KEY 环境变量)")
    args = parser.parse_args()

    # 解析 ops 文件路径
    ops_path = Path(args.ops_file)
    if not ops_path.is_absolute():
        ops_path = DEFAULT_OPS_DIR / args.ops_file
        if not ops_path.exists():
            ops_path = Path(args.ops_file)  # 尝试绝对路径

    # 加载 prompt
    log_section(f"加载 Prompt: {ops_path}", args.output)
    try:
        prompt = load_prompt(ops_path)
    except FileNotFoundError as e:
        log(f"❌ {e}", args.output)
        sys.exit(1)

    task_name = extract_task_name(prompt)
    log(f"任务名: {task_name}", args.output)
    log(f"模型: {args.model}", args.output)
    log(f"Prompt 长度: {len(prompt)} 字符", args.output)

    # 调用 Qwen
    log_section("开始调用 Qwen", args.output)
    if args.cli:
        log("模式: Qwen CLI", args.output)
        response = call_qwen_cli(prompt, args.model)
    else:
        api_key = args.api_key
        if not api_key:
            # 尝试从环境变量读取
            api_key = os.environ.get("DASHSCOPE_API_KEY", "")
        if api_key:
            log("模式: Qwen API (百炼)", args.output)
            response = call_qwen_api(prompt, args.model, api_key,
                                    temperature=args.temperature, max_tokens=args.max_tokens)
        else:
            log("⚠ 未找到 DASHSCOPE_API_KEY，尝试 CLI 模式", args.output)
            response = call_qwen_cli(prompt, args.model)

    # 记录结果
    if response["success"]:
        log("✅ Qwen 调用成功", args.output)
        log(f"输出长度: {len(response['content'])} 字符", args.output)
        # 打印前200字预览
        preview = response["content"][:200].replace("\n", " ")
        log(f"输出预览: {preview}...", args.output)
    else:
        log(f"❌ Qwen 调用失败: {response['error']}", args.output)

    # 保存结果文件
    result_file = save_result(task_name, prompt, response, args.output)
    log(f"📄 结果已保存: {result_file}", args.output)

    log_section("完成", args.output)
    sys.exit(0 if response["success"] else 1)

if __name__ == "__main__":
    main()
