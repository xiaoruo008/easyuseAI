"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SubmitContent() {
  const params = useSearchParams();
  const sessionId = params.get("session") ?? "";

  const [form, setForm] = useState({ name: "", wechat_id: "", product_category: "", notes: "" });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const productImageRef = useRef<HTMLInputElement>(null);
  const referenceImageRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.wechat_id.trim()) {
      setError("姓名和微信号为必填项");
      return;
    }
    setError(null);
    setSubmitting(true);
    setUploading(true);

    try {
      // 0. 读取 session resultType
      let resultType: string | undefined;
      if (sessionId) {
        try {
          const r = await fetch(`/api/diagnosis/session/${sessionId}/result`);
          if (r.ok) {
            const d = await r.json();
            resultType = d.result?.type ?? d.session?.resultType ?? undefined;
          }
        } catch { /* ignore */ }
      }

      // 1. 先上传文件得 URL
      const productFile = productImageRef.current?.files?.[0];
      const referenceFile = referenceImageRef.current?.files?.[0];

      let productImage: string | undefined;
      let referenceImage: string | undefined;

      if (productFile) {
        const fd = new FormData();
        fd.append("file", productFile);
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        if (r.ok) {
          const data = await r.json();
          productImage = data.url;
        }
      }

      if (referenceFile) {
        const fd = new FormData();
        fd.append("file", referenceFile);
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        if (r.ok) {
          const data = await r.json();
          referenceImage = data.url;
        }
      }

      setUploading(false);

      // 2. 提交 JSON（/api/leads 内部触发 n8n webhook）
      const leadRes = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          wechat: form.wechat_id,
          category: form.product_category || undefined,
          platform: undefined,
          resultType,
          productImage,
          referenceImage,
          remark: form.notes || undefined,
        }),
      });

      if (!leadRes.ok) throw new Error("提交失败");
      setSubmitted(true);
    } catch {
      setError("提交失败，请检查网络后重试");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-6 md:p-8 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold text-gray-900">收到了！</h1>
          <p className="text-gray-500 leading-relaxed">
            48小时内顾问会微信联系你，记得通过哦
          </p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-gray-400 text-sm">也可以直接加微信咨询</p>
            <p className="text-indigo-600 font-semibold text-lg">easyuseai</p>
            <button
              onClick={() => navigator.clipboard.writeText("easyuseai")}
              className="text-xs text-indigo-500 hover:text-indigo-700 underline"
            >
              点击复制
            </button>
          </div>
          <div className="pt-4 space-y-2">
            <Link href="/" className="block w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href={`/result?session=${sessionId}`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm text-gray-500">留下联系方式</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5 md:mb-2">留下联系方式，我们帮你做一版图</h1>
        <p className="text-gray-500 text-sm mb-6 md:mb-8">48小时内顾问会微信联系你</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-5 md:p-6 space-y-4 md:space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="你的姓名"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              微信号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="你的微信号"
              value={form.wechat_id}
              onChange={(e) => setForm({ ...form, wechat_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              店铺/品类（选填）
            </label>
            <input
              type="text"
              placeholder="淘宝女装、亚马逊家居…"
              value={form.product_category}
              onChange={(e) => setForm({ ...form, product_category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              补充说明（选填）
            </label>
            <textarea
              placeholder="目标买家是谁…"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              上传资料（选填）
            </label>
            <div className="mb-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
              💡 小提示：上传一张<strong>随手拍产品图</strong>+一张<strong>你喜欢的参考图</strong>，我们会按这个方向免费试做1张
            </div>

            {/* 产品图 */}
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">① 随手拍产品图</p>
              <input
                ref={productImageRef}
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>

            {/* 参考图 */}
            <div>
              <p className="text-xs text-gray-500 mb-1">② 你喜欢的参考图</p>
              <input
                ref={referenceImageRef}
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1 md:pt-2">
            <Link
              href={`/result?session=${sessionId}`}
              className="flex-1 py-3 text-center border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              上一步
            </Link>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? (uploading ? "上传中..." : "提交中...") : "确认提交"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">加载中...</p></div>}>
      <SubmitContent />
    </Suspense>
  );
}
