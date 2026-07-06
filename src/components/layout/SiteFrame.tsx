"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { localeRoutes, messages, type LocaleCode } from "@/i18n/messages";

const pageMax = "mx-auto w-full max-w-[1440px] px-5 md:px-8 2xl:max-w-[1536px] min-[1800px]:max-w-[1760px] min-[1920px]:max-w-[1920px] min-[2400px]:max-w-[2200px]";

function Brand() {
  return (
    <Link href="/" className="text-xl font-black tracking-tight">
      <span>Check</span><span className="text-[#d97757]">CC</span><span>.org</span>
    </Link>
  );
}

export function SiteFrame({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/\/$/, "") || "/";
  const activeLocale: LocaleCode = normalizedPathname === "/hong-kong" ? "zh-HK" : normalizedPathname === "/russia" ? "ru" : "zh";
  const copy = messages[activeLocale];
  const localeItems = Object.entries(localeRoutes).map(([value, route]) => ({
    value: value as LocaleCode,
    href: route.slug ? `/${route.slug}/` : "/",
    label: route.label,
    lang: route.lang,
  }));
  const navItems = [
    { href: "#seo-content", label: copy.nav.projects },
    { href: "#faq", label: copy.nav.faq },
  ];

  useEffect(() => {
    const closeDesktopMenus = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setOpen(false);
        setLocaleOpen(false);
      }
    };
    closeDesktopMenus();
    window.addEventListener("resize", closeDesktopMenus);
    return () => window.removeEventListener("resize", closeDesktopMenus);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f2ea] bg-[radial-gradient(circle_at_16%_8%,rgba(217,119,87,0.14),transparent_30%),radial-gradient(circle_at_84%_6%,rgba(245,158,11,0.10),transparent_28%),linear-gradient(180deg,#fffaf3_0%,#f7f2ea_42%,#f7f2ea_100%)] text-[#0b1220]">
      <aside className={`fixed left-0 top-0 z-[70] h-screen w-[35vw] min-w-[148px] max-w-[260px] border-r border-stone-200 bg-[#fffaf3] p-5 shadow-2xl transition-transform duration-300 md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between gap-3">
          <span className="text-sm font-black">{copy.nav.menu}</span>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-stone-100 px-2 py-1 text-xs font-bold text-stone-600">{copy.nav.close}</button>
        </div>
        <nav className="flex flex-col gap-4 text-sm font-black text-stone-700">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="hover:text-[#d97757]">{item.label}</a>
          ))}
          <a href="https://github.com/yacuo/checkcc" target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-2 hover:text-[#d97757]">
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.589 2 12.253c0 4.53 2.865 8.371 6.839 9.727.5.094.683-.222.683-.494 0-.244-.009-.89-.014-1.747-2.782.62-3.369-1.375-3.369-1.375-.455-1.185-1.11-1.5-1.11-1.5-.908-.636.069-.623.069-.623 1.004.073 1.532 1.057 1.532 1.057.892 1.568 2.341 1.115 2.91.853.091-.662.35-1.115.636-1.371-2.221-.259-4.555-1.138-4.555-5.066 0-1.119.39-2.034 1.03-2.751-.103-.26-.446-1.302.098-2.714 0 0 .84-.276 2.75 1.05A9.37 9.37 0 0 1 12 6.957a9.36 9.36 0 0 1 2.504.345c1.909-1.326 2.747-1.05 2.747-1.05.546 1.412.203 2.454.1 2.714.641.717 1.029 1.632 1.029 2.751 0 3.938-2.337 4.804-4.566 5.058.359.317.679.943.679 1.9 0 1.371-.012 2.477-.012 2.813 0 .274.18.593.688.492C19.138 20.62 22 16.782 22 12.253 22 6.589 17.523 2 12 2Z" /></svg>
            GitHub
          </a>
          <div className="border-t border-stone-200 pt-4">
            <div className="mb-3 text-xs font-black text-stone-400">{copy.nav.language}</div>
            <div className="flex flex-col gap-3">
              {localeItems.map((item) => (
                <a key={item.value} href={item.href} onClick={() => setOpen(false)} className="hover:text-[#d97757]">{item.label} · {item.lang}</a>
              ))}
            </div>
          </div>
        </nav>
      </aside>
      {open && <button type="button" aria-label={copy.nav.close} className="fixed inset-0 z-[60] bg-transparent md:hidden" onClick={() => setOpen(false)} />}

      <div className={`pt-[72px] transition-transform duration-300 ${open ? "max-md:translate-x-[35vw]" : "translate-x-0"}`}>
        <header className="fixed left-0 top-0 z-50 w-full border-b border-stone-200 bg-[#fffaf3]/88 backdrop-blur-xl">
          <div className={`${pageMax} flex h-[72px] items-center justify-between`}>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setOpen(true)} aria-label={copy.nav.menu} className="grid size-11 place-items-center rounded-full border border-stone-200 bg-white text-[#0b1220] md:hidden">
                <span className="flex flex-col gap-1.5">
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                </span>
              </button>
              <Brand />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <nav className="hidden items-center gap-3 text-sm font-black md:flex">
                {navItems.map((item) => (
                  <a key={item.href} href={item.href} className="cursor-pointer rounded-full bg-white px-4 py-2 text-stone-700 ring-1 ring-stone-200 transition hover:text-[#d97757] hover:ring-[#d97757]/40">{item.label}</a>
                ))}
                <a href="https://github.com/yacuo/checkcc" target="_blank" rel="noreferrer" aria-label="GitHub" className="grid size-9 place-items-center rounded-full bg-white text-[#0b1220] ring-1 ring-stone-200 transition hover:text-[#d97757] hover:ring-[#d97757]/40">
                  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.589 2 12.253c0 4.53 2.865 8.371 6.839 9.727.5.094.683-.222.683-.494 0-.244-.009-.89-.014-1.747-2.782.62-3.369-1.375-3.369-1.375-.455-1.185-1.11-1.5-1.11-1.5-.908-.636.069-.623.069-.623 1.004.073 1.532 1.057 1.532 1.057.892 1.568 2.341 1.115 2.91.853.091-.662.35-1.115.636-1.371-2.221-.259-4.555-1.138-4.555-5.066 0-1.119.39-2.034 1.03-2.751-.103-.26-.446-1.302.098-2.714 0 0 .84-.276 2.75 1.05A9.37 9.37 0 0 1 12 6.957a9.36 9.36 0 0 1 2.504.345c1.909-1.326 2.747-1.05 2.747-1.05.546 1.412.203 2.454.1 2.714.641.717 1.029 1.632 1.029 2.751 0 3.938-2.337 4.804-4.566 5.058.359.317.679.943.679 1.9 0 1.371-.012 2.477-.012 2.813 0 .274.18.593.688.492C19.138 20.62 22 16.782 22 12.253 22 6.589 17.523 2 12 2Z" /></svg>
                </a>
                <div className="relative">
                  <button type="button" aria-expanded={localeOpen} onClick={() => setLocaleOpen((value) => !value)} className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-[#0b1220] ring-1 ring-stone-200 transition hover:ring-[#d97757]/40">
                    <span>{localeItems.find((item) => item.value === activeLocale)?.label}</span>
                    <span className="text-stone-400">·</span>
                    <span>{localeItems.find((item) => item.value === activeLocale)?.lang}</span>
                    <svg viewBox="0 0 24 24" className={`size-4 transition ${localeOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                  {localeOpen && (
                    <div className="absolute right-0 top-full z-[80] mt-3 flex w-44 flex-col gap-1 overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 text-sm shadow-2xl shadow-stone-900/10">
                      {localeItems.map((item) => (
                        <a key={item.value} href={item.href} className={`flex items-center justify-between rounded-xl px-3 py-2 transition hover:bg-orange-50 hover:text-[#d97757] ${activeLocale === item.value ? "bg-orange-50 text-[#d97757]" : "text-[#0b1220]"}`}>
                          <span>{item.label}</span>
                          <span className="text-xs text-stone-400">{item.lang}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </nav>
              <button type="button" onClick={() => window.dispatchEvent(new Event("open-region-picker"))} className="cursor-pointer rounded-full bg-[#0b1220] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#d97757]">{copy.nav.detect}</button>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
