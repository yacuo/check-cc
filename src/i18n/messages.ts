export type LocaleCode = "zh" | "zh-HK" | "ru";
export type LocaleSlug = "hong-kong" | "russia";

export type Messages = {
  nav: { projects: string; faq: string; tutorials: string; detect: string; menu: string; close: string; language: string };
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
    shareAfter: (seconds: number) => string;
    shareReport: string;
    shareReady: string;
    shareHint: string;
    generatingPoster: string;
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
};

export const slugToLocale: Record<LocaleSlug, LocaleCode> = {
  "hong-kong": "zh-HK",
  russia: "ru",
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
  ["Claude 封号是什么原因造成的？", "Claude 封号常见原因包括 IP 地区异常、浏览器语言和系统时区不一致、账号地区与支付地区冲突、频繁切换节点、设备环境异常或浏览器指纹不稳定。检测 Claude 运行环境可以提前发现 IP、时区、语言、设备和网络出口是否冲突。"],
  ["Claude 封号机制和环境检测有什么关系？", "Claude 封号机制不会公开具体规则，但环境画像通常会参考登录地区、网络出口、系统时区、浏览器语言、设备指纹和支付地区等信号。Claude 环境检测可以把这些信号拆开查看，帮助判断当前环境是否容易触发封禁、风控或订阅限制。"],
  ["Claude 封账号后还能解封或解除限制吗？", "Claude 封账号、封禁或限制是否能解除，取决于 Anthropic 官方审核和账号状态。用户可以尝试官方申诉，但在重新登录、申请新账号或继续使用前，建议先检测当前环境，避免 IP、地区、语言和设备继续保持高风险状态。"],
  ["Claude 封号会退款吗？可以申请退款吗？", "Claude 封号是否退款、Claude Pro 或 Max 订阅能否申请退款，取决于官方政策、付款渠道和账号状态。检测工具不能承诺退款结果，但可以帮助判断封号前后是否存在环境冲突，方便用户整理封号原因、退款申请或申诉材料。"],
  ["Claude 封号后怎么申诉？", "Claude 封号申诉通常需要通过官方渠道说明账号用途、登录环境、付款信息和异常情况。申诉前可以先记录检测报告，查看 IP 国家、网络组织、浏览器语言、系统时区、设备线索和 Claude 访问风险，避免只描述结果而缺少环境证据。"],
  ["如何申请 Claude 账号？申请前要检测环境吗？", "申请 Claude 账号前建议先检测环境。很多申请失败、无法注册、手机号或邮箱验证异常，可能和地区、网络出口、浏览器语言、系统时区或设备环境有关。先确认环境画像一致，再进行 Claude 申请、账号注册或订阅，会更稳妥。"],
  ["如何申请 Claude API？为什么要先检查 IP 和地区环境？", "申请 Claude API 时，账号地区、网络出口、付款方式和使用环境都可能影响可用性。如何申请 Claude API 不只是提交资料，还需要确认当前 IP、地区、时区和浏览器环境是否稳定，避免 API 申请、开通或后续调用时出现限制。"],
  ["Claude Code 申请和 Claude Pro 订阅有什么环境风险？", "Claude Code 申请、Claude Pro 订阅和 Max 升级都依赖账号地区、支付地区和运行环境的一致性。如果环境显示高风险，比如中国大陆 IP、时区语言冲突或频繁切换节点，可能增加订阅失败、账号限制或封号风险。"],
];

