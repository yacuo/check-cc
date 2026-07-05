"use client";

import { useEffect, useMemo, useState } from "react";
import { evaluateAccess } from "@/lib/detection/scoring";
import type { CheckResponse, RegionCode, SignalResult } from "@/lib/detection/types";
import { messages, type LocaleCode } from "@/i18n/messages";

type Props = { lang?: "zh" | "en"; locale?: LocaleCode };

type ScanStep = { id: string; title: string; desc: string };

type SignalView = SignalResult & { state?: "pending" | "running" | "done" };
type BrowserIpIntel = { ip: string; location: string; country: string; asn: string; org: string };

type TargetRegion = RegionCode | "hk";

const regions: Array<{ code: TargetRegion; label: string }> = [
  { code: "auto", label: "自动检测" },
  { code: "cn", label: "中国大陆" },
  { code: "hk", label: "香港" },
  { code: "ru", label: "俄罗斯" },
  { code: "ir", label: "伊朗" },
];

function normalizeRegion(code: TargetRegion): RegionCode {
  return code === "hk" ? "auto" : code;
}

const scanSteps: ScanStep[] = [
  { id: "language", title: "浏览器语言版本检测", desc: "读取 navigator.languages、Accept-Language 和 Intl locale" },
  { id: "timezone", title: "系统时区与地区环境检测", desc: "检查系统时区、UTC 偏移和重点受限地区时区" },
  { id: "network", title: "网络节点与 IP 地区估算", desc: "请求服务端接口，估算网络出口国家和部署平台地区头" },
  { id: "dns", title: "DNS / 代理一致性风险提示", desc: "提示 DNS、代理、节点、账单地区不一致导致的风控风险" },
  { id: "runtime", title: "Claude 运行环境检查", desc: "分析 User-Agent、设备线索、浏览器环境和应用 WebView" },
  { id: "risk", title: "Claude 封号与付款风险评分", desc: "汇总 Claude Web、Pro/Max、API 和支付风险" },
];

const defaultSignals: SignalView[] = [
  { id: "timezone", label: "系统时区", value: "等待检测", score: 0, weight: 26, contribution: 0, source: "browser" },
  { id: "language", label: "浏览器语言", value: "等待检测", score: 0, weight: 20, contribution: 0, source: "browser" },
  { id: "languageVariant", label: "语言文字特征", value: "等待检测", score: 0, weight: 12, contribution: 0, source: "browser" },
  { id: "chineseFonts", label: "字体地区特征", value: "等待检测", score: 0, weight: 16, contribution: 0, source: "browser" },
  { id: "vendorFonts", label: "厂商字体异常", value: "等待检测", score: 0, weight: 10, contribution: 0, source: "browser" },
  { id: "domesticBrowser", label: "浏览器地区特征", value: "等待检测", score: 0, weight: 8, contribution: 0, source: "browser" },
  { id: "domesticDevice", label: "设备地区特征", value: "等待检测", score: 0, weight: 6, contribution: 0, source: "browser" },
  { id: "locale", label: "Intl 区域设置", value: "等待检测", score: 0, weight: 6, contribution: 0, source: "browser" },
  { id: "timezoneOffset", label: "时区偏移", value: "等待检测", score: 0, weight: 4, contribution: 0, source: "browser" },
  { id: "emojiStyle", label: "Emoji 渲染风格", value: "等待检测", score: 0, weight: 4, contribution: 0, source: "browser" },
  { id: "country", label: "网络出口", value: "等待检测", score: 0, weight: 20, contribution: 0, source: "server" },
  { id: "proxyCountry", label: "代理出口国家", value: "等待检测", score: 0, weight: 0, contribution: 0, source: "server" },
  { id: "ipAddress", label: "IP 地址", value: "等待检测", score: 0, weight: 0, contribution: 0, source: "server" },
  { id: "os", label: "操作系统", value: "等待检测", score: 0, weight: 0, contribution: 0, source: "browser" },
];

const statusText: Record<string, string> = {
  restricted: "高风险 / 可能受限",
  possibly_supported: "需要进一步确认",
  unsupported: "不支持",
  supported: "完美支持",
  unknown: "未确认",
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function animateProgress(from: number, to: number, setProgress: (value: number) => void, setActiveSignal: (value: number) => void) {
  const frames = 4;
  for (let i = 1; i <= frames; i += 1) {
    const value = Math.round(from + ((to - from) * i) / frames);
    setProgress(value);
    setActiveSignal(Math.min(defaultSignals.length - 1, Math.floor((value / 100) * defaultSignals.length)));
    await sleep(22);
  }
}

function makeSignal(id: string, label: string, value: string | null, weight: number, matched: boolean): SignalResult {
  return makeSignalScore(id, label, value, weight, matched ? 1 : 0);
}

function makeSignalScore(id: string, label: string, value: string | null, weight: number, score: number): SignalResult {
  const normalized = Math.max(0, Math.min(1, score));
  return { id, label, value: value || "未知", score: normalized, weight, contribution: Math.round(normalized * weight), source: "browser" };
}

function hasFont(font: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const text = "中文字体检测ABCabc012";
  return ["monospace", "sans-serif", "serif"].some((base) => {
    ctx.font = `72px ${base}`;
    const baseWidth = ctx.measureText(text).width;
    ctx.font = `72px \"${font}\", ${base}`;
    return Math.abs(ctx.measureText(text).width - baseWidth) > 0.5;
  });
}

function matchAny(value: string, patterns: string[]) {
  const lower = value.toLowerCase();
  return patterns.find((pattern) => lower.includes(pattern.toLowerCase())) ?? null;
}

function detectBrowserName(ua: string) {
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/YaBrowser/i.test(ua)) return "Yandex Browser";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/MicroMessenger/i.test(ua)) return "微信内置浏览器";
  return "未知浏览器";
}

