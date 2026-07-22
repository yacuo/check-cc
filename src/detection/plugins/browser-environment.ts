// CheckCC 的浏览器环境检测插件，用于汇总浏览器端可见的环境风险信号。
import { collectBrowserSignals } from "../client-engine";
import type { DetectionPlugin } from "../plugin";

export const browserEnvironmentPlugin: DetectionPlugin = {
  id: "browser-environment",
  titleKey: "browserEnvironment",
  source: "browser",
  defaultWeight: 0,
  async run(context) {
    return collectBrowserSignals(context.region, context.text, context.config).signals;
  },
};
