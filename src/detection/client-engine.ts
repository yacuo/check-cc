import { evaluateAccess } from "./scoring";
import { detectionConfig, getSignalConfig, getSignalWeight, type DetectionConfig } from "./config";
import type { DetectorLocaleText, TargetRegion } from "./locale";
import type { RegionCode, SignalResult } from "./types";

export type SignalView = SignalResult & { state?: "pending" | "running" | "done" };
export type BrowserIpIntel = { ip: string; location: string; country: string; asn: string; org: string };
export type BrowserEnvironmentSnapshot = {
  languages: string[];
  timezone: string | null;
  locale: string | null;
  userAgent: string;
  platform?: string;
  brands: string;
};

export const regions: Array<{ code: TargetRegion }> = [{ code: "auto" }, { code: "cn" }, { code: "hk" }, { code: "ru" }];

export function normalizeRegion(code: TargetRegion): RegionCode {
  return code === "hk" ? "auto" : code;
}

export const scanSteps = detectionConfig.steps;

export const defaultSignals: SignalView[] = Object.entries(detectionConfig.signals)
  .filter(([, config]) => config.enabled)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([id, config]) => ({ id, label: config.labelKey, value: null, score: 0, weight: config.weight, contribution: 0, source: config.source }));

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function animateProgress(from: number, to: number, setProgress: (value: number) => void, setActiveSignal: (value: number) => void) {
  const frames = 4;
  for (let i = 1; i <= frames; i += 1) {
    const value = Math.round(from + ((to - from) * i) / frames);
    setProgress(value);
    setActiveSignal(Math.min(defaultSignals.length - 1, Math.floor((value / 100) * defaultSignals.length)));
    await sleep(22);
  }
}

function makeSignal(id: string, label: string, value: string | null, fallbackWeight: number, matched: boolean, text: DetectorLocaleText, config: DetectionConfig): SignalResult {
  return makeSignalScore(id, label, value, fallbackWeight, matched ? 1 : 0, text, config);
}

export function makeSignalScore(id: string, label: string, value: string | null, fallbackWeight: number, score: number, text: DetectorLocaleText, config: DetectionConfig): SignalResult {
  const normalized = Math.max(0, Math.min(1, score));
  const weight = getSignalWeight(id, fallbackWeight, config);
  return { id, label, value: value || text.unknown, score: normalized, weight, contribution: Math.round(normalized * weight), source: getSignalConfig(id, config)?.source ?? "browser" };
}

function hasFont(font: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const text = "\u4e2d\u6587\u5b57\u4f53\u68c0\u6d4bABCabc012";
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

export function localizeSignalValue(value: string | null, text: DetectorLocaleText) {
  if (!value) return value;
  return text.valueMap[value] ?? value;
}

function detectBrowserName(ua: string, text: DetectorLocaleText) {
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/YaBrowser/i.test(ua)) return "Yandex Browser";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/MicroMessenger/i.test(ua)) return text.signalValues.wechatBrowser;
  return text.signalValues.unknownBrowser;
}

function detectOS(ua: string, platform: string | undefined, text: DetectorLocaleText) {
  const probe = `${ua} ${platform ?? ""}`;
  if (/harmonyos/i.test(probe)) return "HarmonyOS";
  if (/android/i.test(probe)) return "Android";
  if (/iphone|ipad|ios/i.test(probe)) return "iOS";
  if (/mac os|macintosh|macintel/i.test(probe)) return "macOS";
  if (/windows nt/i.test(probe)) return "Windows";
  if (/linux/i.test(probe)) return "Linux";
  return platform || text.signalValues.unknownSystem;
}

