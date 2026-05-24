import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Layers3, MessageSquareText, Sparkles } from 'lucide-react';

import { envConfigs } from '@/config';
import {
  getSeoPage,
  getSeoPagesByMarket,
  imageLayeredSeoPages,
  seoMarketLabels,
  SeoMarket,
} from '@/shared/seo/image-layered-pages';

export const revalidate = 3600;

type PageParams = {
  locale: string;
  market: string;
  slug: string;
};

const validMarkets = new Set(['en', 'pt', 'ja', 'ru', 'es']);

function pageUrl(market: string, slug: string) {
  return `${envConfigs.app_url}/seo/${market}/${slug}`;
}

export function generateStaticParams() {
  return imageLayeredSeoPages.map((page) => ({
    locale: 'en',
    market: page.market,
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { market, slug } = await params;
  const page = getSeoPage(market, slug);

  if (!page) {
    return {};
  }

  const topicIndex = getSeoPagesByMarket(page.market as SeoMarket).findIndex(
    (item) => item.slug === page.slug
  );
  const alternatePages =
    page.market === 'en'
      ? [page]
      : (['pt', 'ja', 'ru', 'es'] as SeoMarket[])
          .map((item) => getSeoPagesByMarket(item)[topicIndex])
          .filter(Boolean);

  return {
    title: page.title,
    description: page.description,
    keywords: [page.keyword, 'Image Layered', 'AI image editor', 'AI layer editor'],
    alternates: {
      canonical: pageUrl(page.market, page.slug),
      languages: Object.fromEntries(
        alternatePages.map((item) => [item.lang, pageUrl(item.market, item.slug)])
      ),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: pageUrl(page.market, page.slug),
      siteName: 'Image Layered',
      type: 'article',
      locale: page.lang,
      images: [
        {
          url: `${envConfigs.app_url}/preview.png`,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    other: {
      'content-language': page.lang,
    },
  };
}

export default async function LocalizedSeoPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { market, slug } = await params;

  if (!validMarkets.has(market)) {
    notFound();
  }

  const page = getSeoPage(market, slug);
  if (!page) {
    notFound();
  }

  const related = imageLayeredSeoPages
    .filter((item) => item.market === page.market && item.slug !== page.slug)
    .slice(0, 5);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: page.h1,
        description: page.description,
        inLanguage: page.lang,
        mainEntityOfPage: pageUrl(page.market, page.slug),
        publisher: {
          '@type': 'Organization',
          name: 'Image Layered',
          url: envConfigs.app_url,
        },
      },
      {
        '@type': 'FAQPage',
        inLanguage: page.lang,
        mainEntity: page.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Image Layered',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        url: envConfigs.app_url,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    ],
  };

  return (
    <main className="bg-[#fbf8f1] text-[#171717] [font-family:var(--font-body)]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[#f7efe2] px-4 py-16 md:px-8 md:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),rgba(250,204,21,0.08)_48%,rgba(244,63,94,0.1))]" />
        <div className="relative mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">
              {seoMarketLabels[page.market as SeoMarket]} SEO
            </div>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.26em] text-[#0f766e]">
              {page.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.02] [font-family:var(--font-display)] md:text-6xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4f463d]">{page.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/qwenimagelayered"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#111111] px-5 py-3 text-sm font-black text-white shadow-[0_16px_30px_rgba(17,17,17,0.2)]"
              >
                {page.cta}
                <ArrowRight className="size-4" />
              </a>
              <a
                href="/pricing"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-black/15 bg-white/75 px-5 py-3 text-sm font-black"
              >
                Pricing
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#111827] shadow-[0_28px_70px_rgba(17,24,39,0.28)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/75">
                Image Layered Workflow
              </span>
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-red-400" />
                <span className="size-3 rounded-full bg-yellow-300" />
                <span className="size-3 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-[1fr_0.82fr]">
              <div className="rounded-xl border border-white/10 bg-[#1f2937] p-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[linear-gradient(145deg,#f97316,#fde047_45%,#ef4444)]">
                  <img
                    src="/imgs/features/001.jpeg"
                    alt="Image Layered layer separation"
                    className="h-full w-full object-cover object-[18%_62%]"
                  />
                  <div className="absolute bottom-3 left-3 rounded-md bg-black/70 px-3 py-1 text-xs font-black text-white">
                    Before
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-cyan-200/20 bg-[#0f172a] p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
                    <MessageSquareText className="size-4" />
                    Prompt
                  </div>
                  <p className="text-sm leading-6 text-slate-200">{page.prompts[0]}</p>
                </div>
              </div>
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/6 p-4">
                <div className="flex items-center gap-2 text-sm font-black text-white">
                  <Layers3 className="size-4 text-cyan-200" />
                  Layers
                </div>
                {['Subject', 'Product', 'Text', 'Background', 'Shadow'].map((layer, index) => (
                  <div key={layer} className="flex items-center gap-3 rounded-lg bg-white/8 p-2 text-sm text-slate-100">
                    <span className="flex size-8 items-center justify-center rounded-md bg-white/10 text-xs font-black">
                      {index + 1}
                    </span>
                    <span className="flex-1 font-semibold">{layer}</span>
                    <CheckCircle2 className="size-4 text-emerald-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 px-4 py-14 md:px-8 md:py-18">
        <div className="mx-auto grid max-w-[1180px] gap-5 md:grid-cols-2">
          <article className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="text-2xl font-black [font-family:var(--font-display)]">Problem</h2>
            <p className="mt-4 text-base leading-8 text-[#4f463d]">{page.pain}</p>
          </article>
          <article className="rounded-xl border border-black/10 bg-white p-6">
            <h2 className="text-2xl font-black [font-family:var(--font-display)]">Image Layered</h2>
            <p className="mt-4 text-base leading-8 text-[#4f463d]">{page.solution}</p>
          </article>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#111827] px-4 py-16 text-white md:px-8 md:py-20">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-3xl font-black [font-family:var(--font-display)] md:text-4xl">
            {page.workflowTitle}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {page.workflow.map((item, index) => (
              <article key={item} className="rounded-xl border border-white/10 bg-white/6 p-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-300 text-[#071123]">
                  <Sparkles className="size-5" />
                </div>
                <p className="mt-4 text-sm font-semibold leading-7 text-slate-200">
                  <span className="font-black text-white">{index + 1}. </span>
                  {item}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <h2 className="text-3xl font-black [font-family:var(--font-display)] md:text-4xl">
              {page.useCasesTitle}
            </h2>
            <div className="mt-6 space-y-3">
              {page.useCases.map((item) => (
                <div key={item} className="rounded-lg border border-black/10 bg-white p-4 text-sm font-semibold leading-7 text-[#4f463d]">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black [font-family:var(--font-display)] md:text-4xl">
              {page.promptsTitle}
            </h2>
            <div className="mt-6 space-y-3">
              {page.prompts.map((item) => (
                <div key={item} className="rounded-lg border border-black/10 bg-[#f7efe2] p-4 text-sm font-semibold leading-7 text-[#2b2620]">
                  "{item}"
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#f7efe2] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-3xl font-black [font-family:var(--font-display)] md:text-4xl">FAQ</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {page.faq.map((item) => (
              <article key={item.q} className="rounded-xl border border-black/10 bg-white p-5">
                <h3 className="text-lg font-black">{item.q}</h3>
                <p className="mt-3 text-sm leading-7 text-[#4f463d]">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-2xl font-black [font-family:var(--font-display)]">More {seoMarketLabels[page.market as SeoMarket]} pages</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <a
                key={item.slug}
                href={`/seo/${item.market}/${item.slug}`}
                className="rounded-lg border border-black/10 bg-white p-4 text-sm font-black leading-6 hover:bg-[#f7efe2]"
              >
                {item.h1}
              </a>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
