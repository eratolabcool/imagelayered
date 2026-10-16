import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileImage,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title:
    'Image to PSD with Layers — Convert Flat Image to Photoshop PSD Online | Image Layered',
  description:
    'Convert any flat JPG, PNG, or AI-generated image into an editable, multi-layer Adobe Photoshop (.psd) file online. Automatically separate subject, text, objects, and inpainted background without manual masking.',
  keywords: [
    'image to psd with layers',
    'turn image into an editable psd',
    'convert image to photo shop layers',
    'ai to psd with layers',
    'jpg to psd with layers',
    'how to convert an image to photoshop with layers',
    'convert image to psd with layers ai',
    'image layer separator online',
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
    canonical: '/image-to-psd',
  },
  openGraph: {
    type: 'website',
    url: '/image-to-psd',
    title: 'Image to PSD with Layers — Image Layered',
    description:
      'Turn flat graphics, posters, and Midjourney generations into fully editable, layered PSD files online. Export with preserved alpha and occlusion filling.',
    siteName: 'Image Layered',
  },
};

const structuredSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Image Layered - Multi-layer PSD Export',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'HowTo',
      name: 'How to convert an image to Photoshop with layers',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload flat image',
          text: 'Upload any flat JPG, PNG, or WebP graphic, advertisement poster, or AI render.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Automatic layer extraction',
          text: 'The AI decomposes the composition into distinct semantic layers (subject, text, foreground objects, background, and shadows).',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Reconstruct occluded backgrounds',
          text: 'The engine completes hidden areas behind foreground elements so every layer is clean and self-contained.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Export multi-layer PSD',
          text: 'Click Export PSD to download a standard .psd file that opens directly in Adobe Photoshop, Clip Studio Paint, or Photopea with all layers intact.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does the exported file contain real Photoshop layers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! The output is a genuine Adobe Photoshop (.psd) file containing independent raster layers with alpha transparency, proper naming, z-index ordering, and position coordinates. You can toggle, transform, mask, and filter each layer inside Photoshop or Photopea.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert AI-generated images (Midjourney, Flux, Stable Diffusion) into PSDs?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. AI image generators typically deliver a single flattened JPEG or PNG. Image Layered was built specifically to recover the multi-layer design structure from these flattened creations, allowing designers to perform client revisions without regenerating the whole scene.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens to the background behind separated subjects?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Unlike simple background cutouts that leave black or empty voids, our layer decomposition models perform generative completion (inpainting) across occluded regions. The resulting background layer is clean and intact.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need Photoshop installed to use this tool?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. The layer separation and PSD generation run entirely in your web browser. You can inspect, adjust, hide, and remix layers directly inside our online Studio, and open the PSD in Photoshop, Clip Studio, or free tools like Photopea whenever you are ready.',
          },
        },
      ],
    },
  ],
};

export default function ImageToPsdPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-zinc-950 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(37,99,235,0.15),transparent_70%)]" />
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <FileImage className="size-3.5" />
            Image Layered PSD Export
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Convert Any Image to{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              PSD with Editable Layers
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Turn flat posters, logos, ads, and AI-generated artwork into
            genuine multi-layer Photoshop (.psd) files online. Automatic
            element segmentation with background reconstruction — zero manual
            clipping paths.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/studio"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
            >
              Upload Image & Convert to PSD
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/solutions/character-into-layers"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-6 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
            >
              Live2D Character Slicing
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Standard .PSD File Output</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Full Alpha Transparency</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Photoshop & Clip Studio Compatible</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Inpainted Clean Backgrounds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Manual Cutouts vs AI PSD Decomposition */}
      <section className="border-b border-zinc-800/80 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Why Traditional Cutouts Fail — And How Image Layered Wins
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Stop rebuilding artwork from scratch just to move one headline or
              retouch one object.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-6">
              <div className="flex items-center gap-2 text-red-400">
                <span className="flex size-6 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold">
                  ✕
                </span>
                <h3 className="font-semibold">The Old Way (Manual Pen Tool)</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Hours spent tracing pen tool paths around hair, clothing, and props.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Removing a foreground element leaves an ugly hole that requires manual clone-stamping.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>AI re-generation rerolls the whole image, losing facial landmarks and lighting.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold">
                  ✓
                </span>
                <h3 className="font-semibold">The Image Layered Way</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Automatic semantic decomposition into 4 to 8 independent layers in seconds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Occluded background areas are automatically inpainted and reconstructed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Direct .psd export: open in Photoshop or Clip Studio with layers ready to edit.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="border-b border-zinc-800/80 bg-zinc-900/20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Engineered for Production Design Workflows
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Everything you need to turn static images into modular creative
              assets.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <Layers className="size-6 text-blue-400" />
              <h3 className="mt-4 font-semibold text-white">Full Layer Hierarchy</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Maintains exact z-index layering from foreground typography down
                to background plates and lighting effects.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <Download className="size-6 text-cyan-400" />
              <h3 className="mt-4 font-semibold text-white">One-Click PSD & ZIP Export</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Export directly to standard Adobe Photoshop PSD format or grab
                an archive of all isolated transparent PNG layers.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <Sparkles className="size-6 text-purple-400" />
              <h3 className="mt-4 font-semibold text-white">AI Layer Inpainting</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Hidden textures and patterns behind foreground objects are
                synthesized naturally, avoiding blank gaps.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <Palette className="size-6 text-pink-400" />
              <h3 className="mt-4 font-semibold text-white">Post-Generative Editing</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Fix hands, alter clothing colors, or rewrite headlines without
                jeopardizing the rest of your winning composition.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <ShieldCheck className="size-6 text-emerald-400" />
              <h3 className="mt-4 font-semibold text-white">Lossless Quality</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Preserves source resolution up to 4K. No aggressive downsampling
                or compression artifacts.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <FileImage className="size-6 text-indigo-400" />
              <h3 className="mt-4 font-semibold text-white">Broad Compatibility</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Compatible with Adobe Photoshop (CS6 through CC), Clip Studio
                Paint, GIMP, Krita, Affinity Photo, and Photopea.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-b border-zinc-800/80 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h3 className="font-semibold text-white">
                Does the exported file contain real Photoshop layers?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Yes. Our browser export engine generates valid binary Photoshop
                PSD files. Every layer is an independent raster surface with
                transparency, correct coordinates, and customizable visibility.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h3 className="font-semibold text-white">
                Can I convert AI images from Midjourney or Flux to PSD?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Yes. That is one of the most popular use cases. Drop your final
                Midjourney, Flux, or DALL-E image into Image Layered, and receive
                a layered PSD ready for client revisions or motion graphics.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h3 className="font-semibold text-white">
                Can I edit individual layers inside the browser before exporting?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Yes. Our Studio workspace allows you to hide, reposition, scale,
                and apply AI-directed prompt edits to any layer before
                exporting the final PSD or PNG composition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Convert your flat image to PSD today
          </h2>
          <p className="mt-4 text-sm text-zinc-400">
            Open the Studio, upload your file, and experience automated
            multi-layer decomposition.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-500"
            >
              Open Studio & Convert to PSD
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
      />
    </main>
  );
}
