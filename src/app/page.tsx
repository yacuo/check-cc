import type { Metadata } from "next";
import { Detector } from "@/components/detector/Detector";
import { SiteFrame } from "@/components/layout/SiteFrame";

export const metadata: Metadata = {
  title: "Claude 环境检测｜Claude 封号风险、运行环境检查与可用地区检测",
  description: "Check Claude 提供 Claude 环境检测、Claude 运行环境检查、Claude 封号风险评估、网络节点与 DNS/IP 地区检测，帮助用户在开通 Claude Pro、Max 或 API 前确认可用性。",
};

const pageMax = "mx-auto w-full max-w-[1440px] px-5 md:px-8 2xl:max-w-[1536px] min-[1800px]:max-w-[1680px] min-[1920px]:max-w-[1760px]";

const regions = [
  { name: "中国大陆", href: "/china", risk: "高风险", desc: "检测中文环境、UTC+8、浏览器语言、网络节点和支付地区。" },
  { name: "俄罗斯", href: "/russia", risk: "高风险", desc: "检测俄语环境、俄罗斯时区、网络出口和订阅可用性。" },
  { name: "伊朗", href: "/iran", risk: "高风险", desc: "检测伊朗时区、语言环境、IP 地区和支付限制。" },
];

const checks = [
  ["Claude 同款时区", "读取系统时区与 UTC 偏移，捕捉地区相位特征。"],
  ["语言与 Intl 指纹", "navigator.languages、Accept-Language、Intl locale 联合识别。"],
  ["字体侧信道探测", "Canvas 宽度探测中文字体与国产厂商字体。"],
  ["浏览器 / WebView", "匹配微信、QQ、夸克、UC、百度等环境线索。"],
  ["设备品牌画像", "识别鸿蒙、华为、小米、OPPO、vivo 等弱信号。"],
  ["网络出口校验", "IP 地区、边缘请求头、节点出口与环境一致性分析。"],
];

