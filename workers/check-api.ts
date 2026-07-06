import { evaluateAccess } from "../src/lib/detection/scoring";
import type { IpIntelSource, IpIntelligence, RegionCode } from "../src/lib/detection/types";

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type, accept-language, user-agent",
};

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
  const cfIp = headers.get("cf-connecting-ip") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
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

  return {
    summary: okSources.length ? `已完成 ${okSources.length}/${sources.length} 个 IP 情报源检测` : "IP 情报暂不可用",
    sources,
    consistentCountry: okSources.length > 1 ? countries.length <= 1 : null,
    detectedIp,
    detectedCountry,
    detectedAsn,
    warnings,
  };
}

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders, ...init?.headers },
  });
}

export default {
  async fetch(req: Request) {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (req.method !== "GET") return json({ error: "Method Not Allowed" }, { status: 405 });

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
    const chinaIpRisk = ipIntelligence.warnings.some((item) => item.includes("中国大陆 IP"));
    const adjustedResult = chinaIpRisk
      ? {
          ...result,
          score: Math.max(result.score, 88),
          status: "restricted" as const,
          matchedRegion: "cn" as const,
          signals: [
            ...result.signals,
            { id: "ipCountryRisk", label: "IP 风险国家", value: "中国大陆 IP", score: 28, weight: 28, contribution: 28, source: "server" as const },
            { id: "claudeAccessRisk", label: "Claude 访问风险", value: "访问和订阅风险极高", score: 20, weight: 20, contribution: 20, source: "server" as const },
          ],
        }
      : result;

    return json({
      app: "Check Claude",
      domain: "checkcc.org",
      region,
      detectedCountry: country,
      detectedTimezone: timezone,
      ipIntelligence,
      disclaimer: "检测结果仅供参考。Claude 可用性、订阅和 API 支持状态可能随官方政策变化。付款前请再次确认官方支持列表。",
      ...adjustedResult,
    });
  },
};
