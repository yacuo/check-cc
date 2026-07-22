"use client";

// CheckCC 的浏览器端检测组件，用于执行环境扫描、展示风险信号、进度状态和检测结果。
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { CheckResponse, SignalResult } from "@/detection/types";
import {
  animateProgress,
  defaultSignals,
  isPublicIp,
  localizeSignalValue,
  normalizeRegion,
  regions,
  scanSteps,
  signalsScore,
  sleep,
  type BrowserIpIntel,
  type SignalView,
} from "@/detection/client-engine";
import { detectorLocaleText, localizeLocation, type DetectorLocaleText, type TargetRegion } from "@/detection/locale";
import { detectionConfig } from "@/detection/config";
import { runDetection, type DetectionRunResult } from "@/detection/runner";
import { messages, type LocaleCode } from "@/i18n/messages";

type Props = { lang?: "zh" | "en"; locale?: LocaleCode };

function ScoreRing({ score, checked, text }: { score: number; checked: boolean; text: DetectorLocaleText }) {
  const deg = checked ? Math.max(0, Math.min(100, score)) * 3.6 : 0;
  const ringColor = !checked ? "#d6d3d1" : score === 0 ? "#059669" : score >= 70 ? "#dc2626" : score >= 31 ? "#d97757" : "#f59e0b";
  return (
    <div className="relative grid size-44 place-items-center rounded-full bg-white shadow-2xl shadow-red-950/10" style={{ background: `conic-gradient(${ringColor} ${deg}deg, #e7e5df 0deg)` }}>
      <div className="grid h-[8.5rem] w-[8.5rem] place-items-center rounded-full bg-white shadow-inner">
        <div className="text-center">
          <div className="text-5xl font-black text-[#0b1220]">{checked ? `${score}%` : "--"}</div>
          <div className="text-xs font-bold tracking-[0.2em] text-stone-500">{checked ? text.risk.blocked : text.risk.waiting}</div>
        </div>
      </div>
    </div>
  );
}

function signalTone(signal: SignalView) {
  if (signal.state === "pending") return "border-stone-200 bg-stone-50 text-stone-400";
  if (signal.state === "running") return "border-sky-300 bg-sky-50 text-sky-700 shadow-md shadow-sky-900/10";
  if (signal.contribution > 0) return "border-red-500 bg-red-600 text-white shadow-lg shadow-red-900/30 [animation:risk-card-pulse_1.2s_ease-in-out_infinite]";
  return "border-emerald-300 bg-emerald-50 text-emerald-700";
}

function signalLabelTone(signal: SignalView) {
  return signal.contribution > 0 && signal.state === "done" ? "text-white" : "text-[#0b1220]";
}

function signalBadgeTone(signal: SignalView) {
  return signal.contribution > 0 && signal.state === "done" ? "bg-white text-red-600" : "bg-white/70";
}

