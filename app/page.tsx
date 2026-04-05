import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">easyuse.ai</span>
          </div>
          <nav className="flex gap-6 text-sm">
            <Link href="/diagnosis" className="text-gray-400 hover:text-gray-900 transition-colors">
              开始
            </Link>
            <Link href="/dashboard/leads" className="text-gray-400 hover:text-gray-900 transition-colors">
              后台
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl text-center space-y-8">
          <p className="text-sm text-amber-600 font-medium tracking-wide">
            商品图重做 · 换背景 · 模特图 · 3小时交付
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
            产品图不够好看？<br />
            <span className="text-gray-400">我们帮你重新做</span>
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed max-w-lg mx-auto">
            拍好了产品图，但背景不好看？
            换一套场景图，一张也只要几十元。
          </p>

          <div className="pt-4">
            <Link
              href="/diagnosis"
              className="inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors text-lg"
            >
              先看看能做什么
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-xs text-gray-300 mt-3">5道题 · 当场出结果 · 免费体验</p>
          </div>
        </div>

        {/* Product image showcase */}
        <div className="mt-16 w-full max-w-3xl">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                beforeUrl: "https://placehold.co/300x300/f5f5f5/cccccc?text=原图",
                afterUrl: "https://placehold.co/300x300/1a1a2e/ffffff?text=换背景后",
                label: "换背景",
                price: "¥29/张",
              },
              {
                beforeUrl: "https://placehold.co/300x300/f5f5f5/cccccc?text=随手拍",
                afterUrl: "https://placehold.co/300x300/1a1a2e/ffffff?text=精修后",
                label: "商品精修",
                price: "¥99/张",
              },
              {
                beforeUrl: "https://placehold.co/300x300/f5f5f5/cccccc?text=平铺图",
                afterUrl: "https://placehold.co/300x300/1a1a2e/ffffff?text=模特图",
                label: "模特图",
                price: "¥299/套",
              },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="relative rounded-xl overflow-hidden bg-gray-50">
                  <div className="aspect-square relative">
                    <Image src={item.beforeUrl} alt="Before" fill className="object-cover opacity-40" unoptimized />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-30">→</span>
                    </div>
                    <Image src={item.afterUrl} alt="After" fill className="object-cover" unoptimized />
                  </div>
                  <div className="p-3 bg-white border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-amber-600 font-medium">{item.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases */}
      <section className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-amber-600 font-medium text-center mb-3 tracking-wide">我们帮客户做过什么</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-16 tracking-tight">
            不是告诉你怎么做，是帮你做完
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📸",
                title: "产品图不够好看",
                desc: "某服装品牌一批换季图，背景杂乱。我们48小时全部重做，买家停留时长提升60%。",
                tag: "图片重做",
                price: "¥99/张",
              },
              {
                icon: "🖼️",
                title: "需要场景图",
                desc: "一款新品上线前需要10种场景图，传统拍摄成本高。我们一天内交付全部可商用场景图。",
                tag: "换背景",
                price: "¥29/张",
              },
              {
                icon: "👤",
                title: "需要模特图",
                desc: "独立品牌想用真实面孔提升信任感。一套模特图，包含场景+姿态+后期，3天交付。",
                tag: "模特图",
                price: "¥299/套",
              },
            ].map((s) => (
              <div key={s.title} className="p-6 rounded-xl border border-gray-100 space-y-4 hover:border-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{s.tag}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                <p className="text-sm font-semibold text-gray-400">{s.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-16 tracking-tight">
            3 步，从问题到交付
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "说出你的问题",
                desc: "5道选择题，找出最该优先解决的那件事",
              },
              {
                step: "02",
                title: "当场看到结果",
                desc: "文案、图片、话术——不用等，直接给你能用的交付物",
              },
              {
                step: "03",
                title: "顾问帮你落地",
                desc: "需要更多？顾问24小时内跟进，帮你部署到位",
              },
            ].map((item) => (
              <div key={item.step} className="space-y-4">
                <span className="text-4xl font-bold text-gray-200">{item.step}</span>
                <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing + CTA */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center tracking-tight mb-4">
            知道自己要什么？
          </h2>
          <p className="text-gray-400 text-center text-lg mb-12">
            先诊断，再决定要不要花钱
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                tier: "体验",
                price: "¥29",
                desc: "1张图/1份文案",
                detail: "适合先试试效果",
                cta: "免费体验",
                href: "/diagnosis",
                primary: false,
              },
              {
                tier: "标准",
                price: "¥99",
                desc: "5张同规格图",
                detail: "批量制作，低于市价70%",
                cta: "立即制作",
                href: "/diagnosis",
                primary: true,
              },
              {
                tier: "定制",
                price: "¥299",
                desc: "完整商品图方案",
                detail: "含模特/场景/精修，3天交付",
                cta: "获取定制方案",
                href: "/diagnosis",
                primary: false,
              },
            ].map((plan) => (
              <div
                key={plan.tier}
                className={`rounded-xl p-6 flex flex-col ${plan.primary ? "bg-white" : "bg-gray-800 border border-gray-700"}`}
              >
                <p className={`text-xs font-medium mb-2 ${plan.primary ? "text-amber-600" : "text-gray-400"}`}>{plan.tier}</p>
                <p className={`text-3xl font-bold mb-1 ${plan.primary ? "text-gray-900" : "text-white"}`}>{plan.price}</p>
                <p className={`text-sm mb-4 ${plan.primary ? "text-gray-500" : "text-gray-400"}`}>{plan.desc}</p>
                <p className={`text-xs mb-6 ${plan.primary ? "text-gray-400" : "text-gray-500"}`}>{plan.detail}</p>
                <Link
                  href={plan.href}
                  className={`mt-auto py-3 rounded-lg text-sm font-semibold text-center transition-colors ${
                    plan.primary
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-8">
            不知道自己需要什么？{" "}
            <Link href="/diagnosis" className="text-gray-400 hover:text-white underline underline-offset-2">
              先做免费诊断
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2026 easyuse.ai · 帮你把事情做完
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/dashboard/leads" className="hover:text-gray-600 transition-colors">后台</Link>
            <Link href="/diagnosis" className="hover:text-gray-600 transition-colors">开始</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
