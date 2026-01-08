import { Metadata } from 'next';
import Link from 'next/link';

// SEO Metadata optimized for ComfyUI + Qwen Image Layered keywords
export const metadata: Metadata = {
  title: 'ComfyUI Qwen Image Layered Tutorial - Complete Workflow Guide',
  description: 'Learn how to use Qwen Image Layered in ComfyUI. Step-by-step tutorial for setting up custom nodes, workflow templates, and automating image layer decomposition.',
  keywords: 'comfyui qwen-image-layered, ComfyUI tutorial, qwen image layered ComfyUI, ComfyUI custom nodes, image layer decomposition workflow, ComfyUI qwen layered, qwen-image-layered fp8',
  authors: [{ name: 'Qwen Image Layered Team' }],
  creator: 'Qwen Image Layered',
  publisher: 'Qwen Image Layered',
  category: 'Tutorial',
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
    canonical: 'https://your-domain.com/comfyui-qwen-image-layered',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com/comfyui-qwen-image-layered',
    title: 'ComfyUI Qwen Image Layered Tutorial - Complete Workflow Guide',
    description: 'Learn how to use Qwen Image Layered in ComfyUI. Step-by-step tutorial for setting up custom nodes and workflows.',
    siteName: 'Qwen Image Layered',
    images: [
      {
        url: 'https://your-domain.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ComfyUI Qwen Image Layered Workflow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ComfyUI Qwen Image Layered Tutorial',
    description: 'Complete guide to using Qwen Image Layered in ComfyUI workflows',
    images: ['https://your-domain.com/og-image.jpg'],
  },
};

// Structured Data for Tutorial
const tutorialJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Tutorial',
  name: 'ComfyUI Qwen Image Layered Tutorial',
  description: 'Learn how to integrate and use Qwen Image Layered in ComfyUI workflows for automatic image layer decomposition.',
  audience: {
    '@type': 'Audience',
    audienceType: 'Designers and developers using ComfyUI',
  },
  educationalLevel: 'Intermediate',
  keywords: 'ComfyUI, Qwen Image Layered, workflow, tutorial, image layer decomposition',
  author: {
    '@type': 'Organization',
    name: 'Qwen Image Layered Team',
  },
};

// FAQ Structured Data
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I install Qwen Image Layered in ComfyUI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can install Qwen Image Layered in ComfyUI by adding our custom node to your ComfyUI nodes folder. The node connects directly to the fal.ai API for Qwen Image Layered model inference.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the system requirements for ComfyUI Qwen Image Layered?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Since Qwen Image Layered runs on fal.ai cloud servers, ComfyUI itself has minimal requirements. You need a working ComfyUI installation and an API key from fal.ai. No local GPU is required for inference.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use LoRA models with Qwen Image Layered in ComfyUI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Qwen Image Layered supports LoRA models for custom style fine-tuning. You can load LoRA weights through the lora_model_url parameter in our ComfyUI custom node.',
      },
    },
    {
      '@type': 'Question',
      name: 'What parameters can I adjust in the ComfyUI workflow?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Key parameters include: num_layers (1-20), guidance_scale (1-20), num_inference_steps (10-100), seed, and acceleration mode. You can also set custom prompts and negative prompts.',
      },
    },
  ],
};

