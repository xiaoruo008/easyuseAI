"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const STYLE_OPTIONS = [
  { id: "background", label: "白底主图", desc: "干净背景，适用各平台" },
  { id: "scene", label: "生活场景", desc: "有氛围感，带入生活" },
  { id: "model", label: "模特上身", desc: "穿在真人身上，更真实" },
  { id: "poster", label: "创意海报", desc: "有设计感，适合种草" },
];

const PLATFORM_OPTIONS = [
  { value: "taobao", label: "淘宝天猫主图" },
  { value: "xiaohongshu", label: "小红书种草内容" },
  { value: "tiktok", label: "TikTok短视频封面" },
  { value: "amazon", label: "亚马逊独立站" },
  { value: "unsure", label: "都要不确定" },
];

export default function UploadPage() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [platform, setPlatform] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 3) {
        setError("最多上传3张图片");
        return;
      }
      setError(null);
      setImages(files);
      // 上传到服务器获取 URL
      const urls: string[] = [];
      for (const file of files) {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const r = await fetch("/api/upload", { method: "POST", body: fd });
          if (r.ok) {
            const data = await r.json();
            urls.push(data.url);
          }
        } catch { /* ignore upload error, fallback to blob */ }
      }
      if (urls.length > 0) {
        sessionStorage.setItem("original_image_url", urls[0]);
      }
      setPreviews(files.map((f) => URL.createObjectURL(f)));
    },
    []
  );

  const toggleStyle = useCallback((id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    // 获取已上传的图片 URL
    const imageUrl = sessionStorage.getItem("original_image_url");
    localStorage.setItem(
      "upload_form",
      JSON.stringify({
        selected_images: images.map((f) => f.name),
        selected_styles: selectedStyles,
        platform,
        notes,
        image_url: imageUrl,
      })
    );
    window.location.href = "/submit";
  }, [images, selectedStyles, platform, notes]);

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
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
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
            {submitting ? "提交中..." : "确认提交"}
          </button>
          <p className="text-center text-xs text-gray-400">48小时内顾问微信联系你</p>
        </section>

      </main>
    </div>
  );
}
