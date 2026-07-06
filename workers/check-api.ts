import { evaluateAccess } from "../src/lib/detection/scoring";
import type { IpIntelSource, IpIntelligence, RegionCode } from "../src/lib/detection/types";

const allowedOrigins = new Set([
  "https://checkcc.org",
  "https://www.checkcc.org",
  "http://localhost:3000",
  "http://localhost:7865",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:7865",
]);

function getAllowedOrigin(headers: Headers) {
  const origin = headers.get("origin");
  if (origin && allowedOrigins.has(origin)) return origin;

  const referer = headers.get("referer");
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (allowedOrigins.has(refererOrigin)) return refererOrigin;
    } catch {}
  }

  return null;
}

function corsHeaders(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type, accept-language, user-agent",
    "vary": "Origin",
  };
}

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
const rateLimitWindowMs = 60_000;
const rateLimitMaxRequests = 30;

function isRateLimited(headers: Headers) {
  const ip = getClientIp(headers);
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > rateLimitMaxRequests;
}

function getClientIp(headers: Headers) {
  return headers.get("cf-connecting-ip") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

const ipIntelCache = new Map<string, { value: IpIntelligence; expiresAt: number }>();
const ipIntelCacheTtlMs = 10 * 60_000;

function parseAcceptLanguage(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter(Boolean);
}

function pickRegion(value: string | null): RegionCode {
  if (value === "cn" || value === "ru" || value === "ir" || value === "auto") return value;
  return "auto";
}

async function fetchJson(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1800);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { "user-agent": "CheckCC.org IP intelligence" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1800);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { "user-agent": "CheckCC.org IP intelligence" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function getIpIntelligence(headers: Headers): Promise<IpIntelligence> {
  const cfCountry = headers.get("cf-ipcountry") || null;
  const cfIp = getClientIp(headers);
  const cached = ipIntelCache.get(cfIp);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const sources: IpIntelSource[] = [];

  sources.push({ source: "Cloudflare", status: cfCountry || cfIp ? "ok" as const : "unavailable" as const, ip: cfIp, country: cfCountry, message: cfCountry || cfIp ? null : "未提供边缘网络 IP 头" });

  const tasks: Array<Promise<IpIntelSource>> = [
    fetchJson("https://ipapi.co/json/").then((data) => ({ source: "ipapi.co", status: "ok" as const, ip: data.ip, country: data.country_name || data.country, region: data.region, city: data.city, asn: data.asn, isp: data.org, org: data.org, latitude: data.latitude, longitude: data.longitude, networkType: data.version ? `IPv${data.version}` : null })).catch(() => ({ source: "ipapi.co", status: "unavailable" as const, message: "数据源暂不可用" })),
    fetchJson("https://ipwho.is/").then((data) => data.success === false ? { source: "ipwho.is", status: "unavailable" as const, message: data.message || "数据源暂不可用" } : { source: "ipwho.is", status: "ok" as const, ip: data.ip, country: data.country, region: data.region, city: data.city, asn: data.connection?.asn ? `AS${data.connection.asn}` : null, isp: data.connection?.isp, org: data.connection?.org, latitude: data.latitude, longitude: data.longitude }).catch(() => ({ source: "ipwho.is", status: "unavailable" as const, message: "数据源暂不可用" })),
    fetchJson("https://api.ip.sb/geoip").then((data) => ({ source: "api.ip.sb", status: "ok" as const, ip: data.ip, country: data.country, region: data.region, city: data.city, asn: data.asn ? `AS${data.asn}` : null, isp: data.isp, org: data.organization })).catch(() => ({ source: "api.ip.sb", status: "unavailable" as const, message: "数据源暂不可用" })),
    fetchText("https://ping0.cc/geo").then((text) => {
      const raw = text.trim();
      const lines = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
      if (lines.length >= 4) {
        const [ip, location, asn, org] = lines;
        return { source: "ping0.cc", status: "ok" as const, ip, country: location, region: null, city: null, asn, isp: org, org };
      }
      const match = raw.match(/^(\S+)\s+(.+?)\s+(AS\d+)\s+(.+)$/);
      if (!match) throw new Error("Unexpected ping0 response");
      const [, ip, location, asn, org] = match;
      return { source: "ping0.cc", status: "ok" as const, ip, country: location, region: null, city: null, asn, isp: org, org };
    }).catch(() => ({ source: "ping0.cc", status: "unavailable" as const, message: "数据源暂不可用" })),
  ];
  sources.push(...(await Promise.all(tasks)));

  const okSources = sources.filter((item) => item.status === "ok");
  const countries = [...new Set(okSources.map((item) => item.country).filter(Boolean).map((item) => String(item).toUpperCase()))];
  const detectedCountry = okSources.find((item) => item.country)?.country ?? null;
  const detectedIp = okSources.find((item) => item.ip)?.ip ?? null;
  const detectedAsn = okSources.find((item) => item.asn)?.asn ?? null;
  const warnings: string[] = [];
  if (countries.some((item) => item === "CN" || item.includes("CHINA") || item.includes("中国"))) warnings.push("检测到中国大陆 IP，Claude 访问和订阅风险极高");
  if (countries.length > 1) warnings.push("多源 IP 国家结果不一致，建议复核代理出口");
  if (okSources.length === 0) warnings.push("IP 情报源全部暂不可用，本次不因 IP 情报失败扣分");

  const value = {
    summary: okSources.length ? `已完成 ${okSources.length}/${sources.length} 个 IP 情报源检测` : "IP 情报暂不可用",
    sources,
    consistentCountry: okSources.length > 1 ? countries.length <= 1 : null,
    detectedIp,
    detectedCountry,
    detectedAsn,
    warnings,
  };
  ipIntelCache.set(cfIp, { value, expiresAt: Date.now() + ipIntelCacheTtlMs });
  return value;
}

function json(data: unknown, origin: string, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders(origin), ...init?.headers },
  });
}

