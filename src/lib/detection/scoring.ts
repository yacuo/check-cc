// 风险评分规则
import { REGION_PROFILES } from "../regions";
import type { AccessStatus, ProductAccess, RegionCode, RegionProfile, SignalResult } from "./types";

type Input = {
  region: RegionCode;
  country?: string | null;
  timezone?: string | null;
  languages?: string[];
  locale?: string | null;
  userAgent?: string | null;
  source: "browser" | "server";
};

const UNKNOWN_PRODUCTS: ProductAccess = {
  web: "unknown",
  pro: "unknown",
  api: "unknown",
  payment: "unknown",
};

function includesLower(list: string[], value: string) {
  const v = value.toLowerCase();
  return list.some((item) => v.includes(item.toLowerCase()) || item.toLowerCase().includes(v));
}

function scoreProfile(profile: RegionProfile, input: Input) {
  const ua = (input.userAgent ?? "").toLowerCase();
  const langs = input.languages?.map((lang) => lang.toLowerCase()) ?? [];
  const countryScore = input.country && profile.countries.includes(input.country.toUpperCase()) ? 1 : 0;
  const timezoneScore = input.timezone && profile.timezones.includes(input.timezone) ? 1 : 0;
  const languageScore = langs.some((lang) => includesLower(profile.languages, lang)) ? 1 : 0;
  const localeScore = input.locale && includesLower(profile.languages, input.locale) ? 1 : 0;
  const browserScore = profile.browserPatterns.some((pattern) => ua.includes(pattern)) ? 1 : 0;
  const deviceScore = profile.devicePatterns.some((pattern) => ua.includes(pattern)) ? 0.7 : 0;

  const signals: SignalResult[] = [
    { id: "country", label: "IP 国家/地区", value: input.country ?? "未知", score: countryScore, weight: profile.weights.country, contribution: Math.round(countryScore * profile.weights.country), source: input.source },
    { id: "timezone", label: "系统/网络时区", value: input.timezone ?? "未知", score: timezoneScore, weight: profile.weights.timezone, contribution: Math.round(timezoneScore * profile.weights.timezone), source: input.source },
    { id: "language", label: "浏览器语言", value: langs.join(", ") || "未知", score: languageScore, weight: profile.weights.language, contribution: Math.round(languageScore * profile.weights.language), source: input.source },
    { id: "locale", label: "Intl 区域设置", value: input.locale ?? "未知", score: localeScore, weight: profile.weights.locale, contribution: Math.round(localeScore * profile.weights.locale), source: input.source },
    { id: "browser", label: "浏览器/应用环境", value: input.userAgent ? "已读取" : "未知", score: browserScore, weight: profile.weights.browser, contribution: Math.round(browserScore * profile.weights.browser), source: input.source },
    { id: "device", label: "设备/系统线索", value: input.userAgent ? "已读取" : "未知", score: deviceScore, weight: profile.weights.device, contribution: Math.round(deviceScore * profile.weights.device), source: input.source },
  ].filter((signal) => signal.weight > 0);

  const total = signals.reduce((sum, signal) => sum + signal.contribution, 0);
  return { profile, score: Math.min(100, total), signals };
}

export function accessStatus(score: number): AccessStatus {
  if (score >= 70) return "restricted";
  if (score >= 40) return "possibly_supported";
  if (score > 0) return "unknown";
  return "unknown";
}

export function recommendations(score: number, profile: RegionProfile | null) {
  if (!profile) {
    return ["没有明显命中重点受限地区，当前环境风险较低。", "如果近期切换过节点、时区或账号地区，建议重新检测一次。"];
  }
  if (score >= 70) {
    return [`当前环境强烈命中${profile.name}特征，建议重点检查 Claude Web、Pro/Max 和 API 可用性。`, "如果已经在使用 Claude，避免频繁切换地区、节点、时区和设备环境。", "检查网络出口、支付卡地区、账单地址和账号地区是否一致。"];
  }
  return [`当前环境部分命中${profile.name}特征，建议结合实际访问状态继续观察。`, "如果账号出现验证、订阅失败或访问异常，可切换环境后重新检测。"];
}

export function evaluateAccess(input: Input) {
  const candidates = input.region === "auto" ? REGION_PROFILES : REGION_PROFILES.filter((profile) => profile.code === input.region);
  const scored = candidates.map((profile) => scoreProfile(profile, input)).sort((a, b) => b.score - a.score);
  const best = scored[0] ?? null;
  const matched = best && best.score > 0 ? best : null;
  const score = matched?.score ?? 0;
  const profile = matched?.profile ?? null;
  return {
    matchedRegion: profile?.code ?? null,
    score,
    status: accessStatus(score),
    products: profile?.products ?? UNKNOWN_PRODUCTS,
    signals: matched?.signals ?? [],
    recommendations: recommendations(score, profile),
  };
}
