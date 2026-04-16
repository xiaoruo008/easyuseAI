# 重构实施分析

## 背景
网站从"内容引流工具"（内容/traffic/customer/efficiency/unclear 5题）转型为"AI电商作图服务平台"（3题，方向待定）。

---

## 1. lib/diagnosis.ts

### 当前状态简述
- 5道题，每题4个选项（A/B/C/D）
- 评分维度：`content`, `traffic`, `customer`, `work`（Q1）, `urgency`（Q2）, `readiness`（Q3）, `goal`（Q4）, `budget`（Q5）
- 结果类型：`traffic` | `customer` | `efficiency` | `unclear`（4种）
- 包含 PERSONAS、PAIN_POINTS、WORKFLOWS、IMMEDIATE_VALUES、EXECUTION_ACTIONS 等完整内容

### 需要的改动

#### 题目改动（5→3题）
**保留Q1（核心痛点）**
- 题目1"你现在最头疼的事情是什么？" → 需改造为电商作图相关
- 新题方向：电商卖家的核心痛点（没时间修图/不会设计/想提升转化率/想要更多流量）
- 评分维度需改为与作图服务相关的标签（如 `product_photo`, `background_swap`, `lifestyle`, `conversion`）

**保留Q2（时间和预算）**
- 题目2"你每个月花多少时间在这件事上？" → 保留urgency维度
- 题目5"你的预算范围是？" → 保留budget维度

**删除Q3和Q4**
- "你试过什么方法解决这个问题？" → 删除
- "如果这个问题解决了，你最希望看到什么效果？" → 删除

**新增题目方向（电商作图专项）**
- 新Q3：产品图需求类型（白底主图/模特图/场景图/精修图）
- 新Q4：风格偏好（商业/极简/高端/自然）

#### 结果类型改动（4→3种）
当前4种（traffic/customer/efficiency/unclear）→ 新3种（待定）
可能的新类型方向：
- `product_photo`（主图优化型）
- `lifestyle`（场景图种草型）
- `full_package`（完整方案型）

#### IMMEDIATE_VALUES 改动
当前显示的是文案类内容（小红书文案、自动回复、报表）→ 改为图片类示例
- 展示不同类型的效果图（白底图、模特图、场景图）

#### ExecutionActions 改动
当前 executionActions 包含 text/image 两种 category → 新版以图片完成为主
- 所有 action 的 category 可能统一为 `image`
- action 列表需根据新的3种结果类型重新设计

### 风险点
1. `calculateResult` 函数的评分算法完全改变，所有得分维度需要重新设计
2. `ResultType` 类型变化会影响 `app/result/page.tsx` 的所有类型判断逻辑
3. `EXECUTION_ACTIONS` 改动会影响 `app/execute/page.tsx` 的 actionId 判断
4. `lib/pro-content.ts` 依赖 `ResultType`，改动会连带影响 pro 页面

### 改动量估算
**大**
- 评分体系重建（涉及算法和所有数据）
- 结果类型重新定义
- 所有相关数据（PERSONAS、PAIN_POINTS、WORKFLOWS、IMMEDIATE_VALUES、EXECUTION_ACTIONS）全部替换

---

## 2. app/page.tsx（首页）

### 当前状态简述
- Hero区：左侧Before/After对比大图（4张轮播），右侧文案+CTA
- Case Gallery：4个case展示（bg-swap/retouch/model/scene）
- Pricing：3个套餐（体验¥29/标准¥99/定制¥299）
- CTA section
- Footer

### 需要的改动

#### 删除的sections
- Case Gallery 中的"商品精修"和"模特图"保留，但需要重新定义标签和描述
- 删除与"内容引流"相关的所有表述

#### 新增sections
- **服务流程介绍**：展示从上传图片到交付的完整流程（4步：上传→AI处理→预览→下载）
- **适用场景区**：针对电商卖家的具体场景（淘宝主图、小红书种草、朋友圈素材、抖音短视频）
- **客户见证/案例区**：更详细的Before/After对比，展示不同产品类型的处理效果

#### Hero区改造
- 保持左侧Before/After对比大图结构，但右侧文案改为电商作图相关
- 文案方向：强调"0门槛、10秒钟、专业级效果"
- CTA保留"限量0元领取"按钮

