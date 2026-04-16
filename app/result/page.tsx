"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WORKFLOWS, PERSONAS, PAIN_POINTS, type ResultType, type WorkflowStep } from "@/lib/diagnosis";

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

        {/* ── 案例展示 ─────────────────────────────── */}
        <section className="space-y-4">
          <p className="text-xs font-medium text-amber-600 tracking-wide">案例效果</p>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              { label: "换背景", before: "背景乱", after: "干净专业" },
              { label: "商品精修", before: "质感糙", after: "高级精致" },
              { label: "模特上身", before: "没模特", after: "真实上身" },
              { label: "场景图", before: "白底图", after: "生活场景" },
            ].map((c) => (
              <div key={c.label} className="bg-gray-100 rounded-xl overflow-hidden">
                <div className="bg-gray-200 border-b border-gray-300 h-24 md:h-32 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Before</p>
                    <p className="text-sm font-medium text-gray-500">{c.before}</p>
                  </div>
                </div>
                <div className="bg-gray-50 h-24 md:h-32 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">After</p>
                    <p className="text-sm font-medium text-gray-700">{c.after}</p>
                  </div>
                </div>
              </div>
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
            立即预约顾问，免费试做一张
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
