"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type HistoryRecord = {
  id: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("generation_history") || "[]");
      setRecords(data);
    } catch { setRecords([]); }
  }, []);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = `easyuse-history-${Date.now()}.png`;
      a.click();
    } catch { window.open(url, "_blank"); }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
          <Link href="/execute" className="text-gray-300 hover:text-gray-600 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-xs md:text-sm text-gray-400">← 返回</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-10">

        {/* ── 标题区 ─────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-medium text-amber-600 tracking-wide">历史记录</p>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">我的生成记录</h1>
          <p className="text-sm text-gray-400">共 {records.length} 条生成记录</p>
        </section>

        {records.length === 0 ? (
          /* ── 空状态 ─────────────────────────────── */
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-12 text-center space-y-3">
            <div className="text-4xl">📭</div>
            <p className="text-base font-medium text-gray-500">暂无生成记录</p>
            <p className="text-sm text-gray-400">去上传图片，开始你的第一次 AI 摄影体验</p>
            <Link
              href="/execute"
              className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              立即体验
            </Link>
          </div>
        ) : (
          /* ── 记录列表 ─────────────────────────────── */
          <section className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                {/* 图片区域 */}
                <div className="grid grid-cols-2 gap-0">
                  {/* Before */}
                  <div className="relative aspect-[3/4] bg-gray-50">
                    {record.originalImageUrl ? (
                      <Image
                        src={record.originalImageUrl}
                        alt="原图"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <p className="text-xs text-gray-400">无原图</p>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                      Before · 原图
                    </span>
                  </div>

                  {/* 分隔线 */}
                  <div className="relative">
                    <div className="absolute inset-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="h-full w-px bg-gradient-to-b from-transparent via-amber-300 to-transparent" />
                    </div>
                    {/* After */}
                    <div className="relative aspect-[3/4] bg-gray-50">
                      <Image
                        src={record.generatedImageUrl}
                        alt="生成图"
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                        After · 生成图
                      </span>
                    </div>
                  </div>
                </div>

                {/* 底部操作栏 */}
                <div className="px-4 py-3 bg-white border-t border-gray-50 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-400">
                    {new Date(record.createdAt).toLocaleString("zh-CN")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/upload"
                      className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      重新生成同款
                    </Link>
                    <button
                      onClick={() => handleDownload(record.generatedImageUrl)}
                      className="px-3 py-1.5 bg-white text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      下载
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}