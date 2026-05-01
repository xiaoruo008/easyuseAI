"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import CaseWall from "@/components/CaseWall";

const BEFORE_IMG = "/images/home/home-before.jpg";
const AFTER_IMG = "/images/home/home-model.png";

export default function HomePage() {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSlider(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateSlider(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    updateSlider(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className={`sticky top-0 z-20 min-h-[72px] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-200' : 'bg-transparent border-b border-transparent'}`}>
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
            <Link href="/diagnosis" className="text-gray-500 hover:text-gray-900 transition-colors duration-300">
              开始使用
            </Link>
            <span className="text-gray-200 hidden md:inline">|</span>
            <Link href="/diagnosis" className="text-gray-400 hover:text-gray-700 transition-colors duration-300 hidden md:inline">
              AI虚拟模特
            </Link>
            <Link href="/diagnosis" className="text-gray-400 hover:text-gray-700 transition-colors duration-300 hidden md:inline">
              商品白底图
            </Link>
            <Link href="/diagnosis" className="text-gray-400 hover:text-gray-700 transition-colors duration-300 hidden md:inline">
              场景生成
            </Link>
            <Link href="/diagnosis" className="text-gray-400 hover:text-gray-700 transition-colors duration-300 hidden md:inline">
              AI精修
            </Link>
            <span className="text-gray-200">|</span>
            <Link href="/#pricing" className="text-gray-400 hover:text-gray-700 transition-colors duration-300">
              价格
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
          {/* Hero Text */}
          <div className="text-center mb-10 md:mb-14">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-4 md:mb-5">
              上传商品图，30秒出电商大片
            </h1>
            <p className="text-gray-500 text-base md:text-xl leading-relaxed mb-8 md:mb-10">
              商品100%保留，AI只改背景和光影，不货不对版
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8">
              <Link
                href="/diagnosis"
                className="inline-flex items-center justify-center gap-2 px-8 md:px-10 py-3.5 md:py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all duration-300 text-sm md:text-base shadow-lg shadow-gray-900/20"
              >
                免费试做一张
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="#cases"
                className="inline-flex items-center justify-center gap-2 px-8 md:px-10 py-3.5 md:py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 text-sm md:text-base"
              >
                看案例效果
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Before/After Slider */}
          <div
            ref={containerRef}
            className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden cursor-col-resize select-none"
            style={{ aspectRatio: "4/3" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* After Image (background) */}
            <div className="absolute inset-0">
              <Image
                src={AFTER_IMG}
                alt="效果图"
                fill
                className="object-cover"
                unoptimized
                draggable={false}
              />
            </div>

            {/* Before Image (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <Image
                src={BEFORE_IMG}
                alt="原图"
                fill
                className="object-cover"
                unoptimized
                draggable={false}
              />
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            >
              {/* Slider Handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
              原图
            </div>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
              效果图
            </div>
          </div>
        </div>
      </section>

      {/* Trust Numbers Band */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "3,200+", label: "已服务卖家" },
              { num: "98%", label: "商品保留率" },
              { num: "30秒", label: "平均出图速度" },
              { num: "0", label: "提示词 用户无需学习" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 md:mb-2">
                  {item.num}
                </div>
                <div className="text-gray-500 text-xs md:text-sm">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Wall */}
      <CaseWall />

      {/* Capabilities Section */}
      <section className="py-20 px-4 md:px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
              为什么选择我们
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              专业电商图解决方案，让你的商品脱颖而出
            </p>
          </div>

          {/* Capability Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {[
              {
                icon: "🔒",
                title: "商品100%保留",
                desc: "AI严格锁定商品主体，只改背景和光影，杜绝货不对版",
              },
              {
                icon: "💡",
                title: "光影智能重建",
                desc: "自动匹配背景环境光，商品边缘有真实反射，不是生硬贴图",
              },
              {
                icon: "📐",
                title: "平台尺寸自适应",
                desc: "自动输出淘宝1:1、小红书4:5、TikTok9:16，不用手动裁切",
              },
              {
                icon: "⚡",
                title: "30秒极速出图",
                desc: "上传即处理，无需等待排队，批量也快",
              },
            ].map((cap) => (
              <div
                key={cap.title}
                className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <div className="text-3xl md:text-4xl mb-4">{cap.icon}</div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                  {cap.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 md:px-6 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
              简单三步，完成电商大片
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              无需学习任何技巧，上传即可使用
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { step: "01", title: "上传商品图", desc: "随手拍一张商品图，支持任意角度" },
              { step: "02", title: "选择风格", desc: "挑选喜欢的风格背景，一键生成" },
              { step: "03", title: "下载使用", desc: "下载高清图片，直接用于电商平台" },
            ].map((s, i) => (
              <div key={s.step} className="flex flex-col items-center text-center relative">
                {/* Connector line (except last) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gray-200 z-0" />
                )}
                {/* Circle */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-gray-900">{s.step}</span>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-4">
            准备好提升你的商品图了吗？
          </h2>
          <p className="text-gray-500 text-sm md:text-base mb-8">
            免费试做一张，感受AI生成的电商大片
          </p>
          <Link
            href="/diagnosis"
            className="inline-flex items-center justify-center gap-2 px-10 md:px-12 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all duration-300 text-sm md:text-base shadow-lg shadow-black/20"
          >
            免费试做一张
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-6 bg-gray-950 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/home/logo-tight.png"
              alt="easyuse.ai"
              width={120}
              height={36}
              className="h-8 w-auto object-contain opacity-60"
              unoptimized
            />
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
            <span>© 2024 easyuse.ai</span>
            <Link href="/diagnosis" className="hover:text-gray-300 transition-colors duration-300">使用条款</Link>
            <Link href="/diagnosis" className="hover:text-gray-300 transition-colors duration-300">隐私政策</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
