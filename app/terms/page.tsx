import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center max-w-xl px-6">
        <h1 className="text-3xl font-bold mb-4">使用条款</h1>
        <p className="text-gray-400 mb-4">
          本网站由 easyuse.ai 运营。使用本网站即表示您同意以下条款。
        </p>
        <p className="text-gray-500 text-sm">
          最后更新：2024年
        </p>
        <Link href="/" className="inline-block mt-6 text-blue-400 hover:text-blue-300">
          ← 返回首页
        </Link>
      </div>
    </main>
  );
}
