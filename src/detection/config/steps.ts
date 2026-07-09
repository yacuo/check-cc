import type { DetectionStepConfig } from "./types";

export const stepConfig: DetectionStepConfig[] = [
  { id: "language", titleKey: "language", descKey: "language" },
  { id: "timezone", titleKey: "timezone", descKey: "timezone" },
  { id: "network", titleKey: "network", descKey: "network" },
  { id: "dns", titleKey: "dns", descKey: "dns" },
  { id: "runtime", titleKey: "runtime", descKey: "runtime" },
  { id: "risk", titleKey: "risk", descKey: "risk" },
];
