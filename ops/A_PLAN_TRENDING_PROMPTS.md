# MiniMax 爆款 Prompt 前缀 — 按 Diagnosis Type

> 用途：作为 MiniMax 图片生成的 prompt 前缀，接在风格前缀之后、模板骨架之前  
> 目标：让生成的图片更有平台爆款感、更有转化力

## 输出格式（可直接复制到 lib/image/providers/minimax-cn.ts）

```ts
const TRENDING_PROMPT_PREFIX: Record<string, string> = {
  traffic: "...",
  customer: "...",
  efficiency: "...",
  unclear: "...",
};
```

---

## traffic — 没有流量/客流

**目标平台：** 小红书、抖音、微信朋友圈  
**目标感受：** 种草感、想点进去、想收藏/分享

### 爆款前缀

```
Pinterest-worthy fashion flat lay, warm morning golden hour light, cozy bedroom backdrop, tagged by fashion lovers, like and share if you save, casual daily wear aesthetic, soft skin detail, iPhone 14 lifestyle shot, no branding
```

**词数：34**  
**核心关键词：** Pinterest-worthy, warm golden hour, tagged by fashion lovers, like and share if you save, casual daily wear, iPhone lifestyle shot

---

## customer — 有流量但转化低/客服累

**目标平台：** 淘宝、天猫、京东  
**目标感受：** 专业可信、快速做购买决定、信任感

### 爆款前缀

```
4K UHD commercial product photography, white seamless background, multiple angles showcase, soft drop shadow for depth, clean retail-ready presentation, visible stitching and fabric texture detail, size reference overlay, trust-building e-commerce aesthetic
```

**词数：32**  
**核心关键词：** 4K UHD, white seamless, multiple angles, soft drop shadow, visible stitching, size reference overlay, trust-building

---

## efficiency — 拍照/修图太慢

**目标平台：** 淘宝主图、1688、拼多多  
**目标感受：** 高效清晰、一眼看清商品、节省决策时间

### 爆款前缀

```
Fast-scrolling e-commerce main image, pure white background, crisp product silhouette, zero distracting elements, instant visual recognition, mobile-first composition, factory wholesale clarity, maximum product visibility, b2b marketplace standard
```

**词数：31**  
**核心关键词：** pure white background, crisp product silhouette, zero distracting elements, instant visual recognition, mobile-first, factory wholesale clarity

---

## unclear — 用户还没想清楚要什么

**目标平台：** 得物、小红书、公众号  
**目标感受：** 多搭感、"原来可以这样搭"、探索感

### 爆款前缀

```
Mood board outfit inspiration, soft diffused natural light, styled layered look with accessories, Pinterest editorial aesthetic, warm inviting atmosphere, outfit combination possibilities, save-for-later aspirational vibe, lifestyle storytelling moment, discovery-friendly composition
```

**词数：33**  
**核心关键词：** mood board, styled layered look, Pinterest editorial aesthetic, warm inviting atmosphere, outfit combination possibilities, save-for-later, lifestyle storytelling

---

## 最终 TS 输出

```ts
const TRENDING_PROMPT_PREFIX: Record<string, string> = {
  traffic: "Pinterest-worthy fashion flat lay, warm morning golden hour light, cozy bedroom backdrop, tagged by fashion lovers, like and share if you save, casual daily wear aesthetic, soft skin detail, iPhone 14 lifestyle shot, no branding",
  customer: "4K UHD commercial product photography, white seamless background, multiple angles showcase, soft drop shadow for depth, clean retail-ready presentation, visible stitching and fabric texture detail, size reference overlay, trust-building e-commerce aesthetic",
  efficiency: "Fast-scrolling e-commerce main image, pure white background, crisp product silhouette, zero distracting elements, instant visual recognition, mobile-first composition, factory wholesale clarity, maximum product visibility, b2b marketplace standard",
  unclear: "Mood board outfit inspiration, soft diffused natural light, styled layered look with accessories, Pinterest editorial aesthetic, warm inviting atmosphere, outfit combination possibilities, save-for-later aspirational vibe, lifestyle storytelling moment, discovery-friendly composition",
};
```
