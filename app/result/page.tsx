"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { WORKFLOWS, PERSONAS, PAIN_POINTS, type ResultType, type WorkflowStep } from "@/lib/diagnosis";

// 成本计算器组件
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
const CASE_STUDIES = [
  {
    label: "换背景",
    beforeImg: "/images/cases/suit-white.jpg",
    afterImg: "/images/cases/suit-brand.jpg",
    beforeAlt: "白底图",
    afterAlt: "品牌场景图",
  },
  {
    label: "商品精修",
    beforeImg: "/images/cases/suit-before.jpg",
    afterImg: "/images/cases/suit-model.jpg",
    beforeAlt: "原图",
    afterAlt: "模特上身效果图",
  },
  {
    label: "模特上身",
    beforeImg: "/images/cases/suit-white.jpg",
    afterImg: "/images/cases/suit-model.jpg",
    beforeAlt: "白底图",
    afterAlt: "真实模特效果",
  },
  {
    label: "场景图",
    beforeImg: "/images/cases/suit-white.jpg",
    afterImg: "/images/cases/suit-scene.jpg",
    beforeAlt: "白底图",
    afterAlt: "生活场景图",
  },
];

function CaseCard({ case: c }: { case: typeof CASE_STUDIES[0] }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-gray-100 rounded-xl overflow-hidden">
      <div className="relative bg-gray-200 border-b border-gray-300 h-24 md:h-32">
        {!imgError ? (
          <Image
            src={c.beforeImg}
            alt={c.beforeAlt}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs text-gray-400">Before</p>
              <p className="text-sm font-medium text-gray-500">{c.beforeAlt}</p>
            </div>
          </div>
        )}
      </div>
      <div className="relative bg-gray-50 h-24 md:h-32">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-gray-400">After</p>
            <p className="text-sm font-medium text-gray-700">{c.afterAlt}</p>
          </div>
        </div>
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

  // Get sessionId from URL for CTA link
  const [sessionId, setSessionId] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSessionId(params.get("session") ?? "");
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

        {/* ── 案例展示 ─────────────────────────────── */}
        <section className="space-y-4">
          <p className="text-xs font-medium text-amber-600 tracking-wide">案例效果</p>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {CASE_STUDIES.map((c) => (
              <CaseCard key={c.label} case={c} />
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
              <span className="text-white text-sm font-medium">微信：easyuseai</span>
              <button
                onClick={() => navigator.clipboard.writeText("easyuseai")}
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