const faqs = [
  ["Claude 环境检测能检测什么？", "可以检测浏览器语言、系统时区、Intl locale、User-Agent、网络地区估算、Claude 可用地区风险、支付地区风险和 Claude 运行环境异常。"],
  ["这个工具能判断 Claude 会不会封号吗？", "不能给出官方结论，但可以根据地区限制、网络节点、浏览器环境和支付地区冲突，提示 Claude 封号风险和订阅失败风险。"],
  ["为什么要在开通 Claude Pro 前检测？", "如果国家/地区、网络出口或支付方式不被支持，可能出现付款失败、订阅后不可用、API 无法开通等问题。"],
  ["检测结果会上传吗？", "浏览器环境检测优先在本地执行。服务端接口只用于估算请求头、IP 国家和时区，不保存用户检测历史。"],
  ["检测后应该怎么看风险？", "低风险说明环境特征较少；中风险建议结合实际访问状态观察；高风险说明地区画像、网络出口或设备环境存在明显冲突。"],
  ["已经在使用 Claude 还需要检测吗？", "需要。切换节点、系统时区、设备、浏览器语言或账号地区后，环境画像可能变化，建议重新检测。"],
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
      featureList: checks.map(([title]) => title),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

export default function Home() {
  return (
    <SiteFrame>
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative pt-8 pb-6 md:pt-12 md:pb-8">
        <div className="absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(circle_at_50%_0%,rgba(217,119,87,0.30),transparent_46%),linear-gradient(180deg,#fffaf3,transparent)]" />
        <div className={`${pageMax} text-center`}>
          <h1 className="mx-auto max-w-[1360px] text-5xl font-black leading-[1.04] tracking-tight md:text-7xl 2xl:max-w-[1480px] min-[1800px]:max-w-[1640px] min-[1800px]:text-8xl">
            检查 Claude 运行环境和封号风险
          </h1>
          <p className="mx-auto mt-7 max-w-[1320px] text-xl font-bold leading-8 text-stone-700 md:text-2xl 2xl:max-w-[1440px] min-[1800px]:max-w-[1600px]">
            独家 AI 环境指纹引擎，综合扫描 Claude 运行环境、地区画像与账号风险
          </p>

        </div>
      </section>

      <section id="checker" className={`${pageMax} mt-0 scroll-mt-[72px]`}>
        <Detector />
      </section>

      <section className={`${pageMax} mt-16`}>
        <article className="relative overflow-hidden rounded-[2.5rem] bg-[#0b1220] p-6 text-white shadow-2xl shadow-slate-950/20 md:p-8 lg:p-10">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#d97757]/25 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#f0b89f]">Detection Logic</p>
              <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">检测原理</h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-stone-300">
                我们把 Claude 运行环境拆成可验证的外部信号，不依赖单一 IP，而是看语言、时区、网络、设备和支付环境是否一致。
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-3">
              {[
                ["01", "环境指纹", "系统时区、UTC 偏移、浏览器语言、Intl locale。"],
                ["02", "网络画像", "服务端请求头、IP 地区、网络出口和节点一致性。"],
                ["03", "风险评分", "按 Claude Web、Pro/Max、API、支付风险加权汇总。"],
              ].map(([num, title, desc]) => (
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

      <section id="seo-content" className={`${pageMax} mt-20`}>
        <div className="grid gap-6 lg:grid-cols-[420px_1fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#d97757]">Risk Signals</p>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">我们会检测哪些 Claude 风险信号？</h2>
          </div>
          <p className="text-base leading-8 text-stone-600 lg:max-w-3xl">
            这些检测项直接渲染在静态 HTML 中，搜索引擎抓取时就能理解网站主题；实际检测时会结合浏览器端与服务端信号动态评分。
          </p>
        </div>
        <div className="mt-10 overflow-hidden rounded-[2rem] border border-stone-200 bg-white/80 shadow-sm">
          <div className="grid divide-y divide-stone-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-3">
            {checks.map(([title, desc], index) => (
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
        <h2 className="text-center text-3xl font-black md:text-5xl">重点地区检测</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {regions.map((region) => (
            <a key={region.name} href={region.href} className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black">{region.name}</h3>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{region.risk}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-600">{region.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="faq" className={`${pageMax} mt-20`}>
        <h2 className="text-center text-3xl font-black md:text-5xl">Claude 环境检测 FAQ</h2>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <article key={question} className="rounded-[2rem] border border-stone-200 bg-white/80 p-6">
              <h3 className="text-lg font-black">{question}</h3>
              <p className="mt-3 leading-7 text-stone-600">{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-20 border-t border-stone-200 bg-[#fffaf3]">
        <div className={`${pageMax} grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr]`}>
          <section>
            <h2 className="text-2xl font-black"><span>Check</span><span className="text-[#d97757]">CC</span><span>.org</span> 是什么？</h2>
            <p className="mt-4 max-w-4xl leading-8 text-stone-600">
              CheckCC.org 是面向 Claude 用户的 AI 环境指纹检测工具，围绕 Claude 环境检测、Claude 封号风险、Claude 运行环境检查、地区画像、网络出口校验和浏览器指纹识别进行综合分析。本站通过系统时区、浏览器语言、Intl locale、字体侧信道、国产浏览器/WebView、设备品牌和服务端网络出口等信号，帮助用户理解当前环境是否更接近官方支持地区，是否存在账号验证、访问异常或封号风险。
            </p>
          </section>
          <section className="text-sm leading-7 text-stone-600 md:text-right">
            <div className="font-black text-[#0b1220]">通用信息</div>
            <p className="mt-3">域名：checkcc.org</p>
            <p>功能：Claude 运行环境检测与风险指数报告</p>
            <p>说明：检测结果仅供参考，Claude 官方政策与支持地区可能变化</p>
          </section>
        </div>
      </footer>
    </main>
    </SiteFrame>
  );
}
