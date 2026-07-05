import { notFound } from "next/navigation";
import { HomeContent } from "../page";
import { getLocaleBySlug, localeRoutes, type LocaleSlug } from "@/i18n/messages";

export function generateStaticParams() {
  return Object.values(localeRoutes)
    .filter((route): route is { slug: LocaleSlug; label: string; lang: string } => Boolean(route.slug))
    .map((route) => ({ locale: route.slug }));
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: slug } = await params;
  const locale = getLocaleBySlug(slug);

  if (!locale || locale === "zh") notFound();

  return <HomeContent locale={locale} />;
}
