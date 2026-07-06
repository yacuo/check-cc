import type { Metadata } from "next";
import Link from "next/link";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { getAllPosts, getGroupedPosts } from "@/lib/content/posts";

const siteUrl = "https://checkcc.org";

export const metadata: Metadata = {
  title: "Claude 教程中心 | Claude 封号、申请、API 与环境检测",
  description: "Claude 教程中心收录 Claude 封号原因、封号机制、退款申诉、账号申请、API 申请和 Claude Code 申请等教程。",
  alternates: { canonical: "/claude" },
};

export default function ClaudeTutorialsPage() {
  const posts = getAllPosts();
  const groups = getGroupedPosts();
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Claude 教程中心",
    description: metadata.description,
    url: `${siteUrl}/claude`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/${post.slug}`,
        name: post.title,
        description: post.description,
      })),
    },
  };

  return (
    <SiteFrame>
      <main className="bg-[#f7f2ea] pt-5 pb-12 text-[#0b1220] md:pt-7 md:pb-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
        <section className="mx-auto w-full max-w-[1440px] px-5 md:px-8 2xl:max-w-[1536px] min-[1800px]:max-w-[1760px] min-[1920px]:max-w-[1920px] min-[2400px]:max-w-[2200px]">
          <div className="rounded-[2.5rem] bg-white p-6 shadow-sm md:p-10">
            <div className="max-w-none">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#d97757]">Claude Tutorials</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] md:text-6xl">Claude 教程中心</h1>
              <p className="mt-4 text-base font-bold leading-8 text-stone-600 md:whitespace-nowrap md:text-[clamp(16px,1.35vw,22px)]">围绕 Claude 封号、封禁、退款申诉、账号申请、API 申请和 Claude Code 申请，整理可搜索、可阅读、可落地的环境风险教程。</p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="space-y-8">
              {groups.map((group) => (
                <section key={group.title} className="rounded-[2.25rem] bg-white p-5 shadow-sm md:p-6">
                  <div className="border-b border-stone-100 pb-5">
                    <h2 className="text-3xl font-black tracking-[-0.04em] text-[#0b1220]">{group.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-stone-600 md:text-base md:leading-7">{group.description}</p>
                  </div>
                  <div className="mt-5 space-y-4">
                    {group.posts.map((post) => (
                      <article key={post.slug} className="rounded-[2rem] border border-stone-200 bg-[#fffaf3] p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-stone-900/10 md:p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="text-sm font-black text-[#d97757]">{post.category}</div>
                            <h3 className="mt-2 text-2xl font-black leading-tight tracking-[-0.04em] text-[#0b1220] md:text-3xl">
                              <Link href={`/${post.slug}`}>{post.title}</Link>
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-stone-600 md:text-base md:leading-7">{post.description}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {post.tags.slice(0, 4).map((tag) => (
                                <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#c05f3c]">{tag}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center justify-between gap-4 border-t border-stone-100 pt-4 text-sm font-black md:w-32 md:flex-col md:items-end md:border-t-0 md:pt-0">
                            <time className="text-stone-400">{post.date}</time>
                            <Link href={`/${post.slug}`} className="rounded-full bg-[#0b1220] px-4 py-2 text-white transition hover:bg-[#d97757]">阅读全文</Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <BlogSidebar relatedPosts={posts.slice(0, 5)} />
          </div>
        </section>
        <SiteFooter />
      </main>
    </SiteFrame>
  );
}
