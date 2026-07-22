// CheckCC 的检测插件接口定义，用于约束每个检测插件接收的上下文和返回的风险信号。
import type { LocaleCode } from "@/i18n/messages";
import type { BrowserEnvironmentSnapshot } from "./client-engine";
import type { DetectorLocaleText } from "./locale";
import type { DetectionConfig } from "./config";
import type { RegionCode, SignalResult, SignalSource } from "./types";

export type DetectionPluginContext = {
  region: RegionCode;
  locale: LocaleCode;
  text: DetectorLocaleText;
  config: DetectionConfig;
  browser: BrowserEnvironmentSnapshot;
};

export type DetectionPlugin = {
  id: string;
  titleKey: string;
  source: SignalSource;
  defaultWeight: number;
  run: (context: DetectionPluginContext) => Promise<SignalResult[]>;
};
