// lib/diagnosis.ts — 5步诊断（用户业务语言版）
// 规则：纯业务痛点，不出现任何AI/技术术语

export type AnswerValue = "A" | "B" | "C" | "D";

export interface Question {
  id: number;
  text: string;
  options: { value: AnswerValue; label: string; scores: Record<string, number> }[];
}

export const DIAGNOSIS_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "你现在产品图最大的问题是什么？",
    options: [
      {
        value: "A",
        label: "没有好图片 — 产品有，但拍出来不好看",
        scores: { image_poor: 3, image_expensive: 0 },
      },
      {
        value: "B",
        label: "AI出图不稳定 — 试过但效果全靠运气",
        scores: { image_poor: 1, image_expensive: 0, image_ai: 2 },
      },
      {
        value: "C",
        label: "实拍太贵 — 找摄影师花钱太多，测款烧不起",
        scores: { image_poor: 0, image_expensive: 3 },
      },
      {
        value: "D",
        label: "还没开始 — 不知道怎么出图，先用厂家图撑着",
        scores: { image_poor: 2, image_expensive: 0 },
      },
    ],
  },
  {
    id: 2,
    text: "你每个月在产品图上花多少钱？",
    options: [
      { value: "A", label: "基本不花钱，用手机随便拍", scores: { urgency: 0 } },
      { value: "B", label: "偶尔请摄影师，一次几百到一千", scores: { urgency: 1 } },
      { value: "C", label: "每月固定花2000~5000在拍摄上", scores: { urgency: 2 } },
      { value: "D", label: "没算过，但知道是一笔不小的开支", scores: { urgency: 3 } },
    ],
  },
  {
    id: 3,
    text: "你最想先解决哪件事？",
    options: [
      { value: "A", label: "省钱 — 用AI替代部分实拍", scores: { goal: 1 } },
      { value: "B", label: "省时间 — 不用每次都等摄影师排期", scores: { goal: 2 } },
      { value: "C", label: "提转化 — 图片更好看，提升下单率", scores: { goal: 3 } },
      { value: "D", label: "稳定 — 每次出图效果都能保证", scores: { goal: 2 } },
    ],
  },
  {
    id: 4,
    text: "你用过AI出图工具吗？",
    options: [
      { value: "A", label: "没用过，不知道怎么开始", scores: { readiness: 0 } },
      { value: "B", label: "试过Midjourney/Stable Diffusion，不太会用", scores: { readiness: 1 } },
      { value: "C", label: "在用，但每次出图效果不稳定", scores: { readiness: 2 } },
      { value: "D", label: "没用过，没时间研究", scores: { readiness: 0 } },
    ],
  },
  {
    id: 5,
    text: "你的预算是多少？",
    options: [
      { value: "A", label: "先了解免费方案", scores: { budget: 0 } },
      { value: "B", label: "100元以内先试试", scores: { budget: 1 } },
      { value: "C", label: "100~500元，效果好可以持续用", scores: { budget: 2 } },
      { value: "D", label: "500元以上，要最好的效果", scores: { budget: 3 } },
    ],
  },
];

// ─── 新的结果类型 ──────────────────────────────────────────────
export type ResultType = "image_poor" | "image_cost" | "image_stability" | "image_start";

export interface ExecutionAction {
  id: string;
  label: string;
  desc: string;
  icon: string;
  category: "text" | "image";
}

export interface DiagnosisResult {
  type: ResultType;
  confidence: number;
  persona: string;        // 用户画像（一句话描述用户）
  painPoint: string;      // 核心问题
  workflow: WorkflowStep[]; // AI工作流步骤
  immediateValue: ImmediateValue; // 即时价值（mock示例）
  suggestedBudget: string;
  urgency: string;
  executionActions: ExecutionAction[]; // 执行动作按钮
}

export interface WorkflowStep {
  step: number;
  title: string;
  desc: string;
  icon: string;
}

export interface ImmediateValue {
  title: string;    // 示例标题
  content: string[]; // 示例内容行（数组）
  label: string;     // 标签，如"你会得到这样的内容"
}

// ─── 诊断规则引擎 ──────────────────────────────────────────────

function dominantScore(answers: Record<number, AnswerValue>): Record<string, number> {
  const totals: Record<string, number> = { image_poor: 0, image_expensive: 0, image_ai: 0 };
  for (const q of DIAGNOSIS_QUESTIONS) {
    const ans = answers[q.id] ?? "D";
    const opt = q.options.find((o) => o.value === ans);
    if (!opt) continue;
    for (const [k, v] of Object.entries(opt.scores)) {
      totals[k] = (totals[k] ?? 0) + v;
    }
  }
  return totals;
}

