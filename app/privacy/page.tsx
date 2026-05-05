import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center max-w-xl px-6">
        <h1 className="text-3xl font-bold mb-4">隐私政策</h1>
        <p className="text-gray-400 mb-4">
          我们重视您的隐私。您上传的所有图片仅用于AI图像处理，不会被分享给第三方。
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
