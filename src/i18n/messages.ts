export type LocaleCode = "zh" | "zh-HK" | "ru" | "en";
export type LocaleSlug = "hong-kong" | "russia" | "en";

export type Messages = {
  nav: { projects: string; faq: string; detect: string; menu: string; close: string; language: string };
  hero: { title: string; subtitle: string };
  logic: { eyebrow: string; title: string; desc: string; items: Array<[string, string, string]> };
  signals: { eyebrow: string; title: string; desc: string; checks: Array<[string, string]> };
  regionsTitle: string;
  regions: Array<{ name: string; risk: string; desc: string }>;
  privacy: { eyebrow: string; title: string; desc: string; items: Array<[string, string]> };
  faq: { title: string; items: Array<[string, string]> };
  footer: { title: string; desc: string; infoTitle: string; domain: string; feature: string; note: string };
  detector: {
    title: string;
    signalCount: (count: number, done: boolean) => string;
    targetTitle: string;
    targetDesc: string;
    startCheck: string;

    cardTags: string[];
    loadingText: string;
    idleCta: string;
    idleReport: string;
    environmentSuffix: string;
    riskPrefix: string;
    close: string;
  };
};

export const defaultLocale: LocaleCode = "zh";

export const localeRoutes: Record<LocaleCode, { slug: LocaleSlug | ""; label: string; lang: string }> = {
  zh: { slug: "", label: "中国", lang: "中文" },
  "zh-HK": { slug: "hong-kong", label: "香港", lang: "繁中" },
  ru: { slug: "russia", label: "俄罗斯", lang: "Русский" },
  en: { slug: "en", label: "Global", lang: "English" },
};

export const slugToLocale: Record<LocaleSlug, LocaleCode> = {
  "hong-kong": "zh-HK",
  russia: "ru",
  en: "en",
};

const zhChecks: Array<[string, string]> = [
  ["地区画像一致性", "综合分析本地化环境、区域偏好与访问来源，判断是否存在明显地区信号冲突。"],
  ["浏览器身份画像", "联合识别浏览器语言、运行时特征与国际化配置，评估账号环境是否自然一致。"],
  ["终端环境指纹", "通过渲染特征、系统线索与运行时能力，捕捉异常设备环境和伪装痕迹。"],
  ["应用容器识别", "识别浏览器、App 内 WebView 与特殊访问容器，判断是否存在高风险访问场景。"],
  ["账号可信度信号", "结合设备连续性、环境稳定性和国产终端弱信号，评估账号画像可信度。"],
  ["网络出口可信度", "校验 IP 归属、ASN 网络组织、边缘请求头和代理出口，分析 Claude 访问风险。"],
];

const zhFaqs: Array<[string, string]> = [
  ["Claude 封号是什么原因？", "快速了解常见封号原因，以及环境画像异常带来的账号风险。"],
  ["Claude 封号原因有哪些？", "梳理 IP、地区、语言、时区、支付方式等常见风险因素。"],
  ["Claude 封号机制是什么？", "从风控信号角度理解账号限制、异常环境和地区画像。"],
  ["Claude 封号后还能解封吗？", "了解账号受限后的处理思路，以及申诉前需要确认的环境问题。"],
  ["Claude 封号会退款吗？", "了解订阅受限后的退款可能性、付款渠道和账号状态影响。"],
  ["如何申请 Claude 账号？", "申请账号前先确认运行环境，减少注册、验证和订阅异常。"],
  ["如何申请 Claude API？", "申请 API 前检查 IP、地区和环境一致性，减少开通风险。"],
  ["Claude Code 怎么申请？", "了解 Claude Code 与 Claude Pro 订阅相关的环境风险。"],
];

