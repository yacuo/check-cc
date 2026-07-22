// CheckCC 的检测运行器配置，用于控制插件执行模式、失败策略和默认超时时间。
import type { DetectionRunnerConfig } from "./types";

export const runnerConfig: DetectionRunnerConfig = {
  mode: "grouped",
  failFast: false,
  defaultTimeoutMs: 3000,
};
