# 方案A对比测试案例

> 基于 `lib/image/providers/minimax-cn.ts` (TRENDING_PROMPT_PREFIX) × `lib/types/fashion.ts` (PATTERN_PROMPTS)
> 生成时间：2026-04-15
> Prompt 构造公式：`fullPrompt = TRENDING_PREFIX[diagnosisType] + STYLE_PREFIX[style] + TYPE_PREFIX[type] + PATTERN_PROMPTS[key] + 用户输入`

---

## 案例1：traffic + 女装

**诊断类型：** traffic
**商品：** 春夏款轻薄针织衫
**Action：** model_photo
**Template Key：** `top_model`

---

**原 prompt（当前线上版本）：**

```
Professional fashion/lifestyle product photography, Natural fashion photograph of a model wearing a casual top, half-body composition with soft natural background, fresh approachable energy, relaxed pose with slight smile, good skin lighting, commercial fashion quality, bright clean color grading, authentic lifestyle feel, natural expression, everyday fashion mood. 春夏款轻薄针织衫
```

**新 prompt（方案A版本）：**

```
Pinterest-worthy fashion flat lay, warm morning golden hour light, cozy bedroom backdrop, tagged by fashion lovers, like and share if you save, casual daily wear aesthetic, soft skin detail, iPhone 14 lifestyle shot, no branding Professional fashion/lifestyle product photography, Natural fashion photograph of a model wearing a casual top, half-body composition with soft natural background, fresh approachable energy, relaxed pose with slight smile, good skin lighting, commercial fashion quality, bright clean color grading, authentic lifestyle feel, natural expression, everyday fashion mood. 春夏款轻薄针织衫
```

---

**差异说明：**

- **新增内容：** `Pinterest-worthy fashion flat lay, warm morning golden hour light, cozy bedroom backdrop, tagged by fashion lovers, like and share if you save, casual daily wear aesthetic, soft skin detail, iPhone 14 lifestyle shot, no branding` — 共约50词
- **变化点：** 头部新增完整的 traffic 诊断前缀，贴合小红书"种草"内容调性
- **去除内容：** 与原版相比，去除了原版开头的显式质量描述（但被 prepend 到后面了，所以内容本身保留）

**预期视觉变化：**

- **图片氛围：** 温暖晨光、金色时刻色调、卧室/居家背景，呈现"博主随手拍"质感；整体偏 lifestyle 种草风，而非标准化棚拍
- **与原版相比：** 原版为干净自然背景的标准商业模特图；新版本更具社交媒体传播感，有"可保存/可分享"的 Pinterest 式氛围，场景感更强，商品感略弱

---

## 案例2：customer + 男装

**诊断类型：** customer
**商品：** 深蓝色西装套装
**Action：** background_swap
**Template Key：** `suit_set_main_white`

---

**原 prompt（当前线上版本）：**

```
Professional product photography with clean background, Full-body flat lay of a tailored 2-piece business suit set on a pure white background, pristine white studio backdrop, professional and clean product photography, sharp tailoring details visible, natural fabric drape, high-end commercial quality, minimal shadows, even diffused lighting, front-facing centered composition, e-commerce standard. 深蓝色西装套装
```

**新 prompt（方案A版本）：**

```
4K UHD commercial product photography, white seamless background, multiple angles showcase, soft drop shadow for depth, clean retail-ready presentation, visible stitching and fabric texture detail, size reference overlay, trust-building e-commerce aesthetic Professional product photography with clean background, Full-body flat lay of a tailored 2-piece business suit set on a pure white background, pristine white studio backdrop, professional and clean product photography, sharp tailoring details visible, natural fabric drape, high-end commercial quality, minimal shadows, even diffused lighting, front-facing centered composition, e-commerce standard. 深蓝色西装套装
```

---

**差异说明：**

- **新增内容：** `4K UHD commercial product photography, white seamless background, multiple angles showcase, soft drop shadow for depth, clean retail-ready presentation, visible stitching and fabric texture detail, size reference overlay, trust-building e-commerce aesthetic` — 共约45词
- **变化点：** 新增 customer 诊断前缀，强调"4K UHD"、"信任感电商美学"、"尺寸参考"、"面料纹理可见"等天猫/京东主图高转化属性
- **去除内容：** 无内容去除，PATTERN_PROMPTS 模板完整保留在尾部

**预期视觉变化：**

- **图片氛围：** 纯白底、分影轮廓、专业电商主图标准；强调西装缝线、面料纹理等细节；接近天猫男装旗舰店主图风格
- **与原版相比：** 原版棚拍感略强但缺转化引导属性；新版本更突出"面料质感/缝线细节/尺寸参照"等转化要素，更符合男装消费者决策需求

---

## 案例3：efficiency + 配饰

**诊断类型：** efficiency
**商品：** 皮带
**Action：** product_photo
**Template Key：** `top_hero_branded`（配饰类目映射）

---

**原 prompt（当前线上版本）：**

```
Professional e-commerce product photography, clean studio lighting, Polished brand photograph of a model wearing a stylish casual top, half or full-body composition in soft directional studio lighting with subtle rim light, premium fashion aesthetic, relaxed approachable energy, high-end commercial quality, clean sophisticated composition, warm inviting color grading, natural skin tone lighting, aspirational yet accessible mood. 皮带
```

