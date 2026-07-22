// CheckCC 的 Emoji 风格检测插件，用于通过系统 Emoji 呈现特征辅助判断设备环境风险。
import { makeSignalScore } from "../client-engine";
import type { DetectionPlugin } from "../plugin";

export const emojiStylePlugin: DetectionPlugin = {
  id: "emojiStyle",
  titleKey: "emojiStyle",
  source: "browser",
  defaultWeight: 4,
  async run({ browser, text, config }) {
    const emojiStyle = /iphone|ipad|mac os/i.test(browser.userAgent)
      ? text.signalValues.appleEmoji
      : /android|harmonyos/i.test(browser.userAgent)
        ? text.signalValues.androidEmoji
        : /windows/i.test(browser.userAgent)
          ? text.signalValues.windowsEmoji
          : text.signalValues.unknownEmoji;
    const score = /android|harmonyos|windows/i.test(browser.userAgent) ? 0.4 : /iphone|ipad|mac os/i.test(browser.userAgent) ? 0.2 : 0;

    return [makeSignalScore("emojiStyle", text.signalLabels.emojiStyle, emojiStyle, this.defaultWeight, score, text, config)];
  },
};
