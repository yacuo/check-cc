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
