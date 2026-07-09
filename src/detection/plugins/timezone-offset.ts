import { makeSignalScore } from "../client-engine";
import type { DetectionPlugin } from "../plugin";

export const timezoneOffsetPlugin: DetectionPlugin = {
  id: "timezoneOffset",
  titleKey: "timezoneOffset",
  source: "browser",
  defaultWeight: 4,
  async run({ text, config }) {
    const offset = -new Date().getTimezoneOffset() / 60;
    return [makeSignalScore("timezoneOffset", text.signalLabels.timezoneOffset, `UTC${offset >= 0 ? "+" : ""}${offset}`, this.defaultWeight, offset === 8 ? 0.7 : 0, text, config)];
  },
};
