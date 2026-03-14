import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "LinClaw - 七牛云 AI · OpenClaw 可视化管理面板",
  description: "集成七牛云 AI 大模型广场，300 万 Token 免费额度，支持多平台接入",
  keywords: ["LinClaw", "OpenClaw", "七牛云", "AI", "Agent", "开源", "钉钉", "飞书", "QQ"],
  authors: [{ name: "LinClaw Team" }],
  openGraph: {
    title: "LinClaw - 七牛云 AI · OpenClaw 可视化管理面板",
    description: "集成七牛云 AI 大模型广场，300 万 Token 免费额度，支持多平台接入",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased bg-[#0a0a0f]`}
      >
        {children}
      </body>
    </html>
  );
}
