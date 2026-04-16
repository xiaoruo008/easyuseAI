"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { WORKFLOWS, PERSONAS, PAIN_POINTS, type ResultType, type WorkflowStep } from "@/lib/diagnosis";

// ── 案例数据结构 ───────────────────────────────────────────────
export type CaseCategory = "model" | "brand_scene" | "lifestyle" | "detail_upgrade";

export interface CaseStudyItem {
  id: string;
  category: CaseCategory;
  resultTypes: string[]; // 哪些诊断结果可复用这组案例
  title: string;
  subtitle: string;
  beforeImage: string;
  afterImage: string;
  aspectRatio: "1:1" | "3:4" | "4:5" | "9:16";
  beforeLabel: string;
  afterLabel: string;
  priority: number;
}

const CASE_STUDIES: CaseStudyItem[] = [
  {
    id: "model-full",
    category: "model",
    resultTypes: ["image_poor", "image_cost", "image_stability", "image_start"],
    title: "模特上身",
    subtitle: "真实感强，提升买家下单信心",
    beforeImage: "/images/cases/suit-white.jpg",
    afterImage: "/images/cases/suit-model.jpg",
    aspectRatio: "3:4",
    beforeLabel: "白底图",
    afterLabel: "真实模特效果",
    priority: 1,
  },
  {
    id: "brand-scene",
    category: "brand_scene",
    resultTypes: ["image_poor", "image_cost", "image_stability"],
    title: "品牌场景图",
    subtitle: "有调性，种草内容更吸睛",
    beforeImage: "/images/cases/suit-white.jpg",
    afterImage: "/images/cases/suit-brand.jpg",
    aspectRatio: "1:1",
    beforeLabel: "白底图",
    afterLabel: "品牌场景效果",
    priority: 2,
  },
  {
    id: "lifestyle-scene",
    category: "lifestyle",
    resultTypes: ["image_poor", "image_start"],
    title: "生活场景图",
    subtitle: "有氛围感，种草更有说服力",
    beforeImage: "/images/cases/suit-white.jpg",
    afterImage: "/images/cases/suit-scene.jpg",
    aspectRatio: "3:4",
    beforeLabel: "白底图",
    afterLabel: "生活场景图",
    priority: 3,
  },
  {
    id: "detail-upgrade",
    category: "detail_upgrade",
    resultTypes: ["image_cost", "image_poor", "image_stability"],
    title: "商品精修",
    subtitle: "提升质感，详情页转化更高",
    beforeImage: "/images/cases/suit-before.jpg",
    afterImage: "/images/cases/suit-model.jpg",
    aspectRatio: "1:1",
    beforeLabel: "原图",
    afterLabel: "精修效果图",
    priority: 4,
  },
];
function CostCalculator() {
  const [monthlyCount, setMonthlyCount] = useState(20);

  // 传统摄影成本估算（每件商品）
  const traditionalCostPerItem = 800; // 模特+场景+后期
  const traditionalMonthly = monthlyCount * traditionalCostPerItem;

  // AI摄影成本估算
  const aiMonthly = 299; // 基础月费
  const aiCostPerExtra = 10; // 超出基础数量的每件费用
  const aiTotal = monthlyCount > 20 ? aiMonthly + (monthlyCount - 20) * aiCostPerExtra : aiMonthly;

  const savings = traditionalMonthly - aiTotal;
  const savingsPercent = Math.round((savings / traditionalMonthly) * 100);

  return (
    <section className="space-y-4">
      <p className="text-xs font-medium text-amber-600 tracking-wide">成本节省计算器</p>
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 md:p-6 text-white space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white/70 text-sm">每月上新数量</span>
            <span className="text-lg font-bold">{monthlyCount} 件</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={monthlyCount}
            onChange={(e) => setMonthlyCount(Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-xs text-white/40">
            <span>5件</span>
            <span>100件</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-white/50 text-xs mb-1">传统摄影</p>
            <p className="text-xl font-bold">¥{traditionalMonthly.toLocaleString()}</p>
            <p className="text-white/40 text-xs">/月</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-white/50 text-xs mb-1">AI摄影</p>
            <p className="text-xl font-bold text-emerald-400">¥{aiTotal.toLocaleString()}</p>
            <p className="text-white/40 text-xs">/月</p>
          </div>
        </div>

        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-center">
          <p className="text-emerald-300 text-sm">预计每月节省</p>
          <p className="text-2xl font-bold text-emerald-300">¥{savings.toLocaleString()}</p>
          <p className="text-emerald-400/70 text-xs">节省 {savingsPercent}% 成本</p>
        </div>
      </div>
    </section>
  );
}

// 案例展示组件（带真实图片）
const OLD_CASE_STUDIES: CaseStudyItem[] = [
  {
    id: "case-bg",
    category: "lifestyle",
    resultTypes: ["image_poor", "image_cost", "image_stability"],
    title: "换背景",
    subtitle: "白底图→品牌场景图",
    beforeImage: "/images/cases/suit-white.jpg",
    afterImage: "/images/cases/suit-brand.jpg",
    aspectRatio: "1:1",
    beforeLabel: "白底图",
    afterLabel: "品牌场景图",
    priority: 1,
  },
  {
    id: "case-retouch",
    category: "lifestyle",
    resultTypes: ["image_poor", "image_cost", "image_stability"],
    title: "商品精修",
    subtitle: "原图→模特上身效果图",
    beforeImage: "/images/cases/suit-before.jpg",
    afterImage: "/images/cases/suit-model.jpg",
    aspectRatio: "3:4",
    beforeLabel: "原图",
    afterLabel: "模特上身效果图",
    priority: 2,
  },
  {
    id: "case-model",
    category: "lifestyle",
    resultTypes: ["image_poor", "image_cost", "image_stability", "image_start"],
    title: "模特上身",
    subtitle: "白底图→真实模特效果",
    beforeImage: "/images/cases/suit-white.jpg",
    afterImage: "/images/cases/suit-model.jpg",
    aspectRatio: "3:4",
    beforeLabel: "白底图",
    afterLabel: "真实模特效果",
    priority: 3,
  },
  {
    id: "case-scene",
    category: "lifestyle",
    resultTypes: ["image_poor", "image_cost", "image_stability"],
    title: "场景图",
    subtitle: "白底图→生活场景图",
    beforeImage: "/images/cases/suit-white.jpg",
    afterImage: "/images/cases/suit-scene.jpg",
    aspectRatio: "1:1",
    beforeLabel: "白底图",
    afterLabel: "生活场景图",
    priority: 4,
  },
];

function CaseCard({ item }: { item: CaseStudyItem }) {
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);

  // aspectRatio → padding-top percentage for container height
  const aspectPadding: Record<string, string> = {
    "3:4": "pb-[133%]",
    "4:5": "pb-[125%]",
    "1:1": "pb-[100%]",
    "9:16": "pb-[177%]",
  };
  const padClass = aspectPadding[item.aspectRatio] ?? "pb-[125%]";

  return (
    <div className="rounded-xl overflow-hidden bg-gray-100">
      {/* 图片容器 — 用 padding-bottom 撑起高度，实现统一比例 */}
      <div className={`relative w-full ${padClass}`}>
        {/* Before 图 */}
        <div className="absolute inset-0 left-0 w-1/2">
          {!beforeError ? (
            <Image
              src={item.beforeImage}
              alt={item.beforeLabel}
              fill
              className="object-cover"
              onError={() => setBeforeError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <p className="text-xs text-gray-400">原图</p>
            </div>
          )}
          <span className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
            Before
          </span>
        </div>

        {/* After 图 */}
        <div className="absolute inset-0 right-0 w-1/2">
          {!afterError ? (
            <Image
              src={item.afterImage}
              alt={item.afterLabel}
              fill
              className="object-cover"
              onError={() => setAfterError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <p className="text-xs text-gray-400">效果图</p>
            </div>
          )}
          <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded">
            After
          </span>
        </div>
      </div>

      {/* 标题 */}
      <div className="p-2.5 bg-white">
        <p className="text-xs font-medium text-gray-800">{item.title}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{item.subtitle}</p>
      </div>
    </div>
  );
}

function TimelineStep({ step, title, desc, icon }: { step: number; title: string; desc: string; icon: string }) {
  return (
    <div className="relative flex gap-5 pb-8 last:pb-0">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-lg shrink-0 text-white">
          {icon}
        </div>
        <div className="flex-1 w-px bg-gray-200 mt-2 last:hidden" />
      </div>
      <div className="pt-1.5">
        <p className="text-xs text-amber-600 font-medium mb-0.5">第{step}步</p>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const [resultType, setResultType] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(true);
  // 倒计时（3分钟，制造紧迫感）
  const [countdown, setCountdown] = useState(3 * 60);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("diagnosis_result");
      if (stored) {
        const data = JSON.parse(stored);
        setResultType(data.result_type || "image_start");
      } else {
        setResultType("image_start");
      }
    } catch {
      setResultType("image_start");
    } finally {
      setLoading(false);
    }
  }, []);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // 格式化倒计时 MM:SS
  const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");

  // Get sessionId from URL for CTA link
  const [sessionId, setSessionId] = useState<string>("");
  // 读取路由决策（高优先级用户显示特殊提示）
  const [routeDecision, setRouteDecision] = useState<{
    selectedProvider: string;
    priorityLevel: string;
    routeReasons: string[];
  } | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSessionId(params.get("session") ?? "");
      try {
        const stored = localStorage.getItem("route_decision");
        if (stored) setRouteDecision(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-gray-900 border-t-transparent animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">正在分析你的情况...</p>
        </div>
      </div>
    );
  }

  const type = (resultType || "image_start") as ResultType;
  const title = PERSONAS[type] ?? "诊断结果";
  const description = PAIN_POINTS[type] ?? "";
  const workflow = WORKFLOWS[type] ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-300 hover:text-gray-600 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-xs md:text-sm text-gray-400">← 返回首页</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-10">

        {/* ── 诊断结论 ─────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-medium text-amber-600 tracking-wide">诊断结论</p>
          <div className="bg-gray-900 rounded-2xl p-6 md:p-8 text-white">
            <h1 className="text-lg md:text-xl font-bold leading-relaxed mb-3">
              {title}
            </h1>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              {description}
            </p>
          </div>
        </section>

        {/* ── 成本计算器 ─────────────────────────────── */}
        <CostCalculator />

        {/* ── 免费试做1张 ─────────────────────────────── */}
        {routeDecision?.selectedProvider === "nanobanana" && (
          <section className="space-y-2">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <span className="text-lg">✨</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">已为你匹配高质量商拍路线</p>
                  <p className="text-xs text-gray-500 mt-0.5">我们检测到你的需求适合跨境卖家标准，当前排队优先级：高</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <p className="text-xs font-medium text-amber-600 tracking-wide">免费体验</p>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 md:p-6 border border-amber-100">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
              免费试做 1 张，看看适不适合你
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              不用写提示词。你只需要：
            </p>
            <ul className="space-y-1.5 text-sm text-gray-600 mb-5">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">1.</span>
                <span>随手拍一张产品图</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">2.</span>
                <span>再发一张你喜欢的参考图</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">3.</span>
                <span>我们免费帮你试做 1 张</span>
              </li>
            </ul>
            {countdown > 0 && (
              <div className="mb-4 flex items-center justify-center gap-1.5 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2 text-amber-700 text-sm font-medium">
                <span>⏰ 限时免费，还剩</span>
                <span className="font-mono font-bold text-amber-800">{mm}:{ss}</span>
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              <Link
                href={sessionId ? `/submit?session=${sessionId}&action=${resultType}` : `/submit?action=${resultType}`}
                className="block w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-center transition-colors shadow-lg shadow-amber-500/20"
              >
                免费试做1张
              </Link>
              <a
                href="https://u.wechat.com/EasyUseAI"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-center transition-colors border border-gray-200"
              >
                加微信：z425659107（免费试做1张，10分钟给你）
              </a>
            </div>
          </div>
        </section>

        {/* ── 案例展示 ─────────────────────────────── */}
        <section className="space-y-4">
          <p className="text-xs font-medium text-amber-600 tracking-wide">案例效果</p>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {CASE_STUDIES.filter((c) => c.resultTypes.includes(resultType!))
              .sort((a, b) => a.priority - b.priority)
              .slice(0, 3)
              .map((item) => (
                <CaseCard key={item.id} item={item} />
              ))}
          </div>
        </section>

        {/* ── 服务流程 ──────────────────────────────── */}
        <section className="space-y-4">
          <p className="text-xs font-medium text-amber-600 tracking-wide">服务流程</p>
          <div className="pl-1">
            {(workflow as WorkflowStep[]).map((step: WorkflowStep) => (
              <TimelineStep key={step.step} {...step} />
            ))}
          </div>
        </section>

        {/* ── 主CTA ──────────────────────────────── */}
        <section className="space-y-2.5 md:space-y-3">
          <Link
            href={sessionId ? `/submit?session=${sessionId}` : "/submit"}
            className="block w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-base md:text-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10 text-center"
          >
            提交需求
          </Link>
          <p className="text-center text-xs text-gray-400">顾问微信联系，48小时内出图</p>
        </section>

        {/* ── 底部链接 ─────────────────────────────── */}
        <section className="space-y-2.5 md:space-y-3">
          <div className="rounded-xl bg-gray-900 p-5 md:p-6 text-center space-y-3">
            <p className="text-white font-semibold text-base md:text-lg">加微信咨询</p>
            <p className="text-white/50 text-xs md:text-sm">顾问发你高清图 + 使用建议</p>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 md:px-5 py-2.5 md:py-3">
              <span className="text-white text-sm font-medium">微信：z425659107</span>
              <button
                onClick={() => navigator.clipboard.writeText("z425659107")}
                className="text-white/50 hover:text-white text-xs transition-colors"
              >
                复制
              </button>
            </div>
            <p className="text-white/30 text-xs">免费，不推销，只发结果</p>
          </div>

          <div className="flex items-center justify-center gap-6 pt-1">
            <Link href="/diagnosis" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              重新诊断 →
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
