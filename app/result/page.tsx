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

function WorkflowCard({ step, title, desc, icon }: WorkflowStep) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs text-indigo-500 font-medium mb-0.5">第{step}步</div>
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
      setError("请重新开始诊断");
      setLoading(false);
      return;
    }
    fetch(`/api/diagnosis/session/${sessionId}/result`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => {
        setError("加载失败，请重新诊断");
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-gray-500">正在分析你的情况...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-4xl">😔</div>
          <h2 className="text-xl font-bold text-gray-900">出了点问题</h2>
          <p className="text-gray-500">{error ?? "未找到诊断结果"}</p>
          <Link
            href="/diagnosis"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm text-gray-500">诊断结果</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* ── 你是什么样的人 ─────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">你是这样的人</p>
          <div className="bg-indigo-600 rounded-2xl p-6 text-white">
            <p className="text-lg font-medium leading-relaxed">{persona}</p>
          </div>
        </section>

        {/* ── 你的核心问题 ────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">你的核心问题</p>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-gray-800 leading-relaxed text-lg">{painPoint}</p>
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
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

        {/* ── 具体怎么做 ──────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">帮你解决问题</p>
          <div className="space-y-3">
            {(workflow ?? []).map((step) => (
              <WorkflowCard key={step.step} {...step} />
            ))}
          </div>
        </section>

        {/* ── 现在就能用 ──────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">{immediateValue.label}</p>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <p className="text-sm font-semibold text-amber-800 mb-3">{immediateValue.title}</p>
              <div className="space-y-3">
                {(immediateValue.content ?? []).map((line, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="bg-amber-100 border-t border-amber-200 px-5 py-3">
              <p className="text-xs text-amber-700">
                💡 以上是系统当场生成的内容，你可以直接用
              </p>
            </div>
          </div>
        </section>

        {/* ── 立刻开始执行 ────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">立刻开始执行</p>
          <div className="grid grid-cols-1 gap-2">
            {(data.result.executionActions ?? []).map((action) => (
              <button
                key={action.id}
                onClick={() => router.push(`/execute?session=${sessionId}&action=${action.id}`)}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-emerald-700">{action.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{action.desc}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </section>

        {/* ── 选一个方式 ─────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">选一个方式开始</p>

          {/* 免费 */}
          <button
            onClick={() => router.push(`/submit?session=${sessionId}`)}
            className="w-full p-4 border-2 border-gray-200 rounded-2xl text-left hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-indigo-700">让顾问帮你做</p>
                <p className="text-sm text-gray-500 mt-0.5">填写信息，24小时内顾问联系你</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">免费</span>
            </div>
          </button>

          {/* 查看完整版 */}
          <Link
            href={`/result/pro?session=${sessionId}`}
            className="block w-full p-3 border border-dashed border-gray-300 rounded-xl text-center text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            想看完整执行版（¥299）？查看详情 →
          </Link>

          {/* ¥29 */}
          <button
            onClick={() => setPaymentType("paid")}
            className="w-full p-4 border-2 border-indigo-300 bg-indigo-50 rounded-2xl text-left hover:border-indigo-500 hover:bg-indigo-100 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-indigo-900 group-hover:text-indigo-700">立即帮我生成一版</p>
                <p className="text-sm text-indigo-600 mt-0.5">3条内容 + 执行说明 + 标题方案</p>
              </div>
              <span className="text-lg font-bold text-indigo-700">¥29</span>
            </div>
          </button>

          {/* ¥299 */}
          <button
            onClick={() => setPaymentType("pro")}
            className="w-full p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-left hover:from-gray-800 hover:to-gray-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">直接帮我做成可用系统</p>
                <p className="text-sm text-gray-400 mt-0.5">顾问帮你落地，交付能用的工具</p>
              </div>
              <span className="text-lg font-bold text-white">¥299</span>
            </div>
          </button>

          <div className="text-center pt-1">
            <Link href="/diagnosis" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              重新诊断 →
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">加载中...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
