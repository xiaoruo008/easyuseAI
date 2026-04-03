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
    text: "你现在最头疼的事情是什么？",
    options: [
      {
        value: "A",
        label: "写了没人看 — 朋友圈、产品页、小红书都没人点赞",
        scores: { content: 3, traffic: 1, work: 0 },
      },
      {
        value: "B",
        label: "客户来问同一个问题 — 重复回答，烦死了",
        scores: { content: 0, traffic: 2, work: 2 },
      },
      {
        value: "C",
        label: "每天手动整理数据 — 报表、对账单、库存表，太费时间",
        scores: { content: 0, traffic: 1, work: 3 },
      },
      {
        value: "D",
        label: "想引流获客，但没有好内容持续输出",
        scores: { content: 2, traffic: 2, work: 0 },
      },
    ],
  },
  {
    id: 2,
    text: "你每个月花多少时间在这件事上？",
    options: [
      { value: "A", label: "不到1小时，无所谓", scores: { urgency: 0 } },
      { value: "B", label: "1~5小时，有点烦", scores: { urgency: 1 } },
      { value: "C", label: "5小时以上，已经影响正常工作了", scores: { urgency: 2 } },
      { value: "D", label: "每天都在处理，快崩溃了", scores: { urgency: 3 } },
    ],
  },
  {
    id: 3,
    text: "你试过什么方法解决这个问题？",
    options: [
      { value: "A", label: "没试过，不知道从哪里下手", scores: { readiness: 0 } },
      { value: "B", label: "试过一些方法，但效果不好", scores: { readiness: 1 } },
      { value: "C", label: "正在用某个工具，但效率还是很低", scores: { readiness: 2 } },
      { value: "D", label: "花钱请过人，但成本太高", scores: { readiness: 2 } },
    ],
  },
  {
    id: 4,
    text: "如果这个问题解决了，你最希望看到什么效果？",
    options: [
      { value: "A", label: "省时间 — 每天少干2小时杂事", scores: { goal: 1 } },
      { value: "B", label: "多赚钱 — 客户变多或转化率提升", scores: { goal: 2 } },
      { value: "C", label: "两者都要 — 既省时间又多赚钱", scores: { goal: 3 } },
      { value: "D", label: "不焦虑 — 不用再为这件事睡不着", scores: { goal: 1 } },
    ],
  },
  {
    id: 5,
    text: "你的预算范围是？",
    options: [
      { value: "A", label: "不想花钱，先了解免费方案", scores: { budget: 0 } },
      { value: "B", label: "500元以内，先试试效果", scores: { budget: 1 } },
      { value: "C", label: "500~2000元，效果好可以持续用", scores: { budget: 2 } },
      { value: "D", label: "2000元以上，我要最好的方案", scores: { budget: 3 } },
    ],
  },
];

// ─── 新的结果类型 ──────────────────────────────────────────────
// 不再是 content/auto/data，而是商业结果类型
export type ResultType = "traffic" | "customer" | "efficiency" | "unclear";

export interface ExecutionAction {
  id: string;       // 唯一标识
  label: string;     // 按钮文字
  desc: string;     // 简短描述
  icon: string;      // emoji图标
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
  const totals: Record<string, number> = { traffic: 0, customer: 0, work: 0 };
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
    A: "低 — 暂时影响不大",
    B: "中 — 已经开始消耗精力",
    C: "高 — 急需解决",
    D: "紧急 — 已经严重影响工作",
  };
  const urgency = urgencyMap[answers[2] ?? "A"] ?? "中";

  // Q5 budget
  const budgetMap: Record<string, string> = {
    A: "免费方案优先",
    B: "500元以内先试",
    C: "500~2000元，效果导向",
    D: "2000元以上，全方位解决",
  };
  const suggestedBudget = budgetMap[answers[5] ?? "A"] ?? "面议";

  // 决策：traffic > customer > efficiency > unclear
  const { traffic, customer, work } = scores;
  let type: ResultType;
  if (traffic >= customer && traffic >= work) {
    type = "traffic";
  } else if (customer >= traffic && customer >= work) {
    type = "customer";
  } else if (work >= traffic && work >= customer) {
    type = "efficiency";
  } else {
    type = "unclear";
  }

  const confidence = Math.min(0.95, 0.4 + Math.max(traffic, customer, work) * 0.08);

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
  traffic: "有产品、有客户基础，但内容引流效率低的商家",
  customer: "客户量大、咨询频繁，客服响应成为瓶颈的商家",
  efficiency: "重复性工作繁重，渴望自动化提效的商家",
  unclear: "方向不明确，需要1对1梳理的商家",
};

// ─── 核心问题 ─────────────────────────────────────────────────

const PAIN_POINTS: Record<ResultType, string> = {
  traffic:
    "你的目标客户根本看不到你——不是产品不好，是内容没有触达他们",
  customer:
    "你把大量时间花在了重复问答上，真正的销售机会反而被耽误",
  efficiency:
    "你每天在做那些'不得不做'的杂事，真正能赚钱的事反而没时间做",
  unclear:
    "你需要一个专业顾问，帮你梳理清楚到底哪里出了问题",
};

// ─── AI工作流（具体步骤，不是功能罗列）──────────────────────────

