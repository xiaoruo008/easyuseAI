# 12 种服装需求类型 - Prompt 模板配置草稿

更新时间：2026-04-12

## 配置结构说明

每种类型包含：
- **type**: 类型标识
- **scene**: 场景类型
- **input_requirements**: 输入要求
- **prompt**: 固定 prompt 模板
- **negative_prompt**: 负向提示模板
- **params**: 生成参数
- **fallback**: 降级策略
- **output_spec**: 输出规格

---

## 类型 1：domestic_menswear_suit_set_main_white

```json
{
  "type": "domestic_menswear_suit_set_main_white",
  "label": "国内男装套装·白底主图",
  "scene": "white_background",
  "input_requirements": {
    "imageType": "product_flat_or_hanging",
    "minResolution": "800x600",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "西装正面完整可见",
      "领口和纽扣清晰",
      "袖子自然摆放对称",
      "背景尽量干净"
    ]
  },
  "prompt": {
    "base": "Professional studio product photography of men's suit jacket, front view, flat lay on pure white seamless background, even soft diffused lighting, no shadows, commercial e-commerce standard, high detail, sharp focus, centered composition, full garment visible",
    "style": "tmall commercial aesthetic, clean professional look",
    "lighting": "even diffused frontal lighting, soft studio lights from both sides",
    "composition": "centered, straight-on front view, full suit visible from collar to hem",
    "product_invariance": "The suit must remain completely identical — same shape, same color, same material, same buttons, same texture. Do NOT alter, deform, recolor, or replace the suit or any part of it in any way."
  },
  "negative_prompt": {
    "base": "no wrinkles, no shadows on background, no human figures, no texture alterations, no color changes",
    "specific": [
      "no folds or creases in fabric",
      "no gradient or textured background",
      "no models or people",
      "no close-up detail only",
      "no tilted or angled view",
      "no harsh shadows",
      "no plastic hangers visible"
    ]
  },
  "params": {
    "aspectRatio": "3:4",
    "model": "image-01",
    "quality": "high",
    "style": "commercial",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "degrade_to_white",
    "mockImageUrl": "https://placehold.co/800x1067/1a1a2e/ffffff?text=Suit+White+BG",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 类型 2：domestic_menswear_suit_set_hero_branded

```json
{
  "type": "domestic_menswear_suit_set_hero_branded",
  "label": "国内男装套装·官网品牌图",
  "scene": "brand_showcase",
  "input_requirements": {
    "imageType": "product_hanging",
    "minResolution": "800x600",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "西装悬挂展现整体版型",
      "领口袖口细节清晰",
      "面料质感可见",
      "可用木质衣架"
    ]
  },
  "prompt": {
    "base": "Premium brand photography of men's suit, hanging on minimalist wooden hanger, soft studio lighting with subtle shadows, luxury boutique aesthetic, warm neutral backdrop, editorial fashion style, sophisticated composition, full suit visible with natural draping",
    "style": "luxury boutique aesthetic, editorial fashion style",
    "lighting": "soft studio lighting with subtle shadows, warm key light",
    "composition": "centered, slightly angled to show depth, full suit with natural draping",
    "product_invariance": "The suit must remain completely identical — same shape, same color, same material, same buttons. Do NOT alter the suit in any way."
  },
  "negative_prompt": {
    "base": "no cheap plastic hangers, no cluttered background, no harsh shadows, no wrinkles",
    "specific": [
      "no cheap plastic hangers",
      "no cluttered or busy background",
      "no harsh direct lighting",
      "no visible wrinkles or creases",
      "no tilted composition",
      "no casual aesthetic"
    ]
  },
  "params": {
    "aspectRatio": "4:5",
    "model": "image-01",
    "quality": "high",
    "style": "editorial",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "safe_prompt",
    "mockImageUrl": "https://placehold.co/800x1000/1a1a2e/ffffff?text=Suit+Brand+Photo",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 类型 3：domestic_menswear_suit_set_model

```json
{
  "type": "domestic_menswear_suit_set_model",
  "label": "国内男装套装·模特图",
  "scene": "model_wearing",
  "input_requirements": {
    "imageType": "product_flat_or_hanging",
    "minResolution": "800x600",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "西装正面完整可见",
      "袖长衣长清晰",
      "肩线细节可见",
      "光线均匀"
    ]
  },
  "prompt": {
    "base": "Professional fashion model photography of man wearing business suit, full body shot, confident professional pose, studio lighting with soft key light, clean white or light gray background, commercial e-commerce style, sharp focus, natural fabric draping, realistic body proportions, masculine confidence",
    "style": "commercial e-commerce fashion style",
    "lighting": "studio lighting with soft key light, even illumination",
    "composition": "full body shot, centered, confident standing pose",
    "product_invariance": "The suit must remain completely identical — same shape, same color, same material. Do NOT alter the suit design or details."
  },
  "negative_prompt": {
    "base": "no casual poses, no wrinkled suit, no distracting background, no unnatural proportions",
    "specific": [
      "no casual or relaxed poses",
      "no wrinkled or creased fabric",
      "no distracting background elements",
      "no distorted body proportions",
      "no facial features focus",
      "no lifestyle setting"
    ]
  },
  "params": {
    "aspectRatio": "3:4",
    "model": "image-01",
    "quality": "high",
    "style": "fashion",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "switch_provider",
    "mockImageUrl": "https://placehold.co/800x1067/1a1a2e/ffffff?text=Suit+Model+Photo",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 类型 4：domestic_womenswear_top_main_white

```json
{
  "type": "domestic_womenswear_top_main_white",
  "label": "国内女装上衣·白底主图",
  "scene": "white_background",
  "input_requirements": {
    "imageType": "product_flat_or_hanging",
    "minResolution": "800x600",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "上衣正面完整可见",
      "领口袖口设计清晰",
      "衣服展平无褶皱",
      "背景干净"
    ]
  },
  "prompt": {
    "base": "Professional studio product photography of women's blouse top, front view, flat lay on pure white seamless background, even soft diffused lighting, no shadows, commercial e-commerce standard, high detail, sharp focus, centered composition, full garment visible, feminine aesthetic",
    "style": "tmall commercial aesthetic, clean professional look",
    "lighting": "even diffused frontal lighting, soft studio lights from both sides",
    "composition": "centered, straight-on front view, full top visible from collar to hem",
    "product_invariance": "The top must remain completely identical — same shape, same color, same material, same buttons, same texture. Do NOT alter, deform, recolor, or replace the top or any part of it in any way."
  },
  "negative_prompt": {
    "base": "no wrinkles, no shadows on background, no human figures, no texture alterations, no color changes",
    "specific": [
      "no folds or creases in fabric",
      "no gradient or textured background",
      "no models or people",
      "no close-up detail only",
      "no tilted or angled view",
      "no harsh shadows"
    ]
  },
  "params": {
    "aspectRatio": "3:4",
    "model": "image-01",
    "quality": "high",
    "style": "commercial",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "degrade_to_white",
    "mockImageUrl": "https://placehold.co/800x1067/1a1a2e/ffffff?text=Womens+Top+White+BG",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 类型 5：domestic_womenswear_top_model

```json
{
  "type": "domestic_womenswear_top_model",
  "label": "国内女装上衣·模特图",
  "scene": "model_wearing",
  "input_requirements": {
    "imageType": "product_flat_or_hanging",
    "minResolution": "800x600",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "上衣正面完整可见",
      "领口袖口设计清晰",
      "光线均匀",
      "颜色准确"
    ]
  },
  "prompt": {
    "base": "Professional fashion model photography of woman wearing casual top blouse, half body shot, natural relaxed pose, soft natural lighting, lifestyle aesthetic, clean minimalist background, commercial fashion style, natural fabric draping, realistic body proportions, sharp focus on garment details, feminine elegance",
    "style": "xiaohongshu lifestyle fashion style",
    "lighting": "soft natural lighting, warm ambient light",
    "composition": "half body shot, centered, natural relaxed pose",
    "product_invariance": "The top must remain completely identical — same shape, same color, same material. Do NOT alter the top design or details."
  },
  "negative_prompt": {
    "base": "no distorted proportions, no unnatural poses, no heavy makeup, no wrinkles",
    "specific": [
      "no distorted body proportions",
      "no stiff or unnatural poses",
      "no heavy makeup or filters",
      "no wrinkled fabric",
      "no cluttered background",
      "no dull colors"
    ]
  },
  "params": {
    "aspectRatio": "3:4",
    "model": "image-01",
    "quality": "high",
    "style": "lifestyle",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "switch_provider",
    "mockImageUrl": "https://placehold.co/800x1067/1a1a2e/ffffff?text=Womens+Top+Model",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 类型 6：domestic_womenswear_top_lifestyle

```json
{
  "type": "domestic_womenswear_top_lifestyle",
  "label": "国内女装上衣·场景图",
  "scene": "lifestyle_flat_lay",
  "input_requirements": {
    "imageType": "product_flat_lay",
    "minResolution": "800x600",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "上衣平铺展开",
      "可搭配简单道具",
      "光线自然",
      "营造氛围感"
    ]
  },
  "prompt": {
    "base": "Lifestyle product photography of women's casual top, flat lay with minimal props such as coffee cup magazine or handbag, warm natural lighting, cozy home cafe aesthetic, soft textured surface wooden table or linen, instagram-worthy composition, relaxed vibe, full garment visible with natural draping",
    "style": "xiaohongshu instagram lifestyle style",
    "lighting": "warm natural lighting, soft ambient light",
    "composition": "flat lay, 45 degree angle, props arranged naturally",
    "product_invariance": "The top must remain completely identical — same shape, same color, same material. Do NOT alter the top in any way."
  },
  "negative_prompt": {
    "base": "no cluttered props, no harsh shadows, no busy patterns, no wrinkles",
    "specific": [
      "no too many props (max 3 items)",
      "no harsh direct shadows",
      "no busy or distracting patterns",
      "no wrinkled fabric",
      "no cluttered background",
      "no stiff arrangement"
    ]
  },
  "params": {
    "aspectRatio": "4:5",
    "model": "image-01",
    "quality": "high",
    "style": "lifestyle",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "switch_provider",
    "mockImageUrl": "https://placehold.co/800x1000/1a1a2e/ffffff?text=Womens+Top+Lifestyle",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 类型 7：domestic_womenswear_dress_main_white

```json
{
  "type": "domestic_womenswear_dress_main_white",
  "label": "国内女装连衣裙·白底主图",
  "scene": "white_background",
  "input_requirements": {
    "imageType": "product_flat_or_hanging",
    "minResolution": "800x600",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "连衣裙正面完整可见",
      "领口袖口裙摆清晰",
      "裙摆自然展开",
      "背景干净"
    ]
  },
  "prompt": {
    "base": "Professional studio product photography of women's dress, front view, flat lay or hanging on pure white seamless background, even soft diffused lighting, minimal shadows, commercial e-commerce standard, high detail, sharp focus, centered composition, full dress visible, feminine aesthetic, natural fabric draping for skirt portion",
    "style": "tmall commercial aesthetic, clean professional look",
    "lighting": "even diffused frontal lighting, soft studio lights from both sides",
    "composition": "centered, straight-on front view, full dress visible from collar to hem",
    "product_invariance": "The dress must remain completely identical — same shape, same color, same material, same buttons, same texture. Do NOT alter, deform, recolor, or replace the dress or any part of it in any way."
  },
  "negative_prompt": {
    "base": "no wrinkles, no shadows on background, no human figures, no texture alterations, no color changes",
    "specific": [
      "no folds or creases in skirt",
      "no gradient or textured background",
      "no models or people",
      "no close-up detail only",
      "no tilted or angled view",
      "no harsh shadows"
    ]
  },
  "params": {
    "aspectRatio": "3:4",
    "model": "image-01",
    "quality": "high",
    "style": "commercial",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "degrade_to_white",
    "mockImageUrl": "https://placehold.co/800x1067/1a1a2e/ffffff?text=Dress+White+BG",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 类型 8：domestic_womenswear_dress_hero_branded

```json
{
  "type": "domestic_womenswear_dress_hero_branded",
  "label": "国内女装连衣裙·官网品牌图",
  "scene": "brand_showcase",
  "input_requirements": {
    "imageType": "product_hanging",
    "minResolution": "800x600",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "连衣裙悬挂展现版型",
      "领口袖口裙摆细节",
      "面料质感可见",
      "可用木质衣架"
    ]
  },
  "prompt": {
    "base": "Premium brand photography of women's dress, hanging on elegant wooden hanger, soft studio lighting with subtle shadows, luxury boutique aesthetic, warm neutral backdrop, editorial fashion style, sophisticated composition, full dress visible with natural draping and flow, feminine elegance and grace",
    "style": "luxury boutique aesthetic, editorial fashion style",
    "lighting": "soft studio lighting with subtle shadows, warm key light",
    "composition": "centered, slightly angled to show depth, full dress with natural flow",
    "product_invariance": "The dress must remain completely identical — same shape, same color, same material. Do NOT alter the dress in any way."
  },
  "negative_prompt": {
    "base": "no cheap plastic hangers, no cluttered background, no harsh shadows, no wrinkles",
    "specific": [
      "no cheap plastic hangers",
      "no cluttered or busy background",
      "no harsh direct lighting",
      "no visible wrinkles or creases",
      "no tilted composition",
      "no casual aesthetic"
    ]
  },
  "params": {
    "aspectRatio": "4:5",
    "model": "image-01",
    "quality": "high",
    "style": "editorial",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "safe_prompt",
    "mockImageUrl": "https://placehold.co/800x1000/1a1a2e/ffffff?text=Dress+Brand+Photo",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 类型 9：domestic_womenswear_dress_model

```json
{
  "type": "domestic_womenswear_dress_model",
  "label": "国内女装连衣裙·模特图",
  "scene": "model_wearing",
  "input_requirements": {
    "imageType": "product_flat_or_hanging",
    "minResolution": "800x600",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "连衣裙正面完整可见",
      "腰线裙长袖口清晰",
      "光线均匀",
      "颜色准确"
    ]
  },
  "prompt": {
    "base": "Professional fashion model photography of woman wearing dress, full body shot, elegant natural pose, studio lighting with soft key light, clean minimalist background, commercial fashion aesthetic, natural fabric draping, realistic body proportions, sharp focus on garment details, feminine grace, flowing skirt movement",
    "style": "commercial fashion aesthetic",
    "lighting": "studio lighting with soft key light, even illumination",
    "composition": "full body shot, centered, elegant standing pose",
    "product_invariance": "The dress must remain completely identical — same shape, same color, same material. Do NOT alter the dress design or details."
  },
  "negative_prompt": {
    "base": "no distorted proportions, no unnatural poses, no facial features, no wrinkles",
    "specific": [
      "no distorted body proportions",
      "no stiff or unnatural poses",
      "no facial features focus",
      "no wrinkled fabric",
      "no cluttered background",
      "no dull colors"
    ]
  },
  "params": {
    "aspectRatio": "3:4",
    "model": "image-01",
    "quality": "high",
    "style": "fashion",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "switch_provider",
    "mockImageUrl": "https://placehold.co/800x1067/1a1a2e/ffffff?text=Dress+Model+Photo",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 类型 10：cross_border_menswear_suit_set_main_white

```json
{
  "type": "cross_border_menswear_suit_set_main_white",
  "label": "跨境男装套装·白底主图",
  "scene": "white_background",
  "input_requirements": {
    "imageType": "product_flat_or_hanging",
    "minResolution": "800x800",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "西装正面完整可见",
      "领口和纽扣清晰",
      "1:1 正方形构图",
      "符合 Amazon 标准"
    ]
  },
  "prompt": {
    "base": "Professional studio product photography of men's suit jacket, front view, flat lay on pure white seamless background, even soft diffused lighting, no shadows, Amazon e-commerce standard, high detail, sharp focus, centered composition, full garment visible, square format 1:1 crop ready",
    "style": "Amazon e-commerce standard, clean professional look",
    "lighting": "even diffused frontal lighting, no shadows on background",
    "composition": "centered, straight-on front view, square 1:1 format",
    "product_invariance": "The suit must remain completely identical — same shape, same color, same material, same buttons. Do NOT alter the suit in any way."
  },
  "negative_prompt": {
    "base": "no wrinkles, no shadows on background, no human figures, no texture alterations, no color changes, no watermarks",
    "specific": [
      "no folds or creases in fabric",
      "no gradient or textured background",
      "no models or people",
      "no close-up detail only",
      "no tilted or angled view",
      "no watermarks or text overlays"
    ]
  },
  "params": {
    "aspectRatio": "1:1",
    "model": "image-01",
    "quality": "high",
    "style": "commercial",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "degrade_to_white",
    "mockImageUrl": "https://placehold.co/800x800/1a1a2e/ffffff?text=Suit+White+BG",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 类型 11：cross_border_womenswear_dress_main_white

```json
{
  "type": "cross_border_womenswear_dress_main_white",
  "label": "跨境女装连衣裙·白底主图",
  "scene": "white_background",
  "input_requirements": {
    "imageType": "product_flat_or_hanging",
    "minResolution": "800x800",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "连衣裙正面完整可见",
      "领口袖口裙摆清晰",
      "1:1 正方形构图",
      "符合 Amazon 标准"
    ]
  },
  "prompt": {
    "base": "Professional studio product photography of women's dress, front view, flat lay or hanging on pure white seamless background, even soft diffused lighting, minimal shadows, Amazon e-commerce standard, high detail, sharp focus, centered composition, full dress visible, square format 1:1 crop ready, feminine aesthetic, natural fabric draping for skirt portion",
    "style": "Amazon e-commerce standard, clean professional look",
    "lighting": "even diffused frontal lighting, no shadows on background",
    "composition": "centered, straight-on front view, square 1:1 format",
    "product_invariance": "The dress must remain completely identical — same shape, same color, same material. Do NOT alter the dress in any way."
  },
  "negative_prompt": {
    "base": "no wrinkles, no shadows on background, no human figures, no texture alterations, no color changes, no watermarks",
    "specific": [
      "no folds or creases in skirt",
      "no gradient or textured background",
      "no models or people",
      "no close-up detail only",
      "no tilted or angled view",
      "no watermarks or text overlays"
    ]
  },
  "params": {
    "aspectRatio": "1:1",
    "model": "image-01",
    "quality": "high",
    "style": "commercial",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "degrade_to_white",
    "mockImageUrl": "https://placehold.co/800x800/1a1a2e/ffffff?text=Dress+White+BG",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 类型 12：cross_border_womenswear_top_model

```json
{
  "type": "cross_border_womenswear_top_model",
  "label": "跨境女装上衣·模特图",
  "scene": "model_wearing",
  "input_requirements": {
    "imageType": "product_flat_or_hanging",
    "minResolution": "800x600",
    "format": ["jpg", "png"],
    "maxFileSize": "10MB",
    "requirements": [
      "上衣正面完整可见",
      "领口袖口下摆清晰",
      "光线均匀",
      "国际化风格"
    ]
  },
  "prompt": {
    "base": "Professional lifestyle model photography of woman wearing casual top, half body shot, relaxed natural pose, warm natural lighting, international e-commerce style, clean background, diverse model representation, sharp focus on garment details, natural fabric draping, realistic body proportions",
    "style": "international e-commerce style, diverse representation",
    "lighting": "warm natural lighting, soft ambient light",
    "composition": "half body shot, centered, relaxed natural pose",
    "product_invariance": "The top must remain completely identical — same shape, same color, same material. Do NOT alter the top design or details."
  },
  "negative_prompt": {
    "base": "no distorted proportions, no unnatural poses, no heavy makeup, no wrinkles",
    "specific": [
      "no distorted body proportions",
      "no stiff or unnatural poses",
      "no heavy makeup or filters",
      "no wrinkled fabric",
      "no cluttered background",
      "no dull colors"
    ]
  },
  "params": {
    "aspectRatio": "3:4",
    "model": "image-01",
    "quality": "high",
    "style": "lifestyle",
    "responseFormat": "url"
  },
  "fallback": {
    "strategy": "switch_provider",
    "mockImageUrl": "https://placehold.co/800x1067/1a1a2e/ffffff?text=Womens+Top+Model",
    "retryCount": 2,
    "retryDelay": 5000
  },
  "output_spec": {
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "provider": "string",
    "model": "string",
    "generatedAt": "ISO8601"
  }
}
```

---

## 配置使用说明

### TypeScript 类型定义

```typescript
interface PromptTemplateConfig {
  type: string;
  label: string;
  scene: string;
  input_requirements: {
    imageType: string;
    minResolution: string;
    format: string[];
    maxFileSize: string;
    requirements: string[];
  };
  prompt: {
    base: string;
    style: string;
    lighting: string;
    composition: string;
    product_invariance: string;
  };
  negative_prompt: {
    base: string;
    specific: string[];
  };
  params: {
    aspectRatio: string;
    model: string;
    quality: string;
    style: string;
    responseFormat: string;
  };
  fallback: {
    strategy: "degrade_to_white" | "safe_prompt" | "switch_provider";
    mockImageUrl: string;
    retryCount: number;
    retryDelay: number;
  };
  output_spec: {
    imageUrl: string;
    thumbnailUrl: string;
    provider: string;
    model: string;
    generatedAt: string;
  };
}
```

### Prompt 拼接规则

```typescript
function buildPrompt(config: PromptTemplateConfig, userPrompt?: string): string {
  const { base, style, lighting, composition, product_invariance } = config.prompt;
  
  let prompt = `${base}, ${style}, ${lighting}, ${composition}, ${product_invariance}`;
  
  if (userPrompt) {
    prompt += `\n\nUser Request: ${userPrompt}`;
  }
  
  return prompt;
}

function buildNegativePrompt(config: PromptTemplateConfig): string {
  const { base, specific } = config.negative_prompt;
  return `${base}, ${specific.join(', ')}`;
}
```
