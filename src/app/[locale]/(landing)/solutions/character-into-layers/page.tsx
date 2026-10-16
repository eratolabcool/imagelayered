import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Layers,
  Sparkles,
  User,
  Wand2,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title:
    'AI Live2D Separator & 2D Character Slicing Tool Online | Image Layered',
  description:
    'Separate 2D anime and VTuber characters into raster layers with AI. Automatically deconstruct hair, limbs, outfit, and background with occluded area inpainting. Export a layered PSD for the next Live2D or Spine preparation step.',
  keywords: [
    'separator ai live2d',
    'layering 2d character',
    'image splitter ai anime live2d',
    'image slicing tool online for rigging',
    'ai character into layers',
    'live2d model layer separator',
    'anime character psd layers',
    'spine 2d character slicing',
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
    canonical: '/solutions/character-into-layers',
  },
  openGraph: {
    type: 'website',
    url: '/solutions/character-into-layers',
    title: 'AI Live2D Separator & 2D Character Slicing Tool Online',
    description:
      'Turn flat anime character art into separated raster layers with automatic occlusion completion. Export a multi-layer PSD for the next Live2D or Spine preparation step.',
    siteName: 'Image Layered',
  },
};

const structuredSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Image Layered - Live2D Character Layer Separator',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'HowTo',
      name: 'How to split 2D characters into layers for Live2D rigging',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload character illustration',
          text: 'Upload any 2D anime character illustration, VTuber art, or game sprite in JPG or PNG format.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'AI Layer Decomposition',
          text: 'Our AI model identifies character anatomy and splits the image into hair, face, limbs, garments, and background with automatic inpainting behind overlaps.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Inspect & Adjust',
          text: 'Review separated layers on the live canvas. Check transparency, hidden surfaces, and edge quality.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Export Layered PSD',
          text: 'Download the project as a multi-layer Adobe Photoshop (.psd) file or transparent PNG ZIP, ready to open in Live2D Cubism, Clip Studio Paint, or Spine.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does AI Live2D layer separation work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Image Layered employs deep generative decomposition models to segment a character into semantic parts (such as bang, back hair, facial features, body, clothing, and accessories). Crucially, it reconstructs and inpaints parts that are visually blocked by foreground elements so riggers do not end up with empty transparent holes when moving limbs.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I export directly to a PSD file for Live2D Cubism?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! You can export your decomposed character as a standard multi-layer Adobe Photoshop (.psd) file. Each layer retains its exact coordinate alignment, layer name, opacity, and alpha transparency, allowing seamless drag-and-drop into Live2D Cubism Editor or Spine.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does it inpaint hidden parts behind overlapping layers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. One of the primary pain points in 2D character rigging is that removing foreground hair or clothes leaves missing sections on the torso or face. Our layer decomposition engine automatically inpaints and completes the occluded geometry behind overlapping elements.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this tool free to try?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You can test your character images in our browser Studio without creating an account or installing local software.',
          },
        },
      ],
    },
  ],
};

const sampleLayers = [
  { name: '01 Front Hair / Bangs', role: 'Animation physics & sway' },
  { name: '02 Eyes & Facial Features', role: 'Blinks, expressions & gaze' },
  { name: '03 Face Base & Head', role: 'Head yaw, pitch & roll rotations' },
  { name: '04 Torso & Limbs', role: 'Breathing, arm & body IK mesh' },
  { name: '05 Clothing & Accessories', role: 'Secondary motion & cloth sway' },
  { name: '06 Back Hair & Wings', role: 'Z-depth layering behind torso' },
  { name: '07 Inpainted Background', role: 'Clean environment without subject' },
];