const WORKFLOWS: Record<ResultType, WorkflowStep[]> = {
  traffic: [
    { step: 1, title: "找到你的目标客户", desc: "分析你的产品定位，圈定最可能买单的人群", icon: "🎯" },
    { step: 2, title: "生成内容素材", desc: "根据你的产品卖点，批量产出适配不同平台的文案", icon: "✍️" },
    { step: 3, title: "自动分发", desc: "一键发布到朋友圈、小红书、抖音等平台", icon: "🚀" },
    { step: 4, title: "效果追踪", desc: "哪篇内容有人看、哪个渠道带来客户，一目了然", icon: "📊" },
  ],
  customer: [
    { step: 1, title: "识别高频问题", desc: "整理客户最常问的20个问题，形成标准回复", icon: "🔍" },
    { step: 2, title: "搭建自动回复", desc: "把你的回复逻辑教给系统，客户发来消息自动解答", icon: "💬" },
    { step: 3, title: "精准分流", desc: "复杂问题转给你，简单问题AI处理，互不耽误", icon: "🔀" },
    { step: 4, title: "销售机会提醒", desc: "当客户表达购买意向时，立刻通知你跟进", icon: "🔔" },
  ],
  efficiency: [
    { step: 1, title: "梳理工作流程", desc: "找出每天必须做但最费时间的3件事", icon: "🗺️" },
    { step: 2, title: "设计自动化方案", desc: "用工具替代人工步骤，你只需要确认结果", icon: "⚡" },
    { step: 3, title: "批量处理数据", desc: "多份表格自动合并、清洗、整理，直接出报表", icon: "📑" },
    { step: 4, title: "定时任务", desc: "设置好后，每天自动运行，你不用再盯着", icon: "⏰" },
  ],
  unclear: [
    { step: 1, title: "1对1需求梳理", desc: "顾问和你通话20分钟，定位真正的问题根源", icon: "📞" },
    { step: 2, title: "定制方案输出", desc: "根据你的情况，给出具体的行动清单", icon: "📋" },
    { step: 3, title: "效果承诺", desc: "明确告诉你预期能达到什么效果", icon: "✅" },
  ],
};

// ─── 即时价值（mock示例）────────────────────────────────────────

const IMMEDIATE_VALUES: Record<ResultType, ImmediateValue> = {
  traffic: {
    label: "这是你马上就能得到的内容",
    title: "小红书引流文案示例",
    content: [
      "【标题】同事问我618怎么省了2000块，其实就是换了种囤货方式",
      "【正文开头】以前每次大促我都熬夜凑单，最后发现根本没省多少…直到闺蜜推荐了这个方法",
      "【引导】点击评论区第一条，获取【2026新版囤货清单】",
    ],
  },
  customer: {
    label: "这是客户会立刻看到的回复",
    title: "自动回复示例 — 客户问价",
    content: [
      "👋 您好！感谢咨询~",
      "这款产品目前活动价 **¥299**，比平时省了60元",
      "今天下单的话，还赠送【使用手册+延长保修】",
      "请问您的收货地址是哪里？我帮您查一下快递时效～",
    ],
  },
  efficiency: {
    label: "这是工具会自动生成的报表",
    title: "月度汇总报表（自动生成）",
    content: [
      "【6月销售汇总】总订单 847 单，总营收 ¥213,450",
      "热销TOP3：①产品A 234单 ②产品B 189单 ③产品C 156单",
      "客户复购率 23.4%（上月19.2%），增长 +4.2pp",
      "请查收，如有疑问随时联系 😊",
    ],
  },
  unclear: {
    label: "这是顾问会帮你梳理的方向",
    title: "初次咨询会涵盖的问题",
    content: [
      "你目前最花时间的3件事是什么？",
      "你现在的客户从哪里来？成交率大概多少？",
      "你希望3个月后，这件事变成什么样子？",
    ],
  },
};

// ─── 执行动作（跳转 /execute 的按钮）──────────────────────────────

const EXECUTION_ACTIONS: Record<ResultType, ExecutionAction[]> = {
  traffic: [
    { id: "copywriting", label: "生成引流文案", desc: "生成3条适配小红书/朋友圈的引流内容", icon: "✍️" },
    { id: "headline", label: "生成爆款标题", desc: "生成10个高点击率的标题方案", icon: "🔥" },
    { id: "product_desc", label: "生成商品描述", desc: "生成适合电商平台的商品详情文字", icon: "📦" },
  ],
  customer: [
    { id: "reply_script", label: "生成回复话术", desc: "生成10套常见问题的标准回复", icon: "💬" },
    { id: "welcome_msg", label: "生成欢迎语", desc: "生成新客户欢迎语+引导下单模板", icon: "👋" },
    { id: "follow_up", label: "生成跟进话术", desc: "生成沉默客户唤醒文案", icon: "🔔" },
  ],
  efficiency: [
    { id: "report", label: "自动生成报表", desc: "输入数据，自动生成月度汇总报表", icon: "📊" },
    { id: "data_clean", label: "自动清洗数据", desc: "上传原始数据，输出整理好的Excel", icon: "🧹" },
    { id: "schedule", label: "自动排期表", desc: "输入任务，自动生成每日工作排期", icon: "📅" },
  ],
  unclear: [
    { id: "consult", label: "预约顾问咨询", desc: "填写信息，顾问24小时内联系你", icon: "📞" },
    { id: "plan", label: "生成分步计划", desc: "根据你的情况，生成30天行动计划", icon: "📋" },
  ],
};
