import { Metadata } from 'next';
import React from 'react';

// SEO Metadata for Quick Test Page
export const metadata: Metadata = {
  title: 'AI Photoshop for Posters - Free Demo | AI Image Decomposition',
  description: 'Try the ultimate AI poster editor for free. Experience automatic image decomposition and professional-grade layer editing. No signup required.',
  keywords: 'AI Photoshop, poster editor, image decomposition demo, RGBA layers online test, AI image editing demo',
  authors: [{ name: 'Image Layered Team' }],
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
    canonical: 'https://your-domain.com/quicktest',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com/quicktest',
    title: 'AI Photoshop for Posters - Free Quick Test Demo',
    description: 'Test the ultimate AI poster editor. Automatically split images into editable layers. Free online demo.',
    siteName: 'Image Layered AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qwen Image Layered - Quick Test Demo',
    description: 'Try Qwen Image Layered AI model for free. Test image decomposition and layer separation.',
  },
};

// Structured Data for WebApplication
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Photoshop for Posters Demo',
  description: 'Free demo to test the ultimate AI poster editor for automatic image decomposition and RGBA layer separation.',
  url: 'https://your-domain.com/quicktest',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Test automatic image decomposition',
    'Try RGBA layer separation online',
    'No registration required',
    'Free to use',
    'Instant results',
  ],
  keywords: 'qwen image layered demo, image layer decomposition test, RGBA layers online test, AI image editing demo',
};

export default function QuickTestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h1 className="text-xl font-semibold text-white">AI Photoshop - Quick Test</h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/qwenimagelayered"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-sm transition-colors"
              >
                Editor
              </a>
              <a
                href="/"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
              >
                Home
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Test AI Photoshop for Posters
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Experience automatic image decomposition and RGBA layer separation powered by Qwen and Flux AI models.
              Try our free AI poster editor below - no signup required.
            </p>
          </div>

          {/* Demo Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Main Editor Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-pink-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 19 7-7 7 7"/>
                    <path d="m18 12-7-7-7 7"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Full-Featured Editor</h3>
                  <p className="text-gray-400 text-sm">Complete AI layer decomposition tool</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Upload your image and let our AI automatically decompose it into editable RGBA layers.
                Edit, recolor, replace products, and redesign posters in seconds.
              </p>
              <ul className="space-y-2 mb-6 text-gray-300">
                <li className="flex items-center gap-2">
                  <svg className="text-green-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Automatic image layer decomposition
                </li>
                <li className="flex items-center gap-2">
                  <svg className="text-green-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  RGBA layer separation with transparency
                </li>
                <li className="flex items-center gap-2">
                  <svg className="text-green-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  AI-powered recoloring and object replacement
                </li>
                <li className="flex items-center gap-2">
                  <svg className="text-green-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  High-resolution export (up to 4K)
                </li>
              </ul>
              <a
                href="/qwenimagelayered"
                className="block w-full text-center px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold transition-all"
              >
                Try Free Editor →
              </a>
            </div>

            {/* Hugging Face Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="m2 17 10 5 10-5"/>
                    <path d="m2 12 10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Hugging Face Demo</h3>
                  <p className="text-gray-400 text-sm">Official Qwen-Layered Space</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Visit the official Hugging Face Space to try Qwen Image Layered directly.
                Experience the raw model interface for image decomposition.
              </p>
              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">
                  <span className="text-yellow-400 font-semibold">Note:</span> Hugging Face demo opens in a new tab
                </p>
              </div>
              <a
                href="https://huggingface.co/spaces/Qwen/Qwen-Image-Layered"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/20"
              >
                Open Hugging Face Demo ↗
              </a>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Why Choose AI Photoshop for Posters?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="text-blue-400" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M2 12h20"/>
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">100% Free</h4>
                <p className="text-gray-400 text-sm">No credit card, no signup, no hidden fees</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg className="text-purple-400" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Fast Processing</h4>
                <p className="text-gray-400 text-sm">AI-powered decomposition in seconds</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <svg className="text-pink-400" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">High Quality</h4>
                <p className="text-gray-400 text-sm">Export up to 4K resolution with AI upscaling</p>
              </div>
            </div>
          </div>

          {/* Model Info Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">About Qwen Image Layered Model</h3>
            <p className="text-gray-300 mb-4">
              Qwen-Image-Layered is a state-of-the-art AI model from Alibaba's Qwen team that specializes in
              automatic image decomposition and RGBA layer separation. It uses advanced computer vision and
              deep learning to identify visual components and separate them into distinct, editable layers.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Key Features:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Automatic image layer decomposition</li>
                  <li>• RGBA layer separation with transparency</li>
                  <li>• Hierarchical layer structure support</li>
                  <li>• High-quality image segmentation</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Use Cases:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Photo editing and manipulation</li>
                  <li>• Design asset extraction</li>
                  <li>• Background removal</li>
                  <li>• Object replacement and recoloring</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://huggingface.co/Qwen/Qwen-Image-Layered"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors"
              >
                Model Card
              </a>
              <a
                href="https://arxiv.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
              >
                Research Paper
              </a>
              <a
                href="/qwenimagelayered"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-sm transition-colors"
              >
                Try Qwen Image Layered Editor
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
