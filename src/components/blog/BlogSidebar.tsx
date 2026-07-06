import Link from "next/link";
import type { Post } from "@/lib/content/posts";

const cards = [
  ["Claude 封号风险检测", "检查 IP、地区、时区和语言是否冲突"],
  ["Claude IP 地区检测", "识别网络出口、IP 国家和组织信息"],
  ["Claude 浏览器环境检测", "查看语言、Intl、User-Agent 和浏览器线索"],
  ["Claude 时区语言检测", "判断系统时区和语言环境是否一致"],
  ["Claude 订阅风险检测", "分析 Pro、Max 和付款地区风险"],
  ["Claude API 可用性检测", "检查 API 申请和调用前的环境风险"],
  ["Claude Code 环境检测", "减少开发工具申请和使用异常"],
];

export function BlogSidebar({ relatedPosts = [] }: { relatedPosts?: Post[] }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="text-lg font-black text-[#0b1220]">Claude 环境风险检测</div>
        <p className="mt-2 text-sm leading-6 text-stone-600">从多个维度检查 Claude 封号、订阅和 API 可用性风险。</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {cards.map(([title, desc]) => (
            <Link key={title} href="/" className="group rounded-2xl border border-red-700/20 bg-red-600 p-4 text-white shadow-lg shadow-red-900/10 transition hover:-translate-y-0.5 hover:bg-red-700">
              <div className="text-lg font-black leading-tight">{title}</div>
              <p className="mt-1 text-sm leading-5 text-red-50/90">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
          <div className="text-lg font-black text-[#0b1220]">相关文章</div>
          <div className="mt-4 space-y-3">
            {relatedPosts.map((post) => (
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
