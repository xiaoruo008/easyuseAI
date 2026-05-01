"use client";

import Link from "next/link";

// P0紧急修复：原有案例图是5张不同商品循环，before/after不是同商品，已全部替换为占位符
// 待有真实同商品before/after案例后替换回来

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

        {/* 占位符：真实案例陆续上线 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 text-center px-2">
                真实案例陆续上线
              </p>
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
