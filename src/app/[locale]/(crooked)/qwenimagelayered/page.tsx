import { Metadata } from 'next';
import { CrookedApp } from '@/shared/blocks/crooked';
import '@/shared/blocks/crooked/styles/crooked.css';
import Link from 'next/link';

// SEO Metadata optimized for target keywords
export const metadata: Metadata = {
  title: 'Qwen Image Layered - AI Image Layer Decomposition & RGBA Layer Separation Tool',
  description: 'Free AI-powered image layer editor using Qwen Image Layered model. Automatically decompose images into editable RGBA layers. Photoshop alternative for layer separation. Supports ComfyUI workflow integration.',
  keywords: 'qwen image layered, qwen-image-layered, image layer decomposition, RGBA layer separation, AI image editing, automatic layer extraction, layer separation AI, image to layers, AI image decomposer, ComfyUI qwen-image-layered',
  authors: [{ name: 'Qwen Image Layered Team' }],
  creator: 'Qwen Image Layered',
  publisher: 'Qwen Image Layered',
  applicationName: 'Qwen Image Layered Editor',
  category: 'Design Application',
  classification: 'Image Editing Software',
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
    canonical: 'https://your-domain.com/qwenimagelayered',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com/qwenimagelayered',
    title: 'Qwen Image Layered - Free AI Image Layer Decomposition Tool',
    description: 'Decompose images into editable RGBA layers automatically using Qwen AI. Free online image layer editor and Photoshop alternative.',
    siteName: 'Qwen Image Layered',
    images: [
      {
        url: 'https://your-domain.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Qwen Image Layered Editor Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qwen Image Layered - Free AI Image Layer Editor',
    description: 'Automatic image decomposition and RGBA layer separation powered by Qwen AI. Free online tool.',
    images: ['https://your-domain.com/og-image.jpg'],
  },
};

// Structured Data for SoftwareApplication
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Qwen Image Layered Editor',
  description: 'Free AI-powered image layer editor using Qwen Image Layered model for automatic image decomposition and RGBA layer separation.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Automatic image layer decomposition',
    'RGBA layer separation',
    'AI-powered image editing',
    'Hierarchical layer management',
    'Image recoloring with AI',
    'Object replacement and removal',
    'High-resolution export',
    'Free to use',
    'ComfyUI workflow support',
  ],
  keywords: 'qwen image layered, qwen-image-layered, image layer decomposition, RGBA layers, AI image editing, Photoshop alternative, image segmentation, automatic layer separation, free image editing',
  author: {
    '@type': 'Organization',
    name: 'Qwen Image Layered Team',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
};

// FAQ Structured Data
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Qwen Image Layered?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Qwen Image Layered is an AI model developed by Alibaba that automatically decomposes images into separate editable layers. It uses advanced computer vision to identify and extract individual visual elements from a single image.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Qwen Image Layered work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Qwen Image Layered uses deep learning to analyze an image and identify distinct visual elements. It then separates these elements into individual RGBA layers, allowing you to edit, recolor, or remove specific parts of an image without affecting others.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Qwen Image Layered free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Qwen Image Layered offers a free tier with limited daily uses. You can decompose images and export layers at no cost. Premium features may be available for commercial use.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Qwen Image Layered be used with ComfyUI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Qwen Image Layered can be integrated into ComfyUI workflows. See our ComfyUI tutorial page for step-by-step instructions on setting up the workflow.',
      },
    },
    {
      '@type': 'Question',
      name: 'What formats can I export?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can export individual layers as PNG files with transparency, or export the composited image in various resolutions up to 4K. Layers maintain their original quality and transparency information.',
      },
    },
  ],
};

