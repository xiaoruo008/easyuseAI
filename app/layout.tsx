import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Product Image Generator – Upload Photos, Get E-commerce-Ready Images | easyuse.ai",
  description: "Upload product photos and get professional e-commerce images — white backgrounds, model photos, scene shots. No prompts needed, results in minutes.",
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
