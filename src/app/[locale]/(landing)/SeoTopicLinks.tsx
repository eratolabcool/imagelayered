import { getSeoPagesByMarket } from '@/shared/seo/image-layered-pages';

/**
 * [INPUT]: reads EN market entries from src/shared/seo/image-layered-pages
 * [OUTPUT]: SeoTopicLinks — keyword-anchored internal link grid from the
 *   homepage to all EN /seo/ deep pages
 * [POS]: (landing) route section rendered after ImageLayeredSeoGuide; the
 *   homepage is the site's strongest page and the only authority feeder to
 *   the 40 SEO pages, which otherwise have zero internal links
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export default function SeoTopicLinks() {
  const pages = getSeoPagesByMarket('en');

  return (
    <section className="px-4 pb-20 md:px-8 md:pb-24">
      <div className="mx-auto max-w-[1120px]">
        <h2 className="max-w-4xl text-3xl font-black tracking-[-0.025em] text-white md:text-4xl">
          Guides for the exact edit you need
        </h2>
        <p className="mt-6 max-w-[74ch] text-base leading-8 text-[#aaa4b1]">
          Focused workflows for the most common image revisions: swap a
          background, rewrite poster text, change an outfit, or fix one object
          while everything else stays exactly where you approved it.
        </p>
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {pages.map((page) => (
            <a
              key={page.slug}
              href={`/seo/en/${page.slug}`}
              className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.04]"
            >
              <span className="text-sm font-extrabold text-white group-hover:underline">
                {page.keyword}
              </span>
              <span className="mt-1.5 block text-xs leading-6 text-[#9993a3]">
                {page.description}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