export default function ComfyUITutorialPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tutorialJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative bg-[#0a0a0a] py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-purple-600/30 text-purple-400 text-sm font-medium rounded-full border border-purple-500/30">
              Tutorial
            </span>
            <span className="text-gray-500 text-sm">Last updated: January 2025</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            ComfyUI + <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Qwen Image Layered</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mb-8 leading-relaxed">
            Learn how to integrate Qwen Image Layered into your ComfyUI workflows.
            Automate image layer decomposition with our custom nodes and templates.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#setup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500 transition-colors"
            >
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <Link
              href="/qwenimagelayered"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              Back to Editor
            </Link>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-[#0d0d0d] py-8 px-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-6 text-sm">
            <a href="#setup" className="text-purple-400 hover:underline">Setup</a>
            <a href="#workflow" className="text-gray-400 hover:text-white transition-colors">Workflow</a>
            <a href="#parameters" className="text-gray-400 hover:text-white transition-colors">Parameters</a>
            <a href="#lora" className="text-gray-400 hover:text-white transition-colors">LoRA Support</a>
            <a href="#troubleshooting" className="text-gray-400 hover:text-white transition-colors">Troubleshooting</a>
            <a href="#faq" className="text-gray-400 hover:text-white transition-colors">FAQ</a>
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section id="setup" className="bg-[#0a0a0a] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">1. Setup and Installation</h2>
          <p className="text-gray-400 mb-8">
            Getting started with Qwen Image Layered in ComfyUI requires a few simple steps.
            Since the model runs on fal.ai cloud servers, no local GPU is needed.
          </p>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Step 1: Get Your API Key</h3>
              <p className="text-gray-400">
                You will need a fal.ai API key to use Qwen Image Layered. Sign up at{' '}
                <a href="https://fal.ai" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                  fal.ai
                </a>{' '}
                and copy your API key from the dashboard.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Step 2: Install ComfyUI</h3>
              <p className="text-gray-400 mb-4">
                If you have not already, install ComfyUI following their{' '}
                <a href="https://github.com/comfyanonymous/ComfyUI" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                  official documentation
                </a>. Make sure it is running correctly before adding our custom node.
              </p>
              <div className="bg-black/40 p-4 rounded-xl text-sm text-gray-300">
                <p className="mb-2"><span className="text-green-400"># Clone ComfyUI</span></p>
                <p className="mb-2">git clone https://github.com/comfyanonymous/ComfyUI.git</p>
                <p className="mb-2">cd ComfyUI</p>
                <p><span className="text-green-400"># Install dependencies</span></p>
                <p>pip install -r requirements.txt</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Step 3: Add Qwen Image Layered Node</h3>
              <p className="text-gray-400 mb-4">
                Create a new Python file in your ComfyUI custom nodes directory. The node connects to
                fal.ai API for Qwen Image Layered model inference.
              </p>
              <p className="text-gray-400 mb-4">
                <strong>File location:</strong> <code className="bg-white/10 px-2 py-1 rounded">ComfyUI/custom_nodes/fal_qwen_image_layered.py</code>
              </p>
              <p className="text-gray-400">
                After installing the custom node, restart ComfyUI and you should see the Qwen Image Layered
                node in the <code className="bg-white/10 px-2 py-1 rounded">image/analysis</code> category.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-green-900/20 border border-green-500/30">
              <h3 className="text-xl font-semibold text-green-400 mb-2">Setup Complete</h3>
              <p className="text-gray-400">
                Once the custom node is installed and ComfyUI is restarted, you are ready to use
                Qwen Image Layered in your workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="bg-[#0d0d0d] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">2. Basic Workflow</h2>
          <p className="text-gray-400 mb-8">
            Here is the recommended workflow structure for using Qwen Image Layered in ComfyUI.
          </p>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Workflow Structure</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-white font-medium">Load Image Node</h4>
                  <p className="text-gray-400 text-sm">
                    Use the standard Load Image node to import your source image into the workflow.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-white font-medium">Qwen Image Layered Node</h4>
                  <p className="text-gray-400 text-sm">
                    Connect your image to the Qwen Image Layered node and configure parameters like
                    number of layers, guidance scale, and inference steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-white font-medium">Preview and Save Nodes</h4>
                  <p className="text-gray-400 text-sm">
                    Add Preview Image nodes for each output layer, and Save Image nodes for export.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Workflow JSON Template</h3>
            <p className="text-gray-400 text-sm mb-4">
              Copy this JSON template and import it into ComfyUI to get started quickly:
            </p>
            <div className="bg-black/40 p-4 rounded-xl text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
{`{
  "nodes": [
    {
      "id": 1,
      "type": "LoadImage",
      "inputs": { "image": "your_image.png" }
    },
    {
      "id": 2,
      "type": "QwenImageLayered",
      "inputs": {
        "image": ["LoadImage", 0],
        "num_layers": 4,
        "guidance_scale": 5.0,
        "inference_steps": 28,
        "api_key": "your_fal_api_key"
      }
    },
    {
      "id": 3,
      "type": "PreviewImage",
      "inputs": { "images": ["QwenImageLayered", "layer_1"] }
    }
  ]
}`}
            </div>
          </div>
        </div>
      </section>

      {/* Parameters Section */}
      <section id="parameters" className="bg-[#0a0a0a] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">3. Parameter Reference</h2>
          <p className="text-gray-400 mb-8">
            Complete reference for all parameters available in the Qwen Image Layered ComfyUI node.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-sm font-semibold text-white">Parameter</th>
                  <th className="py-3 px-4 text-sm font-semibold text-white">Type</th>
                  <th className="py-3 px-4 text-sm font-semibold text-white">Default</th>
                  <th className="py-3 px-4 text-sm font-semibold text-white">Range</th>
                  <th className="py-3 px-4 text-sm font-semibold text-white">Description</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-400">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-purple-400 font-medium">num_layers</td>
                  <td className="py-3 px-4">INT</td>
                  <td className="py-3 px-4">4</td>
                  <td className="py-3 px-4">1 - 20</td>
                  <td className="py-3 px-4">Number of layers to extract from the image</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-purple-400 font-medium">guidance_scale</td>
                  <td className="py-3 px-4">FLOAT</td>
                  <td className="py-3 px-4">5.0</td>
                  <td className="py-3 px-4">1.0 - 20.0</td>
                  <td className="py-3 px-4">Higher values = more adherence to prompt</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-purple-400 font-medium">inference_steps</td>
                  <td className="py-3 px-4">INT</td>
                  <td className="py-3 px-4">28</td>
                  <td className="py-3 px-4">10 - 100</td>
                  <td className="py-3 px-4">More steps = higher quality, slower processing</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-purple-400 font-medium">seed</td>
                  <td className="py-3 px-4">INT</td>
                  <td className="py-3 px-4">42</td>
                  <td className="py-3 px-4">Any</td>
                  <td className="py-3 px-4">Random seed for reproducibility (-1 = random)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-purple-400 font-medium">prompt</td>
                  <td className="py-3 px-4">STRING</td>
                  <td className="py-3 px-4">empty</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">Optional prompt to guide layer extraction</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-purple-400 font-medium">negative_prompt</td>
                  <td className="py-3 px-4">STRING</td>
                  <td className="py-3 px-4">empty</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">Elements to avoid in layer extraction</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-purple-400 font-medium">acceleration</td>
                  <td className="py-3 px-4">STRING</td>
                  <td className="py-3 px-4">regular</td>
                  <td className="py-3 px-4">regular / fast</td>
                  <td className="py-3 px-4">Use fast for quicker results</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-purple-400 font-medium">enable_safety_checker</td>
                  <td className="py-3 px-4">BOOLEAN</td>
                  <td className="py-3 px-4">true</td>
                  <td className="py-3 px-4">true / false</td>
                  <td className="py-3 px-4">Enable content safety filtering</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* LoRA Section */}
      <section id="lora" className="bg-[#0d0d0d] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">4. LoRA Model Support</h2>
          <p className="text-gray-400 mb-8">
            Qwen Image Layered supports LoRA (Low-Rank Adaptation) models for custom style fine-tuning.
            This allows you to apply specific artistic styles to your layer decomposition.
          </p>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-white/10 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Using LoRA Models</h3>
            <p className="text-gray-400 mb-4">
              To use a LoRA model, provide the model URL in the <code className="bg-white/10 px-2 py-1 rounded">lora_model_url</code> parameter.
              You can adjust the effect strength using <code className="bg-white/10 px-2 py-1 rounded">lora_strength</code>.
            </p>
            <div className="bg-black/40 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
{`{
  "type": "QwenImageLayered",
  "inputs": {
    "image": ["LoadImage", 0],
    "num_layers": 4,
    "lora_model_url": "https://huggingface.co/your-model.safetensors",
    "lora_strength": 0.8,
    "guidance_scale": 5.0,
    "inference_steps": 28
  }
}`}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Recommended LoRA Settings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-300">Style Transfer</span>
                <span className="text-purple-400 font-mono">lora_strength: 0.7 - 1.0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-300">Subtle Effects</span>
                <span className="text-purple-400 font-mono">lora_strength: 0.3 - 0.5</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-300">Maximum Impact</span>
                <span className="text-purple-400 font-mono">lora_strength: 1.2 - 1.5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting Section */}
      <section id="troubleshooting" className="bg-[#0a0a0a] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">5. Troubleshooting</h2>

          <div className="space-y-4">
            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">API Key Error</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                <p className="mb-2">Make sure your fal.ai API key is valid and has sufficient credits. Check that:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>API key is correctly copied from fal.ai dashboard</li>
                  <li>API key does not contain extra spaces or characters</li>
                  <li>Your fal.ai account has positive credit balance</li>
                </ul>
              </div>
            </details>

            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">Poor Layer Quality</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                <p className="mb-2">If layer quality is not satisfactory, try these adjustments:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Increase inference_steps to 50-100 for better quality</li>
                  <li>Lower guidance_scale if layers are too different from original</li>
                  <li>Add a descriptive prompt for specific elements</li>
                  <li>Use higher resolution input images</li>
                </ul>
              </div>
            </details>

            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">Slow Processing</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                <p className="mb-2">To speed up processing:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Set acceleration to fast instead of regular</li>
                  <li>Reduce inference_steps to 10-20 for faster results</li>
                  <li>Use fewer num_layers for quicker processing</li>
                  <li>Check your internet connection speed</li>
                </ul>
              </div>
            </details>

            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">LoRA Not Working</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                <p className="mb-2">If LoRA models are not applying correctly:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Verify the lora_model_url is a direct download link</li>
                  <li>Ensure the LoRA model is compatible with Qwen Image Layered</li>
                  <li>Try adjusting lora_strength to a higher value</li>
                  <li>Check that the URL ends with .safetensors or .ckpt</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-[#0d0d0d] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">How do I install Qwen Image Layered in ComfyUI?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                You can install Qwen Image Layered in ComfyUI by adding our custom node to your ComfyUI
                custom nodes folder. The node connects directly to the fal.ai API for Qwen Image Layered
                model inference. See the Setup section above for detailed instructions.
              </div>
            </details>

            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">What are the system requirements for ComfyUI Qwen Image Layered?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                Since Qwen Image Layered runs on fal.ai cloud servers, ComfyUI itself has minimal requirements.
                You need a working ComfyUI installation and an API key from fal.ai. No local GPU is required
                for inference.
              </div>
            </details>

            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">Can I use LoRA models with Qwen Image Layered in ComfyUI?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                Yes! Qwen Image Layered supports LoRA models for custom style fine-tuning. You can load
                LoRA weights through the lora_model_url parameter in our ComfyUI custom node. See the
                LoRA Support section for more details.
              </div>
            </details>

            <details className="group rounded-xl bg-white/5 border border-white/10">
              <summary className="flex items-center justify-between p-6 cursor-pointer">
                <h3 className="text-lg font-semibold text-white">What parameters can I adjust in the ComfyUI workflow?</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 transition-transform group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                Key parameters include: num_layers (1-20), guidance_scale (1-20), num_inference_steps
                (10-100), seed, and acceleration mode. You can also set custom prompts and negative
                prompts. See the Parameter Reference section for complete details.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Related Resources Section */}
      <section className="bg-[#0a0a0a] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Related Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/qwenimagelayered"
              className="p-6 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-white/10 hover:border-blue-500/50 transition-colors group"
            >
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                Qwen Image Layered Editor
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Use the online editor directly in your browser.
              </p>
              <span className="text-blue-400 text-sm font-medium group-hover:underline">
                Open Editor →
              </span>
            </Link>

            <a
              href="https://fal.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/10 border border-white/10 hover:border-purple-500/50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">fal.ai</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get your API key and explore other AI models.
              </p>
              <span className="text-purple-400 text-sm font-medium">
                Visit Site →
              </span>
            </a>

            <a
              href="https://github.com/comfyanonymous/ComfyUI"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl bg-gradient-to-br from-green-900/20 to-cyan-900/10 border border-white/10 hover:border-green-500/50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-2">ComfyUI Documentation</h3>
              <p className="text-gray-400 text-sm mb-4">
                Learn more about ComfyUI features and custom nodes.
              </p>
              <span className="text-green-400 text-sm font-medium">
                Learn More →
              </span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
