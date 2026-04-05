"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import type { DiagnosisResult, WorkflowStep } from "@/lib/diagnosis";
import PaymentModal from "@/components/PaymentModal";

interface ResultData {
  session: { id: string; completed: boolean };
  result: DiagnosisResult | undefined;
}

function TimelineStep({ step, title, desc, icon }: WorkflowStep) {
  return (
    <div className="relative flex gap-5 pb-8 last:pb-0">
      {/* vertical line */}
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

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session");
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<"paid" | "pro" | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("请重新开始");
      setLoading(false);
      return;
    }
    fetch(`/api/diagnosis/session/${sessionId}/result`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => {
        setError("加载失败，请重新开始");
        setLoading(false);
      });
  }, [sessionId]);

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

  if (error || !data?.result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-bold text-gray-900">出了点问题</h2>
          <p className="text-gray-500">{error ?? "未找到结果"}</p>
          <Link
            href="/diagnosis"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            重新开始
          </Link>
        </div>
      </div>
    );
  }

  const result = data.result;
  const { persona, painPoint, workflow, immediateValue, urgency, suggestedBudget } = result;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-300 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm text-gray-400">分析结果</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">

        {/* ── 你的情况 ─────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-medium text-amber-600 tracking-wide">你的情况</p>
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <p className="text-lg font-medium leading-relaxed">{persona}</p>
          </div>
        </section>

        {/* ── 核心问题 ────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-medium text-amber-600 tracking-wide">核心问题</p>
          <div className="rounded-xl border border-gray-200 p-6">
            <p className="text-gray-800 leading-relaxed text-lg">{painPoint}</p>
            <div className="flex gap-6 mt-5 pt-5 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">紧迫程度</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{urgency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">建议预算</p>
                <p className="text-sm font-semibold text-gray-700 mt-0.5">{suggestedBudget}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 我们帮你搞定 ──────────────────────────── */}
        <section className="space-y-4">
          <p className="text-xs font-medium text-amber-600 tracking-wide">我们帮你搞定</p>
          <div className="pl-1">
            {(workflow ?? []).map((step) => (
              <TimelineStep key={step.step} {...step} />
            ))}
          </div>
        </section>

        {/* ── 即时交付 ──────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-medium text-amber-600 tracking-wide">{immediateValue.label}</p>
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 pt-5 pb-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">{immediateValue.title}</p>
              <div className="space-y-3">
                {(immediateValue.content ?? []).map((line, i) => (
                  <p key={i} className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="bg-gray-100 border-t border-gray-200 px-6 py-3">
              <p className="text-xs text-gray-500">以上是现场制作的内容，你可以直接使用</p>
            </div>
          </div>
        </section>

        {/* ── 立刻开始 ────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-medium text-amber-600 tracking-wide">立刻开始</p>
          <div className="grid grid-cols-1 gap-2">
            {(data.result.executionActions ?? []).map((action) => (
              <button
                key={action.id}
                onClick={() => router.push(`/execute?session=${sessionId}&action=${action.id}`)}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-900 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center text-lg transition-colors">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{action.desc}</p>
                </div>
                {action.category === "image" && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">图片</span>
                )}
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </section>

        {/* ── 获取服务 ─────────────────────────────── */}
        <section className="space-y-3 pb-8">
          <p className="text-xs font-medium text-gray-400 tracking-wide">获取服务</p>

          {/* 免费体验 */}
          <button
            onClick={() => router.push(`/submit?session=${sessionId}`)}
            className="w-full p-5 border border-gray-200 rounded-xl text-left hover:border-gray-900 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">免费体验</p>
                <p className="text-sm text-gray-400 mt-0.5">填写信息，顾问24小时内联系你</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">免费</span>
            </div>
          </button>

          {/* ¥99 标准档 - 新增 */}
          <button
            onClick={() => setPaymentType("paid")}
            className="w-full p-5 border-2 border-gray-900 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">标准制作</p>
                <p className="text-sm text-gray-400 mt-0.5">5张同规格图片，批量制作</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">¥99</span>
                <p className="text-xs text-gray-400">立即制作</p>
              </div>
            </div>
          </button>

          {/* ¥299 完整交付 */}
          <button
            onClick={() => setPaymentType("pro")}
            className="w-full p-5 bg-gray-900 rounded-xl text-left hover:bg-gray-800 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">完整交付</p>
                <p className="text-sm text-gray-400 mt-0.5">顾问帮你落地全部流程，交付能用的成果</p>
              </div>
              <span className="text-sm font-semibold text-amber-400">了解详情</span>
            </div>
          </button>

          <div className="text-center pt-2">
            <Link href="/diagnosis" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
              重新开始 →
            </Link>
          </div>
        </section>

        {paymentType && (
          <PaymentModal type={paymentType} onClose={() => setPaymentType(null)} />
        )}
      </main>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
