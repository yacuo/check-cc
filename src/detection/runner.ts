// CheckCC 的检测运行器，用于收集浏览器环境并按插件配置生成去重后的风险信号结果。
import { collectBrowserEnvironment, collectBrowserSignals } from "./client-engine";
import { detectionConfig, type DetectionConfig } from "./config";
import type { DetectionPluginContext } from "./plugin";
import { detectionPlugins } from "./plugins";
import type { SignalResult } from "./types";

export type DetectionRunResult = {
  signals: SignalResult[];
  browserResult: ReturnType<typeof collectBrowserSignals>;
};

function enabledPlugins(config: DetectionConfig) {
  return detectionPlugins.filter((plugin) => plugin.id === "browser-environment" || config.signals[plugin.id]?.enabled !== false);
}

function uniqueSignals(signals: SignalResult[]) {
  const map = new Map<string, SignalResult>();
  for (const signal of signals) {
    const key = `${signal.source}:${signal.id}`;
    if (!map.has(key)) map.set(key, signal);
  }
  return Array.from(map.values());
}

export async function runDetection(context: Omit<DetectionPluginContext, "config" | "browser"> & { config?: DetectionConfig }): Promise<DetectionRunResult> {
  const config = context.config ?? detectionConfig;
  const browser = collectBrowserEnvironment(context.text);
  const pluginContext: DetectionPluginContext = { ...context, config, browser };
  const browserResult = collectBrowserSignals(context.region, context.text, config, browser);
  const plugins = enabledPlugins(config);
  const signals = plugins.length
    ? uniqueSignals((await Promise.all(plugins.map((plugin) => plugin.id === "browser-environment" ? browserResult.signals : plugin.run(pluginContext)))).flat())
    : browserResult.signals;

  return {
    browserResult: { ...browserResult, signals },
    signals,
  };
}
