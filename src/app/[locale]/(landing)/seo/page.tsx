import { Metadata } from 'next';
import { ArrowRight, Globe2, Layers3, Search, Sparkles } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import {
  imageLayeredSeoPages,
  seoMarketLabels,
  SeoMarket,
} from '@/shared/seo/image-layered-pages';

export const revalidate = 3600;

const markets = ['en', 'pt', 'ja', 'ru', 'es'] as SeoMarket[];

const marketDescriptions: Record<SeoMarket, string> = {
  en: 'High-intent English pages for AI image revision, product photo editing, Midjourney cleanup, poster remixing, and consistent character workflows.',
  pt: 'Paginas em portugues para edicao local de imagens, fotos de produto, posters, texto e personagens consistentes.',
  ja: 'AI画像の部分編集、商品写真、ポスター、文字分離、キャラクター編集に向けた日本語ページ。',
  ru: 'Русские страницы для локального редактирования AI-изображений, товаров, постеров, текста и персонажей.',
  es: 'Paginas en espanol para editar imagenes de IA, fotos de producto, posters, texto y personajes consistentes.',
};

const priorityClusters = [
  {
    title: 'AI Image Revision',
    description: 'Control local edits instead of regenerating the whole image.',
    href: '/seo/en/ai-image-revision-tool',
  },
  {
    title: 'Product Photos',
    description: 'Protect the product while changing background, props, and shadow.',
    href: '/seo/en/edit-ai-product-photos',
  },
  {
    title: 'Midjourney Fixes',
    description: 'Keep the winning composition and correct only the broken detail.',
    href: '/seo/en/modify-midjourney-image',
  },
  {
    title: 'Consistent Characters',
    description: 'Change clothing, lighting, and scene without losing identity.',
    href: '/seo/en/modify-ai-character-without-changing-face',
  },
];

export const generateMetadata = (): Metadata => ({
  title: 'AI Image Editing SEO Hub | Image Layered',
  description:
    'Browse Image Layered SEO guides for editing AI images without regenerating, product photo revision, Midjourney cleanup, poster remixing, and consistent character editing.',
  alternates: {
    canonical: `${envConfigs.app_url}/seo`,
  },
  openGraph: {
    title: 'AI Image Editing SEO Hub | Image Layered',
    description:
      'Layer any image, edit anything, and preserve composition with AI image post-editing workflows.',
    url: `${envConfigs.app_url}/seo`,
    siteName: 'Image Layered',
    type: 'website',
    images: [
      {
        url: `${envConfigs.app_url}/preview.png`,
        width: 1200,
        height: 630,
        alt: 'Image Layered AI image editing SEO hub',
      },
    ],
  },
});

export default async function SeoHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Image Layered AI Image Editing SEO Hub',
    description:
      'Topic hub for AI image post-editing, layer separation, product photo editing, poster remixing, and consistent character workflows.',
    url: `${envConfigs.app_url}/seo`,
    mainEntity: markets.map((market) => ({
      '@type': 'ItemList',
      name: seoMarketLabels[market],
      numberOfItems: imageLayeredSeoPages.filter((page) => page.market === market).length,
      url: `${envConfigs.app_url}/seo/${market}`,
    })),
  };

  return (
    <main className="bg-[#fbf8f1] text-[#171717] [font-family:var(--font-body)]">
      <section className="border-b border-black/10 bg-[#111827] px-4 py-16 text-white md:px-8 md:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
            <Search className="size-4" />
            SEO Workflows
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.03] [font-family:var(--font-display)] md:text-6xl">
            AI image editing guides for users who do not want to regenerate
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
            Image Layered focuses on post-editing: split a finished image into layers,
            revise only the broken part, and keep the composition that already works.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/qwenimagelayered"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-black text-[#071123]"
            >
              Try the editor
              <ArrowRight className="size-4" />
            </a>
            <a
              href="/seo/en"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 px-5 py-3 text-sm font-black text-white"
            >
              Browse English topics
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 px-4 py-14 md:px-8 md:py-18">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-3xl font-black [font-family:var(--font-display)]">
            Priority search clusters
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {priorityClusters.map((cluster) => (
              <a
                key={cluster.href}
                href={cluster.href}
                className="rounded-xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Sparkles className="size-5 text-[#0f766e]" />
                <h3 className="mt-4 text-lg font-black">{cluster.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#4f463d]">
                  {cluster.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-18">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-3xl font-black [font-family:var(--font-display)]">
            Markets and languages
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {markets.map((market) => {
              const pages = imageLayeredSeoPages.filter((page) => page.market === market);

              return (
                <a
                  key={market}
                  href={`/seo/${market}`}
                  className="rounded-xl border border-black/10 bg-white p-5 shadow-sm transition hover:bg-[#f7efe2]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-[#111827] text-white">
                        <Globe2 className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-xl font-black">{seoMarketLabels[market]}</h3>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">
                          {pages.length} pages
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="size-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-7 text-[#4f463d]">
                    {marketDescriptions[market]}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-[#f7efe2] px-4 py-14 md:px-8 md:py-18">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex items-center gap-3">
            <Layers3 className="size-6 text-[#0f766e]" />
            <h2 className="text-3xl font-black [font-family:var(--font-display)]">
              All SEO pages
            </h2>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {imageLayeredSeoPages.map((page) => (
              <a
                key={`${page.market}-${page.slug}`}
                href={`/seo/${page.market}/${page.slug}`}
                className="rounded-lg border border-black/10 bg-white p-4 text-sm font-black leading-6 hover:bg-[#fbf8f1]"
              >
                <span className="block text-xs uppercase tracking-[0.16em] text-[#0f766e]">
                  {seoMarketLabels[page.market]}
                </span>
                <span className="mt-2 block">{page.h1}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
