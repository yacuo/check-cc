// CheckCC 的多语言页面路由，用于生成静态语言路径并按 URL slug 渲染对应本地化首页。
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeContent } from "../page";
import { getLocaleBySlug, localeRoutes, messages, type LocaleSlug } from "@/i18n/messages";

export function generateStaticParams() {
  return Object.values(localeRoutes)
    .filter((route): route is { slug: LocaleSlug; label: string; lang: string } => Boolean(route.slug))
    .map((route) => ({ locale: route.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: slug } = await params;
  const locale = getLocaleBySlug(slug);
  if (!locale) return {};
  const copy = messages[locale];
  return {
    title: copy.hero.title,
    description: copy.hero.subtitle,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: slug } = await params;
  const locale = getLocaleBySlug(slug);
  if (!locale) notFound();
  return <HomeContent locale={locale} />;
}
