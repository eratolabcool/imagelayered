import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Languages, Layers3 } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import {
  getSeoPagesByMarket,
  seoMarketLabels,
  SeoMarket,
} from '@/shared/seo/image-layered-pages';

export const revalidate = 3600;

type PageParams = {
  locale: string;
  market: string;
};

const validMarkets = new Set(['en', 'pt', 'ja', 'ru', 'es']);
const markets = ['en', 'pt', 'ja', 'ru', 'es'] as SeoMarket[];

const marketHero: Record<SeoMarket, { title: string; description: string; cta: string }> = {
  en: {
    title: 'English SEO pages for AI image post-editing',
    description:
      'High-intent pages for users who want to edit AI images, product photos, Midjourney outputs, posters, and characters without regenerating the whole image.',
    cta: 'Start editing',
  },
  pt: {
    title: 'Paginas em portugues para edicao de imagens com IA',
    description:
      'Guias para editar imagens de IA, fotos de produto, posters, texto visual e personagens mantendo composicao e consistencia.',
    cta: 'Comecar a editar',
  },
  ja: {
    title: 'AI画像の後編集に向けた日本語ページ',
    description:
      'AI画像、商品写真、ポスター、文字、キャラクターを再生成せずに編集するためのページ集です。',
    cta: '編集を始める',
  },
  ru: {
    title: 'Русские страницы для пост-редактирования AI-изображений',
    description:
      'Страницы для редактирования AI-изображений, товаров, постеров, текста и персонажей без полной регенерации.',
    cta: 'Начать редактирование',
  },
  es: {
    title: 'Paginas en espanol para post-edicion de imagenes con IA',
    description:
      'Guias para editar imagenes de IA, productos, posters, texto y personajes sin regenerar toda la composicion.',
    cta: 'Empezar a editar',
  },
};

export function generateStaticParams() {
  return markets.map((market) => ({
    locale: 'en',
    market,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { market } = await params;

  if (!validMarkets.has(market)) {
    return {};
  }

  const typedMarket = market as SeoMarket;
  const hero = marketHero[typedMarket];

  return {
    title: `${seoMarketLabels[typedMarket]} AI Image Editing Pages | Image Layered`,
    description: hero.description,
    alternates: {
      canonical: `${envConfigs.app_url}/seo/${typedMarket}`,
      languages: Object.fromEntries(
        markets.map((item) => [item, `${envConfigs.app_url}/seo/${item}`])
      ),
    },
    openGraph: {
      title: `${seoMarketLabels[typedMarket]} AI Image Editing Pages | Image Layered`,
      description: hero.description,
      url: `${envConfigs.app_url}/seo/${typedMarket}`,
      siteName: 'Image Layered',
      type: 'website',
      images: [
        {
          url: `${envConfigs.app_url}/preview.png`,
          width: 1200,
          height: 630,
          alt: hero.title,
        },
      ],
    },
  };
}

export default async function SeoMarketPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, market } = await params;
  setRequestLocale(locale);

  if (!validMarkets.has(market)) {
    notFound();
  }

  const typedMarket = market as SeoMarket;
  const pages = getSeoPagesByMarket(typedMarket);
  const hero = marketHero[typedMarket];

  if (!pages.length) {
    notFound();
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: hero.title,
    description: hero.description,
    url: `${envConfigs.app_url}/seo/${typedMarket}`,
    hasPart: pages.map((page) => ({
      '@type': 'Article',
      headline: page.h1,
      url: `${envConfigs.app_url}/seo/${page.market}/${page.slug}`,
      inLanguage: page.lang,
    })),
  };

  return (
    <main className="bg-[#fbf8f1] text-[#171717] [font-family:var(--font-body)]">
      <section className="border-b border-black/10 bg-[#f7efe2] px-4 py-16 md:px-8 md:py-22">
        <div className="mx-auto max-w-[1180px]">
          <a
            href="/seo"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]"
          >
            <Languages className="size-4" />
            {seoMarketLabels[typedMarket]}
          </a>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.03] [font-family:var(--font-display)] md:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#4f463d]">{hero.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/qwenimagelayered"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#111111] px-5 py-3 text-sm font-black text-white"
            >
              {hero.cta}
              <ArrowRight className="size-4" />
            </a>
            <a
              href="/seo"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-black/15 bg-white px-5 py-3 text-sm font-black"
            >
              All markets
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-18">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex items-center gap-3">
            <Layers3 className="size-6 text-[#0f766e]" />
            <h2 className="text-3xl font-black [font-family:var(--font-display)]">
              Topic pages
            </h2>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {pages.map((page) => (
              <a
                key={page.slug}
                href={`/seo/${page.market}/${page.slug}`}
                className="rounded-xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-[#0f766e]" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">
                      {page.keyword}
                    </p>
                    <h3 className="mt-2 text-xl font-black leading-7">{page.h1}</h3>
                    <p className="mt-3 text-sm font-semibold leading-7 text-[#4f463d]">
                      {page.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-[#111827] px-4 py-12 text-white md:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black [font-family:var(--font-display)]">
              Turn a search visit into an edit session
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-300">
              Every page points users back to the actual editor, so SEO traffic can become uploads,
              layer edits, exports, and paid workflow usage.
            </p>
          </div>
          <a
            href="/qwenimagelayered"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-black text-[#071123]"
          >
            Open editor
            <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