function detectOS(ua: string, platform?: string) {
  const probe = `${ua} ${platform ?? ""}`;
  if (/harmonyos/i.test(probe)) return "HarmonyOS";
  if (/android/i.test(probe)) return "Android";
  if (/iphone|ipad|ios/i.test(probe)) return "iOS";
  if (/mac os|macintosh|macintel/i.test(probe)) return "macOS";
  if (/windows nt/i.test(probe)) return "Windows";
  if (/linux/i.test(probe)) return "Linux";
  return platform || "未知系统";
}

function loadBrowserPing0(): Promise<BrowserIpIntel | null> {
  return new Promise((resolve) => {
    const callbackName = `checkccPing0${Date.now()}${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timer = window.setTimeout(() => cleanup(null), 2500);
    const cleanup = (result: BrowserIpIntel | null) => {
      window.clearTimeout(timer);
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callbackName];
      resolve(result);
    };
    (window as unknown as Record<string, (...args: string[]) => void>)[callbackName] = (ip, location, asn, org) => {
      cleanup({ ip, location, country: location?.split(/\s+/)[0] || location, asn, org });
    };
    script.onerror = () => cleanup(null);
    script.src = `https://ping0.cc/geo/jsonp/${callbackName}`;
    document.body.appendChild(script);
  });
}

