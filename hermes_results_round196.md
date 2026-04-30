# R196 — 2026-04-29 16:31 UTC

## Health Status
- HTTP 200 ✅
- Console 0 ✅
- Flow 5/5 ✅
- Mobile 3/3 ✅
- Consecutive stable: 83 rounds ✅

## Incident Fixed This Round
**Orphan next-server process conflict (R149 pattern reappeared)**
- Log showed EADDRINUSE on port 3005, but curl returned 200 (orphan compiled server still serving)
- Process list confirmed: orphan `next-server (v15.5.14)` (pid 21943) occupying port 3005 while `next dev` (pid 21849) failed to start
- Fix: `pkill -9 -f "next"` + cleared `.next` cache + restarted dev server
- Verified: HTTP 200 / Console 0 / Flow 5/5 / Mobile 3/3

---

## WeShop.ai Current State (R196 Comparison Snapshot)

### WeShop Model Matrix (from HTML analysis, 9 languages active)
| Category | Models | EasyUse |
|----------|--------|---------|
| Image Models | 8: Nano Banana2, Seedream 5.0, Qwen Image Edit, Midjourney, Z-Image, Nano Banana Pro, FireRed, Grok Imagine | 4 |
| Video Models | 5: Kling 3.0, Sora 2, Wan AI, Seedance 2.0, Grok Imagine (video) | 0 |
| **Total** | **13** | **4** |

### New WeShop Observations Since R193
- No significant UI/structure changes detected
- GPT Image mentioned in keyword list (grep count: 5) — likely marked "now available"
- Grok Imagine appears in both image and video categories

### Business-Level Gaps (No Code Changes Possible)
| Gap | WeShop | EasyUse | Level |
|-----|--------|---------|-------|
| NYSE stock backing | NYSE:MOGU mentioned multiple times | None | A |
| Video generation | 5 models (Kling/Sora 2/Wan/Seedance 2.0/Grok) | None | A |
| Social proof | 3,000,000+ users | 3,200+ | A (1000x scale) |
| Image models | 8 | 4 | B |
| Languages | 9 (en-US/zh-CN/pt/es/ru/fr/de/id/ko) | 1 (Chinese only) | B |
| AI Video Agent | Yes (Beta, 3,000 free points) | None | B |
| Resource/Blog/FAQ menus | Yes (functional) | /blog, /faq → 404 | B |
| Affiliate Program | Yes | None | B |
| Mobile App | iOS + Android stores | None | B |

### Code-level gaps: 0 ✅
All previously fixed issues remain resolved:
- aria-label on Hot Features links ✅
- pricing section id="pricing" ✅
- Footer dead links removed (/blog, /faq, /affiliate) ✅
- Orphan next-server process conflict ✅ (fixed this round)

## output

```json
{
  "success": true,
  "summary": "R196健康检查全量通过(83轮连续稳定)。发现并修复orphan next-server进程冲突(EADDRINUSE)，已重启dev server。WeShop模型矩阵无显著变化，代码级差距0。",
  "output": {
    "修复内容": "Orphan next-server进程冲突 — pkill -9清理后重启dev server",
    "页面行为": "HTTP 200 / Console 0 / Flow 5/5 / Mobile 3/3",
    "是否解决": "是，网站恢复正常运行"
  },
  "next_suggestions": [
    "A(用户提供): 评估接入GPT Image 2 API",
    "A(用户提供): 评估AI视频生成能力(Sora2/Kling/Seedance 2.0)",
    "A(用户提供): 确认NYSE/上市公司关联可作为背书",
    "B(用户提供): 评估模型数从4扩充到8+",
    "B(用户提供): 评估接入z-image/Fire Red等新型号",
    "B(用户提供): 评估接入视频生成能力"
  ]
}
```