function text(value: unknown) {
  return value == null || value === "" ? null : String(value);
}

function classifyNetworkType(source?: IpIntelSource) {
  const raw = `${source?.asn ?? ""} ${source?.isp ?? ""} ${source?.org ?? ""}`.toLowerCase();
  if (/vpn|proxy|privacy|anonymous/.test(raw)) return "VPN / 代理网络";
  if (/cloud|hosting|host|data ?center|datacenter|server|vps|colo|aws|amazon|google|microsoft|azure|oracle|digitalocean|hetzner|ovh|m247|linode|akamai/.test(raw)) return "数据中心 / 云厂商";
  if (/mobile|wireless|cellular|通信|移动|unicom|telecom|cmcc|china mobile|china unicom|china telecom/.test(raw)) return "移动 / 运营商网络";
  if (/broadband|residential|cable|fiber|fibre|宽带|家宽/.test(raw)) return "家庭宽带";
  return source ? "普通运营商 / 企业网络" : null;
}

function getEdgeSignals(req: Request, ipIntelligence: IpIntelligence) {
  const cf = (req as Request & { cf?: Record<string, unknown> }).cf ?? {};
  const headers = req.headers;
  const primarySource = ipIntelligence.sources.find((source) => source.status === "ok" && (source.asn || source.isp || source.org));
  const acceptLanguage = headers.get("accept-language");
  const secFetchMode = headers.get("sec-fetch-mode");
  const secFetchSite = headers.get("sec-fetch-site");
  const secFetchDest = headers.get("sec-fetch-dest");
  const secChUa = headers.get("sec-ch-ua");
  const secChPlatform = headers.get("sec-ch-ua-platform");
  const headerCompleteness = [headers.get("user-agent"), acceptLanguage, secFetchMode, secFetchSite, secFetchDest, secChUa, secChPlatform].filter(Boolean).length;
  const headerLevel = headerCompleteness >= 6 ? "完整浏览器请求链路" : headerCompleteness >= 4 ? "基础浏览器请求链路" : "请求头完整性偏低";
  const countries = [...new Set(ipIntelligence.sources.filter((source) => source.status === "ok" && source.country).map((source) => String(source.country).toUpperCase()))];
  const consistency = ipIntelligence.consistentCountry === true ? "Cloudflare 与多源 IP 情报一致" : ipIntelligence.consistentCountry === false ? "Cloudflare 与第三方 IP 情报存在冲突" : "多源 IP 情报不足";

  return [
    { id: "edgeCountry", label: "边缘访问国家", value: text(cf.country) || ipIntelligence.detectedCountry, score: 0, weight: 0, contribution: 0, source: "server" as const },
    { id: "edgeColo", label: "Cloudflare 边缘机房", value: text(cf.colo), score: 0, weight: 0, contribution: 0, source: "server" as const },
    { id: "edgeCity", label: "边缘访问城市", value: text(cf.city), score: 0, weight: 0, contribution: 0, source: "server" as const },
    { id: "edgeAsn", label: "边缘 ASN", value: text(cf.asn) || ipIntelligence.detectedAsn, score: 0, weight: 0, contribution: 0, source: "server" as const },
    { id: "edgeAsOrganization", label: "边缘网络组织", value: text(cf.asOrganization) || primarySource?.org || primarySource?.isp || null, score: 0, weight: 0, contribution: 0, source: "server" as const },
    { id: "requestHeaderIntegrity", label: "请求头完整性", value: headerLevel, score: headerCompleteness >= 4 ? 0 : 8, weight: 8, contribution: headerCompleteness >= 4 ? 0 : 8, source: "server" as const },
    { id: "acceptLanguageHeader", label: "HTTP 语言偏好", value: acceptLanguage, score: 0, weight: 0, contribution: 0, source: "server" as const },
    { id: "secFetchProfile", label: "Sec-Fetch 访问画像", value: [secFetchSite, secFetchMode, secFetchDest].filter(Boolean).join(" / ") || null, score: 0, weight: 0, contribution: 0, source: "server" as const },
    { id: "clientHintsProfile", label: "Client Hints 画像", value: [secChUa, secChPlatform].filter(Boolean).join(" / ") || null, score: 0, weight: 0, contribution: 0, source: "server" as const },
    { id: "networkExitType", label: "网络出口类型", value: classifyNetworkType(primarySource), score: classifyNetworkType(primarySource)?.includes("数据中心") ? 8 : 0, weight: 8, contribution: classifyNetworkType(primarySource)?.includes("数据中心") ? 8 : 0, source: "server" as const },
    { id: "ipIntelConsistency", label: "多源 IP 情报一致性", value: consistency, score: ipIntelligence.consistentCountry === false ? 10 : 0, weight: 10, contribution: ipIntelligence.consistentCountry === false ? 10 : 0, source: "server" as const },
    { id: "ipIntelSourceCount", label: "IP 情报源数量", value: `${ipIntelligence.sources.filter((source) => source.status === "ok").length}/${ipIntelligence.sources.length}`, score: 0, weight: 0, contribution: 0, source: "server" as const },
    { id: "ipCountrySet", label: "多源国家集合", value: countries.join(" / ") || null, score: 0, weight: 0, contribution: 0, source: "server" as const },
  ].filter((signal) => signal.value);
}

