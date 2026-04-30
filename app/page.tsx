"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CaseWall from "@/components/CaseWall";

// 首屏轮播大图
const AFTER_IMAGES = [
  { label: "白底效果", src: "/images/home/white-product.png" },
  { label: "官网效果", src: "/images/home/home-brand.png" },
  { label: "模特效果", src: "/images/home/home-model.png" },
  { label: "场景效果", src: "/images/home/home-scene.png" },
];

const REAL_BEFORE = "/images/home/home-before.jpg";

const CASES = [
  { id: "bg-swap", label: "换背景", tag: "最常见", beforeUrl: REAL_BEFORE, afterUrl: AFTER_IMAGES[0].src, from: "¥29/张", scene: "淘宝主图 · 小红书 · 抖音", result: "背景乱 → 干净专业，点击欲望更强" },
  { id: "retouch", label: "商品精修", tag: "电商必备", beforeUrl: REAL_BEFORE, afterUrl: AFTER_IMAGES[1].src, from: "¥99/5张", scene: "淘宝详情 · 亚马逊 · 独立站", result: "光线差/色偏 → 像品牌官网图" },
  { id: "model", label: "模特图", tag: "高转化", beforeUrl: REAL_BEFORE, afterUrl: AFTER_IMAGES[2].src, from: "¥299/套", scene: "淘宝女装 · 亚马逊服饰 · TikTok", result: "没质感 → 有信任感，客户更愿意买" },
  { id: "scene", label: "场景图", tag: "种草专用", beforeUrl: REAL_BEFORE, afterUrl: AFTER_IMAGES[3].src, from: "¥99起", scene: "淘宝主图 · 小红书种草 · 详情页", result: "单品平铺 → 有氛围感，种草更有说服力" },
];

const PAIN_POINTS = [
  {
    id: "expensive",
    title: "实拍太贵",
    desc: "一次摄影几千块，新品测款根本烧不起",
  },
  {
    id: "complex",
    title: "AI太难用",
    desc: "词写不出来，出图全靠运气，十张里一张能用",
  },
  {
    id: "slow",
    title: "时间太长",
    desc: "自己调图一坐就是几小时，改个细节又全乱",
  },
];

