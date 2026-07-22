// CheckCC 的时区检测插件，用于读取浏览器时区并评估 Claude 运行环境的地区一致性。
import { makeSignalScore } from "../client-engine";
import type { DetectionPlugin } from "../plugin";

export const timezonePlugin: DetectionPlugin = {
  id: "timezone",
  titleKey: "timezone",
  source: "browser",
  defaultWeight: 26,
  async run({ browser, text, config }) {
    const timezoneScore = ["Asia/Shanghai", "Asia/Urumqi", "Asia/Chongqing", "Asia/Harbin", "Asia/Kashgar"].includes(browser.timezone ?? "") ? 1 : ["Asia/Hong_Kong", "Asia/Macau", "Asia/Taipei"].includes(browser.timezone ?? "") ? 0.6 : 0;
    return [makeSignalScore("timezone", text.signalLabels.timezone, browser.timezone, this.defaultWeight, timezoneScore, text, config)];
  },
};