#### 图片处理方式
- Hero区的4张轮播图需要替换为新的效果图（与新的3种作图类型匹配）
- 图片路径：`/images/home/` 下可能需要新增/替换图片

### 风险点
1. 图片资源依赖：需要准备新的效果图素材
2. 所有链接指向 `/diagnosis` 的逻辑不变，诊断流程改造后自然对接

### 改动量估算
**中**
- 文案和标签内容改动为主
- 图片素材替换
- Hero区整体改版

---

## 3. app/diagnosis/page.tsx

### 当前状态简述
- 基于 `DIAGNOSIS_QUESTIONS` 的长度（5题）计算 `TOTAL_STEPS`
- 每题答完后保存到 session API，然后自动进入下一步
- 最后一题答完跳转到 `/result?session=${sessionId}`
- 进度条根据 `(currentStep / TOTAL_STEPS) * 100` 计算

### 需要的改动

#### 改动点1：题目总数
```tsx
const TOTAL_STEPS = DIAGNOSIS_QUESTIONS.length;
// 5题→3题后，TOTAL_STEPS自动变为3
```

#### 改动点2：跳转逻辑
当前：最后一题答完 → `router.push('/result?session=' + sessionId)`
新：最后一题答完 → `router.push('/upload?session=' + sessionId)`
（如果新的流程是 upload 优先的话）

#### 改动点3：localStorage 存储
- 当前没有使用 localStorage，只有 sessionId 存在内存
- 如果新流程需要在前端保存答案进度，localStorage 结构可能需要调整
- 当前数据结构 `Record<number, AnswerValue>` 不需要变

#### 改动点4：API 调用
- `PATCH /api/diagnosis/session/${sessionId}` 的 body 结构可能需要调整
- 当前 body: `{ step, answers, completed }` → 新流程可能需要新增字段

### 风险点
1. 如果新流程不是 diagnosis → result 而是 diagnosis → upload，则跳转逻辑需要全面修改
2. session API 的结果计算逻辑在 `/api/diagnosis/session/[id]/result/route.ts`，需要同步改造

### 改动量估算
**小**
- TOTAL_STEPS 自动变化（DIAGNOSIS_QUESTIONS.length）
- 可能只需修改跳转 URL（1行代码）

---

## 4. app/result/page.tsx

### 当前状态简述
- 从 `/api/diagnosis/session/${sessionId}/result` 获取数据
- 展示：选择（fields）/ 示例效果 / 你的情况（persona+painPoint）/ 核心问题 / 工作流（workflow）/ 即时价值（immediateValue）/ 执行动作（executionActions）/ 获取服务（submit/payment）
- 底部有加微信CTA

### 需要的改动

#### 结果类型判断逻辑（4→3）
```tsx
// 当前类型判断逻辑在 lib/diagnosis.ts 的 calculateResult 中
// 4种：traffic / customer / efficiency / unclear
// 新3种：product_photo / lifestyle / full_package（待定）
```

#### IMMEDIATE_VALUES 区域
当前显示：
- traffic → 小红书引流文案示例
- customer → 自动回复示例
- efficiency → 月度报表示例
- unclear → 咨询问题列表

**新：改为图片效果示例**
- 直接展示Before/After对比图
- 不再是文字内容，而是视觉冲击力强的效果图展示

#### 执行动作按钮（executionActions）
当前每个结果类型有3-5个 action：
- traffic: copywriting, headline, product_desc, product_photo, background_swap
- customer: reply_script, welcome_msg, follow_up
- efficiency: report, data_clean, schedule, product_photo
- unclear: consult, plan, background_swap

**新：executionActions 统一为图片类**
- 可能只有 product_photo, background_swap, lifestyle 等图片相关 action
- category 统一为 `image`

#### "获取服务"区域
当前：
- 免费体验 → `/submit?session=${sessionId}`
- ¥99 标准档 → PaymentModal
- ¥299 完整交付 → PaymentModal

**新：可能需要重新定义价格档位**
- ¥29 体验档（1张图）
- ¥99 标准档（5张同规格）
- ¥299 完整档（完整方案+顾问服务）

#### 跳转逻辑变化
当前 result 页面直接跳转到 execute → 返回result 循环
**新：result → upload（上传原图）→ 等待AI处理 → 展示结果**

