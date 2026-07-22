// CheckCC 的检测步骤配置，用于定义前端扫描流程中的步骤顺序和多语言文案键。
import type { DetectionStepConfig } from "./types";

export const stepConfig: DetectionStepConfig[] = [
  { id: "language", titleKey: "language", descKey: "language" },
  { id: "timezone", titleKey: "timezone", descKey: "timezone" },
  { id: "network", titleKey: "network", descKey: "network" },
  { id: "dns", titleKey: "dns", descKey: "dns" },
  { id: "runtime", titleKey: "runtime", descKey: "runtime" },
  { id: "risk", titleKey: "risk", descKey: "risk" },
];
