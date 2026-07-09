import { runnerConfig } from "./runner";
import { serviceConfig } from "./services";
import { signalConfig } from "./signals";
import { stepConfig } from "./steps";
import type { DetectionConfig } from "./types";

export type {
  DetectionConfig,
  DetectionRunnerConfig,
  DetectionRunnerMode,
  DetectionServiceConfig,
  DetectionSignalConfig,
  DetectionStepConfig,
} from "./types";

export { runnerConfig } from "./runner";
export { serviceConfig } from "./services";
export { signalConfig } from "./signals";
export { stepConfig } from "./steps";

export const detectionConfig: DetectionConfig = {
  runner: runnerConfig,
  steps: stepConfig,
  signals: signalConfig,
  services: serviceConfig,
};

export function getSignalConfig(id: string, config = detectionConfig) {
  return config.signals[id];
}

export function getSignalWeight(id: string, fallback = 0, config = detectionConfig) {
  return config.signals[id]?.weight ?? fallback;
}
