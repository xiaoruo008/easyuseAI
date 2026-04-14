"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// 首屏轮播大图
const AFTER_IMAGES = [
  { label: "白底效果", src: "/images/home/white-product.png" },
  { label: "官网效果", src: "/images/home/home-brand.png" },
  { label: "模特效果", src: "/images/home/home-model.png" },
  { label: "场景效果", src: "/images/home/home-scene.png" },
];

const REAL_BEFORE = "/images/home/home-before.jpg";

const CASES = [
  { id: "bg-swap", label: "换背景", tag: "最常见", beforeUrl: REAL_BEFORE, afterUrl: AFTER_IMAGES[0].src, from: "¥29/张", scene: "电商主图 · 小红书 · 抖音", result: "背景乱 → 干净专业，点击欲望更强" },
  { id: "retouch", label: "商品精修", tag: "电商必备", beforeUrl: REAL_BEFORE, afterUrl: AFTER_IMAGES[1].src, from: "¥99/5张", scene: "淘宝 · 京东 · 拼多多", result: "光线差/色偏 → 像品牌官网图" },
  { id: "model", label: "模特图", tag: "高转化", beforeUrl: REAL_BEFORE, afterUrl: AFTER_IMAGES[2].src, from: "¥299/套", scene: "种草笔记 · 详情页 · 广告图", result: "没质感 → 有信任感，客户更愿意买" },
  { id: "scene", label: "场景图", tag: "种草专用", beforeUrl: REAL_BEFORE, afterUrl: AFTER_IMAGES[3].src, from: "¥99起", scene: "小红书 · 朋友圈 · 公众号", result: "单品平铺 → 有氛围感，种草更有说服力" },
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
          <nav className="flex gap-6 text-sm">
            <Link href="/diagnosis" className="text-white/50 hover:text-white transition-colors">开始</Link>
            <Link href="/dashboard/leads" className="text-white/50 hover:text-white transition-colors">后台</Link>
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
            {/* 金标 */}
            <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full border self-start" style={{ background: "rgba(251,191,36,0.04)", borderColor: "rgba(251,191,36,0.15)" }}>
              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }} />
              <span className="text-[10px] md:text-[11px] font-medium tracking-wider" style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24, #d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                AI 驱动 · 服装商家首选
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-4 md:mb-6">
              随手拍一张<br className="hidden sm:block" /> 0提示词自动出图
            </h1>
            <p className="text-white/50 text-sm md:text-lg leading-relaxed mb-6 md:mb-8">
              一张随手拍 → 4K级电商摄影图
            </p>
            {/* CTA */}
            <div className="flex flex-col gap-2.5">
              <Link
                href="/diagnosis"
                className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all text-base shadow-lg shadow-white/10"
              >
                限量0元领取
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <p className="text-center text-white/30 text-xs">仅限前100名，顾问30分钟内联系你</p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Gallery */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-950 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight mb-2 md:mb-3">我们能帮你做成什么样</h2>
            <p className="text-white/40 text-sm">随便挑了几种最常见的需求，都能做</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {CASES.map((c) => (
              <div key={c.id} className="bg-gray-900/50 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all flex flex-col">
                <div className="px-3 md:px-4 py-2.5 flex items-center justify-between border-b border-white/5">
                  <span className="text-xs font-semibold text-white/80">{c.label}</span>
                  <span className="text-[10px] font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">{c.tag}</span>
                </div>
                <div className="flex h-36 md:h-44 flex-shrink-0">
                  <div className="relative flex-1 bg-gray-900">
                    <Image src={c.beforeUrl} alt={`${c.label} 原图`} fill className="object-contain p-1" unoptimized />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/70 text-[9px] text-center py-0.5 tracking-wider">原图</div>
                  </div>
                  <div className="w-px bg-white/10 flex-shrink-0" />
                  <div className="relative flex-1 bg-gray-900">
                    <Image src={c.afterUrl} alt={`${c.label} 效果`} fill className="object-contain p-1" unoptimized />
                    <div className="absolute bottom-0 left-0 right-0 bg-amber-500/70 text-white text-[9px] text-center py-0.5 tracking-wider">效果</div>
                  </div>
                </div>
                <div className="px-3 md:px-4 pt-3 pb-2 flex-1 flex flex-col">
                  <p className="text-xs text-white/60 leading-relaxed mb-1.5 md:mb-2 flex-1">{c.result}</p>
                  <p className="text-[10px] text-white/30 mb-2 md:mb-3">{c.scene}</p>
                  <Link href="/diagnosis" className="w-full py-2 text-xs font-semibold text-center border border-white/10 rounded-lg text-white/60 hover:bg-white/5 hover:border-white/20 transition-colors">我也要做一张</Link>
                </div>
                <div className="px-3 md:px-4 pb-3"><p className="text-xs font-semibold text-amber-400">{c.from}</p></div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 md:mt-10">
            <Link href="/diagnosis" className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 border border-white/20 rounded-xl text-white/50 text-sm font-medium hover:bg-white/5 hover:border-white/30 transition-colors">
              上传我的图，看看能做什么 →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-900 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold text-white text-center tracking-tight mb-2 md:mb-3">明码标价，做完才收钱</h2>
          <p className="text-white/40 text-center mb-8 md:mb-12 text-sm md:text-base">先做一版给你看，不满意不收任何费用</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { tier: "体验", price: "¥29", unit: "/张", desc: "1张图，换背景或基础精修", best: false, cta: "上传一张试试" },
              { tier: "标准", price: "¥99", unit: "/5张", desc: "5张同规格图，批量制作", best: true, cta: "开始制作" },
              { tier: "定制", price: "¥299", unit: "/套", desc: "完整方案，含模特+场景+精修", best: false, cta: "获取定制方案" },
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
          <p className="text-center text-white/30 text-xs md:text-sm mt-6 md:mt-8">不确定自己需要什么？<Link href="/diagnosis" className="underline underline-offset-2 hover:text-white/60 transition-colors">先做5道题，让我们帮你判断</Link></p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-950 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center space-y-4 md:space-y-5">
          <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">发一张图过来</h2>
          <p className="text-white/40 text-base md:text-lg">我们帮你做成能用的版本，当天发给你</p>
          <Link href="/diagnosis" className="inline-flex items-center gap-2 px-8 md:px-10 py-3.5 md:py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-base md:text-lg">开始制作</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 md:py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <p className="text-xs md:text-sm text-white/30">© 2026 easyuse.ai · 帮你把事情做完</p>
          <div className="flex gap-6 text-xs md:text-sm text-white/30">
            <Link href="/dashboard/leads" className="hover:text-white/60 transition-colors">后台</Link>
            <Link href="/diagnosis" className="hover:text-white/60 transition-colors">开始</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
