import { Detector } from "@/components/detector/Detector";

const regions = [
  { name: "China Mainland", href: "/en/china", risk: "High risk", desc: "Checks Chinese locale, UTC+8, network region and payment risk." },
  { name: "Russia", href: "/en/russia", risk: "High risk", desc: "Checks Russian language, regional timezone, network and subscription risk." },
  { name: "Iran", href: "/en/iran", risk: "High risk", desc: "Checks Iran timezone, language signals and payment availability." },
];

export default function EnglishHome() {
  return (
    <main className="min-h-screen bg-[#f7f2ea] text-[#0b1220]">
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-8 md:px-8 lg:grid-cols-[1fr_520px] lg:py-14">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit rounded-full border border-orange-200 bg-white/70 px-4 py-2 text-sm font-semibold text-[#c05f3c]">
            checkcc.org · Claude environment check
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight md:text-7xl">
            Check whether Claude works in your region before paying.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
            Check Claude scans browser language, timezone, network region and device signals to help you avoid paying for Claude Pro, Max or API before confirming availability.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {regions.map((region) => (
              <a key={region.name} href={region.href} className="rounded-3xl border border-stone-200 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-black">{region.name}</h2>
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{region.risk}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-600">{region.desc}</p>
              </a>
            ))}
          </div>
        </div>
        <Detector lang="en" />
      </section>
    </main>
  );
}
