import { makeSignalScore } from "../client-engine";
import type { DetectionPlugin } from "../plugin";

export const languageVariantPlugin: DetectionPlugin = {
  id: "languageVariant",
  titleKey: "languageVariant",
  source: "browser",
  defaultWeight: 12,
  async run({ browser, text, config }) {
    const variant = browser.languages.some((lang) => /zh-(tw|hk|mo)|zh-hant/i.test(lang))
      ? text.signalValues.traditionalChinese
      : browser.languages.some((lang) => /zh-cn|zh-sg|zh-hans|zh/i.test(lang))
        ? text.signalValues.simplifiedChinese
        : text.signalValues.noLanguageVariant;

    const matched = variant !== text.signalValues.noLanguageVariant;
    return [makeSignalScore("languageVariant", text.signalLabels.languageVariant, variant, this.defaultWeight, matched ? 1 : 0, text, config)];
  },
};
