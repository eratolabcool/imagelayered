import { Metadata } from 'next';
import Link from 'next/link';
import { getSeoPagesByMarket } from '@/shared/seo/image-layered-pages';

/**
 * [INPUT]: EN market entries from src/shared/seo/image-layered-pages for
 *   keyword-anchored cross-links; envConfigs-free static metadata
 * [OUTPUT]: /qwen-image-layered-online landing page for the model-word
 *   cluster (qwen image layered online / demo / no install)
 * [POS]: (crooked) sibling of /comfyui-qwen-image-layered; captures the
 *   "run it in a browser now" intent GSC shows at positions 4-9 on
 *   /quicktest with zero clicks, and feeds authority to /seo/en/ pages
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export const metadata: Metadata = {
  title: 'Qwen Image Layered Online — Free Demo, No Install | Image Layered',
  description:
    'Run Qwen Image Layered online in your browser: upload an image, get editable transparent layers, edit one object, export PNG. Free first run, no ComfyUI, no sign-up.',
  keywords: [
    'qwen image layered online',
    'qwen image layered demo',
    'qwen-image-layered online',
    'qwen image layered free',
    'run qwen image layered in browser',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/qwen-image-layered-online',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/qwen-image-layered-online',
    title: 'Qwen Image Layered Online — Free Browser Demo',
    description:
      'Upload an image, get a stack of editable layers. Qwen Image Layered running online, no install.',
    siteName: 'Image Layered',
  },
};

const appJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Image Layered — Qwen Image Layered Online',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const howtoJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to run Qwen Image Layered online',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload an image', text: 'Open the editor and drop in any JPG, PNG, or WEBP — a poster, product shot, or AI-generated image.' },
    { '@type': 'HowToStep', position: 2, name: 'Decompose into layers', text: 'The Qwen Image Layered model separates the image into transparent layers: subject, text, background, shadow.' },
    { '@type': 'HowToStep', position: 3, name: 'Edit one layer', text: 'Select the layer that needs work and describe the change. Unselected layers keep their pixels.' },
    { '@type': 'HowToStep', position: 4, name: 'Export', text: 'Download the recomposed PNG or individual layers as transparent assets.' },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I try Qwen Image Layered online for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The editor runs Qwen Image Layered in the browser and your first layered decompositions are free, with no sign-up required. Open the editor, upload an image, and the layer stack generates in one click.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need ComfyUI or a GPU to use Qwen Image Layered online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. This page runs the model as a hosted online demo, so there is nothing to install and no local GPU. If you prefer self-hosting the workflow in nodes, the ComfyUI guide on this site covers that path separately.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does Qwen Image Layered actually do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It decomposes a flat image into a stack of transparent RGBA layers — subject, product, text, background, shadow — so you can edit or export one element without regenerating the rest of the image.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I export the layers to Photoshop or PSD?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each layer can be downloaded as a transparent PNG, which opens directly in Photoshop, Figma, or Canva. The full composite exports as a production-ready PNG from the editor.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this the official Qwen Image Layered model?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, the online editor runs the same Qwen Image Layered decomposition model released by the Qwen team, wrapped in a layer-canvas workspace with selection, locks, versions, and export.',
      },
    },
  ],
};

const steps = [
  {
    title: 'Upload any flat image',
    text: 'A poster, product photo, character render, or AI generation. JPG, PNG, and WEBP up to 25 MB.',
  },
  {
    title: 'Decompose into editable layers',
    text: 'Qwen Image Layered separates subject, text, background, shadow, and effects into transparent RGBA layers.',
  },
  {
    title: 'Edit one object, keep the rest',
    text: 'Select the layer, describe the change. Everything you did not select keeps its exact pixels.',
  },
  {
    title: 'Export the result',
    text: 'Download the composite PNG, or grab individual layers as transparent assets for Photoshop or Figma.',
  },
];

const faqs = [
  {
    q: 'Can I try Qwen Image Layered online for free?',
    a: 'Yes. The editor runs Qwen Image Layered in the browser and your first layered decompositions are free, with no sign-up required. Open the editor, upload an image, and the layer stack generates in one click.',
  },
  {
    q: 'Do I need ComfyUI or a GPU to use it online?',
    a: 'No. This page runs the model as a hosted online demo — nothing to install, no local GPU. If you prefer wiring the workflow yourself in nodes, the ComfyUI guide covers that path.',
  },
  {
    q: 'What does Qwen Image Layered actually do?',
    a: 'It decomposes a flat image into a stack of transparent RGBA layers — subject, product, text, background, shadow — so you can edit or export one element without regenerating the rest.',
  },
  {
    q: 'Can I export the layers to Photoshop?',
    a: 'Each layer downloads as a transparent PNG that opens directly in Photoshop, Figma, or Canva. The full composite exports as a production-ready PNG.',
  },
  {
    q: 'Is this the official model?',
    a: 'Yes — the online editor runs the same Qwen Image Layered decomposition model released by the Qwen team, wrapped in a layer-canvas workspace with selection, locks, versions, and export.',
  },
];

export default function QwenImageLayeredOnlinePage() {
  const seoPages = getSeoPagesByMarket('en');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howtoJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main className="bg-[#0a0a0a] text-white">
        {/* Hero: the searcher's intent is "try it now in a browser" */}
        <section className="relative overflow-hidden px-6 py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/25 via-blue-900/10 to-transparent" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full border border-teal-500/30 bg-teal-600/20 px-3 py-1 text-sm font-medium text-teal-300">
                Online demo
              </span>
              <span className="text-sm text-gray-500">No install · No sign-up for the first runs</span>
            </div>
            <h1 className="mb-6 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
              Run{' '}
              <span className="bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent">
                Qwen Image Layered
              </span>{' '}
              online
            </h1>
            <p className="mb-8 max-w-3xl text-lg leading-relaxed text-gray-400">
              Upload an image and the model separates it into editable transparent layers — subject,
              text, background, shadow. Edit one object without regenerating the rest, then export.
              The full workspace runs in your browser.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/studio"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-teal-200"
              >
                Open the editor — first layers free
              </Link>
              <Link
                href="/comfyui-qwen-image-layered"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-black text-white transition hover:border-white/50"
              >
                Prefer ComfyUI nodes?
              </Link>
            </div>
          </div>
        </section>

        {/* HowTo steps */}
        <section className="border-t border-white/10 px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              From flat image to editable layers, in four steps
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <article key={step.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-teal-400 font-black text-[#071123]">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-base font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Online vs ComfyUI */}
        <section className="border-t border-white/10 px-6 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Online editor or ComfyUI workflow?
              </h2>
              <p className="mt-4 leading-7 text-gray-400">
                The same Qwen Image Layered model, two ways to run it. The online editor is the
                fastest path from image to edited result: upload, decompose, edit, export — with
                layer locks, version history, and PNG export built in. The ComfyUI route fits
                pipelines that already live in node graphs and local automation.
              </p>
              <Link
                href="/comfyui-qwen-image-layered"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-300 hover:underline"
              >
                Read the ComfyUI workflow guide →
              </Link>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-base font-extrabold">What the online workspace adds on top</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-400">
                <li>· A real layer canvas: select, move, scale, rotate, opacity, blend per layer</li>
                <li>· Object-level AI actions — replace, remove, recolor, rewrite, restyle</li>
                <li>· Layer locks so brand-critical elements never enter the edit pass</li>
                <li>· Version snapshots and recoverable variations instead of destructive edits</li>
                <li>· Export the composite or any single layer as transparent PNG</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Cross-links into edit-intent SEO pages */}
        <section className="border-t border-white/10 px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              What people use the online demo for
            </h2>
            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {seoPages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/seo/en/${page.slug}`}
                  className="group rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.04]"
                >
                  <span className="text-sm font-extrabold group-hover:underline">{page.keyword}</span>
                  <span className="mt-1.5 block text-xs leading-6 text-gray-500">{page.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-white/10 px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">FAQ</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {faqs.map((item) => (
                <article key={item.q} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="text-base font-extrabold">{item.q}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-400">{item.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-white/10 bg-gradient-to-br from-teal-900/20 to-transparent px-6 py-16">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Your image, in layers, in about a minute
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-400">
              Open the editor and drop in an image. The first layered decompositions are free — see
              the layer stack before you decide anything.
            </p>
            <Link
              href="/studio"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-8 py-3 text-sm font-black text-black transition hover:bg-teal-200"
            >
              Start with your image
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
