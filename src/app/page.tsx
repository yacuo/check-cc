import type { Metadata } from "next";
import { Detector } from "@/components/detector/Detector";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { messages, type LocaleCode } from "@/i18n/messages";

export const metadata: Metadata = {
  title: "检查 Claude 封号风险",
  description: "独家 AI 环境指纹引擎，综合扫描 Claude 运行环境、地区画像与账号风险",
};

const pageMax = "mx-auto w-full max-w-[1440px] px-5 md:px-8 2xl:max-w-[1536px] min-[1800px]:max-w-[1760px] min-[1920px]:max-w-[1920px] min-[2400px]:max-w-[2200px]";

const faqLinks = [
  "https://checkcc.org/claude-feng-hao",
  "https://checkcc.org/claude-feng-hao-yuan-yin",
  "https://checkcc.org/claude-feng-hao-ji-zhi",
  "https://checkcc.org/claude-feng-hao-jie-feng",
  "https://checkcc.org/claude-feng-hao-tui-kuan",
  "https://checkcc.org/claude-shen-qing",
  "https://checkcc.org/claude-api-shen-qing",
  "https://checkcc.org/claude-code-shen-qing",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Check Claude",
      url: "https://checkcc.org/",
      applicationCategory: "SecurityApplication",
      operatingSystem: "All",
      inLanguage: "zh-CN",
      description: "Claude 环境检测、Claude 运行环境检查、Claude 封号风险与可用地区检测工具。",
      featureList: messages.zh.signals.checks.map(([title]) => title),
    },
    {
      "@type": "FAQPage",
      mainEntity: messages.zh.faq.items.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

export function HomeContent({ locale = "zh" }: { locale?: LocaleCode }) {
  const copy = messages[locale];
  const regions = copy.regions;

  return (
    <SiteFrame>
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative pt-8 pb-6 md:pt-12 md:pb-8">
        <div className="absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(circle_at_50%_0%,rgba(217,119,87,0.30),transparent_46%),linear-gradient(180deg,#fffaf3,transparent)]" />
        <div className={`${pageMax} text-center`}>
          <h1 className="mx-auto max-w-full text-[clamp(32px,7vw,96px)] font-black leading-[1.04] tracking-[-0.04em] sm:max-w-[1360px] sm:tracking-tight 2xl:max-w-[1480px] min-[1800px]:max-w-[1640px]">
            {copy.hero.title}
          </h1>
          <p className="mx-auto mt-7 max-w-[1320px] text-xl font-bold leading-8 text-stone-700 md:text-2xl 2xl:max-w-[1440px] min-[1800px]:max-w-[1600px]">
            {copy.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="https://checkcc.org" target="_blank" rel="noreferrer" className="rounded-full bg-[#0b1220] px-7 py-3 text-base font-black text-white shadow-xl shadow-slate-950/15 transition hover:bg-[#d97757]">
              Live Demo: checkcc.org
            </a>
            <a href="https://checkcc.org" target="_blank" rel="noreferrer" className="rounded-full border border-stone-300 bg-white/80 px-7 py-3 text-base font-black text-[#0b1220] transition hover:border-[#d97757] hover:text-[#d97757]">
              Official Site
            </a>
          </div>

        </div>
      </section>

      <section id="checker" className={`${pageMax} mt-0 scroll-mt-[72px]`}>
        <Detector locale={locale} />
      </section>

      <section className={`${pageMax} mt-16`}>
        <article className="relative overflow-hidden rounded-[2.5rem] bg-[#0b1220] p-6 text-white shadow-2xl shadow-slate-950/20 md:p-8 lg:p-10">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#d97757]/25 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#f0b89f]">{copy.logic.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">{copy.logic.title}</h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-stone-300">{copy.logic.desc}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-3">
              {copy.logic.items.map(([num, title, desc]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <div className="text-sm font-black text-[#f0b89f]">{num}</div>
                  <h3 className="mt-4 text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-300">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className={`${pageMax} mt-16`}>
        <a href="https://checkcc.org" target="_blank" rel="noreferrer" className="block rounded-[2rem] border border-[#d97757]/30 bg-[#fff4eb] p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl md:p-8">
          <div className="text-sm font-black uppercase tracking-[0.24em] text-[#d97757]">Official Website</div>
          <div className="mt-3 text-2xl font-black text-[#0b1220] md:text-4xl">Use the hosted version at checkcc.org</div>
          <p className="mt-4 text-base font-semibold leading-7 text-stone-600">Open-source self-hosting is available. The official hosted version is maintained at checkcc.org.</p>
        </a>
      </section>

      <section id="seo-content" className={`${pageMax} mt-20`}>
        <div className="grid gap-6 lg:grid-cols-[420px_1fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#d97757]">{copy.signals.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">{copy.signals.title}</h2>
          </div>
          <p className="text-base leading-8 text-stone-600 lg:max-w-3xl">{copy.signals.desc}</p>
        </div>
        <div className="mt-10 overflow-hidden rounded-[2rem] border border-stone-200 bg-white/80 shadow-sm">
          <div className="grid divide-y divide-stone-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-3">
            {copy.signals.checks.map(([title, desc], index) => (
              <article key={title} className="group min-h-[132px] p-4 transition hover:bg-[#fff4eb] md:p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="max-w-[260px] text-xl font-black leading-tight">{title}</h3>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0b1220] text-xs font-black text-white group-hover:bg-[#d97757]">{index + 1}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-600">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${pageMax} mt-20`}>
        <h2 className="text-center text-3xl font-black md:text-5xl">{copy.regionsTitle}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {regions.map((region) => (
            <article key={region.name} className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black">{region.name}</h3>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{region.risk}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-600">{region.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${pageMax} mt-20`}>
        <div className="grid gap-8 rounded-[2.5rem] border border-stone-200 bg-white/80 p-6 shadow-xl shadow-orange-950/5 md:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#d97757]">{copy.privacy.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">{copy.privacy.title}</h2>
            <p className="mt-5 text-base leading-8 text-stone-600">{copy.privacy.desc}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {copy.privacy.items.map(([question, answer]) => (
              <article key={question} className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-black text-[#0b1220]">{question}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className={`${pageMax} mt-20`}>
        <h2 className="text-center text-3xl font-black md:text-5xl">{copy.faq.title}</h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {copy.faq.items.map(([question, answer], index) => (
            <a key={question} href={faqLinks[index] ?? "https://checkcc.org"} target="_blank" rel="noreferrer" className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 transition hover:-translate-y-0.5 hover:border-[#d97757]/40 hover:bg-orange-50 hover:shadow-xl hover:shadow-stone-900/10">
              <h3 className="text-lg font-black">{question}</h3>
              <p className="mt-3 leading-7 text-stone-600">{answer}</p>
            </a>
          ))}
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
    </SiteFrame>
  );
}

export default function Home() {
  return <HomeContent />;
}