function collectBrowserSignals(region: RegionCode) {
  const languages = navigator.languages?.length ? [...navigator.languages] : [navigator.language].filter(Boolean);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || null;
  const ua = navigator.userAgent;
  const uaLower = ua.toLowerCase();
  const nav = navigator as Navigator & { userAgentData?: { platform?: string; brands?: Array<{ brand: string; version: string }>; mobile?: boolean } };
  const brands = nav.userAgentData?.brands?.map((item) => item.brand).join(" / ") || "无 UA-CH brands";
  const scFonts = ["Microsoft YaHei", "Microsoft JhengHei", "PingFang SC", "Hiragino Sans GB", "STHeiti", "STSong", "SimSun", "SimHei", "Noto Sans CJK SC", "Source Han Sans SC", "WenQuanYi Micro Hei"].filter(hasFont);
  const tcFonts = ["PingFang TC", "Heiti TC", "Hiragino Sans CNS", "Noto Sans CJK TC", "Source Han Sans TC", "MingLiU", "PMingLiU"].filter(hasFont);
  const vendorFonts = ["MiSans", "HarmonyOS Sans", "OPPO Sans", "vivo Sans", "Honor Sans", "Alibaba PuHuiTi", "WPS Fangzheng", "FZLanTingHeiS"].filter(hasFont);
  const domesticBrowser = matchAny(`${uaLower} ${brands.toLowerCase()}`, ["micromessenger", "qqbrowser", "mqqbrowser", "quark", "ucbrowser", "ucweb", "baiduboxapp", "baidubrowser", "miuibrowser", "mibrowser", "huaweibrowser", "heytapbrowser", "oppobrowser", "vivobrowser", "360se", "360ee", "qihoobrowser", "sogoumobilebrowser", "2345browser", "lbbrowser"]);
  const domesticDevice = matchAny(`${uaLower} ${nav.userAgentData?.platform ?? ""}`, ["harmonyos", "huawei", "honor", "xiaomi", "redmi", "oppo", "vivo", "realme", "oneplus", "miui"]);
  const chineseVariant = languages.some((lang) => /zh-(tw|hk|mo)|zh-hant/i.test(lang)) ? "中文繁体" : languages.some((lang) => /zh-cn|zh-sg|zh-hans|zh/i.test(lang)) ? "中文简体" : null;
  const offset = -new Date().getTimezoneOffset() / 60;
  const timezoneScore = ["Asia/Shanghai", "Asia/Urumqi", "Asia/Chongqing", "Asia/Harbin", "Asia/Kashgar"].includes(timezone ?? "") ? 1 : ["Asia/Hong_Kong", "Asia/Macau", "Asia/Taipei"].includes(timezone ?? "") ? 0.6 : 0;
  const languageScore = languages.some((lang) => /^zh-cn|zh-hans|^zh$/i.test(lang)) ? 1 : languages.some((lang) => /^zh/i.test(lang)) ? 0.5 : 0;
  const localeScore = /zh-cn|zh-hans|^zh$/i.test(locale ?? "") ? 1 : /^zh/i.test(locale ?? "") ? 0.5 : 0;
  const fontScore = scFonts.length ? Math.min(1, 0.75 + 0.08 * scFonts.length) : tcFonts.length ? 0.5 : 0;
  const vendorFontScore = vendorFonts.length >= 2 ? 1 : vendorFonts.length === 1 ? 0.8 : 0;
  const deviceScore = domesticDevice === "harmonyos" ? 1 : domesticDevice ? 0.7 : 0;
  const emojiStyle = /iphone|ipad|mac os/i.test(ua) ? "Apple Emoji 风格" : /android|harmonyos/i.test(ua) ? "Android / 厂商 Emoji 风格" : /windows/i.test(ua) ? "Windows Emoji 风格" : "未知 Emoji 风格";
  const emojiScore = /Android|厂商|Windows/.test(emojiStyle) ? 0.4 : /Apple/.test(emojiStyle) ? 0.2 : 0;
  const extraSignals: SignalResult[] = [
    makeSignalScore("timezone", "系统时区", timezone, 26, timezoneScore),
    makeSignalScore("language", "浏览器语言", languages.join(", "), 20, languageScore),
    makeSignal("languageVariant", "语言文字特征", chineseVariant || "未命中重点语言文字", 12, Boolean(chineseVariant)),
    makeSignalScore("chineseFonts", "字体地区特征", scFonts.length ? `中国字体：${scFonts.join(" / ")}` : tcFonts.length ? `中文繁体字体：${tcFonts.join(" / ")}` : "未命中重点地区字体", 16, fontScore),
    makeSignalScore("vendorFonts", "厂商字体异常", vendorFonts.length ? `设备厂商字体：${vendorFonts.join(" / ")}` : "未命中设备厂商字体", 10, vendorFontScore),
    makeSignal("domesticBrowser", "浏览器地区特征", domesticBrowser || detectBrowserName(ua), 8, Boolean(domesticBrowser)),
    makeSignalScore("domesticDevice", "设备地区特征", domesticDevice || "未命中重点设备特征", 6, deviceScore),
    makeSignal("os", "操作系统", detectOS(ua, nav.userAgentData?.platform), 0, false),
    makeSignalScore("locale", "Intl 区域设置", locale, 6, localeScore),
    makeSignalScore("timezoneOffset", "时区偏移", `UTC${offset >= 0 ? "+" : ""}${offset}`, 4, offset === 8 ? 0.7 : 0),
    makeSignalScore("emojiStyle", "Emoji 渲染风格", emojiStyle, 4, emojiScore),
  ];
  return { ...evaluateAccess({ region, languages, timezone, locale, userAgent: ua, source: "browser" }), signals: extraSignals };
}

function ScoreRing({ score, checked }: { score: number; checked: boolean }) {
  const deg = checked ? Math.max(0, Math.min(100, score)) * 3.6 : 0;
  const ringColor = !checked ? "#d6d3d1" : score === 0 ? "#059669" : score >= 70 ? "#dc2626" : score >= 31 ? "#d97757" : "#f59e0b";
  return (
    <div className="relative grid size-44 place-items-center rounded-full bg-white shadow-2xl shadow-red-950/10" style={{ background: `conic-gradient(${ringColor} ${deg}deg, #e7e5df 0deg)` }}>
      <div className="grid h-[8.5rem] w-[8.5rem] place-items-center rounded-full bg-white shadow-inner">
        <div className="text-center">
          <div className="text-5xl font-black text-[#0b1220]">{checked ? `${score}%` : "--"}</div>
          <div className="text-xs font-bold tracking-[0.2em] text-stone-500">{checked ? "封号风险" : "等待检测"}</div>
        </div>
      </div>
    </div>
  );
}

function signalsScore(browserSignals: SignalResult[], serverSignals: SignalResult[]) {
  const scoreMap = new Map<string, number>();
  for (const signal of browserSignals) {
    if (signal.contribution > 0) scoreMap.set(signal.id, signal.contribution);
  }
  for (const signal of serverSignals) {
    if (signal.id === "country" && signal.contribution > 0) scoreMap.set("country", 20);
  }
  return Array.from(scoreMap.values()).reduce((sum, value) => sum + value, 0);
}

function signalTone(signal: SignalView) {
  if (signal.state === "pending") return "border-stone-200 bg-stone-50 text-stone-400";
  if (signal.state === "running") return "border-sky-300 bg-sky-50 text-sky-700 shadow-md shadow-sky-900/10";
  if (signal.contribution >= 20) return "border-red-300 bg-red-50 text-red-700";
  if (signal.contribution >= 8) return "border-amber-300 bg-amber-50 text-amber-700";
  return "border-emerald-300 bg-emerald-50 text-emerald-700";
}