export default function QwenImageLayeredPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0a0a0a] py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Qwen Image Layered
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mb-8 leading-relaxed">
            AI-powered automatic image layer decomposition. Transform any image into editable RGBA layers
            instantly. The free alternative to manual layer separation in Photoshop.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#editor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-colors"
            >
              Try It Free
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <Link
              href="/comfyui-qwen-image-layered"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              ComfyUI Tutorial
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#0d0d0d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">What is Qwen Image Layered?</h2>
          <p className="text-gray-400 mb-12 max-w-3xl">
            Qwen Image Layered is an advanced AI model that automatically separates complex images into
            individual editable layers. Powered by Alibaba's Qwen AI technology, it identifies visual
            elements and extracts them as transparent PNG layers.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Automatic Decomposition</h3>
              <p className="text-gray-400 text-sm">
                Upload any image and let AI automatically identify and extract visual elements into separate layers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                  <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">RGBA Layer Support</h3>
              <p className="text-gray-400 text-sm">
                Each extracted layer maintains full transparency (RGBA), perfect for compositing and further editing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Editing Tools</h3>
              <p className="text-gray-400 text-sm">
                Recolor, replace, or remove objects using natural language prompts with our AI-powered editing tools.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Hierarchical Layers</h3>
              <p className="text-gray-400 text-sm">
                Recursive decomposition allows for multi-level layer extraction. Decompose layers within layers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">High-Res Export</h3>
              <p className="text-gray-400 text-sm">
                Export layers and composited images in resolutions up to 4K with full quality preservation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-pink-600/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">ComfyUI Integration</h3>
              <p className="text-gray-400 text-sm">
                Use Qwen Image Layered in your ComfyUI workflows with our custom nodes and workflow templates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#0a0a0a] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">How Qwen Image Layered Works</h2>
          <p className="text-gray-400 mb-12 max-w-3xl">
            Our AI-powered decomposition process uses advanced computer vision to understand image structure
            and extract meaningful visual elements.
          </p>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Your Image</h3>
                <p className="text-gray-400">
                  Simply drag and drop any image onto the editor. Supports PNG, JPG, and WEBP formats
                  up to 10MB. The AI works best with clear, high-resolution images.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Automatic Layer Detection</h3>
                <p className="text-gray-400">
                  The Qwen Image Layered model analyzes your image and identifies distinct visual elements
                  like foreground objects, backgrounds, text, and shadows. You can choose how many layers
                  to extract (1-20).
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Edit & Refine</h3>
                <p className="text-gray-400">
                  Use our AI tools to recolor specific elements, replace objects, or remove unwanted items.
                  All edits are non-destructive and can be reversed at any time.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Export Your Layers</h3>
                <p className="text-gray-400">
                  Download individual layers as transparent PNGs or export the entire composited image.
                  Choose from 1K, 2K, or 4K resolutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-[#0d0d0d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Use Cases</h2>
          <p className="text-gray-400 mb-12 max-w-3xl">
            Qwen Image Layered is perfect for designers, developers, and content creators who need
            to extract or edit image elements quickly.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Asset Extraction for Game Dev</h3>
              <p className="text-gray-400 text-sm">
                Extract game assets from reference images or promotional materials. Get clean, separated
                sprites ready for your game engine.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">E-commerce Product Images</h3>
              <p className="text-gray-400 text-sm">
                Remove backgrounds and extract product elements for transparent PNGs. Create composite
                product images without complex masking.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-green-900/20 to-cyan-900/10 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">UI/UX Design</h3>
              <p className="text-gray-400 text-sm">
                Extract icons, buttons, and UI elements from mockups. Modify individual components
                without redrawing the entire design.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-orange-900/20 to-red-900/10 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Photo Manipulation</h3>
              <p className="text-gray-400 text-sm">
                Replace backgrounds, recolor objects, or remove unwanted elements using natural language
                prompts. Professional results in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#0a0a0a] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">What is Qwen Image Layered?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                Qwen Image Layered is an AI model developed by Alibaba that automatically decomposes
                images into separate editable layers. It uses advanced computer vision to identify and
                extract individual visual elements from a single image, enabling non-destructive editing
                and easy compositing.
              </div>
            </details>

            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">How does Qwen Image Layered work?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                Qwen Image Layered uses deep learning to analyze an image and identify distinct visual
                elements. It then separates these elements into individual RGBA layers, allowing you to
                edit, recolor, or remove specific parts of an image without affecting others.
              </div>
            </details>

            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">Can Qwen Image Layered be used with ComfyUI?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                Yes! Qwen Image Layered can be integrated into ComfyUI workflows. Check out our
                <Link href="/comfyui-qwen-image-layered" className="text-blue-400 hover:underline mx-1">
                  ComfyUI tutorial page
                </Link>
                for step-by-step instructions on setting up the workflow and using custom nodes.
              </div>
            </details>

            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">What is the difference between Qwen Image Layered and Photoshop?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                While Photoshop requires manual layer separation using selection tools and masks,
                Qwen Image Layered automates the entire process using AI. It can identify and extract
                layers that would take hours to create manually. Qwen Image Layered is also free to use
                and runs directly in your browser without installation.
              </div>
            </details>

            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">What formats can I export?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                You can export individual layers as PNG files with full transparency, or export the
                composited image in various resolutions up to 4K. All exports maintain original quality
                and include complete RGBA information for transparency.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Related Pages Section */}
      <section className="bg-[#0d0d0d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Related Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/comfyui-qwen-image-layered"
              className="p-6 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-white/10 hover:border-blue-500/50 transition-colors group"
            >
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                ComfyUI Tutorial
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Learn how to integrate Qwen Image Layered into your ComfyUI workflows.
              </p>
              <span className="text-blue-400 text-sm font-medium group-hover:underline">
                Read Tutorial →
              </span>
            </Link>

            <a
              href="#editor"
              className="p-6 rounded-xl bg-gradient-to-br from-green-900/20 to-cyan-900/10 border border-white/10 hover:border-green-500/50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Try the Editor</h3>
              <p className="text-gray-400 text-sm mb-4">
                Experience Qwen Image Layered directly in your browser. No installation required.
              </p>
              <span className="text-green-400 text-sm font-medium">
                Start Using →
              </span>
            </a>

            <a
              href="/pricing"
              className="p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-white/10 hover:border-purple-500/50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Pricing & Credits</h3>
              <p className="text-gray-400 text-sm mb-4">
                View our credit system and upgrade options for extended usage.
              </p>
              <span className="text-purple-400 text-sm font-medium">
                View Plans →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Editor Anchor */}
      <div id="editor" />

      {/* Main App */}
      <CrookedApp />
    </>
  );
}