export function calculateResult(answers: Record<number, AnswerValue>): DiagnosisResult {
  const scores = dominantScore(answers);

  // Q2 urgency
  const urgencyMap: Record<string, string> = {
    A: "低 — 图片将就着用，不急",
    B: "中 — 想换但成本高，在观望",
    C: "高 — 已经影响转化率了",
    D: "紧急 — 买家总说图不好看",
  };
  const urgency = urgencyMap[answers[2] ?? "A"] ?? "中";

  // Q5 budget
  const budgetMap: Record<string, string> = {
    A: "免费方案优先",
    B: "100元以内先试",
    C: "100~500元，效果导向",
    D: "500元以上，要最好的效果",
  };
  const suggestedBudget = budgetMap[answers[5] ?? "A"] ?? "面议";

  // 决策：image_expensive > image_poor > image_ai > image_start
  const { image_poor, image_expensive, image_ai } = scores;
  let type: ResultType;
  if (image_expensive >= image_poor && image_expensive >= image_ai) {
    type = "image_cost";
  } else if (image_ai >= image_poor && image_ai >= image_expensive) {
    type = "image_stability";
  } else if (image_poor >= image_expensive && image_poor >= image_ai) {
    type = "image_poor";
  } else {
    type = "image_start";
  }

  const confidence = Math.min(0.95, 0.4 + Math.max(image_poor, image_expensive, image_ai) * 0.08);

  return {
    type,
    confidence: Math.round(confidence * 100) / 100,
    persona: PERSONAS[type] ?? "待定",
    painPoint: PAIN_POINTS[type] ?? "需要进一步了解你的具体情况",
    workflow: WORKFLOWS[type] ?? [],
    immediateValue: IMMEDIATE_VALUES[type] ?? { title: "", content: [], label: "" },
    suggestedBudget,
    urgency,
    executionActions: EXECUTION_ACTIONS[type] ?? [],
  };
}

// ─── 用户画像 ─────────────────────────────────────────────────

const PERSONAS: Record<ResultType, string> = {
  image_poor: "产品有，但图片拍出来不好看，想提升品质又不知道怎么做的卖家",
  image_cost: "觉得专业摄影太贵，想找性价比更高的出图方案的卖家",
  image_stability: "自己试过AI出图，但效果不稳定、时间不可控的卖家",
  image_start: "还没有系统化的产品图，不知道从哪里开始的卖家",
};

// ─── 核心问题 ─────────────────────────────────────────────────

const PAIN_POINTS: Record<ResultType, string> = {
  image_poor:
    "你的产品不差，但图片拉低了整体档次——买家看到图不想点，这是转化率低的主要原因",
  image_cost:
    "实拍一次的成本，够你用AI出几十张图了——问题是自己用AI反而更费时间，你需要的是一套稳定工作流",
  image_stability:
    "不是AI不好用，是AI的'抽卡'特性让你没法稳定交付——你缺的是一套稳定输出质量的工作流",
  image_start:
    "你想花时间在卖货上，不是花在研究工具上——图片的事交给我们，你管销售就行",
};

// ─── AI工作流（具体步骤，不是功能罗列）──────────────────────────

const WORKFLOWS: Record<ResultType, WorkflowStep[]> = {
  image_poor: [
    { step: 1, title: "分析产品特征", desc: "了解你的产品定位、风格、目标用户", icon: "🔍" },
    { step: 2, title: "确定出图方案", desc: "根据你的平台和用途，选择最优的出图风格", icon: "🎯" },
    { step: 3, title: "AI工作流出图", desc: "我们用稳定的工作流跑图，不用你操心", icon: "⚡" },
    { step: 4, title: "筛选交付", desc: "多张里挑最好的一张给你，不满意重做", icon: "✅" },
  ],
  image_cost: [
    { step: 1, title: "评估产品", desc: "分析你的产品适合哪种出图方案", icon: "📋" },
    { step: 2, title: "制定出图计划", desc: "给你算一笔账，找到性价比最高的方案", icon: "💰" },
    { step: 3, title: "执行出图", desc: "稳定工作流执行，不是抽卡", icon: "🎯" },
    { step: 4, title: "交付成果", desc: "交付可用的电商主图，不满意重做", icon: "✅" },
  ],
  image_stability: [
    { step: 1, title: "诊断当前问题", desc: "分析你之前用AI出图哪里卡住了", icon: "🔍" },
    { step: 2, title: "搭建稳定工作流", desc: "用我们的内部工作流替代随机抽卡", icon: "⚙️" },
    { step: 3, title: "批量出图", desc: "一次性出多张，从中挑选可用结果", icon: "🎯" },
    { step: 4, title: "筛选交付", desc: "多张里挑最好的一张给你，不满意重做", icon: "✅" },
  ],
  image_start: [
    { step: 1, title: "上传产品图", desc: "随手一拍发给我们就行", icon: "📤" },
    { step: 2, title: "顾问确认需求", desc: "我们的人帮你确认想要的效果", icon: "💬" },
    { step: 3, title: "AI出图工作流", desc: "专业工作流执行，不需要你懂任何AI知识", icon: "🤖" },
    { step: 4, title: "48h内交付", desc: "收到确认后48小时内发给你", icon: "📦" },
  ],
};