function SignalList({ signals, extraCards = [] }: { signals: SignalView[]; extraCards?: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-2 md:grid-cols-2 lg:min-h-[216px] lg:content-between xl:grid-cols-3 2xl:grid-cols-4">
      {signals.map((signal) => (
        <div key={`${signal.source}-${signal.id}`} className={`rounded-xl border px-3 py-2 transition ${signalTone(signal)}`}>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-[#0b1220]">{signal.label}</div>
              <div className="truncate text-xs opacity-75">{signal.value}</div>
            </div>
            <div className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-xs font-black">{signal.state === "pending" ? "--" : `+${signal.contribution}`}</div>
          </div>
        </div>
      ))}
      {extraCards.map((card) => (
        <div key={card.label} className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-emerald-700 transition">
          <div className="truncate text-sm font-semibold text-[#0b1220]">{card.label}</div>
          <div className="truncate text-xs opacity-75">{card.value}</div>
        </div>
      ))}
    </div>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

async function loadImage(src: string) {
  const blob = await (await fetch(src)).blob();
  const objectUrl = URL.createObjectURL(blob);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = objectUrl;
  });
}

async function createPoster(score: number, confidenceText: string, suspectedRegion: string, status: string) {
  const posterRiskLabel = score === 0 ? "完美支持" : score >= 70 ? "封号风险" : score >= 31 ? "高危风险" : "轻度风险";
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 1160;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#f7f2ea";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createRadialGradient(360, 120, 20, 360, 120, 520);
  gradient.addColorStop(0, "rgba(217,119,87,0.36)");
  gradient.addColorStop(1, "rgba(247,242,234,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, 520);

  ctx.font = "900 46px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillStyle = "#0b1220";
  ctx.fillText("Check", 54, 108);
  const checkTitleWidth = ctx.measureText("Check").width;
  ctx.fillStyle = "#d97757";
  ctx.fillText("Claude", 54 + checkTitleWidth + 8, 108);
  const claudeTitleWidth = ctx.measureText("Claude").width;
  ctx.fillStyle = "#0b1220";
  ctx.fillText(" 环境检测报告", 54 + checkTitleWidth + claudeTitleWidth + 8, 108);

  ctx.font = "800 30px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillStyle = "#57534e";
  ctx.fillText("运行环境 · 地区画像 · 封号风险", 54, 176);

  ctx.font = "700 30px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillStyle = "#d97757";
  ctx.fillText(`${confidenceText}${suspectedRegion}环境`, 54, 250);

  const ringX = 360;
  const ringY = 455;
  const ringRadius = 138;
  ctx.save();
  ctx.lineWidth = 28;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(ringX, ringY, ringRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "#e7e5df";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ringX, ringY, ringRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.01, score / 100));
  ctx.strokeStyle = score >= 70 ? "#dc2626" : score >= 31 ? "#d97757" : "#059669";
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(ringX, ringY, 108, 0, Math.PI * 2);
  ctx.fillStyle = "#fffaf3";
  ctx.fill();

  ctx.fillStyle = "#0b1220";
  ctx.font = "900 86px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${score}%`, ringX, ringY - 8);
  ctx.font = "800 28px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillStyle = "#78716c";
  ctx.fillText("封号风险", ringX, ringY + 58);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.beginPath();
  ctx.fillStyle = "#ffffff";
  ctx.roundRect(54, 650, 612, 220, 28);
  ctx.fill();
  ctx.fillStyle = "#0b1220";
  ctx.font = "900 34px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText(posterRiskLabel, 86, 724);
  ctx.font = "600 25px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillStyle = "#57534e";
  ctx.fillText("可能由系统时区、语言、字体、网络出口", 86, 786);
  ctx.fillText("以及浏览器画像等综合原因触发", 86, 828);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent("https://checkcc.org")}`;
  try {
    const qr = await loadImage(qrUrl);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(498, 910, 150, 150, 22);
    ctx.fill();
    ctx.drawImage(qr, 512, 924, 122, 122);
  } catch {
    ctx.strokeStyle = "#d97757";
    ctx.lineWidth = 4;
    ctx.strokeRect(512, 924, 122, 122);
  }

  ctx.font = "900 38px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillStyle = "#0b1220";
  ctx.fillText("Check", 54, 968);
  const checkWidth = ctx.measureText("Check").width;
  ctx.fillStyle = "#d97757";
  ctx.fillText("CC", 54 + checkWidth, 968);
  const ccWidth = ctx.measureText("CC").width;
  ctx.fillStyle = "#0b1220";
  ctx.fillText(".org", 54 + checkWidth + ccWidth, 968);
  ctx.fillStyle = "#78716c";
  ctx.font = "600 22px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText("检查来源 · 扫码查看检测", 54, 1008);

  ctx.font = "500 22px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillStyle = "#78716c";
  ctx.textAlign = "center";
  ctx.fillText("免责声明：结果仅供参考，不代表官方结论", 360, 1122);
  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}

export function Detector({ lang = "zh", locale = "zh" }: Props) {
  const copy = messages[locale].detector;
  const [region, setRegion] = useState<TargetRegion>("auto");
  const [browserResult, setBrowserResult] = useState<ReturnType<typeof collectBrowserSignals> | null>(null);
  const [serverResult, setServerResult] = useState<CheckResponse | null>(null);
  const [browserIpIntel, setBrowserIpIntel] = useState<BrowserIpIntel | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSignal, setActiveSignal] = useState(-1);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const [copyToastText, setCopyToastText] = useState("已复制海报，到剪贴板");
  const [shareCountdown, setShareCountdown] = useState<number | null>(null);
  const [autoPosterShown, setAutoPosterShown] = useState(false);
  const [autoShareReady, setAutoShareReady] = useState(false);

  const rawScore = useMemo(() => Math.min(100, signalsScore(browserResult?.signals ?? [], serverResult?.signals ?? [])), [browserResult, serverResult]);
  const animatedScore = loading ? Math.round((rawScore * progress) / 100) : rawScore;
  const status = rawScore >= 70 ? "restricted" : rawScore >= 31 ? "possibly_supported" : rawScore > 0 ? "unknown" : "supported";
  const suspectedRegion = browserResult?.matchedRegion === "cn" || serverResult?.matchedRegion === "cn" ? "中国大陆" : browserResult?.matchedRegion === "ru" || serverResult?.matchedRegion === "ru" ? "俄罗斯" : browserResult?.matchedRegion === "ir" || serverResult?.matchedRegion === "ir" ? "伊朗" : rawScore > 0 ? "高风险地区" : "官方支持地区";
  const confidenceText = rawScore >= 70 ? "高度疑似" : rawScore >= 31 ? "疑似" : rawScore > 0 ? "少量命中" : "环境安全，疑似";
  const signals = useMemo<SignalView[]>(() => {
    const map = new Map<string, SignalResult>();
    for (const signal of browserResult?.signals ?? []) map.set(signal.id, signal);
    for (const signal of serverResult?.signals ?? []) {
      if (signal.value && signal.value !== "未知") {
        if (signal.id === "country") map.set("country", { ...signal, label: "网络出口" });
        else map.set(`server-${signal.id}`, signal);
      }
    }
    const proxyCountry = browserIpIntel?.country || serverResult?.ipIntelligence?.detectedCountry;
    if (proxyCountry) map.set("proxyCountry", { id: "proxyCountry", label: "代理出口国家", value: proxyCountry, score: 0, weight: 0, contribution: 0, source: "server" });
    const detectedIp = browserIpIntel?.ip || serverResult?.ipIntelligence?.detectedIp;
    if (detectedIp) map.set("ipAddress", { id: "ipAddress", label: "IP 地址", value: detectedIp, score: 0, weight: 0, contribution: 0, source: "server" });
    if (browserIpIntel?.location) map.set("browserIpLocation", { id: "browserIpLocation", label: "IP 位置", value: browserIpIntel.location, score: 0, weight: 0, contribution: 0, source: "server" });
    if (browserIpIntel?.asn) map.set("browserIpAsn", { id: "browserIpAsn", label: "ASN", value: browserIpIntel.asn, score: 0, weight: 0, contribution: 0, source: "server" });
    if (browserIpIntel?.org) map.set("browserIpOrg", { id: "browserIpOrg", label: "网络组织", value: browserIpIntel.org, score: 0, weight: 0, contribution: 0, source: "server" });
    const merged = defaultSignals.map((item, index) => {
      const found = map.get(item.id);
      const state = progress === 100 || found ? "done" : index === activeSignal ? "running" : index < activeSignal ? "done" : "pending";
      return { ...item, ...found, state } as SignalView;
    });
    for (const signal of map.values()) {
      if (!defaultSignals.some((item) => item.id === signal.id)) merged.push({ ...signal, state: progress === 100 ? "done" : "running" });
    }
    return merged;
  }, [browserResult, serverResult, browserIpIntel, activeSignal, progress]);

  const runCheck = async () => {
    setLoading(true);
    setBrowserResult(null);
    setServerResult(null);
    setBrowserIpIntel(null);
    setProgress(0);
    setActiveSignal(0);
    setShareCountdown(null);
    setAutoPosterShown(false);
    setAutoShareReady(false);

    let local: ReturnType<typeof collectBrowserSignals> | null = null;
    let remote: CheckResponse | null = null;

    const checkRegion = normalizeRegion(region);

    for (let index = 0; index < scanSteps.length; index += 1) {
      const from = Math.round((index / scanSteps.length) * 92);
      const to = Math.round(((index + 1) / scanSteps.length) * 92);

      if (index === 0 || index === 1 || index === 4) {
        local = collectBrowserSignals(checkRegion);
        setBrowserResult(local);
      }

      if (index === 2) {
        const [res, browserIp] = await Promise.all([
          fetch(`/api/check?region=${checkRegion}&lang=${lang === "en" ? "en" : "zh-CN"}&t=${Date.now()}`, { cache: "no-store" }),
          loadBrowserPing0(),
        ]);
        remote = (await res.json()) as CheckResponse;
        setServerResult(remote);
        setBrowserIpIntel(browserIp);
      }

      await animateProgress(from, to, setProgress, setActiveSignal);
      await sleep(45);
    }

    if (!local) setBrowserResult(collectBrowserSignals(checkRegion));
    if (!remote) {
      const [res, browserIp] = await Promise.all([
        fetch(`/api/check?region=${checkRegion}&lang=${lang === "en" ? "en" : "zh-CN"}&t=${Date.now()}`, { cache: "no-store" }),
        loadBrowserPing0(),
      ]);
      setServerResult((await res.json()) as CheckResponse);
      setBrowserIpIntel(browserIp);
    }

    await animateProgress(92, 100, setProgress, setActiveSignal);
    setActiveSignal(defaultSignals.length);
    setLoading(false);
    window.setTimeout(() => setAutoShareReady(true), 0);
  };

  const canShareReport = progress === 100 && !loading;
  const hasChecked = progress === 100;
  const ringActive = loading || progress > 0;
  const riskLabel = !ringActive ? "等待检测" : !hasChecked ? "检测中" : animatedScore === 0 ? "完美支持" : animatedScore >= 70 ? "封号风险" : animatedScore >= 31 ? "高危风险" : "轻度风险";
  const riskLabelClass = !ringActive ? "bg-stone-100 text-stone-500" : !hasChecked ? "bg-blue-50 text-blue-600" : animatedScore === 0 ? "bg-emerald-50 text-emerald-700" : animatedScore >= 70 ? "bg-red-50 text-red-600" : animatedScore >= 31 ? "bg-orange-50 text-orange-700" : "bg-amber-50 text-amber-700";
  const ipIntel = serverResult?.ipIntelligence;
  const primaryIpSource = ipIntel?.sources
    .filter((source) => source.status === "ok" && (source.ip || source.country || source.asn || source.isp || source.org))
    .sort((a, b) => [b.ip, b.country, b.region, b.city, b.asn, b.isp, b.org, b.latitude, b.longitude].filter(Boolean).length - [a.ip, a.country, a.region, a.city, a.asn, a.isp, a.org, a.latitude, a.longitude].filter(Boolean).length)[0];
  const ipAddress = primaryIpSource?.ip || ipIntel?.detectedIp || null;
  const ipMetricCards = primaryIpSource ? [
    ipAddress && { label: "IP 地址", value: ipAddress },
    ipAddress && { label: ipAddress.includes(":") ? "IPv6" : "IPv4", value: ipAddress },
    primaryIpSource.asn && { label: "ASN", value: primaryIpSource.asn },
    (primaryIpSource.org || primaryIpSource.isp) && { label: "ASN 所有者", value: primaryIpSource.org || primaryIpSource.isp },
    primaryIpSource.isp && { label: "企业", value: primaryIpSource.isp },
    primaryIpSource.longitude != null && { label: "经度", value: String(primaryIpSource.longitude) },
    primaryIpSource.latitude != null && { label: "纬度", value: String(primaryIpSource.latitude) },
    primaryIpSource.networkType && { label: "IP 类型", value: primaryIpSource.networkType },
    primaryIpSource.risk && { label: "风控值", value: primaryIpSource.risk },
    primaryIpSource.isp && { label: "ISP", value: primaryIpSource.isp },

  ].filter(Boolean) as Array<{ label: string; value: string }> : [];

  const openPoster = async () => {
    if (!canShareReport) return;
    const dataUrl = await createPoster(animatedScore, confidenceText, suspectedRegion, statusText[status]);
    if (dataUrl) setPosterUrl(dataUrl);
  };

  const showCopiedToast = (text = "已复制海报，到剪贴板") => {
    setCopyToastText(text);
    setCopyToast(true);
    window.setTimeout(() => setCopyToast(false), 1600);
  };

  const copyPoster = async () => {
    if (!posterUrl) return;
    const blob = await (await fetch(posterUrl)).blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    showCopiedToast("已复制海报，到剪贴板");
  };

  const copySiteLink = async () => {
    await navigator.clipboard.writeText("https://checkcc.org");
    showCopiedToast("链接已复制");
  };

  useEffect(() => {
    const openPicker = () => setShowRegionPicker(true);
    window.addEventListener("open-region-picker", openPicker);
    return () => window.removeEventListener("open-region-picker", openPicker);
  }, []);

  useEffect(() => {
    if (!autoShareReady || !canShareReport || autoPosterShown) return;
    let cancelled = false;
    let timers: number[] = [];
    const renderDelay = window.setTimeout(() => {
      if (cancelled) return;
      setShareCountdown(5);
      timers = [
        window.setTimeout(() => setShareCountdown(4), 1000),
        window.setTimeout(() => setShareCountdown(3), 2000),
        window.setTimeout(() => setShareCountdown(2), 3000),
        window.setTimeout(() => setShareCountdown(1), 4000),
        window.setTimeout(() => {
          setShareCountdown(null);
          setAutoPosterShown(true);
          void openPoster();
        }, 5000),
      ];
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(renderDelay);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [autoShareReady && canShareReport, autoPosterShown]);

  return (
    <section className="mx-auto p-0">
      <div className="sticky top-[72px] z-40 py-4">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-3 pb-2 md:flex-row md:justify-center md:gap-10 xl:max-w-[1280px]">
          {copy.cardTags.map((title, index) => [title, ["bg-[#d97757]", "bg-red-500", "bg-emerald-500"][index]] as const).map(([title, color]) => (
            <div key={title} className="group flex items-center gap-3 text-lg font-black text-[#0b1220] md:text-2xl">
              <span className={`size-2.5 rounded-full ${color} shadow-[0_0_18px_rgba(217,119,87,0.45)]`} />
              <span className="relative whitespace-nowrap after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[#d97757] after:transition group-hover:after:scale-x-100">
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-5 w-full text-center">
        <button type="button" onClick={() => setShowRegionPicker(true)} disabled={loading} className="h-14 w-full rounded-full bg-[#d97757] px-8 text-lg font-black text-white shadow-xl shadow-orange-900/20 transition hover:bg-[#c05f3c] disabled:opacity-60 md:w-auto md:min-w-[360px]">
          {loading ? copy.loadingText : copy.idleCta}
        </button>
        <div className="relative mt-10 text-center font-black">
          <div className="py-3 leading-tight md:py-4">
            {hasChecked ? (
              <>
                <div className="text-2xl text-[#0b1220] md:inline md:text-3xl">
                  <span>{confidenceText}</span>
                  <span className="mx-1 text-[#d97757]">{suspectedRegion}</span>
                  <span>{copy.environmentSuffix}</span>
                  <span className="hidden md:inline">：</span>
                </div>
                <div className="mt-2 text-2xl md:mt-0 md:inline md:text-3xl">
                  <span className="text-stone-600">{copy.riskPrefix}</span>
                  <span className="mx-1 text-red-600">{animatedScore}%</span>
                  <span className="text-stone-400">·</span>
                  <span className="ml-2 text-[#c05f3c]">{statusText[status]}</span>
                </div>
              </>
            ) : (
              <div className="text-2xl text-[#0b1220] md:text-3xl">{copy.idleReport}</div>
            )}
          </div>
          <button type="button" onClick={() => void openPoster()} disabled={!canShareReport} className="mt-5 rounded-full bg-[#0b1220] px-8 py-4 text-base font-black text-white shadow-xl shadow-slate-950/20 transition hover:bg-[#d97757] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none md:px-10 md:py-5 md:text-lg">
            {shareCountdown ? copy.shareAfter(shareCountdown) : canShareReport ? copy.shareReport : copy.shareReady}
          </button>
          <p className="mt-3 text-sm font-bold text-stone-500 md:text-base">{copy.shareHint}</p>
          {shareCountdown && <p className="mt-2 text-sm font-semibold text-stone-500">{copy.generatingPoster}</p>}
        </div>
      </div>

      <div className="mt-5 rounded-[2rem] border border-stone-200 bg-white/80 p-4 shadow-xl shadow-orange-950/5 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-5">
            <ScoreRing score={animatedScore} checked={ringActive} />
            <div className={`mt-5 rounded-full px-4 py-2 text-sm font-bold ${riskLabelClass}`}>{riskLabel}</div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-black text-[#0b1220]">{hasChecked ? copy.signalCount(signals.length + ipMetricCards.length, true) : copy.title}</h3>
              <span className="rounded-full bg-[#fffaf3] px-3 py-1 text-xs font-bold text-stone-500">{copy.signalCount(signals.length + ipMetricCards.length, false)}</span>
            </div>
            <div className="mt-4"><SignalList signals={signals} extraCards={ipMetricCards} /></div>
          </div>
        </div>
      </div>

      {showRegionPicker && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4" onClick={() => setShowRegionPicker(false)}>
          <div className="relative z-[10000] w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-[#0b1220]">{copy.targetTitle}</h3>
                <p className="mt-1 text-sm text-stone-500">{copy.targetDesc}</p>
              </div>
              <button type="button" onClick={() => setShowRegionPicker(false)} aria-label={copy.close} className="grid size-11 place-items-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200">
                <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {regions.map((item) => (
                <button key={item.code} type="button" onClick={() => setRegion(item.code)} className={`rounded-2xl border px-4 py-4 text-center font-black transition ${region === item.code ? "border-[#d97757] bg-orange-50 text-[#c05f3c]" : "border-stone-200 bg-white text-[#0b1220] hover:border-stone-300"}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => { setShowRegionPicker(false); void runCheck(); }} className="mt-5 h-12 w-full rounded-full bg-[#d97757] font-black text-white shadow-lg shadow-orange-900/15">
              {copy.startCheck}
            </button>
          </div>
        </div>
      )}

      {posterUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-4" onClick={() => setPosterUrl(null)}>
          <div className="relative flex max-h-[92vh] w-full max-w-full flex-col overflow-y-auto rounded-[1.5rem] bg-white p-3 shadow-2xl md:max-w-[min(1120px,92vw)] md:rounded-[2rem] md:p-5" onClick={(event) => event.stopPropagation()}>
            {copyToast && (
              <div className="absolute inset-0 z-20 hidden place-items-center bg-white/55 backdrop-blur-sm md:grid">
                <div className="rounded-[2rem] bg-[#0b1220] px-12 py-8 text-center text-3xl font-black text-white shadow-2xl">
                  {copyToastText}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-black text-[#0b1220]">检测报告海报</h3>
              <button type="button" onClick={() => setPosterUrl(null)} aria-label={copy.close} className="grid size-11 place-items-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200">
                <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <div className="my-3 w-full rounded-2xl bg-[#0b1220] px-1.5 py-4 text-center font-black leading-tight tracking-[-0.05em] text-white shadow-lg shadow-slate-950/15 text-[clamp(11px,3.7vw,28px)] whitespace-nowrap md:my-4 md:px-2 md:text-3xl">
              分享到朋友圈，让朋友少踩 <span className="text-[#f4a261]">Claude 封号</span> 的坑
            </div>
            <div className="grid gap-4 md:grid-cols-[minmax(320px,1fr)_minmax(260px,420px)] md:items-start">
              <aside className="hidden rounded-3xl border border-stone-200 bg-white p-4 md:flex md:flex-col">
                <div className="text-xl font-black text-[#0b1220]">AI 官方订阅代充</div>
                <div className="mt-3 w-full rounded-2xl bg-[#f4a261] px-3 py-3 text-center font-black tracking-[-0.05em] text-[#0b1220] shadow-sm text-[clamp(16px,2vw,30px)] whitespace-nowrap">质保 30 天不掉订阅，掉订阅，按天退差价</div>
                <div className="mt-3 flex flex-col gap-2">
                  {[
                    ["/logos/openai.svg", "ChatGPT Plus 官方代充"],
                    ["/logos/openai.svg", "ChatGPT Pro 5x 官方代充"],
                    ["/logos/openai.svg", "ChatGPT Pro 20x 官方代充"],
                    ["/logos/claude.svg", "Claude Pro 官方代充"],
                    ["/logos/claude.svg", "Claude Max 5X 官方代充"],
                    ["/logos/claude.svg", "Claude Max 20X 官方代充"],
                    ["/logos/grok.svg", "Grok Super 官方代充（1个月）"],
                    ["/logos/grok.svg", "Grok Super 官方代充（2个月）"],
                  ].map(([icon, title]) => (
                    <a key={title} href="https://shop.apiya.ai/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-stone-50 px-3 py-2.5 text-base font-black text-[#0b1220] ring-1 ring-stone-100 transition hover:bg-orange-50 hover:text-[#c05f3c]">
                      <img src={icon} alt="" className="size-6 shrink-0" />
                      <span className="truncate">{title}</span>
                    </a>
                  ))}
                </div>
              </aside>
              <div className="flex items-center justify-center p-0 md:p-0">
                <img src={posterUrl} alt="Check Claude 检测报告海报" className="h-auto max-h-[48vh] w-auto max-w-full rounded-[1.5rem] object-contain md:hidden" />
                <button type="button" onClick={() => void copyPoster()} className="hidden rounded-[1.5rem] bg-transparent p-0 md:block">
                  <img src={posterUrl} alt="Check Claude 检测报告海报" className="h-auto w-auto max-w-full rounded-[1.5rem] object-contain md:max-h-[68vh]" />
                </button>
              </div>
            </div>
            <a href="https://shop.apiya.ai/" target="_blank" rel="noreferrer" className="mt-4 block rounded-2xl bg-red-600 px-2 py-3 text-center shadow-lg shadow-red-900/20 md:hidden">
              <div className="whitespace-nowrap font-black tracking-[-0.04em] text-white text-[clamp(13px,4vw,22px)]">ChatGPT 和 Claude 官方 AI 账号订阅代充</div>
              <div className="mt-1 whitespace-nowrap font-black tracking-[-0.05em] text-white/95 text-[clamp(12px,3.55vw,20px)]">质保 30 天不掉订阅，掉订阅，按天退差价</div>
            </a>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              <button type="button" onClick={() => void copySiteLink()} className="rounded-full bg-white px-4 py-3 text-sm font-black text-[#0b1220] ring-1 ring-stone-200">复制链接</button>
              <button type="button" onClick={() => downloadDataUrl(posterUrl, "check-claude-report.png")} className="rounded-full bg-[#0b1220] px-4 py-3 text-sm font-black text-white ring-1 ring-[#0b1220] md:bg-white md:text-[#0b1220] md:ring-stone-200">保存海报</button>
              <button type="button" onClick={() => void copyPoster()} className="hidden rounded-full bg-[#0b1220] px-4 py-3 text-sm font-black text-white md:block">复制海报，到剪贴板</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
