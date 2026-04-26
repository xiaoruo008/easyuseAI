#!/usr/bin/env python3
"""
Dedupe Check Preview — 检查预览目录中的重复/相似内容

功能:
1. 扫描指定目录中的文本/JSON/JSONL 文件
2. 检测精确重复（exact duplicate）
3. 检测模糊重复（similarity > threshold，默认为 0.75）
4. 统计词频和高频 n-gram
5. 生成 HTML/JSON 双格式报告

用法:
    python scripts/dedupe_check_preview.py                          # 默认检查 public/previews/
    python scripts/dedupe_check_preview.py --dir data/content/     # 指定目录
    python scripts/dedupe_check_preview.py --threshold 0.8        # 调整相似度阈值
    python scripts/dedupe_check_preview.py --format html           # 输出 HTML 报告
    python scripts/dedupe_check_preview.py --format json            # 输出 JSON 报告

输入文件类型:
    *.txt, *.json, *.jsonl, *.md（内容文件）
    忽略: *.png, *.jpg, *.svg, *.ico（媒体文件）

输出:
    logs/dedupe_<dir>_<timestamp>.json   — JSON 详细报告
    logs/dedupe_<dir>_<timestamp>.html   — HTML 可视化报告（可选）
    stdout                                — 简洁摘要
"""

import argparse
import json
import re
import sys
import math
import datetime
import hashlib
from pathlib import Path
from collections import defaultdict, Counter
from typing import Optional

# ── 配置 ────────────────────────────────────────────────────────────────
LOG_DIR = Path(__file__).parent.parent / "logs"
DEFAULT_PREVIEW_DIR = Path(__file__).parent.parent / "public" / "previews"
DEFAULT_THRESHOLD = 0.75
MIN_NGRAM_LEN = 3
MAX_NGRAM_LEN = 5

# ── 工具函数 ──────────────────────────────────────────────────────────
def log(msg: str):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")

def load_file(path: Path) -> list[tuple[str, str]]:
    """
    读取文件，返回 [(record_id, text_content)] 列表
    """
    records = []
    raw = path.read_text(encoding="utf-8", errors="replace").strip()

    if path.suffix == ".jsonl":
        for line in raw.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                record_id = obj.get("id", obj.get("product_id", hashlib.md5(line.encode()).hexdigest()[:8]))
                text = extract_text_from_dict(obj)
                records.append((str(record_id), text))
            except json.JSONDecodeError:
                records.append((f"line_{len(records)+1}", line))
    elif path.suffix == ".json":
        try:
            obj = json.loads(raw)
            if isinstance(obj, list):
                for i, item in enumerate(obj):
                    record_id = item.get("id", item.get("product_id", str(i)))
                    text = extract_text_from_dict(item)
                    records.append((str(record_id), text))
            else:
                record_id = obj.get("id", obj.get("product_id", "root"))
                text = extract_text_from_dict(obj)
                records.append((record_id, text))
        except json.JSONDecodeError:
            records.append(("json_parse_error", raw[:500]))
    else:
        records.append((path.stem, raw))

    return records

def extract_text_from_dict(d: dict) -> str:
    """从字典中提取所有文本字段，拼接成字符串"""
    parts = []
    for key in ["title", "description", "content", "text", "name", "prompt", "copy", "product_description", "lifestyle_copy", "ad_slogan"]:
        if key in d and isinstance(d[key], str):
            parts.append(d[key])
    if not parts:
        # 拼接所有字符串叶子节点
        parts = [str(v) for v in d.values() if isinstance(v, str) and len(str(v)) > 10]
    return " ".join(parts).strip()

def tokenize(text: str) -> list[str]:
    """简单中英文分词"""
    # 英文按空格+标点分
    en_tokens = re.findall(r"[a-zA-Z0-9]+", text)
    # 中文按字符分（同时保留英文词）
    cn_chars = [c for c in text if '\u4e00' <= c <= '\u9fff']
    # 组合：单字+英文词
    tokens = cn_chars + en_tokens
    return [t.lower() for t in tokens if len(t) > 0]

