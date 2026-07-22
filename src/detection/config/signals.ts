// CheckCC 的检测信号配置，用于声明各风险信号的启用状态、来源、权重和展示顺序。
import type { DetectionSignalConfig } from "./types";

export const signalConfig: Record<string, DetectionSignalConfig> = {
  timezone: { enabled: true, labelKey: "timezone", source: "browser", weight: 26, order: 10 },
  language: { enabled: true, labelKey: "language", source: "browser", weight: 20, order: 20 },
  languageVariant: { enabled: true, labelKey: "languageVariant", source: "browser", weight: 12, order: 30 },
  chineseFonts: { enabled: true, labelKey: "chineseFonts", source: "browser", weight: 16, order: 40 },
  vendorFonts: { enabled: true, labelKey: "vendorFonts", source: "browser", weight: 10, order: 50 },
  domesticBrowser: { enabled: true, labelKey: "domesticBrowser", source: "browser", weight: 8, order: 60 },
  domesticDevice: { enabled: true, labelKey: "domesticDevice", source: "browser", weight: 6, order: 70 },
  locale: { enabled: true, labelKey: "locale", source: "browser", weight: 6, order: 80 },
  timezoneOffset: { enabled: true, labelKey: "timezoneOffset", source: "browser", weight: 4, order: 90 },
  emojiStyle: { enabled: true, labelKey: "emojiStyle", source: "browser", weight: 4, order: 100 },
  country: { enabled: true, labelKey: "country", source: "server", weight: 20, order: 200 },
  proxyCountry: { enabled: true, labelKey: "proxyCountry", source: "server", weight: 0, order: 210 },
  ipAddress: { enabled: true, labelKey: "ipAddress", source: "server", weight: 0, order: 220 },
  browserIpLocation: { enabled: true, labelKey: "browserIpLocation", source: "server", weight: 0, order: 230 },
  browserIpOrg: { enabled: true, labelKey: "browserIpOrg", source: "server", weight: 0, order: 240 },
  os: { enabled: true, labelKey: "os", source: "browser", weight: 0, order: 250 },
};
