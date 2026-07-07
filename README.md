# CheckCC

[中文](README.md) | [English](README.en.md)

<p align="center">
  <img src="./docs/images/checkcc-homepage.png" alt="CheckCC 首页" width="900" />
</p>

[CheckCC](https://checkcc.org) 是一个面向 Claude 用户的运行环境风险检测项目，用于分析浏览器环境、系统时区、语言偏好、User-Agent、运行容器等技术信号，帮助用户识别可能影响 Claude 账号稳定性的环境画像冲突。

- 官方在线体验：<https://checkcc.org>
- GitHub 项目主页：<https://github.com/yacuo/check-cc>

## 项目截图

### 检测指标示例

<p align="center">
  <img src="./docs/images/checkcc-detection-signals.png" alt="CheckCC 检测指标示例" width="900" />
</p>

| 检测原理 | 重点检测地区 |
| --- | --- |
| <img src="./docs/images/checkcc-detection-principles.png" alt="CheckCC 检测原理" width="430" /> | <img src="./docs/images/checkcc-supported-regions.png" alt="CheckCC 重点检测地区" width="430" /> |

## 项目说明

[CheckCC](https://checkcc.org) 适合用于学习、二次开发和自部署。项目关注的是“运行环境是否可信、稳定、一致”，不会读取 Claude 账号内容，也不会判断官方封禁结果。

## 技术原理

Claude 账号的风险通常不是由单一因素决定，而是由多个环境信号共同组成账号画像。[CheckCC](https://checkcc.org) 会在浏览器本地采集并分析常见环境信号，然后根据是否存在冲突给出风险提示。

核心检测维度包括：

- **浏览器语言**：判断浏览器首选语言是否和使用地区一致。
- **系统时区**：判断系统时区是否和地区画像匹配。
- **Intl Locale**：检查 JavaScript 国际化环境是否暴露异常语言或地区特征。
- **User-Agent**：识别浏览器、系统和客户端容器特征。
- **运行容器**：判断是否存在 WebView、自动化环境、异常客户端等特征。
- **信号一致性**：综合判断语言、时区、地区和浏览器环境是否互相矛盾。

这些信号不能证明账号一定安全或一定会被限制，但可以帮助用户提前发现明显的环境画像冲突。

## 如何降低封号风险

[CheckCC](https://checkcc.org) 检测结果仅供参考，不代表 Claude 或 Anthropic 官方结论。使用 Claude、Claude Code、Claude Pro 或申请 Claude API 前，可以先检查运行环境。

一般建议：

- 尽量保持 IP、系统时区、浏览器语言和账号地区一致。
- 避免频繁切换国家、代理节点、设备和浏览器环境。
- 避免在 WebView、自动化浏览器、异常客户端或不稳定容器中登录账号。
- 订阅 Claude Pro、申请 Claude API 或使用 Claude Code 前，先检查运行环境。
- 如果检测到高风险信号，先调整环境，再继续登录、订阅或申请相关服务。
- 尽量使用长期稳定的网络出口和一致的设备环境，减少账号画像剧烈变化。

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- pnpm

## 功能特性

- 浏览器语言检测
- 系统时区检测
- Intl Locale 检测
- User-Agent 检测
- 浏览器运行容器检测
- 基础风险评分
- 本地浏览器环境分析
- 多语言页面结构
- 响应式 UI

## 隐私说明

项目默认只做浏览器本地环境检测：

- 不需要登录 Claude
- 不读取 Claude 账号
- 不读取密码
- 不读取 Cookie
- 不读取聊天内容
- 不默认上传检测结果

## 快速开始

```bash
pnpm install
pnpm dev
```

打开：<http://localhost:3000>

## 构建

```bash
pnpm build
pnpm start
```

## 自部署说明

你可以将本项目部署到 Vercel、Cloudflare Pages、Netlify 或自己的服务器，也可以根据需求扩展检测规则、页面样式和部署方式。

## 适用场景

- 学习浏览器环境检测
- 研究 Claude 运行环境风险提示
- 搭建自用环境检测页面
- 作为开源项目二次开发基础

## 免责声明

[CheckCC](https://checkcc.org) 的检测结果仅基于浏览器本地环境信号进行风险提示，不代表 Claude 或 Anthropic 官方判断。请勿将检测结果作为账号安全、订阅状态或申诉结果的唯一依据。

## 开源协议

本项目基于 MIT 协议开源，Copyright © yacuo / CheckCC。

你可以自由使用、修改与再分发本项目，但任何副本或实质性部分都必须保留原始版权与许可声明，并注明来源：<https://github.com/yacuo/check-cc.git>

如果你重新部署本项目，请保留页脚署名或仓库链接，方便访问者找到原项目。
