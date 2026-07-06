export type BlogSidebarCard = {
  title: string;
  description: string;
};

export type BlogSidebarConfig = {
  title: string;
  description: string;
  cards: BlogSidebarCard[];
};

export const defaultBlogSidebarConfig: BlogSidebarConfig = {
  title: "Claude 环境风险检测",
  description: "从账号环境、网络出口、浏览器画像和订阅支付维度检查 Claude 风险。",
  cards: [
    { title: "Claude 环境风险检测", description: "检查地区画像、网络出口和账号可信度风险" },
    { title: "Claude 封号风险检测", description: "排查账号受限、风控命中和封禁前异常信号" },
    { title: "Claude 订阅风险检测", description: "分析 Pro、Max 和付款地区是否存在冲突" },
  ],
};

export const blogSidebarConfigs: Record<string, BlogSidebarConfig> = {
  "claude-feng-hao": {
    title: "Claude 封号风险检测",
    description: "围绕封号原因、风控命中和环境画像，排查 Claude 账号受限风险。",
    cards: [
      { title: "Claude 封号风险检测", description: "排查封号前的地区画像、网络出口和账号可信度异常" },
      { title: "Claude 风控信号检测", description: "识别可能触发账号限制的环境画像冲突" },
      { title: "Claude 高风险环境判断", description: "检查 IP、浏览器身份画像和设备指纹稳定性" },
    ],
  },
  "claude-feng-hao-yuan-yin": {
    title: "Claude 封号原因排查",
    description: "针对账号为什么被限制，检查 IP 出口、地区信号和浏览器环境冲突。",
    cards: [
      { title: "Claude 封号原因排查", description: "定位 IP 出口、地区信号和浏览器环境冲突" },
      { title: "Claude 账号限制检测", description: "判断账号为什么被限制以及当前环境是否高风险" },
    ],
  },
  "claude-feng-hao-ji-zhi": {
    title: "Claude 风控机制检测",
    description: "从 Claude 风控规则、异常环境判断和账号可信度维度识别风险。",
    cards: [
      { title: "Claude 风控机制检测", description: "分析账号环境画像是否命中异常访问特征" },
      { title: "Claude 异常环境判断", description: "检查地区信号、网络出口和设备指纹是否一致" },
      { title: "Claude 账号可信度评估", description: "识别可能影响风控判断的多维风险信号" },
    ],
  },
  "claude-feng-hao-jie-feng": {
    title: "Claude 解封前环境检测",
    description: "申诉或重新登录前，先确认当前账号环境是否仍有高风险信号。",
    cards: [
      { title: "Claude 解封前环境检测", description: "申诉前先排查 IP、地区画像和账号风险" },
      { title: "Claude 账号受限恢复检测", description: "判断当前环境是否仍可能触发限制" },
    ],
  },
  "claude-feng-hao-tui-kuan": {
    title: "Claude 退款与订阅风险检测",
    description: "复盘封号、订阅支付和付款地区冲突，为退款申请整理环境线索。",
    cards: [
      { title: "Claude 退款前风险复盘", description: "整理封号、订阅和付款地区冲突线索" },
      { title: "Claude Pro 订阅风险检测", description: "检查付款环境、账号地区和访问来源是否一致" },
      { title: "Claude 封号申诉辅助检测", description: "记录账号受限前后的环境画像证据" },
    ],
  },
  "claude-shen-qing": {
    title: "Claude 账号申请前检测",
    description: "注册 Claude 前，先检查网络出口、地区画像和浏览器身份是否稳定。",
    cards: [
      { title: "Claude 账号申请前检测", description: "注册前确认网络出口、地区画像和浏览器环境" },
      { title: "Claude 注册环境检测", description: "降低申请失败、验证异常和后续受限风险" },
    ],
  },
  "claude-api-shen-qing": {
    title: "Claude API 申请环境检测",
    description: "围绕账号地区、付款方式和调用环境，排查 API 开通与可用性风险。",
    cards: [
      { title: "Claude API 申请环境检测", description: "检查账号地区、付款方式和调用环境风险" },
      { title: "Claude API 可用性检测", description: "排查开通后不可用、调用受限和地区冲突" },
      { title: "Claude 开发者环境评估", description: "分析服务端出口、账号状态和 API 风险信号" },
    ],
  },
  "claude-code-shen-qing": {
    title: "Claude Code 环境检测",
    description: "检查开发设备、终端代理、账号授权和 Claude Pro 订阅环境风险。",
    cards: [
      { title: "Claude Code 环境检测", description: "检查开发设备、终端代理和账号授权风险" },
      { title: "Claude Pro 订阅环境检测", description: "判断订阅地区、付款方式和网络出口是否冲突" },
    ],
  },
};

export function getBlogSidebarConfig(slug?: string) {
  return slug ? blogSidebarConfigs[slug] ?? defaultBlogSidebarConfig : defaultBlogSidebarConfig;
}
