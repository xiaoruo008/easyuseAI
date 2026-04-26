"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type CaseStyle = "white_bg" | "model" | "ins";

interface CaseItem {
  id: string;
  style: CaseStyle;
  title: string;
  beforeUrl: string;
  afterUrl: string;
  beforeLabel: string;
  afterLabel: string;
  tag?: string;
}

// 案例数据 - 映射到真实图片
const CASES: CaseItem[] = [
  // 电商白底
  {
    id: "white-1",
    style: "white_bg",
    title: "西装白底图",
    beforeUrl: "/images/cases/suit-before.jpg",
    afterUrl: "/images/cases/suit-white.jpg",
    beforeLabel: "随手拍",
    afterLabel: "电商白底",
    tag: "最常见",
  },
  // 模特上身
  {
    id: "model-1",
    style: "model",
    title: "西装模特图",
    beforeUrl: "/images/cases/suit-white.jpg",
    afterUrl: "/images/cases/suit-model.jpg",
    beforeLabel: "白底图",
    afterLabel: "模特上身",
    tag: "高转化",
  },
  // ins风
  {
    id: "ins-1",
    style: "ins",
    title: "品牌场景图",
    beforeUrl: "/images/cases/suit-white.jpg",
    afterUrl: "/images/cases/suit-brand.jpg",
    beforeLabel: "白底图",
    afterLabel: "品牌场景",
    tag: "种草神器",
  },
  {
    id: "ins-2",
    style: "ins",
    title: "生活场景图",
    beforeUrl: "/images/cases/suit-before.jpg",
    afterUrl: "/images/cases/suit-scene.jpg",
    beforeLabel: "随手拍",
    afterLabel: "生活场景",
    tag: "氛围感",
  },
  // 补充更多案例以提升内容丰富度
  {
    id: "white-2",
    style: "white_bg",
    title: "模特白底图",
    beforeUrl: "/images/cases/suit-model.jpg",
    afterUrl: "/images/cases/suit-white.jpg",
    beforeLabel: "模特图",
    afterLabel: "电商白底",
    tag: "换背景",
  },
  {
    id: "model-2",
    style: "model",
    title: "场景模特图",
    beforeUrl: "/images/cases/suit-before.jpg",
    afterUrl: "/images/cases/suit-model.jpg",
    beforeLabel: "随手拍",
    afterLabel: "模特上身",
    tag: "高转化",
  },
  {
    id: "ins-3",
    style: "ins",
    title: "品牌氛围图",
    beforeUrl: "/images/cases/suit-before.jpg",
    afterUrl: "/images/cases/suit-brand.jpg",
    beforeLabel: "随手拍",
    afterLabel: "品牌场景",
    tag: "种草神器",
  },
];

const STYLE_TABS: { key: CaseStyle; label: string; desc: string }[] = [
  { key: "white_bg", label: "电商白底", desc: "换背景 · 去瑕疵 · 提亮" },
  { key: "model", label: "模特上身", desc: "真实感强 · 信任度高" },
  { key: "ins", label: "ins风", desc: "品牌调性 · 种草必备" },
];

const FEATURES = [
  {
    emoji: "👗",
    title: "AI虚拟模特",
    desc: "服装穿在虚拟模特身上，支持多肤色/体型",
    tag: "Virtual Try-On",
  },
  {
    emoji: "✨",
    title: "商品白底图",
    desc: "一键去除背景，生成标准电商白底图",
    tag: "Background Remove",
  },
  {
    emoji: "🏠",
    title: "场景生成",
    desc: "将商品放入生活场景，提升种草感",
    tag: "Scene Generation",
  },
  {
    emoji: "🔮",
    title: "AI精修",
    desc: "智能增强光影、质感、清晰度",
    tag: "Photo Enhancement",
  },
];

export default function CaseWall() {
  const [activeTab, setActiveTab] = useState<CaseStyle>("white_bg");

  const filteredCases = CASES.filter((c) => c.style === activeTab);

  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-gray-950 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        {/* Core Features Section */}
        <div className="mb-12 md:mb-16">
          <div className="text-center mb-8">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight mb-2">
              平台核心功能
            </h2>
            <p className="text-white/40 text-sm">
              AI驱动，一键生成专业电商图
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-gradient-to-b from-amber-500/10 to-transparent rounded-2xl p-4 md:p-5 border border-amber-500/20 hover:border-amber-500/40 hover:from-amber-500/15 transition-all group cursor-default"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl md:text-3xl">{f.emoji}</span>
                  <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-semibold text-white mb-1 group-hover:text-amber-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-white/40 text-[11px] md:text-xs leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-white/20 text-xs">看看别人做成什么样</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Style Tabs */}
        <div className="flex justify-center gap-2 md:gap-3 mb-8 md:mb-10">
          {STYLE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 md:px-5 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-lg"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Description */}
        <p className="text-center text-white/30 text-xs md:text-sm mb-6 md:mb-8">
          {STYLE_TABS.find((t) => t.key === activeTab)?.desc}
        </p>

        {/* Case Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5">
          {filteredCases.map((c) => (
            <CaseCard key={c.id} item={c} />
          ))}
        </div>

        {/* CTA - Secondary, subtle */}
        <div className="text-center mt-8 md:mt-10">
          <p className="text-white/30 text-sm mb-4">想亲自试试效果？</p>
          <Link
            href="/diagnosis"
            className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 bg-white/10 border border-white/20 text-white/80 rounded-xl font-medium hover:bg-white/15 hover:text-white transition-all text-sm"
          >
            查看更多案例
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CaseCard({ item }: { item: CaseItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="bg-gray-900/60 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Comparison */}
      <div className="relative h-48 md:h-56 overflow-hidden bg-gray-900">
        {/* Before Image (always visible, slightly faded) */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${hovered ? "opacity-40" : "opacity-100"}`}>
          <Image
            src={item.beforeUrl}
            alt={item.beforeLabel}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* After Image (visible on hover) */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <Image
            src={item.afterUrl}
            alt={item.afterLabel}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Labels */}
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          <span className={`text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
            hovered ? "bg-amber-500 text-white" : "bg-black/60 text-white/80"
          }`}>
            {hovered ? item.afterLabel : item.beforeLabel}
          </span>
        </div>

        {/* Hover Hint */}
        {!hovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span className="text-white/70 text-[10px]">悬停看效果</span>
            </div>
          </div>
        )}

        {/* Tag */}
        {item.tag && (
          <div className="absolute top-2 right-2">
            <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/80 text-white backdrop-blur-sm">
              {item.tag}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between border-t border-white/5">
        <span className="text-xs md:text-sm font-medium text-white/80">{item.title}</span>
        <Link
          href="/diagnosis"
          className="text-[10px] md:text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
        >
          试做 →
        </Link>
      </div>
    </div>
  );
}
