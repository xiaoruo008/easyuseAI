# R200 — 2026-04-29 20:01 UTC

## Health Status
- HTTP 200 ✅
- Console 0 ✅
- Flow 5/5 ✅
- Mobile 3/3 ✅
- Consecutive stable: 86 rounds ✅

---

## WeShop.ai Current State (R200 Comparison Snapshot)

### Core Data (from curl --max-time 10 https://www.weshop.ai)

| Dimension | WeShop | EasyUse | Gap Level |
|-----------|--------|---------|-----------|
| Social proof | 3,000,000+ users | 3,200+ | A - data scale 1000x |
| Listed company backing | NYSE: MOGU (multiple mentions) | None | A - business |
| Video models | 5 (Kling 3.0 / Sora 2 / Wan AI / Seedance 2.0 / Grok Imagine) | 0 | A - business |
| Image models | 16 (Grok/Seedance/Kling/z-image/Seedream/Wan/Sora/GPT Image/Vidu/Veo/Nano-Banana/Midjourney/Hailuo/Fire Red/Happyhorse) | 4 | B |
| Languages | 9 (en-US/zh-CN/pt/es/ru/fr/de/id/ko) | 1 (Chinese only) | B |
| AI Video Agent | Yes (Beta, 3,000 free points) | None | B |
| Model/Location Shop | Model Shop + Location Shop | None | B |
| Hot Features tools | 8 (Virtual Try-On/AI Model/AI Product/Change Pose/AI Photo Enhancer/AI Fat/AI Image Combiner/AI Clothes Changer) | 5 | B |

### WeShop Model Mentions (homepage HTML count)
- Grok: 12 mentions
- Seedance: 10 mentions
- Kling: 10 mentions
- z-image: 8 mentions
- Seedream: 7 mentions
- Wan AI: 6 mentions
- Sora: 6 mentions
- GPT Image: 5 mentions
- Vidu: 4 mentions
- Veo: 4 mentions
- Nano-Banana: 4 mentions
- Midjourney: 4 mentions
- Hailuo: 4 mentions
- Fire Red: 4 mentions
- Happyhorse: 2 mentions

### WeShop Social Proof
- 3,000,000+ users worldwide
- Brand logos: Mercado Libre, Etsy, Lazada, Shopify, Shopee, eBay, Amazon, Allegro

### WeShop.ai Title
"AI Image & Video Generator – Create with the Latest AI Models Online | WeShop AI"

---

## Code-level gaps: 0 ✅

All previously reported code issues remain resolved:
- aria-label on Hot Features links (5/5) ✅
- pricing section id="pricing" ✅
- Footer dead links removed (/blog, /faq, /affiliate → 404) ✅
- Orphan next-server process conflict resolved ✅

---

## output

```json
{
  "success": true,
  "summary": "R200例行健康检查，全量通过(HTTP200/Console0/Flow5/5/Mobile3/3)。连续稳定86轮。WeShop.ai模型矩阵无变化(15+模型)。代码级差距0。业务级差距需用户提供战略决策。",
  "output": {
    "修复内容": "无",
    "页面行为": "HTTP 200 / Console 0 / Flow 5/5 / Mobile 3/3",
    "是否解决": "网站运行完全正常，连续稳定86轮。WeShop无变化，代码级差距0。"
  },
  "next_suggestions": [
    "A级(用户提供): 评估接入GPT Image 2 API",
    "A级(用户提供): 评估AI视频生成能力（Sora2/Kling/Seedance）",
    "A级(用户提供): 确认NYSE/上市公司关联可作为背书",
    "B级(用户提供): 评估模型数从4扩充到8+",
    "B级(用户提供): 评估接入z-image/Fire Red等新型号"
  ]
}
```