export default function HomePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <main className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="relative z-20 border-b border-white/10 min-h-[72px]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between min-h-[72px]">
          <div className="flex items-center shrink-0">
            <Image
              src="/images/home/logo.png"
              alt="easyuse.ai"
              width={180}
              height={56}
              className="block h-[48px] md:h-[56px] w-auto max-w-[180px] md:max-w-[220px] object-contain"
              unoptimized
            />
          </div>
          <nav className="flex gap-4 text-xs md:text-sm">
            <Link href="/diagnosis" className="text-white/50 hover:text-white transition-colors">开始使用</Link>
            <span className="text-white/20 hidden md:inline">|</span>
            <Link href="/diagnosis" className="text-white/40 hover:text-white/70 transition-colors hidden md:inline">AI虚拟模特</Link>
            <Link href="/diagnosis" className="text-white/40 hover:text-white/70 transition-colors hidden md:inline">商品白底图</Link>
            <Link href="/diagnosis" className="text-white/40 hover:text-white/70 transition-colors hidden md:inline">场景生成</Link>
            <Link href="/diagnosis" className="text-white/40 hover:text-white/70 transition-colors hidden md:inline">AI精修</Link>
            <span className="text-white/20">|</span>
            <Link href="/#pricing" className="text-white/40 hover:text-white/70 transition-colors">价格</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "100svh" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(120,119,198,0.08),transparent_60%)]" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12" style={{ minHeight: "100svh" }}>
          {/* 左侧：主视觉大图 */}
          <div className="flex-1 flex flex-col items-center gap-4 w-full">
            {/* 大图展示区 — 移动端降低高度 */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-gray-900/60 backdrop-blur-sm border border-white/10"
              style={{ minHeight: "clamp(260px, 45vw, 480px)" }}>
              <div className="absolute inset-0 flex">
                {/* 左侧：原图 */}
                <div className="relative flex-[0.88] border-r border-white/10">
                  <Image src={REAL_BEFORE} alt="原图" fill className="object-contain p-2 md:p-4" unoptimized />
                  <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-black/60 backdrop-blur-sm text-white/80 text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full tracking-wider">随手拍</div>
                </div>
                {/* 右侧：效果图 */}
                <div className="relative flex-[1.12]">
                  <Image
                    key={activeIdx}
                    src={AFTER_IMAGES[activeIdx].src}
                    alt="效果"
                    fill
                    className="object-contain p-1 md:p-2 transition-opacity duration-300"
                    unoptimized
                  />
                  <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-amber-500/80 backdrop-blur-sm text-white text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full tracking-wider z-10">
                    {AFTER_IMAGES[activeIdx].label}
                  </div>
                </div>
              </div>
              {/* 中心箭头 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>

            {/* 4张缩略图 — 移动端缩小尺寸 */}
            <div
              className="flex gap-2 md:gap-3 justify-center"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {AFTER_IMAGES.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 flex-shrink-0 ${
                    activeIdx === i
                      ? "border-amber-400 shadow-lg shadow-amber-400/30 scale-105"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  style={{ width: "60px", height: "60px", minWidth: "60px" }}
                >
                  <Image
                    src={img.src}
                    alt={img.label}
                    fill
                    className="object-contain pointer-events-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：文案 */}
          <div className="flex-1 flex flex-col justify-center max-w-lg w-full">
            {/* Social proof banner - HERO ELEMENT */}
            <div className="mb-5 md:mb-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl md:text-3xl font-bold text-amber-400">3,200+</span>
                  <span className="text-amber-300/80 text-sm md:text-base font-medium">跨境卖家在用</span>
                </div>
                <div className="w-px h-5 bg-amber-400/30" />
                <span className="text-amber-300/70 text-xs md:text-sm">Amazon认证服务商</span>
              </div>
            </div>
            {/* AI model names */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-white/40 text-xs">Powered by</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "MiniMax Pro", sub: "图像生成" },
                  { name: "Gemini 2.0", sub: "智能理解" },
                  { name: "FLUX Pro", sub: "真实感模特" },
                ].map((model) => (
                  <div key={model.name} className="flex flex-col items-center px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                    <span className="text-white/80 text-xs font-medium">{model.name}</span>
                    <span className="text-amber-400/70 text-[10px]">{model.sub}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* 金标 */}
            <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full border self-start" style={{ background: "rgba(251,191,36,0.04)", borderColor: "rgba(251,191,36,0.15)" }}>
              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }} />
              <span className="text-[10px] md:text-[11px] font-medium tracking-wider" style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24, #d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                AI 云端摄影棚 · 跨境服装卖家专属
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-3 md:mb-4">
              最新AI图像模型<br className="hidden sm:block" /> 分钟级生成可上架的电商主图
            </h1>
            {/* 英文副标题 — 对标 WeShop 英文 H1，面向跨境卖家 */}
            <p className="text-white/40 text-sm md:text-base leading-relaxed mb-0">
              Powered by Latest AI Models · E-commerce-ready images in minutes
            </p>
            {/* 最新模型公告 — 对标 WeShop "GPT Image 2 is now available" */}
            <div className="mb-4 md:mb-5">
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/15 to-violet-500/15 border border-purple-500/40 hover:border-purple-500/60 hover:from-purple-500/20 hover:to-violet-500/20 transition-all cursor-default shadow-lg shadow-purple-500/10">
                <span className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-gradient-to-r from-purple-500 to-violet-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">NEW</span>
                  <span className="text-white/95 text-sm font-semibold">🍌 Nano-Banana Pro 现已支持跨境服装</span>
                </span>
                <span className="hidden md:inline text-white/40 text-xs">·</span>
                <span className="hidden md:inline text-white/60 text-sm">高质量模特图，让你的商品图脱颖而出</span>
                <svg className="w-4 h-4 text-purple-400/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <p className="text-white/50 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
              不用写提示词，不用学任何工具<br />
              上传产品图，分钟级出可用的结果<br />
              不满意重做到你满意为止
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5 md:mb-6">
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <svg className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>48小时交付</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <svg className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>不满意全额退款</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <svg className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Amazon认证服务商</span>
              </div>
            </div>
            {/* CTA */}
            <div className="flex flex-col gap-2.5">
              {/* Free points CTA with hover tooltip */}
              <div className="relative group">
                <Link
                  href="/diagnosis"
                  className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all text-base shadow-lg shadow-white/10"
                >
                  🎁 免费使用所有功能
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                {/* Tooltip - appears on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50">
                  <div className="relative bg-gray-900/95 border border-white/20 rounded-xl px-4 py-3 shadow-xl shadow-black/30 whitespace-nowrap">
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900/95 border-r border-b border-white/20 rotate-45"></div>
                    <p className="text-sm text-white font-medium">免费使用所有 <span className="text-amber-400 font-bold">AI功能</span></p>
                    <p className="text-xs text-white/60 mt-0.5">无需信用卡，立即激活</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/50 text-center">先回答8个问题，AI精准匹配最佳模型</p>
              <p className="text-xs text-white/50 text-center">无需信用卡，立即开始</p>
              <a
                href="/upload"
                className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 bg-white/10 border border-white/20 text-white/70 rounded-xl font-medium hover:bg-white/15 hover:text-white transition-all text-sm"
              >
                直接上传图片
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </a>
              <p className="text-xs text-white/50 text-center">直接上传，分钟级出图</p>
              {/* 拖拽上传提示区 */}
              <div className="mt-2 px-4 py-3 border-2 border-dashed border-white/20 rounded-xl text-center">
                <p className="text-xs text-white/60">
                  或拖拽图片到此处，即刻开始生成
                </p>
              </div>
            </div>
            {/* Model icon grid */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <span className="text-[10px] text-white/30 uppercase tracking-wider mb-2 block">支持的模型</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { emoji: "📸", name: "Nano-Banana Pro" },
                  { emoji: "🎯", name: "MiniMax-CN" },
                  { emoji: "🌐", name: "Gemini-Nano" },
                  { emoji: "✨", name: "FLUX-Pro" },
                ].map((model) => (
                  <div
                    key={model.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 opacity-60 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-sm">{model.emoji}</span>
                    <span className="text-white/70 text-xs font-medium">{model.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 社会证明区 — 对标 WeShop "Trusted by 3,000,000+ users worldwide" */}
      <section className="py-10 md:py-14 px-4 md:px-6 bg-gray-900 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          {/* 核心数字 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-4">
              <span className="text-3xl md:text-4xl font-bold text-amber-400">3,200+</span>
              <span className="text-amber-300/80 text-base md:text-lg font-medium">跨境卖家信赖之选</span>
            </div>
            <p className="text-white/40 text-sm">已帮助3200+跨境电商卖家高效完成商品图制作，覆盖Amazon、Shopify、TikTok Shop等多个平台</p>
          </div>
          {/* 信任标签行 */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8">
            {[
              { icon: "👥", text: "3200+跨境卖家", highlight: true },
              { icon: "✓", text: "Amazon认证服务商" },
              { icon: "✓", text: "48小时交付" },
              { icon: "✓", text: "不满意全额退款" },
              { icon: "✓", text: "已服务50+品类" },
            ].map((item) => (
              item.highlight ? (
                <div key={item.text} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-sm font-medium">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ) : (
                <div key={item.text} className="flex items-center gap-2 text-white/50 text-sm">
                  <svg className="w-4 h-4 text-amber-400/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item.text}</span>
                </div>
              )
            ))}
          </div>
          {/* 平台标识行 — 提升可见性，对标 WeShop 品牌墙 */}
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 mt-4 pt-6 border-t border-white/5">
            <span className="text-white/30 text-xs self-center mr-1">已服务客户平台</span>
            {["Amazon", "Shopify", "TikTok Shop", "eBay", "AliExpress"].map((platform) => (
              <div key={platform} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10">
                <span className="text-white/60 text-xs font-medium tracking-wide">{platform}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 痛点区 */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-950 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight mb-2 md:mb-3">你是不是也遇到过这些问题</h2>
            <p className="text-white/40 text-sm">电商出图路上的三座大山</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {PAIN_POINTS.map((p) => (
              <div key={p.id} className="bg-gray-900/50 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all flex flex-col p-5 md:p-6">
                <div className="mb-3">
                  {p.id === "expensive" && (
                    // Camera + dollar sign — "实拍太贵" cost icon
                    <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  )}
                  {p.id === "complex" && (
                    // Brain/gear — "AI太难用" complexity icon
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM8.25 21v-4.5a3.75 3.75 0 117.5 0V21" />
                    </svg>
                  )}
                  {p.id === "slow" && (
                    // Clock — "时间太长" time icon
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-base md:text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 解决方案区 */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-900 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight mb-2 md:mb-3">我们帮你把AI用好</h2>
            <p className="text-white/40 text-sm">调参的事交给我们，你只管上传等着收图</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {[
              { step: "01", title: "上传产品图", desc: "随手一拍就行" },
              { step: "02", title: "选风格场景", desc: "想要的风格点一下" },
              { step: "03", title: "AI即时生成", desc: "分钟级出图，不满意重做" },
            ].map((s) => (
              <div key={s.step} className="bg-white/5 rounded-2xl p-5 md:p-6 border border-white/10 text-center">
                <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-3">{s.step}</div>
                <h3 className="text-white font-semibold text-base md:text-lg mb-1">{s.title}</h3>
                <p className="text-white/40 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI 能力展示区 */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gray-950 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight mb-2">支持的AI能力</h2>
            <p className="text-white/40 text-sm">基于业界领先模型，专注电商场景优化</p>
          </div>
          {/* 能力标签 */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-10">
            {[
              { label: "模特图生成", model: "FLUX", desc: "真实感AI模特" },
              { label: "商品白底", model: "MiniMax", desc: "一键去除背景" },
              { label: "背景替换", model: "Gemini", desc: "智能场景合成" },
              { label: "商品精修", model: "MiniMax", desc: "光影质感增强" },
              { label: "场景生成", model: "FLUX", desc: "氛围感主图" },
            ].map((cap) => (
              <div
                key={cap.label}
                className="group relative flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/40 hover:bg-amber-400/5 transition-all cursor-default"
              >
                <span className="text-white/90 text-sm font-medium">{cap.label}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-400 text-[10px] md:text-xs font-semibold">
                  {cap.model}
                </span>
                <span className="hidden md:inline text-white/30 text-xs">{cap.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI 模型详解区 — 对标 WeShop "All AI Models" */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gray-900 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight mb-2">AI模型详解</h2>
            <p className="text-white/40 text-sm">每个场景都有最适合的模型，智能匹配不踩坑</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {[
              {
                model: "Nano-Banana Pro",
                emoji: "🍌",
                tag: "高质量",
                tagColor: "amber",
                useFor: "跨境 · 高频上新 · 高难度图片",
                abilities: ["Lifestyle场景", "品牌场景感", "模特升级", "跨境外套"],
                desc: "专为高质量跨境服装卖家设计，处理复杂风格需求",
                badge: "推荐",
                sampleImg: "/images/home/home-model.png",
              },
              {
                model: "MiniMax-CN",
                emoji: "🎯",
                tag: "主力模型",
                tagColor: "emerald",
                useFor: "日常电商 · 商品精修 · 白底图",
                abilities: ["商品精修", "白底图", "背景去除", "光影增强"],
                desc: "日常电商图的主力模型，稳定可靠速度快",
                badge: null,
                sampleImg: "/images/home/white-product.png",
              },
              {
                model: "Gemini-Nano",
                emoji: "🌐",
                tag: "智能理解",
                tagColor: "blue",
                useFor: "高难度合成 · 背景替换",
                abilities: ["智能合成", "背景替换", "场景生成", "图文理解"],
                desc: "复杂图像理解和自然合成，擅长多元素融合",
                badge: null,
                sampleImg: "/images/home/home-scene.png",
              },
              {
                model: "FLUX-Pro",
                emoji: "✨",
                tag: "真实感模特",
                tagColor: "purple",
                useFor: "服装配饰 · 虚拟模特 · 场景光影",
                abilities: ["真实感模特", "服装配饰", "场景生成", "光影自然"],
                desc: "真实感最强，擅长服装配饰类和虚拟模特场景",
                badge: null,
                sampleImg: "/images/home/home-brand.png",
              },
            ].map((m) => (
              <div
                key={m.model}
                className="group relative p-[1px] rounded-xl bg-gradient-to-br from-amber-400/30 via-emerald-400/30 to-purple-400/30 hover:from-amber-400 hover:via-emerald-400 hover:to-purple-400 transition-all duration-300"
              >
                <div className="flex flex-col p-4 md:p-5 rounded-xl bg-gray-900/90 h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl">{m.emoji}</span>
                      <span className="text-lg md:text-xl font-bold text-white">{m.model}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        m.tagColor === "amber" ? "bg-amber-400/20 text-amber-400" :
                        m.tagColor === "emerald" ? "bg-emerald-400/20 text-emerald-400" :
                        m.tagColor === "blue" ? "bg-blue-400/20 text-blue-400" :
                        "bg-purple-400/20 text-purple-400"
                      }`}>{m.tag}</span>
                    </div>
                    {m.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-gray-900">{m.badge}</span>
                    )}
                  </div>
                  {/* Sample output image — eye icon indicates demo/preview (not video) */}
                  <div className="relative rounded-lg overflow-hidden mb-3 aspect-[16/9] bg-black/40">
                    <Image
                      src={m.sampleImg}
                      alt={`${m.model} sample output`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-1.5 right-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                        m.tagColor === "amber" ? "bg-amber-400/80 text-gray-900" :
                        m.tagColor === "emerald" ? "bg-emerald-400/80 text-gray-900" :
                        m.tagColor === "blue" ? "bg-blue-400/80 text-white" :
                        "bg-purple-400/80 text-white"
                      }`}>{m.model}</span>
                    </div>
                  </div>
                  <p className="text-white/30 text-xs mb-3">{m.useFor}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {m.abilities.map((a, i) => (
                      <span
                        key={a}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          m.tagColor === "amber" ? "bg-amber-400/15 text-amber-300 border border-amber-400/20" :
                          m.tagColor === "emerald" ? "bg-emerald-400/15 text-emerald-300 border border-emerald-400/20" :
                          m.tagColor === "blue" ? "bg-blue-400/15 text-blue-300 border border-blue-400/20" :
                          "bg-purple-400/15 text-purple-300 border border-purple-400/20"
                        }`}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed mt-auto">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <a href="/models" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-amber-400 transition-colors">
              查看全部模型
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Hot Features 热门功能 */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-900 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          {/* Bilingual heading — Hot Feature */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight mb-2">
              Hot Feature
            </h2>
            <p className="text-white/40 text-sm">热门功能 · 演示效果</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {[
              { name: "AI虚拟模特", src: "/images/home/home-model.png", desc: "服装穿在虚拟模特身上，多肤色/体型可选" },
              { name: "商品白底图", src: "/images/home/white-product.png", desc: "一键去除背景，生成标准电商白底图" },
              { name: "场景生成", src: "/images/home/home-scene.png", desc: "将商品放入生活场景，提升种草感" },
              { name: "AI精修", src: "/images/home/home-brand.png", desc: "智能增强光影、质感、清晰度" },
              { name: "智能换背景", src: "/images/home/home-before.jpg", desc: "随意切换背景，一个商品多种用法" },
            ].map((item) => (
              <Link
                key={item.name}
                href="/diagnosis"
                aria-label={item.name}
                className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-400/10 transition-all duration-200 hover:scale-[1.03] hover:brightness-110"
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* View demo icon — eye icon indicates preview/demo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                {/* Hover overlay with description */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-end gap-2 p-2 pb-3">
                  <p className="text-white text-xs font-medium text-center leading-snug">{item.desc}</p>
                </div>
                {/* Name label (always visible) */}
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-xs md:text-sm font-medium text-center group-hover:text-amber-300 transition-colors">{item.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Case Wall */}
      <CaseWall />

      {/* Pricing */}
      <section id="pricing" className="py-12 md:py-20 px-4 md:px-6 bg-gray-900 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold text-white text-center tracking-tight mb-2 md:mb-3">免费使用所有AI商拍功能</h2>
          <p className="text-white/40 text-center mb-8 md:mb-12 text-sm md:text-base">所有功能免费开放，无需注册无需充值</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { tier: "免费", price: "¥0", unit: "/月", desc: "无限使用所有AI商拍功能", best: false, cta: "立即开始" },
              { tier: "免费", price: "¥0", unit: "/月", desc: "无限使用所有AI商拍功能", best: true, cta: "立即开始" },
              { tier: "免费", price: "¥0", unit: "/月", desc: "无限使用所有AI商拍功能", best: false, cta: "立即开始" },
            ].map((plan) => (
              <div key={plan.tier} className={`relative rounded-2xl p-5 md:p-6 flex flex-col ${plan.best ? "bg-white text-gray-900 ring-1 ring-white/20" : "bg-white/5 border border-white/10"}`}>
                {plan.best && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">最受欢迎</span></div>}
                <p className={`text-xs font-medium mb-2 ${plan.best ? "text-gray-500" : "text-white/40"}`}>{plan.tier}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-2xl md:text-3xl font-bold ${plan.best ? "text-gray-900" : "text-white"}`}>{plan.price}</span>
                  <span className={`text-sm mb-0.5 ${plan.best ? "text-gray-500" : "text-white/40"}`}>{plan.unit}</span>
                </div>
                <p className={`text-xs md:text-sm mb-5 md:mb-6 ${plan.best ? "text-gray-500" : "text-white/50"}`}>{plan.desc}</p>
                <Link href="/diagnosis" className={`mt-auto py-2.5 md:py-3 rounded-xl text-sm font-semibold text-center transition-colors ${plan.best ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-white/10 text-white/70 hover:bg-white/15"}`}>{plan.cta}</Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 md:py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <p className="text-xs md:text-sm text-white/30">© 2026 easyuse.ai · 帮你把事情做完</p>
          <div className="flex gap-6 text-xs md:text-sm text-white/30">
            <Link href="/diagnosis" className="hover:text-white/60 transition-colors">开始使用</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