const enChecks: Array<[string, string]> = [
  ["Regional profile consistency", "Analyze local environment signals, regional preferences, and access sources to detect obvious regional conflicts."],
  ["Browser identity profile", "Correlate browser language, runtime traits, and Intl configuration to evaluate whether the account environment looks natural."],
  ["Device environment fingerprint", "Use rendering traits, system signals, and runtime capabilities to identify abnormal devices or spoofed environments."],
  ["Application container detection", "Identify browsers, in-app WebViews, and special access containers that may increase account risk."],
  ["Account trust signals", "Evaluate device continuity, environment stability, and weak vendor signals to estimate account profile trust."],
  ["Network exit trust", "Check IP ownership, ASN organization, edge request headers, and proxy exit consistency for Claude access risk."],
];

const enFaqs: Array<[string, string]> = [
  ["Why can a Claude account be restricted?", "Learn common restriction reasons and how inconsistent environment profiles can increase account risk."],
  ["What are common Claude restriction factors?", "IP region, language, timezone, payment method, device profile, and network exit consistency are common risk signals."],
  ["How does Claude account risk detection work?", "Risk systems usually evaluate multiple environment and behavior signals instead of a single IP address."],
  ["Can a restricted Claude account be recovered?", "Before appealing, check whether IP, timezone, language, and device signals are consistent and stable."],
  ["Will Claude refund after account restrictions?", "Refund outcomes may depend on subscription state, payment channel, account status, and official policy."],
  ["How should I prepare before creating a Claude account?", "Check your runtime environment first to reduce registration, verification, and subscription issues."],
  ["How should I prepare before applying for Claude API?", "Verify that your IP, region, browser language, and environment profile are consistent before applying."],
  ["How does Claude Code relate to environment risk?", "Claude Code and Claude Pro usage can still be affected by inconsistent account and runtime environment signals."],
];