def get_ngrams(tokens: list[str], n: int) -> set[tuple]:
    """生成 n-gram 集合"""
    if len(tokens) < n:
        return set()
    return set(tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1))

def jaccard_similarity(set1: set, set2: set) -> float:
    """Jaccard 相似度"""
    if not set1 or not set2:
        return 0.0
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    return intersection / union if union > 0 else 0.0

def cosine_similarity(vec1: dict, vec2: dict) -> float:
    """稀疏向量余弦相似度"""
    dot_product = sum(vec1.get(k, 0) * vec2.get(k, 0) for k in vec1)
    norm1 = math.sqrt(sum(v*v for v in vec1.values()))
    norm2 = math.sqrt(sum(v*v for v in vec2.values()))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot_product / (norm1 * norm2)

def text_to_tfidf_vector(tokens: list[str]) -> dict[str, float]:
    """将 token 列表转为 TF-IDF 稀疏向量（简化版，IDF 用 log(N/df)）"""
    tf = Counter(tokens)
    # 这里简化：不使用 IDF，直接用 TF
    return {word: count / len(tokens) if len(tokens) > 0 else 0 for word, count in tf.items()}

def exact_hash(text: str) -> str:
    """计算文本的 MD5 哈希（用于精确去重）"""
    return hashlib.md5(text.encode("utf-8")).hexdigest()

# ── 核心检查逻辑 ──────────────────────────────────────────────────────
def check_duplicates(records: list[tuple[str, str]], threshold: float) -> dict:
    """
    主检查函数
    返回结构化报告 dict
    """
    if not records:
        return {"error": "No records to check"}

    # Step 1: 精确重复（exact duplicate）
    hash_to_records: dict[str, list[tuple]] = defaultdict(list)
    for record_id, text in records:
        h = exact_hash(text)
        hash_to_records[h].append(record_id)

    exact_dupes: dict[str, list[str]] = {}
    for h, ids in hash_to_records.items():
        if len(ids) > 1:
            # 取第一条记录的文本前100字作为 key 描述
            sample_text = next((text for rid, text in records if rid in ids), "")
            key = f'"{sample_text[:60]}..." ({len(ids)}条重复)'
            exact_dupes[key] = ids

    # Step 2: 模糊重复（similarity > threshold）
    # 使用 n-gram Jaccard 相似度
    tokenized = {rid: tokenize(text) for rid, text in records}
    ngrams: dict[str, dict[int, set]] = {}  # rid -> {n: set_of_ngrams}
    for rid, tokens in tokenized.items():
        ngrams[rid] = {}
        for n in range(MIN_NGRAM_LEN, MAX_NGRAM_LEN + 1):
            ngrams[rid][n] = get_ngrams(tokens, n)

    fuzzy_dupes: list[dict] = []
    checked: set[tuple] = set()
    n = len(records)

    for i in range(n):
        rid_i, text_i = records[i]
        tokens_i = tokenized[rid_i]
        if not tokens_i:
            continue
        vec_i = text_to_tfidf_vector(tokens_i)

        for j in range(i + 1, n):
            rid_j, text_j = records[j]
            if (rid_i, rid_j) in checked or (rid_j, rid_i) in checked:
                continue
            checked.add((rid_i, rid_j))

            tokens_j = tokenized[rid_j]
            if not tokens_j:
                continue

            # 多级相似度计算
            # 1. N-gram Jaccard
            jaccard_scores = []
            for ng in range(MIN_NGRAM_LEN, MAX_NGRAM_LEN + 1):
                score = jaccard_similarity(ngrams[rid_i].get(ng, set()), ngrams[rid_j].get(ng, set()))
                jaccard_scores.append(score)
            best_jaccard = max(jaccard_scores) if jaccard_scores else 0

            # 2. TF-IDF Cosine
            vec_j = text_to_tfidf_vector(tokens_j)
            cosine = cosine_similarity(vec_i, vec_j)

            # 综合相似度（取两者较大值）
            similarity = max(best_jaccard, cosine)

            if similarity >= threshold:
                fuzzy_dupes.append({
                    "record_a": rid_i,
                    "record_b": rid_j,
                    "similarity": round(similarity, 4),
                    "text_a_preview": text_i[:100].replace("\n", " "),
                    "text_b_preview": text_j[:100].replace("\n", " "),
                    "method": "jaccard+cosine" if best_jaccard == similarity else "cosine"
                })

    # Step 3: 词频统计
    all_tokens: list[str] = []
    for _, text in records:
        all_tokens.extend(tokenize(text))
    token_freq = Counter(all_tokens)
    top_tokens = [{"word": w, "count": c, "ratio": round(c / len(all_tokens), 4) if all_tokens else 0}
                  for w, c in token_freq.most_common(30)]

    # Step 4: 高频 n-gram
    all_ngrams: Counter = Counter()
    for _, text in records:
        tokens = tokenize(text)
        for ng in range(MIN_NGRAM_LEN, MAX_NGRAM_LEN + 1):
            for gram in get_ngrams(tokens, ng):
                all_ngrams[gram] += 1
    top_ngrams = [{"ngram": " ".join(gram), "count": c, "n": len(gram[0]) if gram else 0}
                  for gram, c in all_ngrams.most_common(20) if len(gram) > 0]

    # Step 5: 统计摘要
    total_records = len(records)
    total_files_checked = len(set(rid for rid, _ in records))
    duplicate_groups = len(exact_dupes)
    fuzzy_duplicate_pairs = len(fuzzy_dupes)

    summary = {
        "total_records": total_records,
        "total_files_checked": total_files_checked,
        "exact_duplicate_groups": duplicate_groups,
        "exact_duplicate_records": sum(len(v) for v in exact_dupes.values()),
        "fuzzy_duplicate_pairs": fuzzy_duplicate_pairs,
        "unique_records": total_records - sum(len(v) for v in exact_dupes.values()) - len(fuzzy_dupes),
        "dedup_rate": round((sum(len(v) - 1 for v in exact_dupes.values()) + fuzzy_duplicate_pairs) / total_records, 4)
                       if total_records > 0 else 0
    }

    report = {
        "timestamp": datetime.datetime.now().isoformat(),
        "threshold": threshold,
        "summary": summary,
        "exact_duplicates": exact_dupes,
        "fuzzy_duplicates": fuzzy_dupes,
        "top_tokens": top_tokens,
        "top_ngrams": top_ngrams,
        "records": [{"id": rid, "text_len": len(text), "text_preview": text[:80].replace("\n", " ")}
                    for rid, text in records]
    }

    return report

