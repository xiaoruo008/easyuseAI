import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "easyuse.ai — AI需求诊断",
  description: "3分钟诊断，找到最适合你的AI工作流",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
