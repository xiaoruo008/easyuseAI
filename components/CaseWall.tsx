"use client";

import Link from "next/link";
import Image from "next/image";

// 真实同商品before/after案例（西装套装）
const CASES = [
  {
    before: "/images/cases/suit-before.jpg",
    after: "/images/cases/suit-white.jpg",
    label: "AI白底图",
    desc: "一键生成干净白底商品图",
  },
  {
    before: "/images/cases/suit-before.jpg",
    after: "/images/cases/suit-model.jpg",
    label: "AI虚拟模特",
    desc: "服装穿在虚拟模特身上",
  },
  {
    before: "/images/cases/suit-before.jpg",
    after: "/images/cases/suit-brand.jpg",
    label: "品牌场景图",
    desc: "生成品牌官网级大片",
  },
  {
    before: "/images/cases/suit-before.jpg",
    after: "/images/cases/suit-scene.jpg",
    label: "生活场景图",
    desc: "真实环境氛围感更强",
  },
];

export default function CaseWall() {
  return (
    <section id="cases" className="py-20 px-4 md:px-6 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
            真实生成效果
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            商品图上传后，AI自动生成多种场景效果图
          </p>
        </div>

        {/* 真实案例：before/after hover对比卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CASES.map((c) => (
            <div
              key={c.label}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer"
            >
              {/* 默认显示 after 图 */}
              <Image
                src={c.after}
                alt={c.label}
                fill
                className="object-cover transition-opacity duration-300 group-hover:opacity-0"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* hover 显示 before 图 */}
              <Image
                src={c.before}
                alt={`${c.label} 原图`}
                fill
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* 标签 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-xs font-medium">{c.label}</p>
                <p className="text-white/70 text-xs">{c.desc}</p>
              </div>
              {/* hover提示 */}
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                查看原图
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-gray-400 text-sm mb-4">上传你的商品图，马上体验效果</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition-colors"
          >
            立即体验 →
          </Link>
        </div>
      </div>
    </section>
  );
}
