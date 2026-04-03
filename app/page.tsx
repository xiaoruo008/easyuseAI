import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-gray-900">easyuse.ai</span>
          </div>
          <nav className="flex gap-6 text-sm">
            <Link href="/diagnosis" className="text-gray-500 hover:text-gray-900 transition-colors">
              开始诊断
            </Link>
            <Link href="/dashboard/leads" className="text-gray-500 hover:text-gray-900 transition-colors">
              管理后台
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            找到卡住你的问题 · 给出立刻能用的答案
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            你最头疼的事<br />
            <span className="text-indigo-600">3 分钟</span> 帮你找到解法
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed">
            不讲概念，只问业务。<br />
            5道题帮你找到最该解决的问题，然后给你能直接用的结果。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/diagnosis"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              开始诊断
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              管理后台
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            3步解决问题
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "回答5道题",
                desc: "告诉我们你现在最头疼的事是什么，不用懂技术",
              },
              {
                step: "2",
                title: "立刻生成结果",
                desc: "系统当场给你能用的内容，不用等",
              },
              {
                step: "3",
                title: "顾问帮你落地",
                desc: "有疑问，顾问24小时内帮你解答",
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold text-lg flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we solve */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            我们能帮你解决这些
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "✍️",
                title: "内容写不出来",
                desc: "写了没人看，看完不行动。帮你写出能带来客户的文案",
                color: "bg-blue-50",
              },
              {
                icon: "💬",
                title: "客户问重复问题",
                desc: "同一个问题回答几十遍。帮你用系统自动回复，省下时间",
                color: "bg-green-50",
              },
              {
                icon: "📊",
                title: "数据表格太烦",
                desc: "每天手动整理报表。帮你自动化，出错少还快",
                color: "bg-orange-50",
              },
            ].map((s) => (
              <div key={s.title} className={`${s.color} rounded-2xl p-6 space-y-2`}>
                <div className="text-3xl">{s.icon}</div>
                <h3 className="font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">最花时间的事</h2>
          <p className="text-indigo-100 text-lg">
            先诊断，再生成。不讲概念，只给能用的结果
          </p>
          <Link
            href="/diagnosis"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
          >
            立即开始
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2026 easyuse.ai · 让问题当场解决
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <Link href="/dashboard/leads" className="hover:text-gray-600 transition-colors">管理后台</Link>
            <Link href="/diagnosis" className="hover:text-gray-600 transition-colors">开始诊断</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
