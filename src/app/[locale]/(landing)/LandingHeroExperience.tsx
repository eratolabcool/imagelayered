'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Layers3,
  MousePointer2,
  PenLine,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { prepareImageFile } from '@/shared/blocks/crooked/lib/image-upload';

const copy = {
  en: {
    eyebrow: 'AI image post-editing workspace',
    title: 'Edit Any Image Without Starting Over',
    description:
      'Upload a product shot, poster, AI image, or social creative. Image Layered separates it into editable layers so you can change one object, text block, background, or style while keeping the original composition intact.',
    uploadTitle: 'Upload image to start',
    uploadLoading: 'Preparing image...',
    uploadHint: 'JPG, PNG, WEBP. Your image opens directly in the layered editor.',
    chooseFile: 'Choose file',
    loading: 'Loading...',
    secondaryCta: 'Open editor',
    trust: 'Built for ad creatives, e-commerce images, AI posters, and social media assets',
    visualLabel: 'Live workflow preview',
    promptLabel: 'Prompt edit',
    prompt: "Rewrite the headline to 'Summer Drop' and keep the character, fruit, colors, and layout.",
    before: 'Before',
    result: 'Result',
    layerStack: 'Layer stack',
    layers: ['Character', 'Product', 'Text', 'Background', 'Shadow'],
    metrics: [
      ['1 image', 'upload once'],
      ['5 layers', 'edit separately'],
      ['1 result', 'export composite'],
    ],
    workflowTitle: 'The workflow users actually pay for',
    workflowDescription:
      'People do not want another random image generator. They want controlled revision: keep what works, edit what is wrong, and export something usable.',
    workflow: [
      {
        title: 'Layer the image',
        text: 'Qwen Image Layered separates products, characters, text, backgrounds, shadows, and decorative objects into transparent RGBA layers.',
      },
      {
        title: 'Select one thing',
        text: 'Click the layer you want to change. Hide, extract, delete, duplicate, move, or adjust opacity without touching the rest of the image.',
      },
      {
        title: 'Prompt the edit',
        text: 'Use AI editing for local changes like product swaps, clothing edits, text rewrites, object removal, and background redesign.',
      },
      {
        title: 'Recompose and export',
        text: 'Combine the edited layers back into a new image, or download individual layer assets for ads, stores, thumbnails, and design tools.',
      },
    ],
    useCasesTitle: 'Built around high-intent image editing jobs',
    useCases: [
      {
        title: 'E-commerce product photos',
        text: 'Change backgrounds, keep product shape, preserve shadows, and create catalog variants without reshooting.',
      },
      {
        title: 'AI image revisions',
        text: 'Edit Midjourney, Flux, or GPT images locally without regenerating the whole composition.',
      },
      {
        title: 'Poster and ad remixing',
        text: 'Separate subject, copy, logo, background, and effects, then remake the creative for another campaign.',
      },
      {
        title: 'Creator thumbnails',
        text: 'Extract faces, props, text, and backgrounds to quickly test stronger YouTube, TikTok, and social visuals.',
      },
    ],
    seoTitle: 'What you can edit',
    seoItems: [
      'change background of AI product image',
      'modify AI generated product photos',
      'edit Midjourney image without changing face',
      'separate text from image AI',
      'edit poster without Photoshop',
      'keep same composition AI editing',
    ],
    faqTitle: 'Questions before uploading',
    faqs: [
      {
        q: 'Is this just background removal?',
        a: 'No. Background removal gives you one cutout. Image Layered creates multiple editable layers so you can revise products, people, text, decorations, shadows, and backgrounds independently.',
      },
      {
        q: 'Can I edit only one object?',
        a: 'Yes. After decomposition, select a layer and use prompt editing, visibility, deletion, opacity, or export controls on that layer only.',
      },
      {
        q: 'Who is this best for?',
        a: 'The strongest use cases are e-commerce sellers, ad teams, poster designers, AI creators, and social media editors who need controlled image revisions.',
      },
      {
        q: 'Do I need Photoshop skills?',
        a: 'No. The interface is designed around upload, auto-layer, select a layer, prompt an edit, and export.',
      },
    ],
  },
  zh: {
    eyebrow: 'AI 图片后编辑工作台',
    title: '不用重生成，也能修改任意图片',
    description:
      '上传商品图、海报、AI 生成图或自媒体封面。Image Layered 会把平面图拆成可编辑图层，让你只改某个物体、文字、背景或风格，同时保留原来的构图。',
    uploadTitle: '上传图片开始编辑',
    uploadLoading: '正在准备图片...',
    uploadHint: '支持 JPG、PNG、WEBP，上传后直接进入分层编辑器。',
    chooseFile: '选择图片',
    loading: '加载中...',
    secondaryCta: '打开编辑器',
    trust: '适合广告创意、电商商品图、AI 海报和自媒体视觉素材',
    visualLabel: '工作流预览',
    promptLabel: '提示词编辑',
    prompt: '只把主标题改成 Summer Drop，保持人物、水果、配色和版式不变。',
    before: '原图',
    result: '结果',
    layerStack: '图层结构',
    layers: ['人物', '产品', '文字', '背景', '阴影'],
    metrics: [
      ['1 张图', '上传一次'],
      ['5 个图层', '分别修改'],
      ['1 张结果', '重新合成'],
    ],
    workflowTitle: '用户真正愿意付费的是这个工作流',
    workflowDescription:
      '用户不缺随机生图工具。用户需要的是可控修改：保留对的部分，只修错的地方，然后导出能直接使用的图片。',
    workflow: [
      {
        title: '先把图片分层',
        text: 'Qwen Image Layered 会把产品、人物、文字、背景、阴影和装饰元素拆成透明 RGBA 图层。',
      },
      {
        title: '选中一个元素',
        text: '点击想修改的图层。可以隐藏、提取、删除、复制、移动或调整透明度，不影响其它部分。',
      },
      {
        title: '用提示词局部编辑',
        text: '用 AI 完成商品替换、换衣服、改文字、移除物体、重做背景等局部修改。',
      },
      {
        title: '重新合成并导出',
        text: '把编辑后的图层重新组合成新图片，也可以下载单独图层，用在广告、店铺、封面和设计工具里。',
      },
    ],
    useCasesTitle: '围绕高意图图片编辑需求设计',
    useCases: [
      {
        title: '电商商品图',
        text: '换背景、保留产品轮廓、保留阴影，并快速制作同一商品的多种场景图。',
      },
      {
        title: 'AI 图片二次修改',
        text: '局部修改 Midjourney、Flux 或 GPT 图片，不用把整张图重新生成一遍。',
      },
      {
        title: '海报和广告 Remix',
        text: '拆出人物、文案、Logo、背景和特效，再为新的活动重做视觉。',
      },
      {
        title: '自媒体封面',
        text: '提取人脸、道具、文字和背景，快速测试更强的 YouTube、TikTok、小红书封面。',
      },
    ],
    seoTitle: '你可以解决这些具体问题',
    seoItems: [
      '修改 AI 商品图背景',
      '修改 AI 生成的产品图片',
      '编辑 Midjourney 图片且保持脸不变',
      'AI 分离图片中的文字',
      '不用 Photoshop 修改海报',
      '保持构图不变的 AI 局部编辑',
    ],
    faqTitle: '上传前常见问题',
    faqs: [
      {
        q: '这只是去背景工具吗？',
        a: '不是。去背景通常只得到一个主体抠图。Image Layered 会生成多个可编辑图层，让产品、人物、文字、装饰、阴影和背景分别修改。',
      },
      {
        q: '可以只修改一个物体吗？',
        a: '可以。分层后选中一个图层，就可以只对这一层做提示词编辑、显示隐藏、删除、透明度调整或单独导出。',
      },
      {
        q: '最适合哪些用户？',
        a: '最适合电商卖家、广告团队、海报设计师、AI 创作者和自媒体编辑，他们需要可控的图片二次修改。',
      },
      {
        q: '需要 Photoshop 技能吗？',
        a: '不需要。核心路径就是上传图片、自动分层、选择图层、输入修改需求、导出结果。',
      },
    ],
  },
};

