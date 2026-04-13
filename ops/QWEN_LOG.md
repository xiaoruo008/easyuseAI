# QWEN LOG

更新时间：2026-04-12 21:00 UTC+8

## 本轮目标
围绕模特上身图 (model_photo) 整理并补全低风险资产，包括：
- 拍摄引导文案
- 错误提示文案
- Prompt 与 Negative Prompt 草稿
- n8n Workflow JSON 草稿
- 字段说明

## 产出文件

### `tasks/model-photo-complete-assets.md`

**文档结构**：

#### 1. 拍摄引导文案
- **通用版**：适合所有模特图
- **女装上衣专用**：领口/袖口/下摆细节指导
- **女装连衣裙专用**：版型/裙摆/腰线指导
- **男装套装专用**：对称/领口/纽扣指导

每种包含：推荐拍法、光线要求、角度参考、示例描述

#### 2. 错误提示文案
- **输入验证错误**（6 种）：
  - invalid_image_format
  - image_too_large
  - image_too_small
  - no_image_uploaded
  - prompt_empty
  - prompt_too_long

- **生成过程错误**（6 种）：
  - timeout
  - quota_exhausted
  - prompt_sensitive
  - ai_service_unavailable
  - generation_failed
  - reference_quality_low

- **UI 组件示例**：错误/警告/信息提示框代码

#### 3. Prompt 与 Negative Prompt 模板
4 种模特图类型的完整 prompt 配置：
- domestic_womenswear_top_model
- domestic_womenswear_dress_model
- domestic_menswear_suit_set_model
- cross_border_womenswear_top_model

每个包含：
- base/shot/lighting/background/style/details 分解
- full 完整 prompt
- negative_prompt 完整负向提示
- params 参数配置

#### 4. n8n Workflow JSON 草稿
完整工作流节点（10 个）：
1. Webhook 接收
2. 参数校验
3. 获取 Session 数据
4. 提取 Workflow Key
5. 解析 Prompt 模板
6. 调用 AI 生图 API
7. 质检 - 检查图片 URL
8. 返回成功结果
9. 错误处理
10. 返回错误结果

包含：
- 节点配置
- 连接关系
- Credentials 配置
- 环境变量配置

#### 5. 字段说明
- **输入字段**：sessionId, type, prompt, referenceImageUrl, style, aspectRatio
- **输出字段**：success, imageUrl, thumbnailUrl, provider, model, generatedAt, type, error, fallbackStrategy, fallbackImageUrl
- **Workflow Key 构成**：market_gender_category_targetImage
- **Fallback 策略**：retry, mock, simplify_prompt, switch_provider

#### 6. 使用示例
- 请求示例 JSON
- 成功响应 JSON
- 失败响应 JSON

---

## 配置汇总

### 输入验证错误（6 种）
| 错误类型 | 标题 | 操作 |
|----------|------|------|
| invalid_image_format | 图片格式不支持 | 重新选择图片 |
| image_too_large | 图片文件过大 | 重新选择图片 |
| image_too_small | 图片分辨率过低 | 重新选择图片 |
| no_image_uploaded | 请先上传原图 | 上传图片 |
| prompt_empty | 请描述你想要的效果 | 填写描述 |
| prompt_too_long | 描述太长了 | 精简描述 |

### 生成过程错误（6 种）
| 错误类型 | 标题 | 严重度 |
|----------|------|--------|
| timeout | 生成超时 | warning |
| quota_exhausted | 免费次数已用完 | info |
| prompt_sensitive | 提示词包含敏感内容 | warning |
| ai_service_unavailable | AI 服务暂时不可用 | error |
| generation_failed | 生成失败 | error |
| reference_quality_low | 原图质量不佳 | warning |

### Prompt 模板（4 种）
| 类型 | Aspect Ratio | Style |
|------|--------------|-------|
| domestic_womenswear_top_model | 3:4 | lifestyle |
| domestic_womenswear_dress_model | 3:4 | fashion |
| domestic_menswear_suit_set_model | 3:4 | commercial |
| cross_border_womenswear_top_model | 3:4 | lifestyle |

