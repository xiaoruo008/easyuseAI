"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import type { DiagnosisResult } from "@/lib/diagnosis";

interface ResultData {
  session: { id: string; completed: boolean };
  result: DiagnosisResult | undefined;
}

function ExecuteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session") ?? "";
  const actionId = params.get("action") ?? "";
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ title: string; items: string[] } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
          <div className="w-14 h-14 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-gray-500">正在加载...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error ?? "未找到诊断结果"}</p>
          <Link href="/diagnosis" className="px-6 py-3 bg-indigo-600 text-white rounded-xl">重新开始</Link>
        </div>
      </div>
    );
  }

  const diagnosisResult = data.result;
  const action = (diagnosisResult.executionActions ?? []).find((a) => a.id === actionId);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/execute/mock-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionId, type: diagnosisResult.type }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setResult(d.result);
    } catch {
      alert("生成失败，请重试");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href={`/result?session=${sessionId}`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p className="text-xs text-gray-400">正在执行</p>
            <p className="font-semibold text-gray-900">{action?.label ?? "生成内容"}</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 space-y-6">

        {/* 你的情况 */}
        <div className="bg-indigo-600 rounded-2xl p-5 text-white">
          <p className="text-xs text-indigo-200 mb-1">你的情况</p>
          <p className="font-medium leading-relaxed">{diagnosisResult.painPoint}</p>
        </div>

        {/* 本次任务 */}
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{action?.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{action?.label}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{action?.desc}</p>
        </div>

        {/* 上传素材 */}
        {!result && (
          <div className="bg-white rounded-2xl border p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">上传你的素材（可选）</h3>
            <p className="text-xs text-gray-400 mb-3">上传产品图、数据或客户反馈，系统会针对性生成</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xlsx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setUploadedFile(file.name);
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium hover:file:bg-indigo-100 cursor-pointer"
            />
            {uploadedFile && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                已选择：{uploadedFile}
              </p>
            )}
          </div>
        )}

        {/* 生成结果 */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-sm">{result.title}</h3>
            </div>
            <div className="bg-white rounded-2xl border divide-y divide-gray-100">
              {result.items.map((item, i) => (
                <div key={i} className="px-5 py-4 flex gap-3">
                  <span className="text-indigo-500 font-semibold text-sm mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 按钮 */}
        <div className="space-y-3">
          {!result ? (
            <>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    正在生成...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    免费生成
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">
                免费体验生成1次 · 支付 ¥29 解锁无限使用
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {generating ? "生成中..." : "再生成一次"}
              </button>
              <div className="flex gap-3">
                <Link
                  href={`/result?session=${sessionId}`}
                  className="flex-1 py-3 text-center border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  返回结果
                </Link>
                <button
                  onClick={() => router.push(`/submit?session=${sessionId}`)}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  获取完整方案
                </button>
              </div>
            </>
          )}
        </div>

      </main>
    </div>
  );
}

export default function ExecutePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">加载中...</p></div>}>
      <ExecuteContent />
    </Suspense>
  );
}