export default function CharacterIntoLayersPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-zinc-950 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.15),transparent_70%)]" />
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <Sparkles className="size-3.5" />
            Live2D & Rigging Workflow Engine
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Separate 2D Anime Characters into{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Rig-Ready Layers
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Skip dozens of hours of manual pen-tool slicing. Deconstruct any flat
            anime illustration or VTuber artwork into clean, overlapping layers
            with automated occlusion inpainting. Export directly to multi-layer
            PSD for Live2D Cubism and Spine.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/studio"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
            >
              Start Slicing Character Free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/image-to-psd"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-6 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
            >
              Explore PSD Workflow
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Multi-layer PSD Export</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Occlusion Inpainting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Live2D Cubism & Spine Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Alpha Transparency ZIP</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Layer Preview Demo */}
      <section className="border-b border-zinc-800/80 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Anatomy of an AI-Decomposed Character
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Each anatomical segment is extracted to its own transparent RGBA
              channel with completed borders.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-center">
            {/* Visual breakdown representation */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <Layers className="size-4" /> Live2D Layer Stack Output
                </span>
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300">
                  7 Layers Decomposed
                </span>
              </div>
              <div className="space-y-2 py-4">
                {sampleLayers.slice(0, 5).map((l, i) => (
                  <div
                    key={l.name}
                    className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-2.5 text-xs transition hover:border-blue-500/40"
                  >
                    <div className="flex items-center gap-2.5 font-medium text-zinc-200">
                      <span className="flex size-5 items-center justify-center rounded bg-blue-500/20 text-[11px] font-bold text-blue-400">
                        {i + 1}
                      </span>
                      {l.name}
                    </div>
                    <span className="text-[11px] text-zinc-500">{l.role}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-blue-950/30 border border-blue-800/40 p-3 text-xs text-blue-300">
                <span className="font-semibold flex items-center gap-2">
                  <Download className="size-3.5" /> Direct Photoshop (.psd)
                  Ready
                </span>
                <span>Lossless RGBA</span>
              </div>
            </div>

            {/* Why it solves the Live2D rigger dilemma */}
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Wand2 className="size-5 text-blue-400" />
                  Automatic Occlusion Inpainting
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  When manual artists slice a flat drawing, removing the arm or
                  hair reveals an empty silhouette hole. Our AI automatically
                  reconstructs and completes what lies behind, eliminating the
                  hours normally spent repainting the torso, shoulders, and back
                  hair.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Layers className="size-5 text-indigo-400" />
                  Preserve Fine Hair Strands & Alpha Edges
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Clean alpha channels mean no ugly halos or fringing around
                  hair bangs when animating physics. Bangs, side hair, and ahoge
                  maintain crisp anti-aliased transparency.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Zap className="size-5 text-purple-400" />
                  Direct Import to Live2D Cubism & Spine
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Export directly as a multi-layer PSD file with correct layer
                  hierarchies, or as a structured ZIP file containing individual
                  transparent PNGs. Ready for import into your own rigging workflow; mesh and deformer setup still happen in Live2D or Spine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step Workflow */}
      <section className="border-b border-zinc-800/80 bg-zinc-900/20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              From Flat Illustration to Layered Character Assets in 4 Steps
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Transform hours of tedious slicing into minutes of creative
              rigging.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-blue-500/20 text-sm font-bold text-blue-400">
                1
              </span>
              <h3 className="mt-4 font-semibold text-white">Upload Character</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Upload your flat PNG, JPG, or WebP character illustration or
                VTuber concept art.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/20 text-sm font-bold text-indigo-400">
                2
              </span>
              <h3 className="mt-4 font-semibold text-white">AI Decomposition</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                The model decomposes body, hair, garments, and accessories with
                underlying inpainting.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-purple-500/20 text-sm font-bold text-purple-400">
                3
              </span>
              <h3 className="mt-4 font-semibold text-white">Canvas Inspection</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Solo or hide layers, check edge transparency, and prompt local
                refinements if desired.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/20 text-sm font-bold text-emerald-400">
                4
              </span>
              <h3 className="mt-4 font-semibold text-white">Export PSD / ZIP</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Click “Export PSD” and import directly into Live2D Cubism Editor
                or Spine to begin rigging.
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
                How does AI Live2D layer separation work?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Image Layered uses deep vision-language decomposition models
                trained on complex digital art. It identifies overlapping
                elements and mathematically separates each layer while
                synthesizing the occluded background pixels behind them.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h3 className="font-semibold text-white">
                Can I export directly to a PSD file for Live2D Cubism?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Yes. The Studio features a dedicated “Export PSD” engine that
                packages all layers with their proper canvas coordinates,
                transparency channels, and names directly into an Adobe
                Photoshop (.psd) file.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h3 className="font-semibold text-white">
                Does it support Spine 2D and After Effects?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Yes. Spine 2D artists can either import the generated PSD or
                export all transparent layers as a ZIP archive to quickly set up
                bone hierarchies.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h3 className="font-semibold text-white">
                What file formats can I upload?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                You can upload JPG, PNG, and WebP images up to 25 MB. High-resolution
                character illustrations with distinct silhouettes produce the
                cleanest slices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to rig your character in minutes?
          </h2>
          <p className="mt-4 text-sm text-zinc-400">
            Open Studio now and test your character art with one click. No
            installation required.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-500"
            >
              Open Studio & Separate Character
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
