import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://checkcc.org"),
  title: {
    default: "Check Claude｜Claude 环境检测、封号风险与运行环境检查",
    template: "%s｜Check Claude",
  },
  description: "CheckCC.org 覆盖 Claude 封号原因、封号机制、风控规则、账号受限解封、封号退款、账号申请注册、Claude API 申请、Claude Code 申请和 Claude Pro 订阅环境检测。",
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
    description: "整理 Claude 为什么封账号、封号前异常信号、风控机制、解封退款、账号申请、API 申请、Claude Code 和 Pro 订阅环境风险。",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Check Claude｜Claude 环境检测与可用地区检查",
    description: "覆盖 Claude 封号原因、账号受限恢复、退款申请、账号注册、API 申请、Claude Code 申请和 Claude Pro 订阅风险检测。",
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
