"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { DiagnosisResult } from "@/lib/diagnosis";

interface ResultData {
  session: { id: string; completed: boolean };
  result: DiagnosisResult | undefined;
}

type TextResult = { title: string; items: string[] };
type ImageResult = { imageUrl: string; thumbnailUrl?: string; provider: string; model: string; source: string };

const IMAGE_ACTIONS = new Set(["product_photo", "model_photo", "background_swap"]);

const STYLE_OPTIONS = [
  { value: "commercial", label: "商业" },
  { value: "minimal", label: "极简" },
  { value: "luxury", label: "高端" },
];

const RATIO_OPTIONS = [
  { value: "1:1", label: "1:1" },
  { value: "3:4", label: "3:4" },
  { value: "16:9", label: "16:9" },
];

function ExecuteContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session") ?? "";
  const actionId = params.get("action") ?? "";
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [textResult, setTextResult] = useState<TextResult | null>(null);
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("commercial");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isImageTask = IMAGE_ACTIONS.has(actionId);

  useEffect(() => {
    if (!sessionId) {
      setError("缺少会话信息");
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-3 border-gray-900 border-t-transparent animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">正在准备...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <p className="text-gray-500">{error ?? "未找到结果"}</p>
          <Link href="/diagnosis" className="px-6 py-3 bg-gray-900 text-white rounded-xl inline-block">重新开始</Link>
        </div>
      </div>
    );
  }

  const diagnosisResult = data.result;
  const action = (diagnosisResult.executionActions ?? []).find((a) => a.id === actionId);
  const hasResult = isImageTask ? !!imageResult : !!textResult;

  const handleCreate = async () => {
    setWorking(true);
    try {
      const body: Record<string, string | undefined> = {
        action: actionId,
        type: diagnosisResult.type,
        sessionId,
      };
      if (isImageTask) {
        body.prompt = prompt || undefined;
        body.style = style;
        body.aspectRatio = aspectRatio;
      }

      const res = await fetch("/api/execute/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();

      if (d.taskCategory === "image") {
        setImageResult({ ...d.result, source: d.source ?? "mock" });
      } else {
        setTextResult(d.result);
      }
    } catch {
      alert("制作失败，请重试");
    } finally {
      setWorking(false);
    }
  };

  const copyLink = () => {
    if (!imageResult) return;
    navigator.clipboard.writeText(imageResult.imageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href={`/result?session=${sessionId}`} className="text-gray-300 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p className="text-xs text-gray-400">正在为你制作</p>
            <p className="font-semibold text-gray-900">{action?.label ?? "图片制作"}</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 space-y-6">

        {/* 你的情况 */}
        <div className="bg-gray-900 rounded-xl p-5 text-white">
          <p className="text-xs text-gray-400 mb-1">你的情况</p>
          <p className="font-medium leading-relaxed">{diagnosisResult.painPoint}</p>
        </div>

        {/* 本次任务 */}
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{action?.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{action?.label}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{action?.desc}</p>
        </div>

        {/* 图片任务：输入 */}
        {isImageTask && !hasResult && (
          <>
            <div className="rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">你想要什么样的图？</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  actionId === "product_photo" ? "例如：放在纯白背景里，光线柔和，专业电商风" :
                  actionId === "background_swap" ? "例如：把背景换成现代简约的咖啡馆场景" :
                  "描述你想要的图片效果"
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">风格</h3>
                <div className="flex gap-2">
                  {STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStyle(opt.value)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        style === opt.value
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">比例</h3>
                <div className="flex gap-2">
                  {RATIO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAspectRatio(opt.value)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        aspectRatio === opt.value
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">有参考图吗？（可选）</h3>
              <p className="text-xs text-gray-400 mb-3">上传产品照片，我们会参考风格制作</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUploadedFile(file.name);
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:font-medium hover:file:bg-gray-200 cursor-pointer"
              />
              {uploadedFile && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  已选择：{uploadedFile}
                </p>
              )}
            </div>
          </>
        )}

        {/* 文案任务：上传素材 */}
        {!isImageTask && !hasResult && (
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">上传你的素材（可选）</h3>
            <p className="text-xs text-gray-400 mb-3">上传产品图、数据或客户反馈，我们会针对性制作</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xlsx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setUploadedFile(file.name);
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:font-medium hover:file:bg-gray-200 cursor-pointer"
            />
            {uploadedFile && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                已选择：{uploadedFile}
              </p>
            )}
          </div>
        )}

        {/* 图片结果 */}
        {imageResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-sm">你的图做好了</h3>
            </div>
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="relative aspect-square bg-gray-50">
                <Image
                  src={imageResult.imageUrl}
                  alt="制作结果"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  {imageResult.source === "mock"
                    ? "预览效果 · 实际制作更精细"
                    : "专业团队制作 · 可直接使用"}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyLink}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        已复制
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        复制链接
                      </>
                    )}
                  </button>
                  <a
                    href={imageResult.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    下载
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 文案结果 */}
        {textResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-sm">{textResult.title}</h3>
            </div>
            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
              {textResult.items.map((item, i) => (
                <div key={i} className="px-5 py-4 flex gap-3">
                  <span className="text-gray-300 font-semibold text-sm mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 按钮 */}
        <div className="space-y-3 pb-8">
          {!hasResult ? (
            <button
              onClick={handleCreate}
              disabled={working}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {working ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  制作中，请稍候...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  立即帮我做一版
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleCreate}
                disabled={working}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {working ? "制作中..." : "再做一版"}
              </button>
              <div className="flex gap-3">
                <Link
                  href={`/result?session=${sessionId}`}
                  className="flex-1 py-3 text-center border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  返回
                </Link>
                <button
                  onClick={() => router.push(`/submit?session=${sessionId}`)}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  获取完整服务
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><p className="text-gray-400 text-sm">加载中...</p></div>}>
      <ExecuteContent />
    </Suspense>
  );
}
