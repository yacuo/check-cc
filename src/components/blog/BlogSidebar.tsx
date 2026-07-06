import Link from "next/link";
import { getBlogSidebarConfig } from "@/config/blog-sidebar";
import type { Post } from "@/lib/content/posts";

export function BlogSidebar({ relatedPosts = [], currentPost }: { relatedPosts?: Post[]; currentPost?: Post }) {
  const config = getBlogSidebarConfig(currentPost?.slug);
  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="text-lg font-black text-[#0b1220]">{config.title}</div>
        <p className="mt-2 text-sm leading-6 text-stone-600">{config.description}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {config.cards.map((card) => (
            <Link key={card.title} href="/" className="group rounded-2xl border border-red-700/20 bg-red-600 p-4 text-white shadow-lg shadow-red-900/10 transition hover:-translate-y-0.5 hover:bg-red-700">
              <div className="text-lg font-black leading-tight">{card.title}</div>
              <p className="mt-1 text-sm leading-5 text-red-50/90">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-lg font-black text-[#0b1220]">{currentPost ? "延伸阅读" : "精选教程"}</div>
          <div className="mt-4 space-y-3">
            {relatedPosts.slice(0, currentPost ? 3 : 5).map((post) => (
              <Link key={post.slug} href={`/${post.slug}`} className="block rounded-2xl bg-[#fffaf3] p-4 transition hover:bg-orange-50">
                <div className="text-sm font-black leading-6 text-[#0b1220]">{post.title}</div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">{post.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