const editorPath = (locale?: string | string[]) => {
  const value = Array.isArray(locale) ? locale[0] : locale;
  return value ? `/${value}/qwenimagelayered` : '/qwenimagelayered';
};

export default function LandingHeroExperience() {
  const [isPreparing, setIsPreparing] = useState(false);
  const params = useParams();
  const isZh = params?.locale === 'zh';
  const t = isZh ? copy.zh : copy.en;
  const seoLinks = [
    { label: t.seoItems[0], href: '/seo/en/change-background-of-ai-product-image' },
    { label: t.seoItems[1], href: '/seo/en/edit-ai-product-photos' },
    { label: t.seoItems[2], href: '/seo/en/modify-ai-character-without-changing-face' },
    { label: t.seoItems[3], href: '/seo/en/separate-text-from-image-ai' },
    { label: t.seoItems[4], href: '/seo/en/edit-poster-without-photoshop' },
    { label: t.seoItems[5], href: '/seo/en/keep-same-composition-ai' },
  ];

  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication',
          name: 'Image Layered',
          applicationCategory: 'DesignApplication',
          operatingSystem: 'Web',
          url: 'https://image-layered.app',
          description: isZh
            ? 'AI 图片分层编辑器，用于局部修改商品图、海报和 AI 生成图片。'
            : 'AI image layer editor for controlled local edits on product photos, posters, and AI-generated images.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          featureList: t.seoItems,
        },
        {
          '@type': 'FAQPage',
          mainEntity: t.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a,
            },
          })),
        },
      ],
    }),
    [isZh, t.faqs, t.seoItems]
  );

  const handleUpload = async (file: File) => {
    setIsPreparing(true);
    try {
      const prepared = await prepareImageFile(file);
      sessionStorage.setItem('uploadedImage', JSON.stringify(prepared));
      window.location.href = editorPath(params?.locale);
    } catch (error) {
      console.error('[LandingHeroExperience] upload failed', error);
      toast.error(isZh ? '图片加载失败，请换一张再试。' : 'Failed to load image. Please try another one.');
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#161616] [font-family:var(--font-body)]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[#f7efe2]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,116,144,0.12),rgba(250,204,21,0.08)_46%,rgba(244,63,94,0.11))]" />
        <div className="relative mx-auto grid min-h-[92vh] max-w-[1440px] items-center gap-10 px-4 py-8 md:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:py-12">
          <div className="max-w-3xl pt-16 lg:pt-8">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#0f766e]">{t.eyebrow}</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] text-[#161616] [font-family:var(--font-display)] md:text-7xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#4a4037] md:text-lg">{t.description}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <label className="group block cursor-pointer">
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
                <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#101010] px-5 py-3 text-sm font-black text-white shadow-[0_18px_34px_rgba(16,16,16,0.22)] transition-transform group-hover:-translate-y-0.5">
                  <Zap className="size-4" />
                  {isPreparing ? t.loading : t.chooseFile}
                </span>
              </label>
              <a
                href={editorPath(params?.locale)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-black/15 bg-white/80 px-5 py-3 text-sm font-black text-[#161616] shadow-[0_14px_28px_rgba(16,16,16,0.08)] transition-transform hover:-translate-y-0.5"
              >
                {t.secondaryCta}
                <ArrowRight className="size-4" />
              </a>
            </div>

            <div className="mt-5 max-w-[560px] rounded-lg border border-black/10 bg-white/70 p-4 shadow-[0_16px_32px_rgba(16,16,16,0.08)]">
              <p className="text-sm font-bold text-[#161616]">{isPreparing ? t.uploadLoading : t.uploadTitle}</p>
              <p className="mt-1 text-sm leading-6 text-[#63584d]">{t.uploadHint}</p>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {t.metrics.map(([value, label]) => (
                <div key={value} className="rounded-lg border border-black/10 bg-white/55 px-4 py-3">
                  <p className="text-xl font-black text-[#161616]">{value}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6b6258]">{label}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 max-w-xl text-sm font-semibold leading-6 text-[#5b5046]">{t.trust}</p>
          </div>

          <div className="relative pb-8 lg:pb-0">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#111827] shadow-[0_30px_80px_rgba(17,24,39,0.28)]">
              <div className="flex items-center justify-between border-b border-white/10 bg-[#0f172a] px-4 py-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200/70">{t.visualLabel}</p>
                  <p className="mt-1 text-sm font-semibold text-white">Image Layered</p>
                </div>
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                  <span className="h-3 w-3 rounded-full bg-[#facc15]" />
                  <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_220px]">
                <div className="bg-[#1f2937] p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
                      <div className="relative aspect-[4/5] bg-[linear-gradient(160deg,#f97316,#fde047_45%,#f43f5e)]">
                        <img
                          src="/imgs/features/001.jpeg"
                          alt="Qwen Image Layered layer separation preview"
                          className="h-full w-full object-cover object-[18%_62%]"
                        />
                        <div className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2.5 py-1 text-xs font-black text-white">
                          {t.before}
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.08)_75%),linear-gradient(45deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.08)_75%)] [background-position:0_0,12px_12px] [background-size:24px_24px]" />
                      <div className="relative flex aspect-[4/5] items-center justify-center p-6">
                        <div className="h-[74%] w-[62%] rotate-[-4deg] rounded-xl bg-[#f97316] shadow-[18px_20px_0_rgba(34,211,238,0.22)]" />
                        <div className="absolute left-[26%] top-[26%] h-[30%] w-[36%] rotate-[5deg] rounded-xl bg-[#f8fafc] shadow-[14px_14px_0_rgba(251,191,36,0.34)]" />
                        <div className="absolute right-[22%] top-[18%] h-12 w-24 rotate-[-7deg] rounded-md bg-[#f43f5e] shadow-[10px_10px_0_rgba(255,255,255,0.18)]" />
                        <div className="absolute bottom-[20%] left-[22%] h-16 w-16 rounded-full bg-[#fde047] shadow-[12px_12px_0_rgba(34,197,94,0.24)]" />
                        <div className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2.5 py-1 text-xs font-black text-white">
                          {t.result}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-cyan-200/20 bg-[#0f172a] p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
                      <PenLine className="size-4" />
                      {t.promptLabel}
                    </div>
                    <p className="text-sm leading-6 text-slate-200">{t.prompt}</p>
                  </div>
                </div>

                <aside className="border-l border-white/10 bg-[#0f172a] p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    <Layers3 className="size-4 text-cyan-200" />
                    {t.layerStack}
                  </div>
                  <div className="mt-4 space-y-2">
                    {t.layers.map((layer, index) => (
                      <div
                        key={layer}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/6 p-2 text-sm text-slate-100"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-xs font-black tabular-nums">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-semibold">{layer}</span>
                        <CheckCircle2 className="size-4 text-emerald-300" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-3 text-xs font-black text-[#071123]">
                      <Wand2 className="size-4" />
                      Edit
                    </button>
                    <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white/10 px-3 text-xs font-black text-white">
                      <Download className="size-4" />
                      Export
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#fbf8f1] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0f766e]">Workflow</p>
            <h2 className="mt-4 text-3xl font-black text-[#161616] [font-family:var(--font-display)] md:text-5xl">
              {t.workflowTitle}
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5b5046]">{t.workflowDescription}</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {t.workflow.map((item, index) => {
              const icons = [Layers3, MousePointer2, Sparkles, Download];
              const Icon = icons[index] ?? Layers3;
              return (
                <article key={item.title} className="rounded-xl border border-black/10 bg-white p-5 shadow-[0_14px_36px_rgba(16,16,16,0.06)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0f766e] text-white">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-[#161616]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5b5046]">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-[#111827] px-4 py-16 text-white md:px-8 md:py-20">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="max-w-3xl text-3xl font-black [font-family:var(--font-display)] md:text-5xl">{t.useCasesTitle}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {t.useCases.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/10 bg-white/6 p-6">
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid border-b border-black/10 bg-[#f7efe2] md:grid-cols-[0.88fr_1.12fr]">
        <div className="px-4 py-14 md:px-8 md:py-16 lg:pl-[calc((100vw-1180px)/2)]">
          <h2 className="text-3xl font-black text-[#161616] [font-family:var(--font-display)] md:text-4xl">{t.seoTitle}</h2>
        </div>
        <div className="grid gap-px bg-black/10 md:grid-cols-2">
          {seoLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="bg-[#fbf8f1] p-5 text-sm font-black text-[#2b2620] transition-colors hover:bg-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>

      <section className="bg-[#fbf8f1] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-3xl font-black text-[#161616] [font-family:var(--font-display)] md:text-4xl">{t.faqTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {t.faqs.map((faq) => (
              <article key={faq.q} className="rounded-xl border border-black/10 bg-white p-5">
                <h3 className="text-base font-black text-[#161616]">{faq.q}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5b5046]">{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </div>
  );
}
