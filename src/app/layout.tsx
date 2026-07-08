// 全站元信息与脚本
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://checkcc.org"),
  title: {
    default: "检查 Claude 封号风险",
    template: "%s｜CheckCC",
  },
  description: "独家 AI 环境指纹引擎，综合扫描 Claude 运行环境、地区画像与账号风险",
  alternates: {
    canonical: "/",
    languages: {
      "zh-CN": "/",
      "zh-HK": "/hong-kong",
      ru: "/russia",
      en: "/en",
    },
  },
  openGraph: {
    type: "website",
    url: "https://checkcc.org",
    siteName: "CheckCC",
    title: "检查 Claude 封号风险",
    description: "独家 AI 环境指纹引擎，综合扫描 Claude 运行环境、地区画像与账号风险",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "检查 Claude 封号风险",
    description: "独家 AI 环境指纹引擎，综合扫描 Claude 运行环境、地区画像与账号风险",
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
      <body className="min-h-full" suppressHydrationWarning>
        {children}
        <Script id="interaction-guard" strategy="afterInteractive">
          {`
(function() {
  var blocked = false;
  var sizeThreshold = 160;
  var timeThreshold = 120;
  var message = ["检测到开发者工具", "为保持页面检测流程稳定，请关闭开发者工具后继续使用。"].join("\\n");

  function isLocalEnv() {
    return /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname) ||
      /^192\.168\./.test(location.hostname) ||
      /^10\./.test(location.hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(location.hostname);
  }

  if (isLocalEnv()) return;

  function isCrawler() {
    return /bot|crawler|spider|crawling|googlebot|bingbot|baiduspider|yandex|duckduckbot|slurp|sogou|360spider|bytespider|petalbot/i.test(navigator.userAgent || "");
  }

  function lockPage() {
    if (blocked || isCrawler()) return;
    blocked = true;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.innerHTML = "";

    var overlay = document.createElement("div");
    overlay.textContent = message;
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "2147483647";
    overlay.style.background = "#fffaf3";
    overlay.style.color = "#0b1220";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "24px";
    overlay.style.textAlign = "center";
    overlay.style.font = "600 18px/1.8 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
    overlay.style.whiteSpace = "pre-line";
    document.body.appendChild(overlay);
  }

  function hasDevtoolsSize() {
    return window.outerWidth - window.innerWidth > sizeThreshold || window.outerHeight - window.innerHeight > sizeThreshold;
  }

  function hasDebuggerDelay() {
    var start = performance.now();
    debugger;
    return performance.now() - start > timeThreshold;
  }

  function check() {
    if (isCrawler()) return;
    if (hasDevtoolsSize() || hasDebuggerDelay()) lockPage();
  }

  window.addEventListener("keydown", function(event) {
    var key = event.key && event.key.toLowerCase();
    var blockedShortcut = event.key === "F12" ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && ["i", "j", "c"].indexOf(key) !== -1) ||
      ((event.ctrlKey || event.metaKey) && key === "u");

    if (blockedShortcut) {
      event.preventDefault();
      event.stopPropagation();
      lockPage();
    }
  }, true);

  window.addEventListener("contextmenu", function(event) {
    event.preventDefault();
  }, true);

  setInterval(check, 800);
  window.addEventListener("resize", check);
  check();
})();
`}
        </Script>
      </body>
    </html>
  );
}
