import Link from "next/link";
import Image from "next/image";

// MiniMax 真实案例（来源：客户随手拍保健品图）
const REAL_BEFORE =
  "https://minimax-algeng-chat-tts.oss-cn-wulanchabu.aliyuncs.com/ccv2%2F2026-04-05%2FMiniMax-M2.7-highspeed%2F2027708094057816140%2F32a4d7fcfd86701f9da3ddc2b7922058a2761f92ccaf5bf8d20399e986802d1d..png?Expires=1775487954&OSSAccessKeyId=LTAI5tGLnRTkBjLuYPjNcKQ8&Signature=WmDLHsXcYjIfxsehK6Z240VtE1Y%3D";

const REAL_AFTER =
  "https://minimax-algeng-chat-tts.oss-cn-wulanchabu.aliyuncs.com/ccv2%2F2026-04-05%2FMiniMax-M2.7-highspeed%2F2027708094057816140%2F53c65eaffa64256aa285f5e13b0d8e3b852f9fac8fb48cf4c935b651cdf215e0..jpeg?Expires=1775490924&OSSAccessKeyId=LTAI5tGLnRTkBjLuYPjNcKQ8&Signature=xchuBok2X4prNDzXWVqeEBirMJQ%3D";

const CASES = [
  {
    id: "bg-swap",
    label: "换背景",
    tag: "最常见",
    beforeUrl: REAL_BEFORE,
    afterUrl: REAL_AFTER,
    from: "¥29/张",
    scene: "电商主图 · 小红书 · 抖音",
    result: "随手拍 → 专业电商级展示图，点击欲望更强",
  },
  {
    id: "retouch",
    label: "商品精修",
    tag: "电商必备",
    beforeUrl: REAL_BEFORE,
    afterUrl: REAL_AFTER,
    from: "¥99/5张",
    scene: "淘宝 · 京东 · 拼多多",
    result: "光线差/色偏 → 精修后像品牌官网图",
  },
  {
    id: "model",
    label: "模特图",
    tag: "高转化",
    beforeUrl: REAL_BEFORE,
    afterUrl: REAL_AFTER,
    from: "¥299/套",
    scene: "种草笔记 · 详情页 · 广告图",
    result: "平铺图 → 有质感的产品展示图，信任感更强",
  },
  {
    id: "scene",
    label: "场景图",
    tag: "种草专用",
    beforeUrl: REAL_BEFORE,
    afterUrl: REAL_AFTER,
    from: "¥99起",
    scene: "小红书 · 朋友圈 · 公众号",
    result: "单品图 → 有氛围感的种草场景图",
  },
];

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
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-28">
        <div className="max-w-2xl text-center space-y-8">
          <p className="text-sm text-amber-600 font-medium tracking-wide">
            商品图 · 模特图 · 背景替换 · 当天出结果
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
            把普通产品图，<br className="hidden md:block" />
            做成更容易卖的视觉
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed max-w-lg mx-auto">
            发一张图过来，我们帮你做好看。
            <br />
            先做一版给你看，满意再付款。
          </p>

          <div className="pt-2 flex flex-col items-center gap-3">
            <Link
              href="/diagnosis"
              className="inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors text-lg"
            >
              先上传一张试试
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-xs text-gray-400">5道题 · 当场出结果 · 不收费</p>
          </div>
        </div>
      </section>

      {/* Case Gallery — 4组案例前后对比 */}
      <section className="py-20 px-6 border-t border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
              我们能帮你做成什么样
            </h2>
            <p className="text-gray-500">随便挑了几种最常见的需求，都能做</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CASES.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-all group flex flex-col">
                {/* 案例标签 */}
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-700">{c.label}</span>
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{c.tag}</span>
                </div>

                {/* Before / After 图片 */}
                <div className="relative h-48 bg-gray-100 overflow-hidden flex-shrink-0">
                  <Image
                    src={c.beforeUrl}
                    alt={`${c.label} 前`}
                    fill
                    className="object-cover opacity-40 group-hover:opacity-30 transition-opacity"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold opacity-60 drop-shadow-sm">→</span>
                  </div>
                  <Image
                    src={c.afterUrl}
                    alt={`${c.label} 后`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* 结果描述 */}
                <div className="px-4 pt-3 pb-2 flex-1 flex flex-col">
                  <p className="text-xs text-gray-700 leading-relaxed mb-2 flex-1">{c.result}</p>
                  <p className="text-[10px] text-gray-400 mb-3">{c.scene}</p>
                  <Link
                    href="/diagnosis"
                    className="w-full py-2 text-xs font-semibold text-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
                  >
                    我也要做一张
                  </Link>
                </div>

                {/* 价格 */}
                <div className="px-4 pb-3">
                  <p className="text-xs font-semibold text-amber-600">{c.from}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-400 mb-4">
              真实案例图替换占位图后，信任感会更强
            </p>
            <Link
              href="/diagnosis"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              上传我的图，看看能做什么 →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center tracking-tight mb-3">
            明码标价，做完才收钱
          </h2>
          <p className="text-gray-500 text-center mb-12">
            先做一版给你看，不满意不收任何费用
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                tier: "体验",
                price: "¥29",
                unit: "/张",
                desc: "1张图，换背景或基础精修",
                best: false,
                cta: "上传一张试试",
              },
              {
                tier: "标准",
                price: "¥99",
                unit: "/5张",
                desc: "5张同规格图，批量制作",
                best: true,
                cta: "开始制作",
              },
              {
                tier: "定制",
                price: "¥299",
                unit: "/套",
                desc: "完整方案，含模特+场景+精修",
                best: false,
                cta: "获取定制方案",
              },
            ].map((plan) => (
              <div
                key={plan.tier}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.best
                    ? "bg-gray-900 text-white ring-2 ring-gray-900"
                    : "bg-white border border-gray-200"
                }`}
              >
                {plan.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">最受欢迎</span>
                  </div>
                )}

                <p className={`text-xs font-medium mb-2 ${plan.best ? "text-amber-400" : "text-gray-400"}`}>
                  {plan.tier}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-3xl font-bold ${plan.best ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm mb-1 ${plan.best ? "text-gray-400" : "text-gray-400"}`}>
                    {plan.unit}
                  </span>
                </div>
                <p className={`text-sm mb-6 ${plan.best ? "text-gray-400" : "text-gray-500"}`}>
                  {plan.desc}
                </p>

                <Link
                  href="/diagnosis"
                  className={`mt-auto py-3 rounded-xl text-sm font-semibold text-center transition-colors ${
                    plan.best
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            不确定自己需要什么？{" "}
            <Link href="/diagnosis" className="underline underline-offset-2 hover:text-gray-600">
              先做5道题，让我们帮你判断
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            发一张图过来
          </h2>
          <p className="text-gray-400 text-lg">
            我们帮你做成能用的版本，当天发给你
          </p>
          <Link
            href="/diagnosis"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-lg"
          >
            开始制作
          </Link>
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