export const messages: Record<LocaleCode, Messages> = {
  zh: {
    nav: { projects: "检测项目", faq: "FAQ", tutorials: "Claude 教程中心", detect: "立即检测", menu: "菜单", close: "关闭", language: "语言" },
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
    footer: { title: "CheckCC.org 是什么？", desc: "CheckCC.org 是面向 Claude 用户的 AI 环境指纹检测工具，围绕 Claude 环境检测、Claude 封号风险、Claude 运行环境检查、地区画像、网络出口校验和浏览器指纹识别进行综合分析。", infoTitle: "通用信息", domain: "域名：checkcc.org", feature: "功能：Claude 运行环境检测与风险指数报告", note: "说明：检测结果仅供参考，Claude 官方政策与支持地区可能变化" },
    detector: { title: "命中的检测信号", signalCount: (count, done) => done ? `命中${count}个检测信号` : `共展示${count}项`, shareAfter: (seconds) => `${seconds} 秒后打开分享报告`, shareReport: "分享检测报告", shareReady: "检测完成后可分享", shareHint: "检查后，把检查报告：分享到朋友圈，让朋友少踩 Claude 封号的坑", generatingPoster: "检测完成，正在生成朋友圈分享海报...", targetTitle: "选择检测目标", targetDesc: "默认自动检测，也可以指定重点地区。", startCheck: "开始检测", cardTags: ["Claude 环境检测", "Claude 封号风险", "运行环境检查"], loadingText: "正在执行多维度检测...", idleCta: "立即重新检测 Claude 环境", idleReport: "点击检测，生成 Claude 环境风险报告", environmentSuffix: "环境", riskPrefix: "封号风险", close: "关闭" },
  },
  "zh-HK": {
    nav: { projects: "檢測項目", faq: "FAQ", tutorials: "Claude 教程中心", detect: "立即檢測", menu: "選單", close: "關閉", language: "語言" },
    hero: { title: "檢查 Claude 運行環境和封號風險", subtitle: "AI 環境指紋引擎，綜合掃描 Claude 運行環境、地區畫像與帳號風險" },
    logic: { eyebrow: "Detection Logic", title: "檢測原理", desc: "我們把 Claude 運行環境拆成可驗證的外部信號，不依賴單一 IP，而是看語言、時區、網絡、設備和付款環境是否一致。", items: [["01", "環境指紋", "系統時區、UTC 偏移、瀏覽器語言、Intl locale。"], ["02", "網絡畫像", "服務端請求頭、IP 地區、網絡出口和節點一致性。"], ["03", "風險評分", "按 Claude Web、Pro/Max、API、付款風險加權匯總。"]] },
    signals: { eyebrow: "Risk Signals", title: "我們會檢測哪些 Claude 風險信號？", desc: "這些檢測項直接渲染在靜態 HTML 中；實際檢測時會結合瀏覽器端與服務端信號動態評分。", checks: [["地區畫像一致性", "綜合分析本地化環境、區域偏好與訪問來源，判斷是否存在明顯地區信號衝突。"], ["瀏覽器身份畫像", "聯合識別瀏覽器語言、運行時特徵與國際化配置，評估帳號環境是否自然一致。"], ["終端環境指紋", "透過渲染特徵、系統線索與運行時能力，捕捉異常設備環境和偽裝痕跡。"], ["應用容器識別", "識別瀏覽器、App 內 WebView 與特殊訪問容器，判斷是否存在高風險訪問場景。"], ["帳號可信度信號", "結合設備連續性、環境穩定性和國產終端弱信號，評估帳號畫像可信度。"], ["網絡出口可信度", "校驗 IP 歸屬、ASN 網絡組織、邊緣請求頭和代理出口，分析 Claude 訪問風險。"]] },
    regionsTitle: "重點地區檢測",
    regions: [{ name: "中國內地", risk: "高風險", desc: "檢測中文環境、UTC+8、瀏覽器語言、網絡節點和付款地區。" }, { name: "香港", risk: "重點檢測", desc: "檢測香港網絡出口、繁體語言、時區和付款地區一致性。" }, { name: "俄羅斯", risk: "高風險", desc: "檢測俄語環境、俄羅斯時區、網絡出口和訂閱可用性。" }],
    privacy: { eyebrow: "Privacy", title: "我們如何保護你的檢測私隱？", desc: "CheckCC 只分析完成環境風險評估所需的技術信號，不要求登入 Claude，也不會讀取帳號敏感內容。", items: [["會上傳我的帳號資料嗎？", "不會。CheckCC 不需要登入 Claude，也不會讀取或保存帳號、密碼、Cookie 等敏感資訊。"], ["檢測結果會被保存嗎？", "不會保存個人檢測結果。檢測僅用於本次環境風險判斷，不會關聯你的 Claude 帳號。"], ["網站會統計訪問資料嗎？", "網站僅使用 Google Analytics 統計匿名訪問量，用於優化體驗，不會收集 Claude 帳號或檢測報告內容。"], ["檢測過程會分析哪些信號？", "主要分析瀏覽器環境、網絡出口、地區畫像和設備指紋一致性，用來判斷運行環境是否存在封號風險。"]] },
    faq: { title: "Claude 環境檢測 FAQ", items: [["Claude 環境檢測能檢測甚麼？", "可以檢測瀏覽器語言、系統時區、Intl locale、User-Agent、網絡地區估算、可用地區風險和付款風險。"], ["這個工具能判斷 Claude 會不會封號嗎？", "不能給出官方結論，但可以根據地區限制、網絡節點、瀏覽器環境和付款地區衝突提示風險。"], ["為甚麼開通 Claude Pro 前要檢測？", "如果國家/地區、網絡出口或付款方式不被支援，可能出現付款失敗或訂閱後不可用。"], ["檢測結果會上傳嗎？", "瀏覽器環境檢測優先在本地執行，服務端接口只用於估算請求頭、IP 國家和時區。"], ["檢測後應該怎樣看風險？", "低風險代表異常特徵較少；高風險代表地區畫像、網絡出口或設備環境存在明顯衝突。"], ["已經在使用 Claude 還需要檢測嗎？", "需要。切換節點、時區、設備、瀏覽器語言或帳號地區後，環境畫像可能變化。"]] },
    footer: { title: "CheckCC.org 是甚麼？", desc: "CheckCC.org 是面向 Claude 用戶的 AI 環境指紋檢測工具，圍繞 Claude 環境檢測、封號風險、地區畫像、網絡出口校驗和瀏覽器指紋識別進行綜合分析。", infoTitle: "通用資訊", domain: "域名：checkcc.org", feature: "功能：Claude 運行環境檢測與風險指數報告", note: "說明：檢測結果僅供參考，Claude 官方政策與支援地區可能變化" },
    detector: { title: "命中的檢測信號", signalCount: (count, done) => done ? `命中${count}個檢測信號` : `共展示${count}項`, shareAfter: (seconds) => `${seconds} 秒後打開分享報告`, shareReport: "分享檢測報告", shareReady: "檢測完成後可分享", shareHint: "檢查後，把檢查報告分享到朋友圈，讓朋友少踩 Claude 封號的坑", generatingPoster: "檢測完成，正在生成朋友圈分享海報...", targetTitle: "選擇檢測目標", targetDesc: "預設自動檢測，也可以指定重點地區。", startCheck: "開始檢測", cardTags: ["Claude 環境檢測", "Claude 封號風險", "運行環境檢查"], loadingText: "正在執行多維度檢測...", idleCta: "立即重新檢測 Claude 環境", idleReport: "點擊檢測，生成 Claude 環境風險報告", environmentSuffix: "環境", riskPrefix: "封號風險", close: "關閉" },
  },
  ru: {
    nav: { projects: "Проверки", faq: "FAQ", tutorials: "Центр Claude", detect: "Проверить", menu: "Меню", close: "Закрыть", language: "Язык" },
    hero: { title: "Проверьте среду Claude и риск блокировки", subtitle: "AI-движок цифрового профиля анализирует среду Claude, региональные признаки и риск аккаунта" },
    logic: { eyebrow: "Detection Logic", title: "Как работает проверка", desc: "Мы разделяем среду Claude на проверяемые внешние сигналы: язык, часовой пояс, сеть, устройство и платежный регион.", items: [["01", "Профиль среды", "Часовой пояс, UTC-смещение, язык браузера и Intl locale."], ["02", "Сетевой профиль", "Заголовки запроса, IP-регион, сетевой выход и согласованность узла."], ["03", "Оценка риска", "Сводная оценка рисков Claude Web, Pro/Max, API и оплаты."]] },
    signals: { eyebrow: "Risk Signals", title: "Какие сигналы риска Claude проверяются?", desc: "Эти проверки отображаются в HTML и затем уточняются динамически по сигналам браузера и сервера.", checks: [["Согласованность региона", "Анализ локальной среды, региональных предпочтений и источника доступа для выявления конфликтов."], ["Профиль браузера", "Сопоставление языка браузера, runtime-признаков и Intl-конфигурации для оценки естественности среды."], ["Отпечаток устройства", "Проверка рендеринга, системных признаков и runtime-возможностей для поиска аномалий и маскировки."], ["Контейнер приложения", "Определение браузера, WebView внутри приложений и специальных контейнеров доступа с повышенным риском."], ["Доверие аккаунта", "Оценка непрерывности устройства, стабильности среды и слабых сигналов производителя терминала."], ["Доверие сетевого выхода", "Проверка IP-принадлежности, ASN, edge-заголовков и proxy-выхода для оценки риска доступа к Claude."]] },
    regionsTitle: "Ключевые регионы",
    regions: [{ name: "Китай", risk: "Высокий риск", desc: "Проверка китайской локали, UTC+8, языка браузера, сети и платежного региона." }, { name: "Гонконг", risk: "Проверка", desc: "Проверка сетевого выхода Гонконга, языка, часового пояса и платежного региона." }, { name: "Россия", risk: "Высокий риск", desc: "Проверка русского языка, часового пояса, сети и риска подписки." }],
    privacy: { eyebrow: "Privacy", title: "Как CheckCC защищает приватность проверки?", desc: "CheckCC анализирует только технические сигналы, необходимые для оценки риска среды. Вход в Claude не требуется, содержимое аккаунта не читается.", items: [["Загружаются ли данные моего аккаунта?", "Нет. CheckCC не требует входа в Claude и не читает логин, пароль, Cookie или другие чувствительные данные аккаунта."], ["Сохраняются ли результаты проверки?", "Персональные результаты не сохраняются. Проверка используется только для текущей оценки риска среды и не связывается с аккаунтом Claude."], ["Используется ли аналитика сайта?", "Сайт использует Google Analytics только для анонимной статистики посещений и улучшения опыта, без сбора аккаунтов Claude или содержимого отчетов."], ["Какие сигналы анализируются?", "Браузерная среда, сетевой выход, региональный профиль и согласованность отпечатка устройства для оценки риска блокировки."]] },
    faq: { title: "FAQ по проверке среды Claude", items: [["Что проверяет этот инструмент?", "Язык браузера, часовой пояс, Intl locale, User-Agent, сетевой регион, риск доступности Claude и оплаты."], ["Можно ли точно определить риск блокировки?", "Нет. Это не официальный вывод, а оценка по региону, сети, браузеру и платежным признакам."], ["Зачем проверять перед Claude Pro?", "Неподдерживаемый регион, сеть или способ оплаты могут привести к ошибке оплаты или недоступности подписки."], ["Данные отправляются?", "Проверка браузера выполняется локально. Сервер нужен только для оценки заголовков, IP и часового пояса."], ["Как читать результат?", "Низкий риск означает меньше конфликтов; высокий риск означает явный конфликт региона, сети или устройства."], ["Нужно ли проверять повторно?", "Да. При смене узла, часового пояса, устройства, языка или региона аккаунта профиль может измениться."]] },
    footer: { title: "Что такое CheckCC.org?", desc: "CheckCC.org — инструмент проверки цифрового профиля среды Claude: региональные признаки, риск блокировки, сетевой выход и браузерный отпечаток.", infoTitle: "Общая информация", domain: "Домен: checkcc.org", feature: "Функция: проверка среды Claude и отчет о риске", note: "Примечание: результаты справочные, политики Claude и поддерживаемые регионы могут меняться" },
    detector: { title: "Найденные сигналы проверки", signalCount: (count, done) => done ? `Найдено ${count} сигналов` : `Показано ${count} пунктов`, shareAfter: (seconds) => `Открыть отчет через ${seconds} сек.`, shareReport: "Поделиться отчетом", shareReady: "Можно поделиться после проверки", shareHint: "После проверки поделитесь отчетом, чтобы другие избежали риска блокировки Claude", generatingPoster: "Проверка завершена, создается постер отчета...", targetTitle: "Выберите цель проверки", targetDesc: "По умолчанию используется автоопределение, можно выбрать ключевой регион.", startCheck: "Начать проверку", cardTags: ["Проверка среды Claude", "Риск блокировки Claude", "Проверка окружения"], loadingText: "Выполняется многофакторная проверка...", idleCta: "Повторно проверить среду Claude", idleReport: "Нажмите, чтобы создать отчет о риске среды Claude", environmentSuffix: "среда", riskPrefix: "риск блокировки", close: "Закрыть" },
  },
};

export function getLocaleBySlug(slug?: string): LocaleCode | null {
  if (!slug) return defaultLocale;
  return slug === "hong-kong" || slug === "russia" ? slugToLocale[slug] : null;
}
