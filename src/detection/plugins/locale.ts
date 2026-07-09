import { makeSignalScore } from "../client-engine";
import type { DetectionPlugin } from "../plugin";

export const localePlugin: DetectionPlugin = {
  id: "locale",
  titleKey: "locale",
  source: "browser",
  defaultWeight: 6,
  async run({ browser, text, config }) {
    const localeScore = /zh-cn|zh-hans|^zh$/i.test(browser.locale ?? "") ? 1 : /^zh/i.test(browser.locale ?? "") ? 0.5 : 0;
    return [makeSignalScore("locale", text.signalLabels.locale, browser.locale, this.defaultWeight, localeScore, text, config)];
  },
};
