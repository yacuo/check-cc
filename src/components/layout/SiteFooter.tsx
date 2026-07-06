import { messages, type LocaleCode } from "@/i18n/messages";

const pageMax = "mx-auto w-full max-w-[1440px] px-5 md:px-8 2xl:max-w-[1536px] min-[1800px]:max-w-[1760px] min-[1920px]:max-w-[1920px] min-[2400px]:max-w-[2200px]";

export function SiteFooter({ locale = "zh" }: { locale?: LocaleCode }) {
  const copy = messages[locale].footer;
  return (
    <footer className="mt-20 border-t border-stone-200 bg-[#fffaf3]">
      <div className={`${pageMax} grid gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr]`}>
        <section>
          <a href="https://checkcc.org" target="_blank" rel="noreferrer" className="inline-flex text-2xl font-black text-[#0b1220] transition hover:text-[#d97757]">{copy.title}</a>
          <p className="mt-4 max-w-4xl leading-8 text-stone-600">{copy.desc}</p>
        </section>
        <section className="text-sm leading-7 text-stone-600 lg:text-right">
          <div className="font-black text-[#0b1220]">{copy.infoTitle}</div>
          <div className="mt-3 flex items-center gap-3 lg:justify-end">
            <a href="https://checkcc.org" target="_blank" rel="noreferrer" className="font-black text-[#d97757] transition hover:text-[#0b1220]">https://checkcc.org</a>
            <a href="https://github.com/yacuo/checkcc" target="_blank" rel="noreferrer" aria-label="GitHub" className="grid size-9 place-items-center rounded-full bg-white text-[#0b1220] ring-1 ring-stone-200 transition hover:text-[#d97757] hover:ring-[#d97757]/40">
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.589 2 12.253c0 4.53 2.865 8.371 6.839 9.727.5.094.683-.222.683-.494 0-.244-.009-.89-.014-1.747-2.782.62-3.369-1.375-3.369-1.375-.455-1.185-1.11-1.5-1.11-1.5-.908-.636.069-.623.069-.623 1.004.073 1.532 1.057 1.532 1.057.892 1.568 2.341 1.115 2.91.853.091-.662.35-1.115.636-1.371-2.221-.259-4.555-1.138-4.555-5.066 0-1.119.39-2.034 1.03-2.751-.103-.26-.446-1.302.098-2.714 0 0 .84-.276 2.75 1.05A9.37 9.37 0 0 1 12 6.957a9.36 9.36 0 0 1 2.504.345c1.909-1.326 2.747-1.05 2.747-1.05.546 1.412.203 2.454.1 2.714.641.717 1.029 1.632 1.029 2.751 0 3.938-2.337 4.804-4.566 5.058.359.317.679.943.679 1.9 0 1.371-.012 2.477-.012 2.813 0 .274.18.593.688.492C19.138 20.62 22 16.782 22 12.253 22 6.589 17.523 2 12 2Z" /></svg>
            </a>
          </div>
          <p>{copy.feature}</p>
          <p>{copy.note}</p>
        </section>
      </div>
    </footer>
  );
}
