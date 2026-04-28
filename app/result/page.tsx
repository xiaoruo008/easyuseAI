"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { WORKFLOWS, PERSONAS, PAIN_POINTS, type ResultType, type WorkflowStep } from "@/lib/diagnosis";

// ── 案例数据结构 ───────────────────────────────────────────────
export type CaseCategory = "model" | "brand_scene" | "lifestyle" | "detail_upgrade";

export interface CaseStudyItem {
  id: string;
  category: CaseCategory;
  resultTypes: string[]; // 哪些诊断结果可复用这组案例
  title: string;
  subtitle: string;
  beforeImage: string;
  afterImage: string;
  aspectRatio: "1:1" | "3:4" | "4:5" | "9:16";
  beforeLabel: string;
  afterLabel: string;
  priority: number;
}

const CASE_STUDIES: CaseStudyItem[] = [
  {
    id: "model-full",
    category: "model",
    resultTypes: ["image_poor", "image_cost", "image_stability", "image_start"],
    title: "模特上身",
    subtitle: "真实感强，提升买家下单信心",
    beforeImage: "/images/cases/suit-white.jpg",
    afterImage: "/images/cases/suit-model.jpg",
    aspectRatio: "3:4",
    beforeLabel: "白底图",
    afterLabel: "真实模特效果",
    priority: 1,
  },
  {
    id: "brand-scene",
    category: "brand_scene",
    resultTypes: ["image_poor", "image_cost", "image_stability"],
    title: "品牌场景图",
    subtitle: "有调性，种草内容更吸睛",
    beforeImage: "/images/cases/suit-white.jpg",
    afterImage: "/images/cases/suit-brand.jpg",
    aspectRatio: "1:1",
    beforeLabel: "白底图",
    afterLabel: "品牌场景效果",
    priority: 2,
  },
  {
    id: "lifestyle-scene",
    category: "lifestyle",
    resultTypes: ["image_poor", "image_start"],
    title: "生活场景图",
    subtitle: "有氛围感，种草更有说服力",
    beforeImage: "/images/cases/suit-white.jpg",
    afterImage: "/images/cases/suit-scene.jpg",
    aspectRatio: "3:4",
    beforeLabel: "白底图",
    afterLabel: "生活场景图",
    priority: 3,
  },
  {
    id: "detail-upgrade",
    category: "detail_upgrade",
    resultTypes: ["image_cost", "image_poor", "image_stability"],
    title: "商品精修",
    subtitle: "提升质感，详情页转化更高",
    beforeImage: "/images/cases/suit-before.jpg",
    afterImage: "/images/cases/suit-model.jpg",
    aspectRatio: "1:1",
    beforeLabel: "原图",
    afterLabel: "精修效果图",
    priority: 4,
  },
];
function CostCalculator() {
  const [monthlyCount, setMonthlyCount] = useState(20);
  const [collapsed, setCollapsed] = useState(true);

  // 传统摄影成本估算（每件商品）
  const traditionalCostPerItem = 800; // 模特+场景+后期
  const traditionalMonthly = monthlyCount * traditionalCostPerItem;

  // AI摄影成本估算
  const aiMonthly = 299; // 基础月费
  const aiCostPerExtra = 10; // 超出基础数量的每件费用
  const aiTotal = monthlyCount > 20 ? aiMonthly + (monthlyCount - 20) * aiCostPerExtra : aiMonthly;

  const savings = traditionalMonthly - aiTotal;
  const savingsPercent = Math.round((savings / traditionalMonthly) * 100);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-amber-600 tracking-wide">成本节省计算器</p>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
        >
          {collapsed ? "展开" : "收起"}
          <svg className={`w-3 h-3 transition-transform ${collapsed ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {collapsed ? (
        /* 折叠状态：一行摘要 */
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs">传统摄影 vs AI摄影</p>
            <p className="text-sm font-bold text-white/80 mt-0.5">每月节省 up to <span className="text-emerald-400 text-base">¥{savings.toLocaleString()}</span></p>
          </div>
          <button
            onClick={() => setCollapsed(false)}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            查看详情 →
          </button>
        </div>
      ) : (
        /* 展开状态：完整计算器 */
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 md:p-6 text-white space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">每月上新数量</span>
              <span className="text-lg font-bold">{monthlyCount} 件</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={monthlyCount}
              onChange={(e) => setMonthlyCount(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-white/40">
              <span>5件</span>
              <span>100件</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-white/50 text-xs mb-1">传统摄影</p>
              <p className="text-xl font-bold">¥{traditionalMonthly.toLocaleString()}</p>
              <p className="text-white/40 text-xs">/月</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-white/50 text-xs mb-1">AI摄影</p>
              <p className="text-xl font-bold text-emerald-400">¥{aiTotal.toLocaleString()}</p>
              <p className="text-white/40 text-xs">/月</p>
            </div>
          </div>

          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-center">
            <p className="text-emerald-300 text-sm">预计每月节省</p>
            <p className="text-2xl font-bold text-emerald-300">¥{savings.toLocaleString()}</p>
            <p className="text-emerald-400/70 text-xs">节省 {savingsPercent}% 成本</p>
          </div>
        </div>
      )}
    </section>
  );
}

// 用户结果首屏：before=用户原图，after=AI生成图，无数据时用 CASE_STUDIES[0] 占位
function UserResultFirstScreen() {
  const [beforeUrl, setBeforeUrl] = useState(CASE_STUDIES[0].beforeImage);
  const [afterUrl, setAfterUrl] = useState(CASE_STUDIES[0].afterImage);
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);

  useEffect(() => {
    // before: 用户上传原图（sessionStorage）
    const storedBefore = sessionStorage.getItem("original_image_url");
    if (storedBefore) setBeforeUrl(storedBefore);

    // after: 从生成历史取最新一条（localStorage）
    try {
      const history = JSON.parse(localStorage.getItem("generation_history") || "[]");
      if (history.length > 0) {
        setAfterUrl(history[0].generatedImageUrl);
      }
    } catch { /* ignore */ }
  }, []);

  // 下载结果图（从 afterUrl 下载）
  const handleDownload = () => {
    if (!afterUrl || afterError) return;
    const a = document.createElement("a");
    a.href = afterUrl;
    a.download = "AI效果图.jpg";
    a.target = "_blank";
    a.click();
  };

  return (
    <section className="space-y-3">
      <p className="text-xs font-medium text-amber-600 tracking-wide">我的结果</p>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {/* Before */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-square">
          {!beforeError ? (
            <Image
              src={beforeUrl}
              alt="用户上传原图"
              fill
              className="object-contain"
              onError={() => setBeforeError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-400">你的原图</p>
            </div>
          )}
          {/* 底部横条标签（黑底白字），与 CaseCard 的右上角小标签明显区分 */}
          <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[10px] px-2 py-1 text-center font-medium tracking-wide">
            你的原图
          </span>
        </div>

        {/* After */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-square">
          {!afterError ? (
            <Image
              src={afterUrl}
              alt="AI生成效果图"
              fill
              className="object-contain"
              onError={() => setAfterError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-400">AI效果图</p>
            </div>
          )}
          {/* 底部横条标签（黑底白字），与 CaseCard 的右上角小标签明显区分 */}
          <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-2 py-1 text-center font-medium tracking-wide">
            AI效果图
          </span>
        </div>
      </div>

      {/* 下载按钮：放在首屏 Before/After 正下方，最显眼位置 */}
      <button
        onClick={handleDownload}
        className="w-full py-3 bg-gradient-to-r from-[#FF6B6B] to-[#ff8e8e] hover:from-[#ff5252] hover:to-[#FF6B6B] text-white rounded-xl font-bold text-center transition-colors shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        保存图片
      </button>
    </section>
  );
}

function CaseCard({ item }: { item: CaseStudyItem }) {
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);

  // aspectRatio 映射到 Tailwind class
  const aspectClass = item.aspectRatio === "1:1"
    ? "aspect-square"
    : item.aspectRatio === "4:5"
    ? "aspect-[4/5]"
    : item.aspectRatio === "9:16"
    ? "aspect-[9/16]"
    : "aspect-[3/4]"; // 默认 3:4

  return (
    <div className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
      {/* Before 图 */}
      <div className={`relative w-full ${aspectClass} bg-gray-50`}>
        {!beforeError ? (
          <Image
            src={item.beforeImage}
            alt={item.beforeLabel}
            fill
            className="object-contain"
            onError={() => setBeforeError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gray-50 border-2 border-dashed border-gray-200">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-[10px] text-gray-400">原图</p>
          </div>
        )}
        {/* 右上角小标签（与 UserResultFirstScreen 的底部横条明显区分） */}
        <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
          Before · {item.beforeLabel}
        </span>
      </div>

      {/* 分隔线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

      {/* After 图 */}
      <div className={`relative w-full ${aspectClass} bg-gray-50`}>
        {!afterError ? (
          <Image
            src={item.afterImage}
            alt={item.afterLabel}
            fill
            className="object-contain"
            onError={() => setAfterError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gray-50 border-2 border-dashed border-gray-200">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-[10px] text-gray-400">效果图</p>
          </div>
        )}
        {/* 右上角小标签（琥珀色，与 UserResultFirstScreen 的底部横条明显区分） */}
        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded font-medium">
          After · {item.afterLabel}
        </span>
      </div>

      {/* 标题 */}
      <div className="p-3 bg-white">
        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
      </div>
    </div>
  );
}

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
  // 倒计时（3分钟，制造紧迫感）— 使用 sessionStorage 持久化截止时间戳，刷新不重置
  const [countdown, setCountdown] = useState<number>(3 * 60);

  // 在 useEffect 中初始化倒计时（避免 SSR 访问 sessionStorage）
  useEffect(() => {
    const stored = sessionStorage.getItem("countdown_deadline");
    if (!stored) {
      const deadline = Date.now() + 3 * 60 * 1000;
      sessionStorage.setItem("countdown_deadline", String(deadline));
      setCountdown(3 * 60);
    } else {
      const deadline = parseInt(stored, 10);
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setCountdown(remaining);
    }
  }, []);

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

  // 倒计时逻辑：每秒从 sessionStorage 读取截止时间，计算剩余秒数
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      const stored = sessionStorage.getItem("countdown_deadline");
      if (!stored) {
        setCountdown(0);
        return;
      }
      const deadline = parseInt(stored, 10);
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setCountdown(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 格式化倒计时 MM:SS
  const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");

  // Get sessionId from URL for CTA link
  const [sessionId, setSessionId] = useState<string>("");
  // 微信弹窗状态
  const [showWechatModal, setShowWechatModal] = useState(false);
  // 读取路由决策（高优先级用户显示特殊提示）
  const [routeDecision, setRouteDecision] = useState<{
    selectedProvider: string;
    priorityLevel: string;
    routeReasons: string[];
  } | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSessionId(params.get("session") ?? "");
      try {
        const stored = localStorage.getItem("route_decision");
        if (stored) setRouteDecision(JSON.parse(stored));
      } catch { /* ignore */ }
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

        {/* ── 用户结果首屏：BEFORE/AFTER 对比 ─────────── */}
        <UserResultFirstScreen />

        {/* ── 诊断结论（缩小为紧凑摘要）────────────────────────────── */}
        <section className="space-y-2">
          <p className="text-xs font-medium text-amber-600 tracking-wide">诊断结论</p>
          <div className="bg-gray-900 rounded-xl p-4 text-white">
            <h1 className="text-sm md:text-base font-bold leading-snug">
              {title}
            </h1>
            <p className="text-white/60 text-xs mt-1 leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>
        </section>

        {/* ── 成本计算器 ─────────────────────────────── */}
        <CostCalculator />

        {/* ── 免费试做1张 ─────────────────────────────── */}
        {routeDecision?.selectedProvider === "nanobanana" && (
          <section className="space-y-2">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-start gap-3">
                <span className="text-lg">✨</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">已为你匹配高质量商拍路线</p>
                  <p className="text-xs text-gray-500 mt-0.5">我们检测到你的需求适合跨境卖家标准，当前排队优先级：高</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <p className="text-xs font-medium text-amber-600 tracking-wide">免费体验</p>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 md:p-6 border border-amber-100">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">
              免费试做 1 张，看看适不适合你
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              不用写提示词。你只需要：
            </p>
            <ul className="space-y-1.5 text-sm text-gray-600 mb-5">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">1.</span>
                <span>随手拍一张产品图</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">2.</span>
                <span>再发一张你喜欢的参考图</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">3.</span>
                <span>我们免费帮你试做 1 张</span>
              </li>
            </ul>
            <p className="text-amber-600 text-sm font-medium mb-4">
              ⚡ 想立即体验？点下方「立即在线生成」，30秒出图，不用加微信不用留联系方式
            </p>
            {countdown > 0 && (
              <div className="mb-4 flex items-center justify-center gap-1.5 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2 text-amber-700 text-sm font-medium">
                <span>⏰ 限时免费，还剩</span>
                <span className="font-mono font-bold text-amber-800">{mm}:{ss}</span>
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  const sid = new URLSearchParams(window.location.search).get("session") ?? "";
                  window.location.href = sid
                    ? `/execute?session=${sid}&action=product_photo&workflowKey=product_photo`
                    : `/execute?action=product_photo&workflowKey=product_photo`;
                }}
                className="block w-full py-3.5 bg-gradient-to-r from-[#FF6B6B] to-[#ff8e8e] hover:from-[#ff5252] hover:to-[#FF6B6B] text-white rounded-xl font-bold text-center transition-colors shadow-lg shadow-red-500/25"
              >
                ⚡ 立即在线生成（30秒出图）
              </button>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <button
                  onClick={() => {
                    const sid = new URLSearchParams(window.location.search).get("session") ?? "";
                    window.location.href = sid
                      ? `/submit?session=${sid}&action=${resultType}`
                      : `/submit?action=${resultType}`;
                  }}
                  className="flex items-center gap-1 hover:text-amber-600 transition-colors underline decoration-gray-300 hover:decoration-amber-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  让顾问帮我做
                </button>
                <span>·</span>
                <button
                  onClick={() => setShowWechatModal(true)}
                  className="hover:text-amber-600 transition-colors underline decoration-gray-300 hover:decoration-amber-400"
                >
                  加微信咨询
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 案例展示 ─────────────────────────────── */}
        <section className="space-y-4">
          <p className="text-xs font-medium text-amber-600 tracking-wide">案例效果</p>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {CASE_STUDIES.filter((c) => c.resultTypes.includes(resultType!))
              .sort((a, b) => a.priority - b.priority)
              .slice(0, 3)
              .map((item) => (
                <CaseCard key={item.id} item={item} />
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

        {/* ── 底部链接 ─────────────────────────────── */}
        <section className="space-y-2.5 md:space-y-3">
          <div className="rounded-xl bg-gray-100 border border-gray-300 p-4 text-center space-y-2">
            <p className="text-gray-500 font-medium text-sm">有问题？<button onClick={() => setShowWechatModal(true)} className="text-amber-600 hover:text-amber-700 transition-colors">加微信咨询</button></p>
            <p className="text-gray-400 text-xs">微信：z425659107 <button onClick={() => navigator.clipboard.writeText("z425659107")} className="text-amber-600 hover:text-amber-700 transition-colors ml-1">复制</button></p>
          </div>

          <div className="flex items-center justify-center gap-6 pt-1">
            <Link href="/diagnosis" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              重新诊断 →
            </Link>
            <Link href="/history" className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors">
              查看历史记录 →
            </Link>
          </div>
        </section>

      </main>

      {/* 微信咨询弹窗 */}
      {showWechatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWechatModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <button
              onClick={() => setShowWechatModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-5.98-2.575M21 12c0-4.418-3.582-8-8-8" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">添加客服微信</h3>
              <p className="text-gray-500 text-sm">长按复制微信号，搜索添加</p>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">z425659107</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("z425659107");
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-center transition-colors shadow-lg"
              >
                复制微信号
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