function SignalList({ signals, extraCards = [] }: { signals: SignalView[]; extraCards?: Array<{ label: string; value: string }> }) {
  const items = [
    ...signals.map((signal) => ({ type: "signal" as const, key: `${signal.source}-${signal.id}`, signal })),
    ...extraCards.map((card) => ({ type: "card" as const, key: `card-${card.label}`, card })),
  ];

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:min-h-[216px] lg:content-between xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => item.type === "signal" ? (
        <div key={item.key} className={`rounded-xl border px-3 py-2 transition ${signalTone(item.signal)}`}>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className={`truncate text-sm font-semibold ${signalLabelTone(item.signal)}`}>{item.signal.label}</div>
              <div className="truncate text-xs font-semibold opacity-90">{item.signal.value}</div>
            </div>
            <div className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${signalBadgeTone(item.signal)}`}>{item.signal.state === "pending" ? "--" : `+${item.signal.contribution}`}</div>
          </div>
        </div>
      ) : (
        <div key={item.key} className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-emerald-700 transition">
          <div className="truncate text-sm font-semibold text-[#0b1220]">{item.card.label}</div>
          <div className="truncate text-xs opacity-75">{item.card.value}</div>
        </div>
      ))}
    </div>
  );
}

export function Detector({ locale = "zh" }: Props) {
  const copy = messages[locale].detector;
  const detectorText = detectorLocaleText[locale];
  const [region, setRegion] = useState<TargetRegion>("auto");
  const [browserResult, setBrowserResult] = useState<DetectionRunResult["browserResult"] | null>(null);
  const [serverResult, setServerResult] = useState<CheckResponse | null>(null);
  const [browserIpIntel, setBrowserIpIntel] = useState<BrowserIpIntel | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSignal, setActiveSignal] = useState(-1);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const rawScore = useMemo(() => Math.min(100, signalsScore(browserResult?.signals ?? [], serverResult?.signals ?? [])), [browserResult, serverResult]);
  const animatedScore = loading ? Math.round((rawScore * progress) / 100) : rawScore;
  const status = rawScore >= 70 ? "restricted" : rawScore >= 31 ? "possibly_supported" : rawScore > 0 ? "unknown" : "supported";
  const pageRegionCode = region !== "auto" ? region : locale === "zh-HK" ? "hk" : locale === "ru" ? "ru" : "cn";
  const detectedRegionCode = (serverResult?.matchedRegion ?? browserResult?.matchedRegion ?? pageRegionCode) as TargetRegion;
  const pageRegion = detectorText.regions[detectedRegionCode];
  const russianSummaryRegions: Record<TargetRegion, string> = { auto: "российской", cn: "китайской", hk: "гонконгской", ru: "российской", ir: "иранской" };
  const suspectedRegion = rawScore > 0 ? locale === "ru" ? russianSummaryRegions[detectedRegionCode] : pageRegion : detectorText.confidence.supportedRegion;
  const confidenceText = rawScore >= 70 ? detectorText.confidence.high : rawScore >= 31 ? detectorText.confidence.medium : rawScore > 0 ? detectorText.confidence.low : detectorText.confidence.safe;
  const environmentSuffix = locale === "ru" ? "среды" : copy.environmentSuffix;
  const signals = useMemo<SignalView[]>(() => {
    const map = new Map<string, SignalResult>();
    for (const signal of browserResult?.signals ?? []) map.set(signal.id, signal);
    for (const signal of serverResult?.signals ?? []) {
      if (signal.value && signal.value !== detectorLocaleText.zh.unknown) {
        if (signal.id === "country") map.set("country", { ...signal, label: detectorText.signalLabels.country, value: localizeSignalValue(signal.value, detectorText) });
        else map.set(`server-${signal.id}`, { ...signal, label: detectorText.signalLabels[signal.id] ?? signal.label, value: signal.value === detectorLocaleText.zh.signalValues.read ? detectorText.signalValues.read : localizeSignalValue(signal.value, detectorText) });
      }
    }
    const detectedCountry = serverResult?.ipIntelligence?.detectedCountry || browserIpIntel?.country;
    if (detectedCountry && !map.has("country")) map.set("country", { id: "country", label: detectorText.signalLabels.country, value: localizeLocation(detectedCountry, locale), score: 0, weight: 20, contribution: 0, source: "server" });
    const proxyCountry = browserIpIntel?.country || serverResult?.ipIntelligence?.detectedCountry;
    if (proxyCountry) map.set("proxyCountry", { id: "proxyCountry", label: detectorText.signalLabels.proxyCountry, value: localizeLocation(proxyCountry, locale), score: 0, weight: 0, contribution: 0, source: "server" });
    const sourceIps = serverResult?.ipIntelligence?.sources.map((item) => item.ip).filter((ip): ip is string => typeof ip === "string" && isPublicIp(ip)) ?? [];
    const detectedIpv4 = sourceIps.find((ip) => !ip.includes(":"));
    const browserPublicIp = browserIpIntel?.ip && isPublicIp(browserIpIntel.ip) ? browserIpIntel.ip : null;
    const serverPublicIp = serverResult?.ipIntelligence?.detectedIp && isPublicIp(serverResult.ipIntelligence.detectedIp) ? serverResult.ipIntelligence.detectedIp : null;
    const detectedIp = detectedIpv4 || browserPublicIp || serverPublicIp;
    if (detectedIp) map.set("ipAddress", { id: "ipAddress", label: detectorText.signalLabels.ipAddress, value: detectedIp, score: 0, weight: 0, contribution: 0, source: "server" });
    if (browserIpIntel?.location) map.set("browserIpLocation", { id: "browserIpLocation", label: detectorText.signalLabels.browserIpLocation, value: localizeLocation(browserIpIntel.location, locale), score: 0, weight: 0, contribution: 0, source: "server" });
    if (browserIpIntel?.asn) map.set("browserIpAsn", { id: "browserIpAsn", label: detectorText.signalLabels.browserIpAsn, value: browserIpIntel.asn, score: 0, weight: 0, contribution: 0, source: "server" });
    if (browserIpIntel?.org) map.set("browserIpOrg", { id: "browserIpOrg", label: detectorText.signalLabels.browserIpOrg, value: browserIpIntel.org, score: 0, weight: 0, contribution: 0, source: "server" });
    const merged = defaultSignals.map((item, index) => {
      const found = map.get(item.id);
      const state = progress === 100 || found ? "done" : index === activeSignal ? "running" : index < activeSignal ? "done" : "pending";
      return { ...item, label: detectorText.signalLabels[item.id] ?? item.label, value: detectorText.pending, ...found, state } as SignalView;
    });
    for (const signal of map.values()) {
      if (!defaultSignals.some((item) => item.id === signal.id)) merged.push({ ...signal, state: progress === 100 ? "done" : "running" });
    }
    return merged;
  }, [browserResult, serverResult, browserIpIntel, activeSignal, progress, detectorText, locale]);

  const runCheck = async () => {
    setLoading(true);
    setBrowserResult(null);
    setServerResult(null);
    setBrowserIpIntel(null);
    setProgress(0);
    setActiveSignal(0);

    let local: DetectionRunResult["browserResult"] | null = null;
    let remote: CheckResponse | null = null;

    const checkRegion = normalizeRegion(region);

    for (let index = 0; index < scanSteps.length; index += 1) {
      const from = Math.round((index / scanSteps.length) * 92);
      const to = Math.round(((index + 1) / scanSteps.length) * 92);

      if (index === 0 || index === 1 || index === 4) {
        const result = await runDetection({ region: checkRegion, locale, text: detectorText, config: detectionConfig });
        local = result.browserResult;
        setBrowserResult(local);
      }

      if (index === 2) {
        remote = null;
        setServerResult(null);
        setBrowserIpIntel(null);
      }

      await animateProgress(from, to, setProgress, setActiveSignal);
      await sleep(45);
    }

    if (!local) {
      const result = await runDetection({ region: checkRegion, locale, text: detectorText, config: detectionConfig });
      setBrowserResult(result.browserResult);
    }
    if (!remote) {
      setServerResult(null);
      if (!browserIpIntel) setBrowserIpIntel(null);
    }

    await animateProgress(92, 100, setProgress, setActiveSignal);
    setActiveSignal(defaultSignals.length);
    setLoading(false);
  };

  const hasChecked = progress === 100;
  const ringActive = loading || progress > 0;
  const riskLabel = !ringActive ? detectorText.risk.waiting : !hasChecked ? detectorText.risk.checking : animatedScore === 0 ? detectorText.risk.supported : animatedScore >= 70 ? detectorText.risk.blocked : animatedScore >= 31 ? detectorText.risk.high : detectorText.risk.light;
  const riskLabelClass = !ringActive ? "bg-stone-100 text-stone-500" : !hasChecked ? "bg-blue-50 text-blue-600" : animatedScore === 0 ? "bg-emerald-50 text-emerald-700" : animatedScore >= 70 ? "bg-red-50 text-red-600" : animatedScore >= 31 ? "bg-orange-50 text-orange-700" : "bg-amber-50 text-amber-700";
  const ipIntel = serverResult?.ipIntelligence;
  const primaryIpSource = ipIntel?.sources
    .filter((source) => source.status === "ok" && (source.ip || source.country || source.asn || source.isp || source.org))
    .sort((a, b) => [b.ip, b.country, b.region, b.city, b.asn, b.isp, b.org, b.latitude, b.longitude].filter(Boolean).length - [a.ip, a.country, a.region, a.city, a.asn, a.isp, a.org, a.latitude, a.longitude].filter(Boolean).length)[0];
  const browserIpSource = browserIpIntel ? {
    ip: browserIpIntel.ip,
    country: browserIpIntel.country,
    region: browserIpIntel.location,
    city: browserIpIntel.location,
    asn: browserIpIntel.asn,
    isp: browserIpIntel.org,
    org: browserIpIntel.org,
    latitude: null,
    longitude: null,
    networkType: browserIpIntel.ip.includes(":") ? "IPv6" : "IPv4",
    risk: null,
  } : null;
  const displayIpSource = primaryIpSource ?? browserIpSource;
  const ipSourceAddresses = [
    ...(ipIntel?.sources.map((source) => source.ip) ?? []),
    browserIpIntel?.ip,
  ].filter((ip): ip is string => typeof ip === "string" && isPublicIp(ip));
  const ipv4Address = ipSourceAddresses.find((ip) => !ip.includes(":")) ?? null;
  const ipv6Address = ipSourceAddresses.find((ip) => ip.includes(":")) ?? null;
  const primaryPublicIp = displayIpSource?.ip && isPublicIp(displayIpSource.ip) ? displayIpSource.ip : null;
  const detectedPublicIp = ipIntel?.detectedIp && isPublicIp(ipIntel.detectedIp) ? ipIntel.detectedIp : null;
  const ipAddress = ipv4Address || primaryPublicIp || detectedPublicIp || null;
  const ipMetricCards = displayIpSource ? [
    !ipv4Address && !ipv6Address && ipAddress && { label: detectorText.ipMetricLabels.ipAddress, value: ipAddress },
    ipv6Address && { label: detectorText.ipMetricLabels.ipv6, value: ipv6Address },
    ipv4Address && { label: detectorText.ipMetricLabels.ipv4, value: ipv4Address },
    displayIpSource.asn && { label: detectorText.ipMetricLabels.asn, value: displayIpSource.asn },
    (displayIpSource.org || displayIpSource.isp) && { label: detectorText.ipMetricLabels.asnOwner, value: displayIpSource.org || displayIpSource.isp },
    displayIpSource.isp && { label: detectorText.ipMetricLabels.company, value: displayIpSource.isp },
    displayIpSource.longitude != null && { label: detectorText.ipMetricLabels.longitude, value: String(displayIpSource.longitude) },
    displayIpSource.latitude != null && { label: detectorText.ipMetricLabels.latitude, value: String(displayIpSource.latitude) },
    displayIpSource.networkType && { label: detectorText.ipMetricLabels.ipType, value: displayIpSource.networkType },
    displayIpSource.risk && { label: detectorText.ipMetricLabels.risk, value: displayIpSource.risk },
    displayIpSource.isp && { label: detectorText.ipMetricLabels.isp, value: displayIpSource.isp },
  ].filter(Boolean) as Array<{ label: string; value: string }> : [];

  useEffect(() => {
    const openPicker = () => setShowRegionPicker(true);
    window.addEventListener("open-region-picker", openPicker);
    return () => window.removeEventListener("open-region-picker", openPicker);
  }, []);

  return (
    <section className="mx-auto p-0">
      <div className="sticky top-[72px] z-40 py-4">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-3 pb-2 md:flex-row md:justify-center md:gap-10 xl:max-w-[1280px] min-[1800px]:max-w-[1560px] min-[2400px]:max-w-[1800px]">
          {copy.cardTags.map((title, index) => [title, ["bg-[#d97757]", "bg-red-500", "bg-emerald-500"][index]] as const).map(([title, color]) => (
            <div key={title} className="group flex items-center gap-3 text-lg font-black text-[#0b1220] md:text-2xl">
              <span className={`size-2.5 rounded-full ${color} shadow-[0_0_18px_rgba(217,119,87,0.45)]`} />
              <span className="relative whitespace-nowrap after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[#d97757] after:transition group-hover:after:scale-x-100">
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-5 w-full text-center">
        <button type="button" onClick={() => setShowRegionPicker(true)} disabled={loading} className="h-14 w-full cursor-pointer rounded-full bg-[#d97757] px-8 text-lg font-black text-white shadow-xl shadow-orange-900/20 transition hover:bg-[#c05f3c] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:min-w-[360px]">
          {loading ? copy.loadingText : copy.idleCta}
        </button>
        <div className="relative mt-10 text-center font-black">
          <div className="py-3 leading-tight md:py-4">
            {hasChecked ? (
              <>
                <div className="text-2xl text-[#0b1220] md:inline md:text-3xl">
                  <span>{confidenceText}</span>
                  <span className="mx-1 text-[#d97757]">{suspectedRegion}</span>
                  <span>{environmentSuffix}</span>
                  <span className="hidden md:inline">：</span>
                </div>
                <div className="mt-2 text-2xl md:mt-0 md:inline md:text-3xl">
                  <span className="text-stone-600">{copy.riskPrefix}</span>
                  <span className="mx-1 text-red-600">{animatedScore}%</span>
                  <span className="text-stone-400">·</span>
                  <span className="ml-2 text-[#c05f3c]">{detectorText.status[status]}</span>
                </div>
              </>
            ) : (
              <div className="text-2xl text-[#0b1220] md:text-3xl">{copy.idleReport}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[2rem] border border-stone-200 bg-white/80 p-4 shadow-xl shadow-orange-950/5 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-5">
            <ScoreRing score={animatedScore} checked={ringActive} text={detectorText} />
            <div className={`mt-5 rounded-full px-4 py-2 text-sm font-bold ${riskLabelClass}`}>{riskLabel}</div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-black text-[#0b1220]">{hasChecked ? copy.signalCount(signals.length + ipMetricCards.length, true) : copy.title}</h3>
              <span className="rounded-full bg-[#fffaf3] px-3 py-1 text-xs font-bold text-stone-500">{copy.signalCount(signals.length + ipMetricCards.length, false)}</span>
            </div>
            <div className="mt-2 md:mt-4"><SignalList signals={signals} extraCards={ipMetricCards} /></div>
          </div>
        </div>
      </div>

      {showRegionPicker && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/45 p-4" onClick={() => setShowRegionPicker(false)}>
          <div className="relative z-[10000] w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-[#0b1220]">{copy.targetTitle}</h3>
                <p className="mt-1 text-sm text-stone-500">{copy.targetDesc}</p>
              </div>
              <button type="button" onClick={() => setShowRegionPicker(false)} aria-label={copy.close} className="grid size-11 place-items-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200">
                <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {regions.map((item) => (
                <button key={item.code} type="button" onClick={() => setRegion(item.code)} className={`rounded-2xl border px-4 py-4 text-center font-black transition ${region === item.code ? "border-[#d97757] bg-orange-50 text-[#c05f3c]" : "border-stone-200 bg-white text-[#0b1220] hover:border-stone-300"}`}>
                  {detectorText.regions[item.code]}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => { setShowRegionPicker(false); void runCheck(); }} className="mt-5 h-12 w-full cursor-pointer rounded-full bg-[#d97757] font-black text-white shadow-lg shadow-orange-900/15">
              {copy.startCheck}
            </button>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
