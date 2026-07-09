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
    { id: "country", label: "country", value: input.country ?? null, score: countryScore, weight: profile.weights.country, contribution: Math.round(countryScore * profile.weights.country), source: input.source },
    { id: "timezone", label: "timezone", value: input.timezone ?? null, score: timezoneScore, weight: profile.weights.timezone, contribution: Math.round(timezoneScore * profile.weights.timezone), source: input.source },
    { id: "language", label: "language", value: langs.join(", ") || null, score: languageScore, weight: profile.weights.language, contribution: Math.round(languageScore * profile.weights.language), source: input.source },
    { id: "locale", label: "locale", value: input.locale ?? null, score: localeScore, weight: profile.weights.locale, contribution: Math.round(localeScore * profile.weights.locale), source: input.source },
    { id: "browser", label: "browser", value: input.userAgent ? "read" : null, score: browserScore, weight: profile.weights.browser, contribution: Math.round(browserScore * profile.weights.browser), source: input.source },
    { id: "device", label: "device", value: input.userAgent ? "read" : null, score: deviceScore, weight: profile.weights.device, contribution: Math.round(deviceScore * profile.weights.device), source: input.source },
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
  void score;
  void profile;
  return [];
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
