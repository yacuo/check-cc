import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://checkcc.org"),
  title: {
    default: "Check Claude｜Claude 环境检测、封号风险与运行环境检查",
    template: "%s｜Check Claude",
  },
  description: "Claude 可用地区检测工具。开通 Claude Pro、Max 或 API 前，检查浏览器语言、系统时区、网络节点、DNS/IP 地区、支付风险和 Claude 封号风险。",
  keywords: [
    "Claude 环境检测",
    "Claude 封号",
    "Claude 解封",
    "Claude 测评",
    "Claude 运行环境检查",
    "Claude 可用地区",
    "Claude 国家检测",
    "Claude Pro 支付失败",
    "Claude API 地区限制",
    "Claude 风控检测",
  ],
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
    description: "开通 Claude 前先检测地区、网络和浏览器环境，避免订阅后不可用。",
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
