import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeContent } from "../page";
import { getLocaleBySlug, localeRoutes, type LocaleSlug } from "@/i18n/messages";

export function generateStaticParams() {
  return Object.values(localeRoutes)
    .filter((route): route is { slug: LocaleSlug; label: string; lang: string } => Boolean(route.slug))
    .map((route) => ({ locale: route.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: slug } = await params;
  const locale = getLocaleBySlug(slug);
  if (!locale) return {};
  return {
    title: "Claude 环境检测｜Claude 封号风险与运行环境检查",
    description: "CheckCC 提供 Claude 运行环境、地区画像、浏览器指纹与账号风险检测。",
    alternates: { canonical: `/${slug}` },
  };
}

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: slug } = await params;
  const locale = getLocaleBySlug(slug);
  if (!locale) notFound();
  return <HomeContent locale={locale} />;
}
