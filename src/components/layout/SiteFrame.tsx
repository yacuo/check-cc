"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

const pageMax = "mx-auto w-full max-w-[1440px] px-5 md:px-8 2xl:max-w-[1536px] min-[1800px]:max-w-[1680px] min-[1920px]:max-w-[1760px]";

const navItems = [
  { href: "#seo-content", label: "检测项目" },
  { href: "#faq", label: "FAQ" },
  { href: "/en", label: "English" },
];

function Brand() {
  return (
    <Link href="/" className="text-xl font-black tracking-tight">
      <span>Check</span><span className="text-[#d97757]">CC</span><span>.org</span>
    </Link>
  );
}

export function SiteFrame({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f2ea] bg-[radial-gradient(circle_at_16%_8%,rgba(217,119,87,0.14),transparent_30%),radial-gradient(circle_at_84%_6%,rgba(245,158,11,0.10),transparent_28%),linear-gradient(180deg,#fffaf3_0%,#f7f2ea_42%,#f7f2ea_100%)] text-[#0b1220]">
      <aside className={`fixed left-0 top-0 z-[70] h-screen w-[35vw] min-w-[148px] max-w-[260px] border-r border-stone-200 bg-[#fffaf3] p-5 shadow-2xl transition-transform duration-300 md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between gap-3">
          <span className="text-sm font-black">导航</span>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-stone-100 px-2 py-1 text-xs font-bold text-stone-600">关闭</button>
        </div>
        <nav className="flex flex-col gap-4 text-sm font-black text-stone-700">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="hover:text-[#d97757]">{item.label}</a>
          ))}
        </nav>
      </aside>

      <div className={open ? "translate-x-[35vw] transition-transform duration-300" : "transition-transform duration-300"}>
        <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#fffaf3]/88 backdrop-blur-xl">
          <div className={`${pageMax} flex h-[72px] items-center justify-between`}>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm font-black md:hidden">菜单</button>
              <Brand />
            </div>
            <nav className="hidden items-center gap-8 text-sm font-semibold text-stone-600 md:flex">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="hover:text-[#d97757]">{item.label}</a>
              ))}
            </nav>
            <button type="button" onClick={() => window.dispatchEvent(new Event("open-region-picker"))} className="rounded-full bg-[#0b1220] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#d97757]">立即检测</button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
