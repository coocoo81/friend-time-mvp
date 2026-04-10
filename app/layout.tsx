import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "约时间吧",
  description: "一个帮朋友们快速找到共同空闲时间的轻量日历工具"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