### 风险点
1. `ResultData` 接口中的 `fields` 和 `workflow` 来自 `/api/diagnosis/session/[id]/result/route.ts`，需要同步改造
2. 如果从5题改3题，session API 返回的数据结构可能变化
3. PaymentModal 组件需要确认是否存在且可用（当前搜索不到文件但 ls 显示存在）

### 改动量估算
**大**
- 结果类型判断逻辑重写
- IMMEDIATE_VALUES 展示方式从文字改为图片
- executionActions 完全重新设计
- 获取服务区域重新布局

---

## 5. app/upload/page.tsx（新建）

### 需要的功能

#### 核心功能
1. **文件上传**：支持拖拽+点击上传，接受 image/* 格式
2. **图片预览**：上传后立即显示预览（使用 URL.createObjectURL）
3. **风格/类型选择**：选择需要的图片处理类型（白底/模特/场景/精修）
4. **提交到AI处理**：调用 `/api/execute/generate` 或新的处理API
5. **跳转到结果展示**：处理完成后展示结果或跳转到结果页

#### 需要的状态
```tsx
interface UploadState {
  file: File | null;
  previewUrl: string | null;
  selectedType: 'white_bg' | 'model' | 'lifestyle' | 'retouch' | null;
  selectedStyle: 'commercial' | 'minimal' | 'luxury' | null;
  aspectRatio: '1:1' | '3:4' | '16:9';
  uploading: boolean;
  error: string | null;
}
```

#### 与 submit 页的数据传递
- 如果 diagnosis → upload → submit，则数据通过 URL query params 传递（sessionId）
- 如果 upload → submit 合并，则 upload 直接收集所有信息后调用 API

#### 文件预览实现
```tsx
const previewUrl = file ? URL.createObjectURL(file) : null;
// 使用 <img src={previewUrl} /> 或 Next.js <Image> 组件展示
```

### 风险点
1. 文件上传大小限制需要后端 API 配合
2. AI 处理是异步还是同步？同步的话需要 loading 状态和超时处理
3. 如果是异步，需要考虑轮询或 WebSocket

### 改动量估算
**中（新建）**
- 从头新建页面
- 需要与 execute/page.tsx 区分职责

---

## 6. app/submit/page.tsx

### 当前状态简述
- 表单字段：name, phone, company, note, file（附件上传）
- 提交到 `/api/leads`
- 成功页：静态"提交成功"提示

### 需要的改动

#### 新增字段
1. **wechat_id**（微信号）
   - 新增输入框：微信/备注
   - 必填还是选填待定

2. **product_category**（产品类目）
   - 下拉选择或输入：上衣/裤子/裙子/套装/内衣等
   - 影响后续 AI 处理的效果

3. **selected_styles**（选择的风格）
   - 多选：商业/极简/高端/自然
   - 与 upload 页的选择联动

#### API 调用结构
```tsx
// 当前 POST /api/leads
{
  name, phone, company, note,
  diagnosisSessionId, serviceType, contact
}

// 新增字段后
{
  name, phone, company, note,
  diagnosisSessionId, serviceType, contact,
  wechat_id, product_category, selected_styles
}
```

#### 成功页改造
当前：静态"提交成功"提示
新：
- 展示已上传的图片预览（如有）
- 告知用户顾问将在XX小时内联系
- 提供继续上传更多图片的入口

### 风险点
1. `/api/leads` API 需要同步新增字段处理
2. 如果 product_category 和 selected_styles 需要从 upload 页传递，跨页状态管理需要设计

### 改动量估算
**中**
- 新增3个表单字段
- API body 结构扩展
- 成功页增强

---

## 7. app/result/pro/page.tsx

### 当前状态简述
- 从 `/api/diagnosis/session/${sessionId}/result` 获取 diagnosis result
- 根据 `result.type` 调用 `getProContent(type)` 获取详细工作流
- 展示：服务流程（8步）/ 示例脚本 / 爆款标题 / 执行说明 / CTA
- 通过 `PaymentModal` 处理支付

### 所有指向这个页面的链接

通过代码分析，链接指向 `/result/pro` 的地方：

1. **app/result/page.tsx**（第298行）
   ```tsx
   onClick={() => setPaymentType("pro")}
   // 点击"¥299 完整交付"按钮 → 触发 PaymentModal，而非直接跳转
   ```
   实际上 pro 页面不是直接链接跳转，而是通过 PaymentModal 弹窗处理

2. **文档中**（docs/WEBSITE_PLAN.md）
   - 多处提及 `/result/pro` 作为完整交付的跳转目标

### 分析

**PaymentModal 内部做了什么？**
- 从 result/page.tsx 导入 PaymentModal 组件
- 当前 PaymentModal 组件存在但文件路径未被搜索到
- 需要确认 PaymentModal 的具体实现

**最简单处理方式**

由于新网站定位为"AI电商作图服务平台"，pro 页面的完整工作流内容可能不再适用（当前 pro 内容是关于内容引流、客服自动化、数据报表的，与图片制作无关）。

**推荐方案：**
1. **隐藏（不删除）**：将 pro 按钮从 result 页面移除，避免用户看到
2. **删除**：如果确认不需要 pro 页面，直接删除文件和 PaymentModal 组件
3. **改造**：如果需要保留完整服务概念，将 pro 页面改造为"完整方案"服务介绍（但需匹配新的图片服务定位）

### 风险点
1. PaymentModal 组件如果被删除，result 页面中的 `setPaymentType("pro")` 调用会报错
2. `/api/diagnosis/session/[id]/result/route.ts` 中可能没有 `/result/pro` 相关逻辑

### 改动量估算
**小**（如果隐藏/删除）或 **中**（如果改造）

---

## 8. 路由和导航

### 当前导航结构

```
首页 (/)
  ├── Header: logo + [开始diagnosis] + [后台dashboard]
  ├── Footer: © easyuse.ai + [后台] + [开始]
  │
诊断 (/diagnosis)
  ├── Header: ← 返回 + "问题诊断"
  └── 独立页面，无Footer
  │
结果 (/result)
  ├── Header: ← 返回 + "分析结果"
  └── 独立页面，无Footer
  │
执行 (/execute)
  ├── Header: ← 返回 + [任务名]
  └── 独立页面，无Footer
  │
提交 (/submit)
  ├── Header: ← 返回 + "留下联系方式"
  └── 独立页面，无Footer
  │
Pro (/result/pro)
  └── Header: ← 返回 + "完整执行版"
  │
后台 (/dashboard/leads)
  └── 独立管理后台
```

### 需要调整的地方

#### Header 导航
- 首页 header 右侧"开始"链接指向 `/diagnosis` → 保持不变（诊断流程改造后自然衔接）
- "后台"链接指向 `/dashboard/leads` → 保持不变

#### 新增 upload 页面导航
- 如果 diagnosis → upload → result，则需要：
  - diagnosis 完成后跳转到 `/upload?session=${sessionId}`
  - upload header 左侧"返回"指向上一页（可能是 `/diagnosis` 或 `/result`）
  - upload 完成后跳转到 `/submit?session=${sessionId}`

#### Footer 调整
- 首页 footer 的"开始"链接指向 `/diagnosis` → 保持不变

#### result 页面导航调整
- 如果新流程不经过 diagnosis 直接 upload，则 result 页面可能需要重新设计返回逻辑

### 风险点
1. upload 页面新建后，需要确保所有跳转路径正确
2. sessionId 需要在所有页面间正确传递

### 改动量估算
**小**
- 主要涉及 3 个跳转 URL 的修改
- upload 页面需要设计返回逻辑

---

## 总结：改动优先级

| 优先级 | 文件/模块 | 改动量 | 依赖关系 |
|--------|----------|--------|---------|
| 1 | lib/diagnosis.ts | 大 | 被所有页面依赖 |
| 2 | app/result/page.tsx | 大 | 依赖 diagnosis 类型 |
| 3 | app/page.tsx | 中 | 独立 |
| 4 | app/submit/page.tsx | 中 | 独立 |
| 5 | app/diagnosis/page.tsx | 小 | 依赖 diagnosis |
| 6 | app/upload/page.tsx | 中（新建） | 新建，无依赖 |
| 7 | app/result/pro/page.tsx | 小 | 可隐藏 |
| 8 | 路由和导航 | 小 | 配合其他改动 |

### 关键依赖链
```
lib/diagnosis.ts（核心改造）
    ↓
app/diagnosis/page.tsx（题目数量变化）
    ↓
session API（/api/diagnosis/session/[id]/result）
    ↓
app/result/page.tsx（类型判断和展示逻辑）
    ↓
app/execute/page.tsx（action 判断）
```