**新 prompt（方案A版本）：**

```
Fast-scrolling e-commerce main image, pure white background, crisp product silhouette, zero distracting elements, instant visual recognition, mobile-first composition, factory wholesale clarity, maximum product visibility, b2b marketplace standard Professional e-commerce product photography, clean studio lighting, Polished brand photograph of a model wearing a stylish casual top, half or full-body composition in soft directional studio lighting with subtle rim light, premium fashion aesthetic, relaxed approachable energy, high-end commercial quality, clean sophisticated composition, warm inviting color grading, natural skin tone lighting, aspirational yet accessible mood. 皮带
```

---

**差异说明：**

- **新增内容：** `Fast-scrolling e-commerce main image, pure white background, crisp product silhouette, zero distracting elements, instant visual recognition, mobile-first composition, factory wholesale clarity, maximum product visibility, b2b marketplace standard` — 共约45词
- **变化点：** 新增 efficiency 诊断前缀，强调"移动端优先"、"快速划过即识别"、"工厂批发清晰度"、"最大产品可见度"，专为1688/B2B快速选品场景设计
- **去除内容：** 无内容去除，PATTERN_PROMPTS 模板完整保留

**预期视觉变化：**

- **图片氛围：** 纯白底、轮廓锐利、无干扰元素；产品占比最大化；适合移动端快速滑动浏览的批发场景
- **与原版相比：** 原版有模特和场景元素，更偏品牌感；新版本去掉背景干扰，产品主体更突出，符合1688批发商"快速出图、看货不费眼"的诉求

---

## 案例4：unclear + 鞋类

**诊断类型：** unclear
**商品：** 复古运动鞋
**Action：** lifestyle
**Template Key：** `pants_lifestyle`（鞋类场景映射）

---

**原 prompt（当前线上版本）：**

```
Product beautifully placed in a lifestyle scene, warm natural lighting, Lifestyle photograph of a model wearing casual chic pants in an urban setting like a stylish city street or cozy cafe, soft natural daylight, relaxed aspirational atmosphere, authentic everyday moment, warm color palette, shallow depth of field with pleasing bokeh, high production value, modern urban lifestyle mood, sophisticated casual aesthetic. 复古运动鞋
```

**新 prompt（方案A版本）：**

```
Mood board outfit inspiration, soft diffused natural light, styled layered look with accessories, Pinterest editorial aesthetic, warm inviting atmosphere, outfit combination possibilities, save-for-later aspirational vibe, lifestyle storytelling moment, discovery-friendly composition Product beautifully placed in a lifestyle scene, warm natural lighting, Lifestyle photograph of a model wearing casual chic pants in an urban setting like a stylish city street or cozy cafe, soft natural daylight, relaxed aspirational atmosphere, authentic everyday moment, warm color palette, shallow depth of field with pleasing bokeh, high production value, modern urban lifestyle mood, sophisticated casual aesthetic. 复古运动鞋
```

---

**差异说明：**

- **新增内容：** `Mood board outfit inspiration, soft diffused natural light, styled layered look with accessories, Pinterest editorial aesthetic, warm inviting atmosphere, outfit combination possibilities, save-for-later aspirational vibe, lifestyle storytelling moment, discovery-friendly composition` — 共约45词
- **变化点：** 新增 unclear 诊断前缀，定位"探索期用户"需求——强调 Pinterest editorial 风格、组合搭配可能性、"收藏备用"氛围，适合得物等潮流发现平台
- **去除内容：** 无内容去除；尾部保留 lifestyle 场景图模板

**预期视觉变化：**

- **图片氛围：** 柔和自然光、暖调、层次感强；接近 Pinterest 时尚灵感板风格，强调"这套怎么搭配"的氛围感
- **与原版相比：** 原版是城市街景/咖啡馆场景图，偏展示性；新版本更强调"编辑灵感板"和"收藏待用"的内容发现感，更符合得物卖家在探索定位阶段需要的"种草感"和"氛围感"

---

## 对比汇总

| 案例 | 诊断类型 | 原版关键词 | 新版核心差异 |
|------|---------|-----------|------------|
| 1. 女装针织衫 | traffic | 商业模特图 | 小红书/Pinterest 种草风，温暖金色时刻，居家背景 |
| 2. 男装西装 | customer | 白底棚拍 | 4K UHD，电商信任感，面料/缝线细节，尺寸参考 |
| 3. 皮带 | efficiency | 品牌模特图 | 移动端优先，轮廓锐利，零干扰，B2B清晰度 |
| 4. 复古运动鞋 | unclear | 城市 lifestyle | Pinterest 灵感板，收藏氛围，搭配可能性，编辑感 |

## 验证方法建议

1. **A/B 盲测：** 同一商品输入，分别跑原版（无 TRENDING_PREFIX）和新版（有 TRENDING_PREFIX），让用户打分
2. **关键指标：** traffic→小红书点赞/保存率；customer→天猫点击率；efficiency→1688询盘转化；unclear→得物粉丝增长
3. **注意：** `generateBatch()` 方法（第237行）目前**未使用** `trendingPart`，批量生成不走方案A；单张生成（`generate()`）走方案A
