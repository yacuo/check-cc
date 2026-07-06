import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://checkcc.org"),
  title: {
    default: "Check Claude｜Claude 环境检测、封号风险与运行环境检查",
    template: "%s｜Check Claude",
  },
  description: "CheckCC.org 是 Claude 环境检测和封号风险检测工具，帮助用户检查 IP 地区、系统时区、浏览器语言、设备指纹、网络出口、订阅支付和 Claude API 可用性风险。",
  alternates: {
    canonical: "/",
    languages: {
      "zh-CN": "/",
      en: "/en",
    },
  },
  openGraph: {
    type: "website",
    url: "https://checkcc.org",
    siteName: "Check Claude",
    title: "Check Claude｜Claude 环境检测与可用地区检查",
    description: "付款前检查 Claude 运行环境、网络节点、系统时区、浏览器语言和地区限制，降低订阅失败和封号风险。",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Check Claude｜Claude 环境检测与可用地区检查",
    description: "开通 Claude 前先检测 IP 地区、网络出口、浏览器语言、系统时区和订阅支付风险，避免账号受限或订阅不可用。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full" suppressHydrationWarning>{children}</body>
    </html>
  );
}