const worker = {
  async fetch(req: Request) {
    const allowedOrigin = getAllowedOrigin(req.headers);
    if (!allowedOrigin) return new Response("Forbidden", { status: 403 });
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders(allowedOrigin) });
    if (req.method !== "GET") return json({ error: "Method Not Allowed" }, allowedOrigin, { status: 405 });
    if (isRateLimited(req.headers)) return json({ error: "Too Many Requests" }, allowedOrigin, { status: 429 });

    const url = new URL(req.url);
    const region = pickRegion(url.searchParams.get("region"));
    const headers = req.headers;
    const ipIntelligence = await getIpIntelligence(headers);
    const country = headers.get("cf-ipcountry") || null;
    const timezone = null;
    const userAgent = headers.get("user-agent") || null;
    const languages = parseAcceptLanguage(headers.get("accept-language"));

    const result = evaluateAccess({
      region,
      country,
      timezone,
      languages,
      locale: languages[0] ?? null,
      userAgent,
      source: "server",
    });
    const edgeSignals = getEdgeSignals(req, ipIntelligence);
    const chinaIpRisk = ipIntelligence.warnings.some((item) => item.includes("中国大陆 IP"));
    const adjustedResult = chinaIpRisk
      ? {
          ...result,
          score: Math.max(result.score, 88),
          status: "restricted" as const,
          matchedRegion: "cn" as const,
          signals: [
            ...result.signals,
            ...edgeSignals,
            { id: "ipCountryRisk", label: "IP 风险国家", value: "中国大陆 IP", score: 28, weight: 28, contribution: 28, source: "server" as const },
            { id: "claudeAccessRisk", label: "Claude 访问风险", value: "访问和订阅风险极高", score: 20, weight: 20, contribution: 20, source: "server" as const },
          ],
        }
      : { ...result, signals: [...result.signals, ...edgeSignals] };

    return json({
      app: "Check Claude",
      domain: "checkcc.org",
      region,
      detectedCountry: country,
      detectedTimezone: timezone,
      ipIntelligence,
      disclaimer: "检测结果仅供参考。Claude 可用性、订阅和 API 支持状态可能随官方政策变化。付款前请再次确认官方支持列表。",
      ...adjustedResult,
    }, allowedOrigin);
  },
};

export default worker;
