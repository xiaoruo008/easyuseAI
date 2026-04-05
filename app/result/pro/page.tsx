"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import PaymentModal from "@/components/PaymentModal";
import getProContent from "@/lib/pro-content";
import type { DiagnosisResult } from "@/lib/diagnosis";

interface ResultData {
  session: { id: string; completed: boolean };
  result: DiagnosisResult | undefined;
}

function ProContent() {
  const params = useSearchParams();
  const sessionId = params.get("session");
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("缺少诊断会话");
      setLoading(false);
      return;
    }
    fetch(`/api/diagnosis/session/${sessionId}/result`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("加载失败"); setLoading(false); });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full border-4 border-gray-900 border-t-transparent animate-spin mx-auto" />
          <p className="text-gray-500">正在加载...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error ?? "未找到结果"}</p>
          <Link href="/diagnosis" className="px-6 py-3 bg-gray-900 text-white rounded-xl">重新开始</Link>
        </div>
      </div>
    );
  }

  const result = data.result;
  const pro = getProContent(result.type);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/result?session=${sessionId}`} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <p className="text-xs text-gray-400">完整执行版</p>
              <p className="font-semibold text-gray-900">帮你做成可用系统</p>
            </div>
          </div>
          <span className="text-sm font-bold text-gray-900">¥299</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* 执行步骤 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">服务流程（共{pro.steps.length}步）</h2>
          <div className="space-y-3">
            {pro.steps.map((step) => (
              <div key={step.step} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
                <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 示例 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">示例（可直接用）</h2>
          <div className="space-y-4">
            {pro.sampleScripts.map((script, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">{script.title}</p>
                </div>
                <div className="px-5 py-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                    {script.content}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 标题方案 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">爆款标题（3个）</h2>
          <div className="space-y-2">
            {pro.headlines.map((h, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                <span className="text-gray-400 font-bold text-sm mt-0.5">{i + 1}.</span>
                <p className="text-sm text-gray-800 leading-relaxed">{h}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 执行说明 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">服务说明</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <ul className="space-y-2">
              {pro.executionNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="mt-0.5">💡</span>
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="space-y-3 pt-2">
          <button
            onClick={() => setShowPayment(true)}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
          >
            立即获取完整版 · ¥299
          </button>
          <div className="flex gap-3">
            <Link
              href={`/result?session=${sessionId}`}
              className="flex-1 py-3 text-center border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              返回
            </Link>
            <Link
              href="/diagnosis"
              className="flex-1 py-3 text-center border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              重新诊断
            </Link>
          </div>
        </section>

        {showPayment && (
          <PaymentModal type="pro" onClose={() => setShowPayment(false)} />
        )}
      </main>
    </div>
  );
}

export default function ProPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">加载中...</p></div>}>
      <ProContent />
    </Suspense>
  );
}
