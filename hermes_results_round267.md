# R267 — 2026-05-01 09:05 UTC

## Health Status
- HTTP 200 ✅ (port 3005)
- Console 0 ✅
- Flow 5/5 ✅
- Mobile 3/3 ✅

## Incident & Fix
orphan next-server (v15.5.14) process (pid 8691) was occupying port 3005, causing HTTP 500. Detected via EADDRINUSE in logs + curl returning 500. Fixed with pkill -9 -f "next" + rm -rf .next + env PORT=3005 npx next dev.

## Summary
R267健康检查全量通过(HTTP200/Console0/Flow5/5/Mobile3/3)。检测并修复orphan next-server进程冲突，恢复服务。WeShop模型矩阵较上轮无变化，Grok(12)/Seedance(10)/Kling(10)仍为最核心模型。

## WeShop.ai 对标观察（curl HTML分析）

**WeShop模型提及次数（较上轮无变化）：**
- Grok: 12 | Seedance: 10 | Kling: 10 | z-image: 8 | Seedream: 7 | Wan AI: 6 | Sora: 6 | GPT Image 2: 5 | Veo: 4 | Nano-Banana: 4 | Midjourney: 4 | Hailuo: 4 | Fire Red: 4

**WeShop业务级差距（维持不变）：**
- A级（用户提供）：NYSE/上市公司背书（WeShop=MOGU NYSE上市公司）
- A级（用户提供）：视频生成能力（WeShop有42处AI Video提及，Kling/Seedance/Sora/Veo/Grok）
- A级（用户提供）：GPT Image 2专区
- B级（用户提供）：模型数从4扩充到8+（WeShop有13个模型）
- B级（用户提供）：多语言支持（WeShop支持多语言切换器）
- C级（用户提供）：Resource/Affiliate/App菜单
- C级（用户提供）：社交证明数字更新（3200+ → 更大数字如1万+）

## output
```json
{
  "success": true,
  "summary": "R267健康检查全量通过(HTTP200/Console0/Flow5/5/Mobile3/3)。检测并修复orphan next-server进程冲突(port 3005→500)，执行pkill+清理.next+重启后恢复。WeShop模型矩阵无变化。",
  "output": {
    "修复内容": "R267修复orphan next-server (v15.5.14)进程占用port 3005导致500错误",
    "页面行为": "HTTP 200 / Console 0 / Flow 5/5 / Mobile 3/3",
    "是否解决": "是 — orphan进程已清理，dev server正常响应"
  },
  "next_suggestions": [
    "A级(用户提供): 评估接入AI视频生成能力（Sora2/Kling/Seedance/Grok Video）",
    "A级(用户提供): 评估接入GPT Image 2 API",
    "A级(用户提供): 确认NYSE/上市公司关联可作为背书",
    "B级(用户提供): 评估模型数从4扩充到8+",
    "B级(用户提供): 评估接入z-image/Fire Red等新型号",
    "B级(用户提供): 评估多语言支持（至少英文版）",
    "C级(用户提供): 评估Resource/Affiliate/App菜单",
    "C级(用户提供): 评估社交证明数字更新（3200+ → 更大数字如1万+）"
  ]
}
```