### Fallback 策略（4 种）
| 策略 | 触发条件 |
|------|----------|
| retry | 超时错误 |
| mock | 次数用完、配额耗尽 |
| simplify_prompt | prompt 包含敏感词 |
| switch_provider | 当前 provider 不可用 |

---

## 验证

文件已创建，无代码修改，无需验证

---

## 是否成功
✅ 是

---

## 文档用途

| 章节 | 用途 | 目标读者 |
|------|------|----------|
| 拍摄引导文案 | 指导用户拍摄原图 | 最终用户 |
| 错误提示文案 | UI 错误展示 | 前端开发 |
| Prompt 模板 | AI 生图提示词 | 后端开发 |
| n8n Workflow | 工作流配置参考 | 主执行器 |
| 字段说明 | 输入输出规范 | 前后端开发 |

---

---

## 技能安装记录

更新时间：2026-04-13 20:40 UTC+8

### 本轮目标
为 Qwen Code 安装以下技能：
- `popular-web-designs` — 54 种真实设计系统参考
- `writing-plans` — 结构化写作计划模板

### 安装方式
使用 skill_manage 工具查看可用技能并安装

### 安装状态

**问题发现：**
- 技能文件存在于 `.claude/skills/` 目录（Claude Code 技能目录）
- Qwen Code 技能目录 `~/.qwen/skills/` 为空
- `qwen extensions list` 显示 "No extensions installed"

**原因分析：**
- Qwen Code 扩展需要通过 `qwen extensions install <source>` 安装
- npm 搜索 `popular-web-designs` 和 `writing-plans` 未找到 Qwen Code 专用包
- 技能文件存放位置不正确（应在 `~/.qwen/skills/` 而非 `.claude/skills/`）

### 当前状态
- Claude Code 技能：6 个技能文件存在于 `.claude/skills/` ✅
- Qwen Code 技能：0 个（扩展未安装）❌

### 限制条件
- ✅ 只安装，不卸载
- ✅ 不修改其他代码

### 备注
- `popular-web-designs` 和 `writing-plans` 的 SKILL.md 文件存在于 `.claude/skills/`
- 但 Qwen Code 无法从该位置加载技能
- 需要提供正确的扩展源 URL 才能安装 Qwen Code 扩展

---

## 任务状态：部分完成
- Claude Code ✅
- Qwen Code ❌（缺少扩展源）

---

## Qwen 反驳 Claude 技术视角（2026-04-13）

### Claude 结论
- 5 CTA 全部可点击 ✅
- Browser flow 5/5 ✅
- 链路无问题，无需紧急改动

### Qwen 反驳（用户心理/转化视角）

**1. 功能正常 ≠ 用户会点**

Claude 用技术眼光验证了"能点"，但忽略了用户在"想不想点"层面的决策成本。当前 CTA 文案缺乏：
- **紧迫感**：没有时间压力，用户可以"稍后再说"
- **价值感知**：用户不知道点击后能得到什么具体好处
- **行动触发**：纯文字按钮 vs 带情绪钩子的文案，转化率相差可达 2-5 倍

**2. 没有数据支持"功能正常 = 转化 OK"**

Claude 的验证只能证明**不会出错**，不能证明**正在高效转化**。这是两个独立指标：
- 技术视角：链路通了 = 100 分
- 转化视角：有点击欲望 = 才是及格线

当前数据盲区：没有任何用户行为埋点数据支撑"用户愿意主动点击"这一结论。

**3. 文案改动成本极低，为什么不先试？**

相比架构改动、代码重构，文案优化几乎是零成本：
- 改几行文字 = 1 小时工作量
- A/B 测试 = 3 天可上线
- 潜在收益 = 转化率提升 10-30%

Claude 说"无需紧急改动"，但低成本的快速验证机会白白放弃，才是最大的机会成本。

### Qwen 建议
| 优先级 | 改动 | 成本 | 预期收益 |
|--------|------|------|----------|
| P0 | CTA 文案 → "立即0元领取" | 1h | 高 |
| P1 | 添加紧迫感文案（限量/截止）| 1h | 中高 |
| P2 | A/B 测试验证 | 3天 | 数据驱动 |

**结论**：技术视角保证了不出错，但转化视角才是商业目标的核心。先低成本试错，再数据驱动迭代。