function detectDeviceName(ua: string, platform: string | undefined, text: DetectorLocaleText) {
  const os = detectOS(ua, platform, text);
  if (/iphone/i.test(ua)) return `iPhone / ${os}`;
  if (/ipad/i.test(ua)) return `iPad / ${os}`;
  if (/android/i.test(ua)) return `${text.signalValues.androidDevice} / ${os}`;
  if (/macintosh|mac os|macintel/i.test(`${ua} ${platform ?? ""}`)) return `Mac / ${os}`;
  if (/windows/i.test(ua)) return `Windows PC / ${os}`;
  if (/linux/i.test(ua)) return `${text.signalValues.linuxDevice} / ${os}`;
  return os;
}

export function collectBrowserEnvironment(text: DetectorLocaleText): BrowserEnvironmentSnapshot {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string; brands?: Array<{ brand: string; version: string }>; mobile?: boolean } };
  return {
    languages: navigator.languages?.length ? [...navigator.languages] : [navigator.language].filter(Boolean),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    locale: Intl.DateTimeFormat().resolvedOptions().locale || null,
    userAgent: navigator.userAgent,
    platform: nav.userAgentData?.platform,
    brands: nav.userAgentData?.brands?.map((item) => item.brand).join(" / ") || text.signalValues.noBrands,
  };
}