// ─── 即时价值（mock示例）────────────────────────────────────────

const IMMEDIATE_VALUES: Record<ResultType, ImmediateValue> = {
  image_poor: {
    label: "这是马上就能得到的图片",
    title: "商品精修图示例",
    content: [
      "白底主图 · 淘宝天猫标准",
      "模特上身图 · 服装类适用",
      "生活场景图 · 小红书种草",
      "精修商品图 · 质感升级",
    ],
  },
  image_cost: {
    label: "帮你算了一笔账",
    title: "实拍 vs AI出图",
    content: [
      "实拍：¥2000/次，平均出图10张 = ¥200/张",
      "AI出图：¥99/5张，平均 = ¥20/张",
      "节省 90% 成本，还能更快出更多版本测款",
    ],
  },
  image_stability: {
    label: "这是用稳定工作流出的图",
    title: "稳定输出示例",
    content: [
      "背景干净专业 · 淘宝天猫标准",
      "模特上身效果图 · 服装类适用",
      "生活场景图 · 小红书种草",
      "精修商品图 · 质感升级",
    ],
  },
  image_start: {
    label: "坐等收图就行",
    title: "你只需要做这两步",
    content: [
      "Step 1: 上传你的产品图",
      "Step 2: 告诉我们你想要什么效果",
      "剩下的我们来搞，48h内发给你",
    ],
  },
};

// ─── 执行动作（跳转 /execute 的按钮）──────────────────────────────

const EXECUTION_ACTIONS: Record<ResultType, ExecutionAction[]> = {
  image_poor: [
    { id: "background_swap", label: "换背景", desc: "把杂乱的背景换成干净的专业背景", icon: "🖼️", category: "image" },
    { id: "product_retouch", label: "商品精修", desc: "提升质感，让图片看起来更高级", icon: "✨", category: "image" },
    { id: "model_photo", label: "模特上身", desc: "服装类生成模特上身效果图", icon: "👗", category: "image" },
    { id: "scene_photo", label: "场景图", desc: "把产品放在真实生活场景中", icon: "🏠", category: "image" },
  ],
  image_cost: [
    { id: "background_swap", label: "换背景", desc: "把杂乱的背景换成干净的专业背景", icon: "🖼️", category: "image" },
    { id: "product_retouch", label: "商品精修", desc: "提升质感，让图片看起来更高级", icon: "✨", category: "image" },
    { id: "model_photo", label: "模特上身", desc: "服装类生成模特上身效果图", icon: "👗", category: "image" },
    { id: "scene_photo", label: "场景图", desc: "把产品放在真实生活场景中", icon: "🏠", category: "image" },
  ],
  image_stability: [
    { id: "background_swap", label: "换背景", desc: "把杂乱的背景换成干净的专业背景", icon: "🖼️", category: "image" },
    { id: "product_retouch", label: "商品精修", desc: "提升质感，让图片看起来更高级", icon: "✨", category: "image" },
    { id: "model_photo", label: "模特上身", desc: "服装类生成模特上身效果图", icon: "👗", category: "image" },
    { id: "scene_photo", label: "场景图", desc: "把产品放在真实生活场景中", icon: "🏠", category: "image" },
  ],
  image_start: [
    { id: "background_swap", label: "换背景", desc: "把杂乱的背景换成干净的专业背景", icon: "🖼️", category: "image" },
    { id: "product_retouch", label: "商品精修", desc: "提升质感，让图片看起来更高级", icon: "✨", category: "image" },
    { id: "model_photo", label: "模特上身", desc: "服装类生成模特上身效果图", icon: "👗", category: "image" },
    { id: "scene_photo", label: "场景图", desc: "把产品放在真实生活场景中", icon: "🏠", category: "image" },
  ],
};
