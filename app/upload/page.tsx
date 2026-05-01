"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const STYLE_OPTIONS = [
  { id: "background", label: "白底主图", desc: "干净背景，适用各平台", scene: "white_hero", action: "product_photo" },
  { id: "scene", label: "生活场景", desc: "有氛围感，带入生活", scene: "lifestyle", action: "lifestyle" },
  { id: "model", label: "模特上身", desc: "穿在真人身上，更真实", scene: "model_studio", action: "model_photo" },
  { id: "poster", label: "创意海报", desc: "有设计感，适合种草", scene: "brand_hero", action: "fashion_model" },
];

const PLATFORM_OPTIONS = [
  { value: "taobao", label: "淘宝天猫主图" },
  { value: "xiaohongshu", label: "小红书种草内容" },
  { value: "tiktok", label: "TikTok短视频封面" },
  { value: "amazon", label: "亚马逊独立站" },
  { value: "unsure", label: "都要不确定" },
];

type ImageResult = { imageUrl: string; thumbnailUrl?: string; provider: string; model: string; source: string; workflowLabel?: string };

export default function UploadPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [platform, setPlatform] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [imageResult, setImageResult] = useState<ImageResult | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 3) {
        setError("最多上传3张图片");
        return;
      }
      setError(null);
      // 先清空旧的预览和URL状态
      setImages([]);
      setPreviews([]);
      setUploadedImageUrl(null);

      // 上传到服务器获取 URL（必须成功，否则不显示预览）
      const urls: string[] = [];
      let uploadFailed = false;
      for (const file of files) {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          if (r.ok) {
            const data = await r.json();
            urls.push(data.url);
            console.log("[Upload] ✅ file uploaded:", file.name, "→", data.url);
          } else {
            console.error("[Upload] ❌ upload failed:", file.name, "HTTP", r.status);
            uploadFailed = true;
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[Upload] ❌ upload error:", file.name, msg);
          uploadFailed = true;
        }
      }

      if (uploadFailed || urls.length === 0) {
        setError("图片上传失败，请重新上传");
        // 上传失败：不显示预览，不设置URL状态
        return;
      }

      // 上传成功：写入 sessionStorage 并设置状态
      const firstUrl = urls[0];
      sessionStorage.setItem("original_image_url", firstUrl);
      setUploadedImageUrl(firstUrl);
      setImages(files);
      setPreviews(urls); // 使用服务器URL作为预览

      console.log("[Upload] 📋 uploadedImageUrl:", firstUrl);
      console.log("[Upload] 📋 sessionStorage:", sessionStorage.getItem("original_image_url"));
    },
    []
  );

  const toggleStyle = useCallback((id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const handleDownload = async () => {
    if (!imageResult) return;
    try {
      const response = await fetch(imageResult.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `easyuse-product-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageResult.imageUrl, "_blank");
    }
  };

  const copyLink = () => {
    if (!imageResult) return;
    navigator.clipboard.writeText(imageResult.imageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 保存到生成历史
  const saveToHistory = useCallback((generatedImageUrl: string) => {
    try {
      const HISTORY_KEY = "generation_history";
      const MAX_HISTORY = 20;
      const storedOriginalUrl = typeof window !== "undefined"
        ? sessionStorage.getItem("original_image_url") || ""
        : "";
      const record = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        originalImageUrl: storedOriginalUrl,
        generatedImageUrl,
        createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      const updated = [record, ...existing].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch { /* ignore storage error */ }
  }, []);

  // 清理轮询 timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selectedStyles.length === 0) {
      setError("请至少选择一个出图风格");
      return;
    }

    // P0：唯一可信来源 = uploadedImageUrl（上传成功后才设置）
    const imageUrl = uploadedImageUrl || sessionStorage.getItem("original_image_url");

    console.log("[Upload] 📋 generate payload:");
    console.log("  - uploadedImageUrl state:", uploadedImageUrl);
    console.log("  - sessionStorage:", sessionStorage.getItem("original_image_url"));
    console.log("  - imageUrl used:", imageUrl);

    // P0：没有URL → 直接阻止，不走任何兜底
    if (!imageUrl) {
      setError("请上传产品图片");
      return;
    }

    // blob URL → 上传API失败，阻止
    if (imageUrl.startsWith("blob:")) {
      setError("图片上传失败，请重新上传");
      return;
    }

    setSubmitting(true);
    setWorking(true);
    setError(null);

    const firstStyle = STYLE_OPTIONS.find((s) => s.id === selectedStyles[0]);
    if (!firstStyle) {
      setError("未知的出图风格");
      setWorking(false);
      setSubmitting(false);
      return;
    }

    const marketMap: Record<string, string> = {
      taobao: "domestic",
      xiaohongshu: "domestic",
      tiktok: "domestic",
      amazon: "cross_border",
      unsure: "domestic",
    };
    const market = marketMap[platform] || "domestic";

    const body: Record<string, unknown> = {
      action: firstStyle.action,
      type: "traffic",
      choiceMode: true,
      referenceImageUrl: imageUrl,
      originalImageUrl: imageUrl,
      category: "dress",
      gender: "womenswear",
      scene: firstStyle.scene,
      market,
      aspectRatio: firstStyle.scene === "white_hero" ? "1:1" : "3:4",
      style: "commercial",
      extraFeatures: notes || undefined,
      userPainPoint: `平台：${platform || "未选择"}，风格：${firstStyle.label}`,
      userPersona: "电商卖家",
      diagnosisType: "traffic",
    };

    try {
      const res = await fetch("/api/execute/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("生成请求失败");
      const d = await res.json();

      const taskId = d.taskId as string | null;

      if (!taskId) {
        // 没有 taskId（同步返回），直接使用结果
        if (d.taskCategory === "image") {
          setImageResult({ ...d.result, source: d.source ?? "mock", workflowLabel: d.workflowLabel ?? undefined });
          saveToHistory(d.result.imageUrl);
        }
        setWorking(false);
        setSubmitting(false);
        return;
      }

      // 启动轮询（每 3 秒一次，最多 60 秒）
      let elapsed = 0;
      timerRef.current = setInterval(async () => {
        elapsed += 3000;
        try {
          const pollRes = await fetch(`/api/tasks/${taskId}`);
          if (!pollRes.ok) return;
          const task = await pollRes.json();

          if (task.status === "done") {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setWorking(false);
            if (d.taskCategory === "image" && task.outputData) {
              setImageResult({ ...task.outputData, source: task.outputData.source ?? "ai", workflowLabel: d.workflowLabel ?? undefined });
              saveToHistory(task.outputData.imageUrl);
            }
          } else if (task.status === "failed") {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setWorking(false);
            setError(task.errorMessage ?? "生成失败，请稍后重试。");
          } else if (elapsed >= 60000) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setWorking(false);
            setError("生成超时（超过60秒），请稍后重试或联系顾问协助。");
          }
        } catch {
          // 轮询请求出错，继续等待下一次
        }
      }, 3000);

      // 60 秒硬超时保险
      setTimeout(() => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setWorking(false);
          setError("生成超时（超过60秒），请稍后重试或联系顾问协助。");
        }
      }, 60000);

    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
        setError("生成超时，可能是网络波动。建议：1) 稍等 1 分钟后重试；2) 检查网络连接。");
      } else if (message.includes("2049") || message.includes("quota")) {
        setError("免费次数已用完。请联系顾问获取更多体验次数。");
      } else {
        setError("制作时遇到点小问题，可能是网络波动或 AI 服务暂时繁忙。建议：1) 稍等 1 分钟再试；2) 检查网络连接。");
      }
      setWorking(false);
    } finally {
      setSubmitting(false);
    }
  }, [images, selectedStyles, platform, notes, uploadedImageUrl, saveToHistory]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center gap-3">
          <Link href="/result" className="text-gray-300 hover:text-gray-600 transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-xs md:text-sm text-gray-400">← 返回结果</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-10">

        {/* ── 页面标题 ─────────────────────────────── */}
        <section className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">告诉我们你要什么</h1>
          <p className="text-sm text-gray-500">选好这几步，坐等收图就行</p>
        </section>

        {/* ── 生成中状态 ─────────────────────────────── */}
        {working && (
          <section className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 p-6 md:p-8 text-white text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin mx-auto" />
            <div>
              <p className="text-lg font-bold">AI 正在生成中...</p>
              <p className="text-sm text-white/60 mt-1">预计 30 秒左右，请稍候</p>
            </div>
          </section>
        )}

        {/* ── 图片结果展示 ─────────────────────────────── */}
        {imageResult && !working && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-sm">
                {imageResult.workflowLabel ? `${imageResult.workflowLabel} · 你的图做好了` : "你的图做好了"}
              </h3>
            </div>

            {/* Before/After 对比区 */}
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 overflow-hidden">
              {/* Before - 原图 */}
              <div className="relative bg-gray-100 aspect-[3/4]">
                {uploadedImageUrl ? (
                  <Image
                    src={uploadedImageUrl}
                    alt="原图"
                    fill
                    className="object-cover"
                  />
                ) : previews[0] ? (
                  <img src={previews[0]} alt="原图" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400 text-center">原图</p>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded-md">
                  <span className="text-xs text-white font-medium">Before</span>
                </div>
              </div>

              {/* After - AI生成图 */}
              <div className="relative bg-gray-50 aspect-[3/4]">
                <Image
                  src={imageResult.imageUrl}
                  alt="AI制作结果"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-indigo-600 rounded-md">
                  <span className="text-xs text-white font-medium">After</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">原图 → AI优化后，可直接用于电商Listing</p>

            {/* 按钮组 */}
            <div className="p-3 md:p-4 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                {imageResult.source === "mock"
                  ? "当前为示例效果 · 联系顾问获取实际产品图"
                  : "AI生成效果 · 可直接使用"}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* 下载按钮 */}
                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-semibold text-sm shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下载图片
                </button>
                {/* 复制链接 */}
                <button
                  onClick={copyLink}
                  className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      已复制
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      复制链接
                    </>
                  )}
                </button>
                {/* 再生成一张 */}
                <button
                  onClick={handleSubmit}
                  disabled={working}
                  className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  再生成一张
                </button>
              </div>
            </div>

            {/* 联系顾问 */}
            <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-900 mb-1">满意吗？获取完整服务</h3>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    留下联系方式，顾问24小时内联系你。现在填写，额外赠送 3 张免费制作券。
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/submit")}
                className="w-full py-3 bg-amber-600 text-white rounded-xl font-medium text-sm hover:bg-amber-700 transition-colors"
              >
                联系顾问获取完整服务
              </button>
            </div>

            {/* 重新开始 */}
            <div className="text-center">
              <button
                onClick={() => {
                  setImageResult(null);
                  setError(null);
                  setSelectedStyles([]);
                  setImages([]);
                  setPreviews([]);
                  setUploadedImageUrl(null);
                  setPlatform("");
                  setNotes("");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                重新上传图片生成
              </button>
            </div>
          </section>
        )}

        {/* ── 错误提示 ─────────────────────────────── */}
        {error && !working && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* ── 输入表单（生成后隐藏） ─────────────────────────────── */}
        {!imageResult && !working && (
          <>
        {/* ── 步骤1：上传产品图 ───────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-medium text-amber-600 tracking-wide">步骤1：上传产品图</p>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">点击上传产品图</p>
                <p className="text-xs text-gray-400">手机拍一张就行，不要拼图 · 最多3张</p>
              </div>
            </label>
          </div>
          {previews.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={src} alt={`预览${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 步骤2：选出图风格 ───────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-medium text-amber-600 tracking-wide">步骤2：选出图风格（可多选）</p>
          <div className="grid grid-cols-2 gap-3">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleStyle(opt.id)}
                className={`px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedStyles.includes(opt.id)
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 bg-white hover:border-gray-400"
                }`}
              >
                <p className={`font-medium text-sm ${selectedStyles.includes(opt.id) ? "text-gray-900" : "text-gray-700"}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ── 步骤3：选用途平台 ───────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-medium text-amber-600 tracking-wide">步骤3：选用途平台（单选）</p>
          <div className="space-y-2">
            {PLATFORM_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  platform === opt.value
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 bg-white hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="platform"
                  value={opt.value}
                  checked={platform === opt.value}
                  onChange={() => setPlatform(opt.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  platform === opt.value ? "border-gray-900" : "border-gray-300"
                }`}>
                  {platform === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-gray-900" />
                  )}
                </div>
                <span className={`text-sm font-medium ${platform === opt.value ? "text-gray-900" : "text-gray-700"}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* ── 步骤4：补充说明 ───────────────────────── */}
        <section className="space-y-3">
          <p className="text-xs font-medium text-amber-600 tracking-wide">步骤4：补充说明（选填）</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="有什么特殊要求？比如背景颜色、模特风格…"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:border-gray-400 transition-colors"
          />
        </section>

        {/* ── 底部按钮 ─────────────────────────────── */}
        <section className="space-y-2.5 pt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-base md:text-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10 disabled:opacity-50"
          >
            {submitting ? "提交中..." : "⚡ 开始生成（约30秒）"}
          </button>
          <p className="text-center text-xs text-gray-400">AI自动匹配最佳模板，不用手写提示词</p>
        </section>
          </>
        )}

      </main>
    </div>
  );
}