export function collectBrowserSignals(region: RegionCode, text: DetectorLocaleText, config: DetectionConfig = detectionConfig, snapshot = collectBrowserEnvironment(text)) {
  const { languages, timezone, locale, userAgent: ua, platform, brands } = snapshot;
  const uaLower = ua.toLowerCase();
  const scFonts = ["Microsoft YaHei", "Microsoft JhengHei", "PingFang SC", "Hiragino Sans GB", "STHeiti", "STSong", "SimSun", "SimHei", "Noto Sans CJK SC", "Source Han Sans SC", "WenQuanYi Micro Hei"].filter(hasFont);
  const tcFonts = ["PingFang TC", "Heiti TC", "Hiragino Sans CNS", "Noto Sans CJK TC", "Source Han Sans TC", "MingLiU", "PMingLiU"].filter(hasFont);
  const vendorFonts = ["MiSans", "HarmonyOS Sans", "OPPO Sans", "vivo Sans", "Honor Sans", "Alibaba PuHuiTi", "WPS Fangzheng", "FZLanTingHeiS"].filter(hasFont);
  const domesticBrowser = matchAny(`${uaLower} ${brands.toLowerCase()}`, ["micromessenger", "qqbrowser", "mqqbrowser", "quark", "ucbrowser", "ucweb", "baiduboxapp", "baidubrowser", "miuibrowser", "mibrowser", "huaweibrowser", "heytapbrowser", "oppobrowser", "vivobrowser", "360se", "360ee", "qihoobrowser", "sogoumobilebrowser", "2345browser", "lbbrowser"]);
  const domesticDevice = matchAny(`${uaLower} ${platform ?? ""}`, ["harmonyos", "huawei", "honor", "xiaomi", "redmi", "oppo", "vivo", "realme", "oneplus", "miui"]);
  const chineseVariant = languages.some((lang) => /zh-(tw|hk|mo)|zh-hant/i.test(lang)) ? text.signalValues.traditionalChinese : languages.some((lang) => /zh-cn|zh-sg|zh-hans|zh/i.test(lang)) ? text.signalValues.simplifiedChinese : null;
  const offset = -new Date().getTimezoneOffset() / 60;
  const timezoneScore = ["Asia/Shanghai", "Asia/Urumqi", "Asia/Chongqing", "Asia/Harbin", "Asia/Kashgar"].includes(timezone ?? "") ? 1 : ["Asia/Hong_Kong", "Asia/Macau", "Asia/Taipei"].includes(timezone ?? "") ? 0.6 : 0;
  const languageScore = languages.some((lang) => /^zh-cn|zh-hans|^zh$/i.test(lang)) ? 1 : languages.some((lang) => /^zh/i.test(lang)) ? 0.5 : 0;
  const localeScore = /zh-cn|zh-hans|^zh$/i.test(locale ?? "") ? 1 : /^zh/i.test(locale ?? "") ? 0.5 : 0;
  const fontScore = scFonts.length ? Math.min(1, 0.75 + 0.08 * scFonts.length) : tcFonts.length ? 0.5 : 0;
  const vendorFontScore = vendorFonts.length >= 2 ? 1 : vendorFonts.length === 1 ? 0.8 : 0;
  const deviceScore = domesticDevice === "harmonyos" ? 1 : domesticDevice ? 0.7 : 0;
  const emojiStyle = /iphone|ipad|mac os/i.test(ua) ? text.signalValues.appleEmoji : /android|harmonyos/i.test(ua) ? text.signalValues.androidEmoji : /windows/i.test(ua) ? text.signalValues.windowsEmoji : text.signalValues.unknownEmoji;
  const emojiScore = /android|harmonyos|windows/i.test(ua) ? 0.4 : /iphone|ipad|mac os/i.test(ua) ? 0.2 : 0;
  const label = text.signalLabels;
  const value = text.signalValues;
  const signals: SignalResult[] = [
    makeSignalScore("timezone", label.timezone, timezone, 26, timezoneScore, text, config),
    makeSignalScore("language", label.language, languages.join(", "), 20, languageScore, text, config),
    makeSignal("languageVariant", label.languageVariant, chineseVariant || value.noLanguageVariant, 12, Boolean(chineseVariant), text, config),
    makeSignalScore("chineseFonts", label.chineseFonts, scFonts.length ? `${value.scFonts}：${scFonts.join(" / ")}` : tcFonts.length ? `${value.tcFonts}：${tcFonts.join(" / ")}` : value.noFonts, 16, fontScore, text, config),
    makeSignalScore("vendorFonts", label.vendorFonts, vendorFonts.length ? `${value.vendorFonts}：${vendorFonts.join(" / ")}` : value.noVendorFonts, 10, vendorFontScore, text, config),
    makeSignal("domesticBrowser", label.domesticBrowser, domesticBrowser || detectBrowserName(ua, text), 8, Boolean(domesticBrowser), text, config),
    makeSignal("browser", label.browser, `${detectBrowserName(ua, text)} / ${detectOS(ua, platform, text)}`, 0, false, text, config),
    makeSignalScore("domesticDevice", label.domesticDevice, domesticDevice || value.noDevice, 6, deviceScore, text, config),
    makeSignal("device", label.device, detectDeviceName(ua, platform, text), 0, false, text, config),
    makeSignal("os", label.os, detectOS(ua, platform, text), 0, false, text, config),
    makeSignalScore("locale", label.locale, locale, 6, localeScore, text, config),
    makeSignalScore("timezoneOffset", label.timezoneOffset, `UTC${offset >= 0 ? "+" : ""}${offset}`, 4, offset === 8 ? 0.7 : 0, text, config),
    makeSignalScore("emojiStyle", label.emojiStyle, emojiStyle, 4, emojiScore, text, config),
  ].filter((signal) => getSignalConfig(signal.id, config)?.enabled !== false);
  return { ...evaluateAccess({ region, languages, timezone, locale, userAgent: ua, source: "browser" }), signals };
}

export function isPublicIp(ip: string) {
  if (ip.includes(":")) return !/^(::1|fc|fd|fe80:)/i.test(ip);
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
  const [a, b] = parts;
  return !(a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254) || a === 0);
}

export function signalsScore(browserSignals: SignalResult[], serverSignals: SignalResult[], config: DetectionConfig = detectionConfig) {
  const scoreMap = new Map<string, number>();
  for (const signal of browserSignals) {
    if (signal.contribution > 0) scoreMap.set(signal.id, signal.contribution);
  }
  for (const signal of serverSignals) {
    if (signal.id === "country" && signal.contribution > 0) scoreMap.set("country", getSignalWeight("country", 20, config));
  }
  return Array.from(scoreMap.values()).reduce((sum, value) => sum + value, 0);
}
