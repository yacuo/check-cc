type Props = {
  name: string;
  title: string;
  description: string;
  href?: string;
};

export function RegionPage({ name, title, description, href = "/" }: Props) {
  return (
    <main className="min-h-screen bg-[#f7f2ea] px-5 py-10 text-[#0b1220] md:px-8">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-stone-200 bg-white/80 p-8 shadow-xl shadow-orange-950/10 md:p-12">
        <a href={href} className="text-sm font-bold text-[#c05f3c]">← 返回检测首页</a>
        <div className="mt-8 inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700">{name} · 重点受限地区</div>
        <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-stone-600">{description}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["Claude Web", "访问和账号地区可能受限制，付款前先确认官方支持状态。"],
            ["Pro / Max 订阅", "支付卡、账单地址和账号地区不一致时，订阅可能失败。"],
            ["Claude API", "Console、API Key 和账单地区可能存在额外限制。"],
            ["付款建议", "先确认可用性，再开通付费；不要在状态不明时直接订阅。"],
          ].map(([label, text]) => (
            <section key={label} className="rounded-3xl border border-stone-200 bg-[#fffaf3] p-5">
              <h2 className="font-black">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
