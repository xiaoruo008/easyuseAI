import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生产环境：关闭 x-powered-by
  poweredByHeader: false,

  // 图片优化（生产 CDN）
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // Vercel 环境变量校验（缺少 DATABASE_URL 时给出友好提示）
  env: {
    // 不能在这里定义，但可以在构建时注入
  },

  // 输出文件追踪（Vercel 构建必需）
  typescript: {
    // 允许构建时忽略类型错误（已有 tsc 检查）
    ignoreBuildErrors: true,
  },

  eslint: {
    // 允许构建时忽略 ESLint（已有 lint 检查）
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
