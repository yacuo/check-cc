import { makeSignalScore } from "../client-engine";
import type { DetectionPlugin } from "../plugin";

export const languagePlugin: DetectionPlugin = {
  id: "language",
  titleKey: "language",
  source: "browser",
  defaultWeight: 20,
  async run({ browser, text, config }) {
    const languageScore = browser.languages.some((lang) => /^zh-cn|zh-hans|^zh$/i.test(lang)) ? 1 : browser.languages.some((lang) => /^zh/i.test(lang)) ? 0.5 : 0;
    return [makeSignalScore("language", text.signalLabels.language, browser.languages.join(", "), this.defaultWeight, languageScore, text, config)];
  },
};
