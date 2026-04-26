"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ModelType = "image" | "video" | "multimodal";

interface Model {
  model: string;
  emoji: string;
  tag: string;
  tagColor: "amber" | "emerald" | "blue" | "purple";
  useFor: string;
  abilities: string[];
  desc: string;
  badge: string | null;
  sampleImg: string;
  type: ModelType;
}

const MODELS: Model[] = [
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
    type: "image",
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
    type: "image",
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
    type: "multimodal",
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
    type: "image",
  },
];

const FILTERS = [
  { key: "all", label: "全部模型", zh: "全部模型" },
  { key: "image", label: "AI图像模型", zh: "AI图像模型" },
  { key: "multimodal", label: "多模态模型", zh: "多模态模型" },
] as const;

type FilterKey = typeof FILTERS[number]["key"];

export default function ModelsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredModels = activeFilter === "all"
    ? MODELS
    : MODELS.filter((m) => m.type === activeFilter);

  return (
    <main className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="relative z-20 border-b border-white/10 min-h-[72px]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between min-h-[72px]">
          <div className="flex items-center shrink-0">
            <Link href="/">
              <Image
                src="/images/home/logo.png"
                alt="easyuse.ai"
                width={180}
                height={56}
                className="block h-[48px] md:h-[56px] w-auto max-w-[180px] md:max-w-[220px] object-contain"
                unoptimized
              />
            </Link>
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
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gray-900 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-3">
            AI模型详解
          </h1>
          <p className="text-white/40 text-sm md:text-base">
            每个场景都有最适合的模型，智能匹配不踩坑
          </p>
        </div>
      </section>

      {/* Filter + Models Grid */}
      <section className="py-12 md:py-16 px-4 md:px-6 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Filter Buttons — 对标 WeShop All/Image/Video filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === f.key
                    ? "bg-amber-400 text-gray-900 font-semibold"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/10"
                }`}
              >
                {f.zh}
                {f.key === "all" && (
                  <span className="ml-1.5 text-xs opacity-60">({MODELS.length})</span>
                )}
                {f.key === "image" && (
                  <span className="ml-1.5 text-xs opacity-60">({MODELS.filter((m) => m.type === "image").length})</span>
                )}
                {f.key === "multimodal" && (
                  <span className="ml-1.5 text-xs opacity-60">({MODELS.filter((m) => m.type === "multimodal").length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Model count summary */}
          <div className="text-center mb-6">
            <p className="text-white/30 text-xs">
              {activeFilter === "all"
                ? `共 ${MODELS.length} 个模型`
                : `共 ${filteredModels.length} 个${FILTERS.find((f) => f.key === activeFilter)?.zh}`}
            </p>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {filteredModels.length === 0 ? (
              <div className="col-span-full text-center py-12 text-white/30">
                <p className="text-sm">暂无可用模型，敬请期待</p>
              </div>
            ) : (
              filteredModels.map((m) => (
                <div
                  key={m.model}
                  className="group relative p-[1px] rounded-xl bg-gradient-to-br from-amber-400/30 via-emerald-400/30 to-purple-400/30 hover:from-amber-400 hover:via-emerald-400 hover:to-purple-400 transition-all duration-300"
                >
                  <div className="flex flex-col p-4 md:p-5 rounded-xl bg-gray-900/90 h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl md:text-2xl">{m.emoji}</span>
                        <span className="text-lg md:text-xl font-bold text-white">{m.model}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          m.tagColor === "amber" ? "bg-amber-400/20 text-amber-400" :
                          m.tagColor === "emerald" ? "bg-emerald-400/20 text-emerald-400" :
                          m.tagColor === "blue" ? "bg-blue-400/20 text-blue-400" :
                          "bg-purple-400/20 text-purple-400"
                        }`}>{m.tag}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {m.type === "video" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-400/20 text-red-400">视频</span>
                        )}
                        {m.type === "multimodal" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-400/20 text-blue-400">多模态</span>
                        )}
                        {m.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-gray-900">{m.badge}</span>
                        )}
                      </div>
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
                      {m.abilities.map((a) => (
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
              ))
            )}
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Link
              href="/diagnosis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-gray-900 font-medium transition-colors"
            >
              立即体验
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-white/5 text-center">
        <p className="text-white/30 text-xs">
          © 2024 easyuse.ai — AI产品图生成工具
        </p>
      </footer>
    </main>
  );
}