export const messages: Record<LocaleCode, Messages> = {
  zh: {
    nav: { projects: "检测项目", faq: "FAQ", detect: "立即检测", menu: "菜单", close: "关闭", language: "语言" },
    hero: { title: "检查 Claude 运行环境和封号风险", subtitle: "独家 AI 环境指纹引擎，综合扫描 Claude 运行环境、地区画像与账号风险" },
    logic: {
      eyebrow: "Detection Logic",
      title: "检测原理",
      desc: "我们把 Claude 运行环境拆成可验证的外部信号，不依赖单一 IP，而是看语言、时区、网络、设备和支付环境是否一致。",
      items: [["01", "环境指纹", "系统时区、UTC 偏移、浏览器语言、Intl locale。"], ["02", "网络画像", "服务端请求头、IP 地区、网络出口和节点一致性。"], ["03", "风险评分", "按 Claude Web、Pro/Max、API、支付风险加权汇总。"]],
    },
    signals: { eyebrow: "Risk Signals", title: "我们会检测哪些 Claude 风险信号？", desc: "这些检测项直接渲染在静态 HTML 中，搜索引擎抓取时就能理解网站主题；实际检测时会结合浏览器端与服务端信号动态评分。", checks: zhChecks },
    regionsTitle: "重点地区检测",
    regions: [{ name: "中国大陆", risk: "高风险", desc: "检测中文环境、UTC+8、浏览器语言、网络节点和支付地区。" }, { name: "香港", risk: "重点检测", desc: "检测香港网络出口、繁体语言、时区和付款地区一致性。" }, { name: "俄罗斯", risk: "高风险", desc: "检测俄语环境、俄罗斯时区、网络出口和订阅可用性。" }],
    privacy: { eyebrow: "Privacy", title: "我们如何保护你的检测隐私？", desc: "CheckCC 只分析完成环境风险评估所需的技术信号，不要求登录 Claude，也不会读取账号敏感内容。", items: [["会上传我的账号数据吗？", "不会。CheckCC 不需要登录 Claude，也不会读取或保存账号、密码、Cookie 等敏感信息。"], ["检测结果会被保存吗？", "不会保存个人检测结果。检测仅用于本次环境风险判断，不会关联你的 Claude 账号。"], ["网站会统计访问数据吗？", "网站仅使用 Google Analytics 统计匿名访问量，用于优化体验，不会收集 Claude 账号或检测报告内容。"], ["检测过程会分析哪些信号？", "主要分析浏览器环境、网络出口、地区画像和设备指纹一致性，用来判断运行环境是否存在封号风险。"]] },
    faq: { title: "Claude 环境检测，封号检测 FAQ", items: zhFaqs },
    footer: { title: "CheckCC 是什么？", desc: "CheckCC.org 是面向 Claude 用户的 AI 环境指纹检测工具，围绕 Claude 环境检测、Claude 封号风险、Claude 运行环境检查、地区画像、网络出口校验和浏览器指纹识别进行综合分析。", infoTitle: "通用信息", domain: "域名：checkcc.org", feature: "功能：Claude 运行环境检测与风险指数报告", note: "说明：检测结果仅供参考，Claude 官方政策与支持地区可能变化" },
    detector: { title: "命中的检测信号", signalCount: (count, done) => done ? `命中${count}个检测信号` : `共展示${count}项`, targetTitle: "选择检测目标", targetDesc: "默认自动检测，也可以指定重点地区。", startCheck: "开始检测", cardTags: ["Claude 环境检测", "Claude 封号风险", "运行环境检查"], loadingText: "正在执行多维度检测...", idleCta: "立即重新检测 Claude 环境", idleReport: "点击检测，生成 Claude 环境风险报告", environmentSuffix: "环境", riskPrefix: "封号风险", close: "关闭" },
  },
  "zh-HK": {
    nav: { projects: "檢測項目", faq: "FAQ", detect: "立即檢測", menu: "選單", close: "關閉", language: "語言" },
    hero: { title: "檢查 Claude 運行環境和封號風險", subtitle: "AI 環境指紋引擎，綜合掃描 Claude 運行環境、地區畫像與帳號風險" },
    logic: { eyebrow: "Detection Logic", title: "檢測原理", desc: "我們把 Claude 運行環境拆成可驗證的外部信號，不依賴單一 IP，而是看語言、時區、網絡、設備和付款環境是否一致。", items: [["01", "環境指紋", "系統時區、UTC 偏移、瀏覽器語言、Intl locale。"], ["02", "網絡畫像", "服務端請求頭、IP 地區、網絡出口和節點一致性。"], ["03", "風險評分", "按 Claude Web、Pro/Max、API、付款風險加權匯總。"]] },
    signals: { eyebrow: "Risk Signals", title: "我們會檢測哪些 Claude 風險信號？", desc: "這些檢測項直接渲染在靜態 HTML 中；實際檢測時會結合瀏覽器端與服務端信號動態評分。", checks: [["地區畫像一致性", "綜合分析本地化環境、區域偏好與訪問來源，判斷是否存在明顯地區信號衝突。"], ["瀏覽器身份畫像", "聯合識別瀏覽器語言、運行時特徵與國際化配置，評估帳號環境是否自然一致。"], ["終端環境指紋", "透過渲染特徵、系統線索與運行時能力，捕捉異常設備環境和偽裝痕跡。"], ["應用容器識別", "識別瀏覽器、App 內 WebView 與特殊訪問容器，判斷是否存在高風險訪問場景。"], ["帳號可信度信號", "結合設備連續性、環境穩定性和國產終端弱信號，評估帳號畫像可信度。"], ["網絡出口可信度", "校驗 IP 歸屬、ASN 網絡組織、邊緣請求頭和代理出口，分析 Claude 訪問風險。"]] },
    regionsTitle: "重點地區檢測",
    regions: [{ name: "中國內地", risk: "高風險", desc: "檢測中文環境、UTC+8、瀏覽器語言、網絡節點和付款地區。" }, { name: "香港", risk: "重點檢測", desc: "檢測香港網絡出口、繁體語言、時區和付款地區一致性。" }, { name: "俄羅斯", risk: "高風險", desc: "檢測俄語環境、俄羅斯時區、網絡出口和訂閱可用性。" }],
    privacy: { eyebrow: "Privacy", title: "我們如何保護你的檢測私隱？", desc: "CheckCC 只分析完成環境風險評估所需的技術信號，不要求登入 Claude，也不會讀取帳號敏感內容。", items: [["會上傳我的帳號資料嗎？", "不會。CheckCC 不需要登入 Claude，也不會讀取或保存帳號、密碼、Cookie 等敏感資訊。"], ["檢測結果會被保存嗎？", "不會保存個人檢測結果。檢測僅用於本次環境風險判斷，不會關聯你的 Claude 帳號。"], ["網站會統計訪問資料嗎？", "網站僅使用 Google Analytics 統計匿名訪問量，用於優化體驗，不會收集 Claude 帳號或檢測報告內容。"], ["檢測過程會分析哪些信號？", "主要分析瀏覽器環境、網絡出口、地區畫像和設備指紋一致性，用來判斷運行環境是否存在封號風險。"]] },
    faq: { title: "Claude 環境檢測，封號檢測 FAQ", items: [["Claude 封號是甚麼原因？", "快速了解常見封號原因，以及環境畫像異常帶來的帳號風險。"], ["Claude 封號原因有哪些？", "梳理 IP、地區、語言、時區、付款方式等常見風險因素。"], ["Claude 封號機制是甚麼？", "從風控信號角度理解帳號限制、異常環境和地區畫像。"], ["Claude 封號後還能解封嗎？", "了解帳號受限後的處理思路，以及申訴前需要確認的環境問題。"], ["Claude 封號會退款嗎？", "了解訂閱受限後的退款可能性、付款渠道和帳號狀態影響。"], ["如何申請 Claude 帳號？", "申請帳號前先確認運行環境，減少註冊、驗證和訂閱異常。"], ["如何申請 Claude API？", "申請 API 前檢查 IP、地區和環境一致性，減少開通風險。"], ["Claude Code 怎麼申請？", "了解 Claude Code 與 Claude Pro 訂閱相關的環境風險。"]] },
    footer: { title: "CheckCC 是甚麼？", desc: "CheckCC.org 是面向 Claude 用戶的 AI 環境指紋檢測工具，圍繞 Claude 環境檢測、封號風險、地區畫像、網絡出口校驗和瀏覽器指紋識別進行綜合分析。", infoTitle: "通用資訊", domain: "域名：checkcc.org", feature: "功能：Claude 運行環境檢測與風險指數報告", note: "說明：檢測結果僅供參考，Claude 官方政策與支援地區可能變化" },
    detector: { title: "命中的檢測信號", signalCount: (count, done) => done ? `命中${count}個檢測信號` : `共展示${count}項`, targetTitle: "選擇檢測目標", targetDesc: "預設自動檢測，也可以指定重點地區。", startCheck: "開始檢測", cardTags: ["Claude 環境檢測", "Claude 封號風險", "運行環境檢查"], loadingText: "正在執行多維度檢測...", idleCta: "立即重新檢測 Claude 環境", idleReport: "點擊檢測，生成 Claude 環境風險報告", environmentSuffix: "環境", riskPrefix: "封號風險", close: "關閉" },
  },
  ru: {
    nav: { projects: "Проверки", faq: "FAQ", detect: "Проверить", menu: "Меню", close: "Закрыть", language: "Язык" },
    hero: { title: "Проверьте среду Claude и риск блокировки", subtitle: "AI-движок цифрового профиля анализирует среду Claude, региональные признаки и риск аккаунта" },
    logic: { eyebrow: "Detection Logic", title: "Как работает проверка", desc: "Мы разделяем среду Claude на проверяемые внешние сигналы: язык, часовой пояс, сеть, устройство и платежный регион.", items: [["01", "Профиль среды", "Часовой пояс, UTC-смещение, язык браузера и Intl locale."], ["02", "Сетевой профиль", "Заголовки запроса, IP-регион, сетевой выход и согласованность узла."], ["03", "Оценка риска", "Сводная оценка рисков Claude Web, Pro/Max, API и оплаты."]] },
    signals: { eyebrow: "Risk Signals", title: "Какие сигналы риска Claude проверяются?", desc: "Эти проверки отображаются в HTML и затем уточняются динамически по сигналам браузера и сервера.", checks: [["Согласованность региона", "Анализ локальной среды, региональных предпочтений и источника доступа для выявления конфликтов."], ["Профиль браузера", "Сопоставление языка браузера, runtime-признаков и Intl-конфигурации для оценки естественности среды."], ["Отпечаток устройства", "Проверка рендеринга, системных признаков и runtime-возможностей для поиска аномалий и маскировки."], ["Контейнер приложения", "Определение браузера, WebView внутри приложений и специальных контейнеров доступа с повышенным риском."], ["Доверие аккаунта", "Оценка непрерывности устройства, стабильности среды и слабых сигналов производителя терминала."], ["Доверие сетевого выхода", "Проверка IP-принадлежности, ASN, edge-заголовков и proxy-выхода для оценки риска доступа к Claude."]] },
    regionsTitle: "Ключевые регионы",
    regions: [{ name: "Китай", risk: "Высокий риск", desc: "Проверка китайской локали, UTC+8, языка браузера, сети и платежного региона." }, { name: "Гонконг", risk: "Проверка", desc: "Проверка сетевого выхода Гонконга, языка, часового пояса и платежного региона." }, { name: "Россия", risk: "Высокий риск", desc: "Проверка русского языка, часового пояса, сети и риска подписки." }],
    privacy: { eyebrow: "Privacy", title: "Как CheckCC защищает приватность проверки?", desc: "CheckCC анализирует только технические сигналы, необходимые для оценки риска среды. Вход в Claude не требуется, содержимое аккаунта не читается.", items: [["Загружаются ли данные моего аккаунта?", "Нет. CheckCC не требует входа в Claude и не читает логин, пароль, Cookie или другие чувствительные данные аккаунта."], ["Сохраняются ли результаты проверки?", "Персональные результаты не сохраняются. Проверка используется только для текущей оценки риска среды и не связывается с аккаунтом Claude."], ["Используется ли аналитика сайта?", "Сайт использует Google Analytics только для анонимной статистики посещений и улучшения опыта, без сбора аккаунтов Claude или содержимого отчетов."], ["Какие сигналы анализируются?", "Браузерная среда, сетевой выход, региональный профиль и согласованность отпечатка устройства для оценки риска блокировки."]] },
    faq: { title: "Claude Environment & Ban Risk FAQ", items: [["Почему аккаунт Claude может быть заблокирован?", "Кратко о частых причинах блокировок и рисках из-за конфликтного профиля среды."], ["Какие причины блокировки встречаются чаще?", "IP, регион, язык, часовой пояс, способ оплаты и другие сигналы риска."], ["Как работает риск-механика Claude?", "Объяснение ограничений аккаунта через сигналы среды, региона и поведения."], ["Можно ли разблокировать аккаунт Claude?", "Что проверить перед обращением в поддержку и как оценить проблемы среды."], ["Возвращают ли деньги после блокировки?", "Что влияет на возврат: подписка, платежный канал и состояние аккаунта."], ["Как зарегистрировать аккаунт Claude?", "Перед регистрацией стоит проверить среду, чтобы снизить риск ошибок проверки и подписки."], ["Как подать заявку на Claude API?", "Перед API-заявкой проверьте IP, регион и согласованность окружения."], ["Как получить Claude Code?", "Кратко о рисках среды для Claude Code и подписки Claude Pro."]] },
    footer: { title: "Что такое CheckCC?", desc: "CheckCC.org — инструмент проверки цифрового профиля среды Claude: региональные признаки, риск блокировки, сетевой выход и браузерный отпечаток.", infoTitle: "Общая информация", domain: "Домен: checkcc.org", feature: "Функция: проверка среды Claude и отчет о риске", note: "Примечание: результаты справочные, политики Claude и поддерживаемые регионы могут меняться" },
    detector: { title: "Найденные сигналы проверки", signalCount: (count, done) => done ? `Найдено ${count} сигналов` : `Показано ${count} пунктов`, targetTitle: "Выберите цель проверки", targetDesc: "По умолчанию используется автоопределение, можно выбрать ключевой регион.", startCheck: "Начать проверку", cardTags: ["Проверка среды Claude", "Риск блокировки Claude", "Проверка окружения"], loadingText: "Выполняется многофакторная проверка...", idleCta: "Повторно проверить среду Claude", idleReport: "Нажмите, чтобы создать отчет о риске среды Claude", environmentSuffix: "среда", riskPrefix: "риск блокировки", close: "Закрыть" },
  },
  en: {
    nav: { projects: "Checks", faq: "FAQ", detect: "Check now", menu: "Menu", close: "Close", language: "Language" },
    hero: { title: "Check your Claude environment and account risk", subtitle: "An AI environment fingerprint engine for scanning Claude runtime signals, regional profiles, and account risk" },
    logic: { eyebrow: "Detection Logic", title: "How CheckCC works", desc: "CheckCC breaks the Claude runtime environment into verifiable external signals. Instead of relying on a single IP address, it checks whether language, timezone, network, device, and payment-region signals are consistent.", items: [["01", "Environment fingerprint", "System timezone, UTC offset, browser language, and Intl locale."], ["02", "Network profile", "Request headers, IP region, network exit, and node consistency."], ["03", "Risk scoring", "Weighted scoring across Claude Web, Pro/Max, API, and payment-related risk."]] },
    signals: { eyebrow: "Risk Signals", title: "Which Claude risk signals does CheckCC inspect?", desc: "These checks are rendered in static HTML for search visibility, then refined dynamically with browser-side and server-side signals during actual detection.", checks: enChecks },
    regionsTitle: "Key regions covered",
    regions: [{ name: "Mainland China", risk: "High risk", desc: "Checks Chinese locale traits, UTC+8 timezone, browser language, network node, and payment-region consistency." }, { name: "Hong Kong", risk: "Focused check", desc: "Checks Hong Kong network exits, Traditional Chinese language traits, timezone, and payment-region consistency." }, { name: "Russia", risk: "High risk", desc: "Checks Russian language traits, Russia timezone, network exit, and subscription availability risk." }],
    privacy: { eyebrow: "Privacy", title: "How does CheckCC protect your privacy?", desc: "CheckCC only analyzes technical signals needed for environment risk evaluation. It does not require Claude login and does not read sensitive account content.", items: [["Will my Claude account data be uploaded?", "No. CheckCC does not require Claude login and does not read or store account names, passwords, cookies, or other sensitive data."], ["Are detection results saved?", "No personal detection results are saved. The check is only used for the current environment risk evaluation and is not linked to your Claude account."], ["Does the website use analytics?", "The website only uses Google Analytics for anonymous traffic statistics and experience improvements. It does not collect Claude account data or report content."], ["Which signals are analyzed?", "CheckCC mainly analyzes browser environment, network exit, regional profile, and device fingerprint consistency to estimate runtime risk."]] },
    faq: { title: "Claude environment and account risk FAQ", items: enFaqs },
    footer: { title: "What is CheckCC?", desc: "CheckCC.org is an AI environment fingerprint checker for Claude users. It analyzes Claude environment signals, account restriction risk, runtime consistency, regional profiles, network exits, and browser fingerprints.", infoTitle: "General information", domain: "Domain: checkcc.org", feature: "Feature: Claude runtime environment check and risk index report", note: "Note: results are for reference only. Claude policies and supported regions may change." },
    detector: { title: "Detected signals", signalCount: (count, done) => done ? `${count} detected signals` : `${count} items shown`, targetTitle: "Select check target", targetDesc: "Auto detection is used by default. You can also select a key region.", startCheck: "Start check", cardTags: ["Claude environment check", "Claude account risk", "Runtime environment scan"], loadingText: "Running multi-factor detection...", idleCta: "Recheck Claude environment now", idleReport: "Click to generate a Claude environment risk report", environmentSuffix: "environment", riskPrefix: "account risk", close: "Close" },
  },
};

export function getLocaleBySlug(slug?: string): LocaleCode | null {
  if (!slug) return defaultLocale;
  return slug === "hong-kong" || slug === "russia" || slug === "en" ? slugToLocale[slug] : null;
}