# ── HTML 报告生成 ──────────────────────────────────────────────────────
def generate_html_report(report: dict) -> str:
    summary = report["summary"]
    exact = report["exact_duplicates"]
    fuzzy = report["fuzzy_duplicates"]
    tokens = report["top_tokens"][:15]
    ngrams = report["top_ngrams"][:15]

    no_exact_msg = '<p class="ok">✅ 未发现精确重复内容</p>'
    exact_table_html = ""
    if exact:
        rows_html = ""
        for key, ids in list(exact.items())[:20]:
            rows_html += f"<tr><td>{key}</td><td>{', '.join(ids)}</td></tr>\n"
        exact_table_html = f"<table><tr><th>重复内容预览</th><th>涉及记录</th></tr>{rows_html}</table>"
    else:
        exact_table_html = no_exact_msg

    no_fuzzy_msg = '<p class="ok">✅ 未发现模糊重复内容</p>'
    fuzzy_table_html = ""
    if fuzzy:
        rows_html = ""
        for pair in fuzzy[:30]:
            rows_html += (
                f"<tr><td>{pair['record_a']}</td>"
                f"<td>{pair['record_b']}</td>"
                f"<td class=\"sim\">{pair['similarity']:.2f}</td>"
                f"<td>{pair['method']}</td>"
                f"<td>{pair['text_a_preview'][:50]}...</td></tr>\n"
            )
        fuzzy_table_html = f"<table><tr><th>记录A</th><th>记录B</th><th>相似度</th><th>检测方法</th><th>A内容预览</th></tr>{rows_html}</table>"
    else:
        fuzzy_table_html = no_fuzzy_msg

    token_rows = "".join(
        f"<tr><td>{t['word']}</td><td>{t['count']}</td><td>{t['ratio']*100:.1f}%</td></tr>"
        for t in tokens
    )
    ngram_rows = "".join(
        f"<tr><td>{t['n']}-gram</td><td>{t['ngram']}</td><td>{t['count']}</td></tr>"
        for t in ngrams
    )

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>内容去重报告 — {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}</title>
<style>
  body {{ font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }}
  h1 {{ color: #1a1a1a; border-bottom: 3px solid #333; padding-bottom: 10px; }}
  h2 {{ color: #333; margin-top: 30px; border-left: 4px solid #333; padding-left: 10px; }}
  .summary {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }}
  .card {{ background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
  .card .num {{ font-size: 2em; font-weight: bold; color: #1a1a1a; }}
  .card .label {{ color: #666; font-size: 0.85em; margin-top: 5px; }}
  table {{ width: 100%; border-collapse: collapse; margin: 15px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
  th {{ background: #333; color: white; padding: 12px; text-align: left; }}
  td {{ padding: 10px 12px; border-bottom: 1px solid #eee; }}
  tr:last-child td {{ border-bottom: none; }}
  tr:hover {{ background: #fafafa; }}
  .sim {{ font-weight: bold; color: #e67e22; }}
  .ok {{ color: #27ae60; font-weight: bold; }}
  footer {{ margin-top: 40px; color: #999; font-size: 0.8em; text-align: center; }}
</style>
</head>
<body>
<h1>📋 内容去重检查报告</h1>
<p>生成时间: {report['timestamp']} &nbsp;|&nbsp; 相似度阈值: {report['threshold']}</p>

<h2>📊 统计摘要</h2>
<div class="summary">
  <div class="card">
    <div class="num">{summary['total_records']}</div>
    <div class="label">总记录数</div>
  </div>
  <div class="card">
    <div class="num">{summary['exact_duplicate_groups']}</div>
    <div class="label">精确重复组</div>
  </div>
  <div class="card">
    <div class="num">{summary['fuzzy_duplicate_pairs']}</div>
    <div class="label">模糊重复对</div>
  </div>
  <div class="card">
    <div class="num">{summary['dedup_rate']*100:.1f}%</div>
    <div class="label">重复率</div>
  </div>
  <div class="card">
    <div class="num">{summary['unique_records']}</div>
    <div class="label">唯一记录</div>
  </div>
</div>

<h2>⚠️ 精确重复 {len(exact)} 组</h2>
{exact_table_html}

<h2>🔶 模糊重复（相似度 ≥ {report['threshold']}）共 {len(fuzzy)} 对</h2>
{fuzzy_table_html}

<h2>🔤 高频词 TOP 15</h2>
<table>
  <tr><th>词语</th><th>出现次数</th><th>占比</th></tr>
  {token_rows}
</table>

<h2>📈 高频 N-gram TOP 15</h2>
<table>
  <tr><th>类型</th><th>N-gram</th><th>出现次数</th></tr>
  {ngram_rows}
</table>

<footer>
  由 dedupe_check_preview.py 生成 &nbsp;|&nbsp; logs/dedupe_*.json
</footer>
</body>
</html>"""

# ── 主流程 ──────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="检查预览内容重复度")
    parser.add_argument("--dir", "-d", type=Path,
                        help=f"要检查的目录 (默认: {DEFAULT_PREVIEW_DIR})")
    parser.add_argument("--threshold", "-t", type=float, default=DEFAULT_THRESHOLD,
                        help=f"模糊重复相似度阈值 (默认: {DEFAULT_THRESHOLD})")
    parser.add_argument("--format", "-f", choices=["html", "json", "both"], default="both",
                        help="输出格式 (默认: both)")
    parser.add_argument("--output-prefix", "-o",
                        help="输出文件名前缀 (默认: dedupe_<目录名>_<时间戳>)")
    args = parser.parse_args()

    target_dir = args.dir or DEFAULT_PREVIEW_DIR
    threshold = args.threshold
    output_format = args.format

    # 如果目录不存在，尝试创建（可能路径是新的）
    if not target_dir.exists():
        log(f"⚠️ 目录不存在: {target_dir}")
        # 尝试相对路径
        alt = Path(__file__).parent.parent / target_dir
        if alt.exists():
            target_dir = alt
            log(f"  使用替代路径: {target_dir}")
        else:
            log("❌ 无法找到有效目录，退出")
            sys.exit(1)

    log(f"🔍 开始检查: {target_dir}")
    log(f"   相似度阈值: {threshold}")

    # 扫描文件
    supported = {".txt", ".json", ".jsonl", ".md"}
    files = [p for p in target_dir.rglob("*")
             if p.is_file() and p.suffix.lower() in supported
             and ".git" not in str(p)]

    log(f"📂 找到 {len(files)} 个内容文件")

    if not files:
        log("❌ 没有找到任何 .txt/.json/.jsonl/.md 文件")
        sys.exit(1)

    # 加载所有记录
    all_records: list[tuple[str, str]] = []
    file_map: dict[str, Path] = {}
    for fp in files:
        try:
            records = load_file(fp)
            for rid, text in records:
                all_records.append((f"{fp.name}:{rid}", text))
                file_map[f"{fp.name}:{rid}"] = fp
        except Exception as e:
            log(f"  ⚠ 读取失败 {fp.name}: {e}")

    log(f"📝 共加载 {len(all_records)} 条记录")

    # 执行去重检查
    log("🔬 开始去重分析...")
    report = check_duplicates(all_records, threshold)

    # 生成时间戳
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    dir_name = target_dir.name
    prefix = args.output_prefix or f"dedupe_{dir_name}"

    # 保存 JSON 报告
    json_path = LOG_DIR / f"{prefix}_{ts}.json"
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"✅ JSON 报告: {json_path}")

    # 保存 HTML 报告
    html_path: Optional[Path] = None
    if output_format in ("html", "both"):
        html_content = generate_html_report(report)
        html_path = LOG_DIR / f"{prefix}_{ts}.html"
        html_path.write_text(html_content, encoding="utf-8")
        log(f"✅ HTML 报告: {html_path}")

    # 打印摘要到 stdout
    s = report["summary"]
    dup_rate = s["dedup_rate"] * 100
    status = "⚠️ 有重复内容" if (s["exact_duplicate_groups"] > 0 or s["fuzzy_duplicate_pairs"] > 0) else "✅ 无重复"

    print("\n" + "=" * 60)
    print(f"  📋 去重报告摘要 — {target_dir.name}")
    print("=" * 60)
    print(f"  总记录数:     {s['total_records']}")
    print(f"  精确重复组:   {s['exact_duplicate_groups']} 组 ({s['exact_duplicate_records']} 条)")
    print(f"  模糊重复对:   {s['fuzzy_duplicate_pairs']} 对")
    print(f"  重复率:       {dup_rate:.1f}%")
    print(f"  唯一记录:     {s['unique_records']}")
    print(f"  状态:         {status}")
    print("=" * 60)

    if s["exact_duplicate_groups"] > 0:
        print(f"\n⚠️ 精确重复详情 (前5组):")
        for i, (key, ids) in enumerate(list(report["exact_duplicates"].items())[:5]):
            print(f"  {i+1}. {key}")

    if s["fuzzy_duplicate_pairs"] > 0:
        print(f"\n⚠️ 模糊重复详情 (前5对):")
        for i, pair in enumerate(report["fuzzy_duplicates"][:5]):
            print(f"  {i+1}. [{pair['record_a']}] ↔ [{pair['record_b']}] (相似度: {pair['similarity']:.2f})")

    print(f"\n📁 完整报告: {json_path}")
    if html_path:
        print(f"🌐 HTML报告: {html_path}")
    print()

    # 返回退出码：有重复则 exit 1
    has_issues = s["exact_duplicate_groups"] > 0 or s["fuzzy_duplicate_pairs"] > 0
    sys.exit(1 if has_issues else 0)

if __name__ == "__main__":
    main()
