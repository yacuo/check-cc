import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { findPostBySlug, getAdjacentPosts, getAllPosts, getRelatedPosts } from "@/lib/content/posts";
import { HomeContent } from "../page";
import { getLocaleBySlug, localeRoutes, type LocaleSlug } from "@/i18n/messages";

const siteUrl = "https://checkcc.org";

export function generateStaticParams() {
  const localeParams = Object.values(localeRoutes)
    .filter((route): route is { slug: LocaleSlug; label: string; lang: string } => Boolean(route.slug))
    .map((route) => ({ locale: route.slug }));
  const postParams = getAllPosts().map((post) => ({ locale: post.slug }));
  return [...localeParams, ...postParams];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: slug } = await params;
  const post = findPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | CheckCC.org`,
    description: post.description,
    alternates: { canonical: `/${post.slug}` },
    openGraph: {
      title: `${post.title} | CheckCC.org`,
      description: post.description,
      url: `/${post.slug}`,
      type: "article",
    },
  };
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: slug } = await params;
  const locale = getLocaleBySlug(slug);

  if (locale && locale !== "zh") return <HomeContent locale={locale} />;

  const post = findPostBySlug(slug);
  if (!post || locale === "zh") notFound();

  const { previous, next } = getAdjacentPosts(post.slug);
  const relatedPosts = getRelatedPosts(post.slug, 5);
  const postUrl = `${siteUrl}/${post.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    author: { "@type": "Organization", name: "CheckCC.org" },
    publisher: { "@type": "Organization", name: "CheckCC.org", url: siteUrl },
    articleSection: post.category,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Claude 教程中心", item: `${siteUrl}/claude` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <SiteFrame>
      <main className="bg-[#f7f2ea] pt-5 pb-12 text-[#0b1220] md:pt-7 md:pb-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8 2xl:max-w-[1536px] min-[1800px]:max-w-[1760px] min-[1920px]:max-w-[1920px] min-[2400px]:max-w-[2200px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
            <article className="overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-sm md:p-10">
              <nav aria-label="面包屑导航" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-black text-stone-400">
                <Link href="/" className="transition hover:text-[#d97757]">首页</Link>
                <span>/</span>
                <Link href="/claude" className="transition hover:text-[#d97757]">Claude 教程中心</Link>
                <span>/</span>
                <span className="text-[#d97757]">{post.category}</span>
              </nav>
              <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl xl:text-[52px]">{post.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-600">{post.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                <time className="font-black text-stone-400">{post.date}</time>
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 font-black text-[#c05f3c]">{tag}</span>
                ))}
              </div>

              <div
                className="mt-10 max-w-none text-[17px] leading-8 text-stone-700 [&_code]:rounded-md [&_code]:bg-stone-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-black [&_h2]:tracking-[-0.04em] [&_h2]:text-[#0b1220] [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-2xl [&_h3]:font-black [&_h3]:text-[#0b1220] [&_li]:mb-2 [&_p]:mb-5 [&_strong]:text-[#0b1220] [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: post.html }}
              />

              {post.faqs.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-3xl font-black tracking-[-0.04em]">常见问题</h2>
                  <div className="mt-5 grid gap-4">
                    {post.faqs.map((faq) => (
                      <div key={faq.question} className="rounded-2xl bg-[#fffaf3] p-5 ring-1 ring-stone-100">
                        <h2 className="text-xl font-black text-[#0b1220]">{faq.question}</h2>
                        <p className="mt-2 leading-7 text-stone-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <nav className="mt-10 space-y-4 border-t border-stone-100 pt-6">
                {previous && (
                  <Link href={`/${previous.slug}`} className="block w-full text-left transition hover:text-[#d97757]">
                    <div className="text-sm font-black text-stone-400">上一篇</div>
                    <div className="mt-1 font-black text-[#0b1220]">{previous.title}</div>
                  </Link>
                )}
                {next && (
                  <Link href={`/${next.slug}`} className="block w-full text-right transition hover:text-[#d97757]">
                    <div className="text-sm font-black text-stone-400">下一篇</div>
                    <div className="mt-1 font-black text-[#0b1220]">{next.title}</div>
                  </Link>
                )}
              </nav>
            </article>
            <BlogSidebar relatedPosts={relatedPosts} currentPost={post} />
          </div>
        </div>
        <SiteFooter />
      </main>
    </SiteFrame>
  );
}
