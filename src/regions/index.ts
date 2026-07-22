// CheckCC 的地区画像规则，用于定义国家、时区、语言、浏览器、设备和产品可用性风险特征。
import type { RegionProfile } from "@/detection/types";

export const REGION_PROFILES: RegionProfile[] = [
  {
    code: "cn",
    name: "中国大陆",
    shortName: "中国",
    countries: ["CN"],
    timezones: ["Asia/Shanghai", "Asia/Urumqi", "Asia/Chongqing", "Asia/Harbin", "Asia/Kashgar"],
    languages: ["zh-cn", "zh-hans", "zh"],
    browserPatterns: ["micromessenger", "qqbrowser", "quark", "ucbrowser", "baidu", "miuibrowser", "huaweibrowser", "360"],
    devicePatterns: ["huawei", "honor", "xiaomi", "redmi", "oppo", "vivo", "harmonyos", "realme", "oneplus"],
    fontFamilies: ["Microsoft YaHei", "PingFang SC", "SimSun", "SimHei", "HarmonyOS Sans", "MiSans", "OPPO Sans"],
    weights: { country: 34, timezone: 24, language: 18, browser: 8, device: 8, locale: 8 },
    products: { web: "restricted", pro: "restricted", api: "restricted", payment: "restricted" },
  },
  {
    code: "ru",
    name: "俄罗斯",
    shortName: "俄罗斯",
    countries: ["RU"],
    timezones: ["Europe/Moscow", "Europe/Samara", "Asia/Yekaterinburg", "Asia/Novosibirsk", "Asia/Vladivostok"],
    languages: ["ru"],
    browserPatterns: ["yabrowser", "yandex", "mail.ru"],
    devicePatterns: ["android", "windows"],
    fontFamilies: ["Arial", "Times New Roman"],
    weights: { country: 38, timezone: 26, language: 22, browser: 8, device: 2, locale: 4 },
    products: { web: "restricted", pro: "restricted", api: "restricted", payment: "restricted" },
  },
  {
    code: "ir",
    name: "伊朗",
    shortName: "伊朗",
    countries: ["IR"],
    timezones: ["Asia/Tehran"],
    languages: ["fa", "fa-ir"],
    browserPatterns: [],
    devicePatterns: [],
    fontFamilies: ["Tahoma", "Vazirmatn"],
    weights: { country: 46, timezone: 28, language: 20, browser: 2, device: 0, locale: 4 },
    products: { web: "restricted", pro: "restricted", api: "restricted", payment: "restricted" },
  },
];

export function getRegionProfile(code: string | null | undefined) {
  return REGION_PROFILES.find((profile) => profile.code === code) ?? null;
}
