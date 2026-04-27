# DESIGN.md — easyuse.ai

> AI 服装模特图生成平台设计规范

---

## 1. Visual Theme & Atmosphere

**整体定位：** 时尚电商工具平台，专业与亲切并存。

**基调：** 
- 干净整洁，白色为主背景
- 图片驱动——模特图、商品图为绝对核心
- 色彩点缀克制，强调内容而非装饰
- 亲和力强，不过于严肃，适合跨境卖家日常使用

**密度：** 中等偏低，留白充足，用户专注于上传和生成结果。

---

## 2. Color Palette & Roles

| 角色 | 色值 | 用途 |
|------|------|------|
| Primary | `#FF6B6B` | 主按钮 CTA「开始使用」、重点强调 |
| Primary Hover | `#FF5252` | 主按钮悬停态 |
| Secondary | `#6C5CE7` | 次级强调、标签、模型名称高亮 |
| Accent Warm | `#FFC0CB` | 功能卡片背景、温和点缀 |
| Accent Green | `#00C851` | 成功状态、交付标签 |
| Background | `#FFFFFF` | 主背景 |
| Surface | `#F8F9FA` | 卡片、区块背景 |
| Border | `#E9ECEF` | 分割线、边框 |
| Text Primary | `#1A1A2E` | 标题、主要文字 |
| Text Secondary | `#6C757D` | 说明文字、次要信息 |
| Text Muted | `#ADB5BD` | 占位符、辅助说明 |

---

## 3. Typography Rules

**字体栈：**
```
font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

**层级：**

| 级别 | 尺寸 | 字重 | 用途 |
|------|------|------|------|
| Display | 36–48px | 700–800 | Hero 标题 |
| H1 | 28–32px | 700 | 页面主标题 |
| H2 | 22–26px | 600 | 区块标题 |
| H3 | 18–20px | 600 | 卡片标题 |
| Body | 14–16px | 400 | 正文 |
| Caption | 12–13px | 400 | 辅助说明 |

**行高：** 标题 1.2–1.4，正文 1.6–1.8。

---

## 4. Component Stylings

### 按钮

**Primary Button（主按钮）**
```
背景: #FF6B6B
圆角: 9999px（全圆角，药丸形）
字号: 15px / font-weight: 600
内边距: 12px 28px
悬停: #FF5252 + 轻微阴影
```

**Secondary Button**
```
背景: transparent
边框: 1.5px solid #FF6B6B
文字: #FF6B6B
圆角: 9999px
悬停: 背景填充 #FFF5F5
```

**Ghost Button**
```
背景: transparent
文字: #6C757D
悬停: 文字变 #FF6B6B
```

### 卡片（功能卡片）

```
背景: #FFFFFF
边框: 1px solid #E9ECEF
圆角: 16px
阴影: 0 2px 12px rgba(0,0,0,0.06)
悬停: 阴影加深，微微上浮 translateY(-2px)
内边距: 24px
```

### 输入框

```
背景: #F8F9FA
边框: 1.5px solid #E9ECEF
圆角: 12px
聚焦: 边框变 #FF6B6B，阴影 0 0 0 3px rgba(255,107,107,0.1)
字号: 15px
```

### 导航

```
高度: 64px
背景: 白色 + 底部 1px 边框
字号: 15px
字重: 500
链接间距: 32px
悬停下划线: #FF6B6B 2px
```

---

## 5. Layout Principles

**网格：** 12列，间距 24px，最大内容宽度 1200px。

**模块间距：** 上下区块间距 80–120px，保持呼吸感。

**Hero 区块：**
- 大标题居中或偏左
- CTA 按钮醒目
- 背景可渐变或纯白，不用复杂图案

**功能展示区：**
- 4列网格（桌面）→ 2列（平板）→ 1列（手机）
- 图标 + 标题 + 说明，卡片式

**案例展示：**
- 图片为主，横向滚动或网格
- 标签筛选（电商白底 / 模特上身 / ins风）

**定价区：**
- 3列卡片，中列突出（推荐）

---

## 6. Depth & Elevation

**阴影系统：**

| 等级 | 值 | 用途 |
|------|------|------|
| Light | `0 2px 12px rgba(0,0,0,0.06)` | 卡片默认 |
| Medium | `0 4px 24px rgba(0,0,0,0.10)` | 悬停、浮起 |
| Strong | `0 8px 40px rgba(0,0,0,0.14)` | 弹窗、模态 |

**圆角：**
```
按钮/标签: 9999px
卡片: 16px
输入框: 12px
小元素: 8px
```

---

## 7. Do's and Don'ts

**✅ 应该：**
- 保持图片干净、高质量，优先展示 AI 生成结果
- CTA 按钮使用主色 #FF6B6B，位置醒目
- 功能区用图标 + 简短短语，用户快速理解
- 案例展示用真实商品图，不用占位符
- 移动端保持单列核心流程

**❌ 不应该：**
- 不要用过多的颜色点缀，干扰商品图
- 不要在 Hero 区放复杂动画或视频自动播放
- 不要用纯黑色文字（#000），用 #1A1A2E
- 不要让按钮过于相似（主次区分要明显）

---

## 8. Responsive Behavior

| 断点 | 宽度 | 行为 |
|------|------|------|
| Mobile | < 640px | 单列，功能卡片纵向堆叠 |
| Tablet | 640–1024px | 两列网格 |
| Desktop | > 1024px | 多列完整布局 |

**触摸目标：** 最小 44×44px。

**图片策略：** 商品图 16:9 或 4:3，模特图优先 3:4 竖图。

---

## 9. Agent Prompt Guide

### 颜色速查
```
Primary:    #FF6B6B  (珊瑚红，主 CTA)
Secondary:  #6C5CE7  (紫，次级强调)
Background: #FFFFFF
Surface:    #F8F9FA
Text:       #1A1A2E / #6C757D
```

### 常用布局类 Tailwind 参考
```
主按钮:   bg-[#FF6B6B] text-white rounded-full px-7 py-3
次按钮:   border-2 border-[#FF6B6B] text-[#FF6B6B] rounded-full
卡片:     bg-white rounded-2xl border border-[#E9ECEF] shadow-sm
输入框:   bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]
导航:     h-16 border-b border-[#E9ECEF]
Hero区:   py-20 text-center
```

### 快速生成规范
- **新增页面：** 参考上面 Component 样式，用 Tailwind 等效 class
- **修改按钮：** 主按钮必用 rounded-full + bg-[#FF6B6B]
- **新增卡片：** white + rounded-2xl + shadow-sm 组合
- **图片优先：** 页面中商品图/模特图比例不低于 40%
