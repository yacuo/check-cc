import Link from "next/link";
import { messages, type LocaleCode } from "@/i18n/messages";

const pageMax = "mx-auto w-full max-w-[1440px] px-5 md:px-8 2xl:max-w-[1536px] min-[1800px]:max-w-[1760px] min-[1920px]:max-w-[1920px] min-[2400px]:max-w-[2200px]";

const tutorialLinks = [
  ["Claude 教程中心", "/claude"],
  ["Claude 封号原因", "/claude-feng-hao-yuan-yin"],
  ["Claude 封号机制", "/claude-feng-hao-ji-zhi"],
  ["Claude 解封申诉", "/claude-feng-hao-jie-feng"],
  ["Claude 退款说明", "/claude-feng-hao-tui-kuan"],
  ["Claude 账号申请", "/claude-shen-qing"],
  ["Claude API 申请", "/claude-api-shen-qing"],
  ["Claude Code 申请", "/claude-code-shen-qing"],
];

export function SiteFooter({ locale = "zh" }: { locale?: LocaleCode }) {
  const copy = messages[locale].footer;
  return (
    <footer className="mt-20 border-t border-stone-200 bg-[#fffaf3]">
      <div className={`${pageMax} grid gap-8 py-10 lg:grid-cols-[1.15fr_1fr_0.85fr]`}>
        <section>
          <h2 className="text-2xl font-black text-[#0b1220]">{copy.title}</h2>
          <p className="mt-4 max-w-4xl leading-8 text-stone-600">{copy.desc}</p>
        </section>
        <section>
          <div className="font-black text-[#0b1220]">Claude 教程内链</div>
          <div className="mt-4 grid gap-2 text-sm font-bold text-stone-600 sm:grid-cols-2">
            {tutorialLinks.map(([label, href]) => (
              <Link key={href} href={href} className="transition hover:text-[#d97757]">
                {label}
              </Link>
            ))}
          </div>
        </section>
        <section className="text-sm leading-7 text-stone-600 lg:text-right">
          <div className="font-black text-[#0b1220]">{copy.infoTitle}</div>
          <p className="mt-3">{copy.domain}</p>
          <p>{copy.feature}</p>
          <p>{copy.note}</p>
        </section>
      </div>
    </footer>
  );
}
