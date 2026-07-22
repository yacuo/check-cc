// CheckCC 的检测插件注册入口，用于汇总浏览器环境、语言、时区和字体等检测插件。
import type { DetectionPlugin } from "../plugin";
import { browserEnvironmentPlugin } from "./browser-environment";
import { emojiStylePlugin } from "./emoji-style";
import { languagePlugin } from "./language";
import { languageVariantPlugin } from "./language-variant";
import { localePlugin } from "./locale";
import { timezonePlugin } from "./timezone";
import { timezoneOffsetPlugin } from "./timezone-offset";

export const detectionPlugins: DetectionPlugin[] = [
  timezonePlugin,
  languagePlugin,
  languageVariantPlugin,
  localePlugin,
  timezoneOffsetPlugin,
  emojiStylePlugin,
  browserEnvironmentPlugin,
];
