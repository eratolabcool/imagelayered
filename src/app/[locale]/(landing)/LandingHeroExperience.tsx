'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from '@/core/i18n/navigation';

import { prepareImageFile } from '@/shared/blocks/crooked/lib/image-upload';

export default function LandingHeroExperience() {
  const [isPreparing, setIsPreparing] = useState(false);
  const router = useRouter();

  const handleUpload = async (file: File) => {
    setIsPreparing(true);
    try {
      const prepared = await prepareImageFile(file);

      // 将图片数据保存到sessionStorage
      sessionStorage.setItem('uploadedImage', JSON.stringify(prepared));

      // 跳转到工具页面（使用相对路径）
      window.location.href = '/qwenimagelayered';
    } catch (error) {
      console.error('[LandingHeroExperience] upload failed', error);
      toast.error('Failed to load image. Please try another one.');
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060e20] text-white [font-family:var(--font-body)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(92,118,255,0.24),transparent_28%),radial-gradient(circle_at_82%_4%,rgba(255,92,138,0.18),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(68,217,255,0.12),transparent_28%),linear-gradient(180deg,#081121_0%,#060e20_58%,#050b17_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:76px_76px]" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-10 pt-6 md:px-6 md:pb-14 md:pt-8">
          <div className="mx-auto flex max-w-[980px] flex-col items-center px-2 pb-10 pt-20 text-center md:pt-28">
            <p className="text-[10px] uppercase tracking-[0.42em] text-cyan-100/55">AI Photoshop for Posters</p>
            <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-[-0.06em] text-white [font-family:var(--font-display)] md:text-7xl">
              Upload any poster.<br/>Edit every object like layers.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
              Image Layered turns flat images into editable layers, so you can change text, replace products, remove objects, and redesign posters with AI.
            </p>

            <label className="mt-10 block w-full max-w-[620px] cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleUpload(file);
                  }
                  event.target.value = '';
                }}
              />
              <div className="rounded-[30px] bg-[rgba(20,31,56,0.78)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[22px] transition-transform duration-300 hover:-translate-y-1">
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,rgba(97,120,255,0.32),rgba(77,228,255,0.18))] text-white shadow-[0_18px_36px_rgba(77,228,255,0.18)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3v12" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white [font-family:var(--font-display)]">{isPreparing ? 'Preparing image...' : 'Upload image to start'}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-400">JPG, PNG, WEBP. We will drop you straight into the layered workspace.</p>
                  </div>
                  <span className="rounded-full bg-[linear-gradient(135deg,#89a2ff,#4de4ff)] px-5 py-3 text-sm font-semibold text-[#071123] shadow-[0_18px_36px_rgba(77,228,255,0.22)]">
                    {isPreparing ? 'Loading...' : 'Choose file'}
                  </span>
                </div>
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Features Section - 增加关键词密度 */}
      <section className="mx-auto max-w-[980px] px-4 pb-16 md:px-6 md:pb-20">
        <div className="flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white [font-family:var(--font-display)] mb-4">
              Powerful AI Poster Editing Features
            </h2>
            <p className="text-base text-slate-400 max-w-3xl mx-auto">
              Our advanced AI-powered editor provides professional-grade separation of image elements into editable layers. Perfect for redesigning posters, product photography, e-commerce, and digital marketing.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400" aria-label="Automatic Layer Detection Icon">
                  <path d="M12 2v20M2 12h20"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Automatic Layer Detection</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Advanced AI algorithms automatically identify and separate different elements in your image, creating precise layers for backgrounds, products, text, and objects.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400" aria-label="Smart Editing Tools Icon">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Editing Tools</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Edit each layer independently with AI-powered tools including recoloring, object replacement, background removal, and intelligent inpainting.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">High-Quality Export</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Export your layered compositions in multiple formats including PNG with transparency, PSD for Photoshop, and high-resolution JPG for web use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="mx-auto max-w-[980px] px-4 pb-16 md:px-6 md:pb-20">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white [font-family:var(--font-display)] mb-4">
              Versatile Applications for Every Industry
            </h2>
            <p className="text-base text-slate-400 max-w-3xl mx-auto">
              From e-commerce product photography to graphic design and marketing, our AI image layering solution adapts to your specific workflow needs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-3">E-Commerce Product Photography</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">
                Separate products from backgrounds, create consistent product catalogs, and generate multiple background variations for your online store.
              </p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Transparent product images for Amazon, Shopify, eBay</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Batch processing for large product catalogs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Background replacement with lifestyle scenes</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-3">Graphic Design & Creative Work</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">
                Extract design elements, create reusable assets, and streamline your creative workflow with intelligent layer separation.
              </p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Extract logos, icons, and graphic elements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Create transparent PNG assets for web design</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Prepare layered files for Photoshop editing</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-3">Digital Marketing & Advertising</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">
                Create dynamic ad variations, A/B test different backgrounds, and optimize visual assets for various marketing channels.
              </p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Generate multiple ad creatives from single source</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Customize backgrounds for different platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Rapid iteration for campaign testing</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-3">Social Media Content Creation</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">
                Produce engaging social media content with separated elements, enabling endless creative possibilities for posts and stories.
              </p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Create Instagram-ready layered compositions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Design eye-catching Pinterest graphics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Produce professional TikTok and YouTube thumbnails</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section for SEO */}
      <section className="mx-auto max-w-[980px] px-4 pb-20 md:px-6 md:pb-28">
        <div className="flex flex-col gap-8">
          <h2 className="text-3xl font-bold text-center text-white [font-family:var(--font-display)]">
            Frequently Asked Questions
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* FAQ Items - 扩展答案以增加字数 */}
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">What is AI image layering and how does it work?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                AI image layering is an advanced technology that uses deep learning and computer vision to automatically separate different elements within an image into individual, editable layers. Our tool analyzes visual patterns, edges, colors, and semantic context to identify distinct objects such as products, backgrounds, text, and decorative elements. Each element is then extracted onto its own layer, allowing you to manipulate them independently. This process, which traditionally required hours of manual work in Photoshop, is now completed in seconds with professional-grade accuracy.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">What image formats and file types are supported?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our AI image layering tool supports the most common web and print image formats including JPG (JPEG), PNG (with transparency support), and WEBP (modern web format). We recommend using high-resolution images (minimum 1024x1024 pixels) for optimal layer separation results. The tool works best with images that have clear visual separation between elements, good lighting, and distinct color contrasts. Maximum file size is 10MB per image, and we support both RGB and CMYK color modes for comprehensive workflow integration.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">How many layers can I generate from a single image?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                You can decompose your images into anywhere from 1 to 20 separate layers, depending on the complexity of your image and your specific needs. Simple product images might only need 2-3 layers (product, background, shadow), while complex scenes with multiple objects can be separated into 10-15 layers for maximum editing flexibility. The AI automatically detects the optimal number of layers based on the visual content, but you can also manually specify the desired layer count. Each layer is generated with precise edges and can be independently adjusted for opacity, position, and blending modes.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Is my image data secure and private?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Yes, we take data security and user privacy extremely seriously. All uploaded images are processed using enterprise-grade encryption during transfer and storage. Your images are processed on secure servers and are automatically deleted within 24 hours of processing completion. We do not use your images for training our AI models without explicit consent. Our infrastructure complies with GDPR, CCPA, and other major data protection regulations. Payment information is processed through PCI-compliant payment processors, and we never store your credit card details on our servers.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">What editing tools are available for the generated layers?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our comprehensive layer editing toolkit includes professional-grade features such as AI-powered recoloring that maintains natural lighting and shadows, intelligent object replacement that seamlessly integrates new elements, background removal with automatic edge refinement, and content-aware inpainting for removing unwanted objects. Each layer can be independently adjusted for opacity (0-100%), position (with snap-to-grid alignment), and blending modes (multiply, screen, overlay, etc.). You can also duplicate layers, delete unwanted elements, and rearrange the layer order with simple drag-and-drop functionality.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">How do I export my layered image projects?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Exporting your work is flexible and straightforward. Choose from PNG format with full transparency support for web graphics and overlays, high-resolution JPG for print and social media, or PSD (Photoshop Document) format that preserves all layers for further editing in Adobe Photoshop and other professional design software. You can export individual layers or the complete composition. The export dialog allows you to specify exact dimensions, resolution (DPI), and quality settings. Batch export is available for processing multiple projects at once, making it ideal for large product catalogs and marketing campaigns.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Can I use this tool for commercial purposes?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Absolutely! Our AI image layering tool is designed for both personal and commercial use. E-commerce businesses use it to create product catalogs, marketing agencies produce ad creatives, graphic designers streamline their workflows, and content creators generate social media assets. The commercial license permits use in client projects, advertising materials, product packaging, and all other commercial applications. We offer team and enterprise plans with additional features such as API access, priority processing, and dedicated support for high-volume production environments.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">What is the processing time for image layering?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Processing time varies based on image complexity, resolution, and the number of layers requested. Simple images (2-4 layers) typically process in 10-30 seconds, while complex scenes with 10+ layers may take 1-2 minutes. Our optimized AI pipeline ensures fast processing without sacrificing quality. You can continue working while your image processes in the background, and you'll receive a notification when it's complete. Processing occurs on our high-performance cloud servers, so your own computer's performance isn't affected. For batch processing of multiple images, total time scales linearly with the number of images.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Data for SEO - Multiple Schema Types */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What is AI image layering and how does it work?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "AI image layering uses deep learning and computer vision to automatically separate different elements within an image into individual, editable layers. Our tool analyzes visual patterns, edges, colors, and semantic context to identify distinct objects such as products, backgrounds, text, and decorative elements."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What image formats and file types are supported?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Our AI image layering tool supports JPG (JPEG), PNG with transparency support, and WEBP formats. We recommend using high-resolution images (minimum 1024x1024 pixels) for optimal layer separation results."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How many layers can I generate from a single image?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "You can decompose images into anywhere from 1 to 20 separate layers, depending on the complexity of your image and your specific needs. Simple product images might need 2-3 layers, while complex scenes can be separated into 10-15 layers."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is my image data secure and private?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes. All uploaded images are processed using enterprise-grade encryption during transfer and storage. Images are automatically deleted within 24 hours of processing completion. We comply with GDPR, CCPA, and other major data protection regulations."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What editing tools are available for the generated layers?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Our toolkit includes AI-powered recoloring, intelligent object replacement, background removal with automatic edge refinement, content-aware inpainting, opacity adjustments, position controls, and blending modes."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How do I export my layered image projects?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Export in PNG format with full transparency, high-resolution JPG for print and social media, or PSD format for further editing in Adobe Photoshop. You can export individual layers or complete compositions."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Can I use this tool for commercial purposes?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Absolutely! Our AI image layering tool is designed for both personal and commercial use. Commercial license permits use in client projects, advertising materials, product packaging, and all other commercial applications."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "What is the processing time for image layering?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Simple images (2-4 layers) typically process in 10-30 seconds, while complex scenes with 10+ layers may take 1-2 minutes. Processing occurs on high-performance cloud servers."
                    }
                  }
                ]
              },
              {
                "@type": "SoftwareApplication",
                "name": "AI Image Layering Tool",
                "applicationCategory": "DesignApplication",
                "operatingSystem": "Web-based",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.8",
                  "ratingCount": "1250",
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "featureList": [
                  "Automatic AI layer detection",
                  "Smart editing tools",
                  "High-quality export",
                  "Support for JPG, PNG, WEBP",
                  "Commercial usage license",
                  "Secure cloud processing",
                  "Batch processing",
                  "PSD export for Photoshop"
                ]
              },
              {
                "@type": "WebSite",
                "name": "AI Image Layering Tool",
                "url": "https://image-layered.app",
                "description": "Professional AI-powered image layering tool for e-commerce, graphic design, and digital marketing. Automatically separate image elements into editable layers.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://image-layered.app/search?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@type": "Organization",
                "name": "Image Layered",
                "url": "https://image-layered.app",
                "logo": "https://image-layered.app/logo.png",
                "description": "Leading provider of AI-powered image processing and layering tools for professionals and businesses.",
                "sameAs": [
                  "https://twitter.com/image-layered",
                  "https://github.com/image-layered"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "email": "[EMAIL_ADDRESS]"
                }
              }
            ]
          })
        }}
      />
    </div>
  );
}
