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
    quotaHint: 'Free trial: 3 images · no sign-up needed',
    socialProof: 'Over 10,000+ layers edited',
    trust: 'Built for ad creatives, e-commerce images, AI posters, and social media assets',
    visualLabel: 'Live workflow preview',
    studioTitle: 'Layer Studio',
    stepOriginal: 'Original',
    stepDecompose: 'AI decompose',
    decomposeHint: '5 editable layers detected',
    caseBadge: 'Original → Result',
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
      {
        q: 'How is this different from Photoshop or Canva?',
        a: 'Photoshop and Canva give you manual tools — you select, mask, and rebuild by hand. Image Layered auto-separates the image into RGBA layers first, then you describe the change in plain language. A text swap, product replacement, or background redesign that takes minutes of manual masking is done in one prompt.',
      },
      {
        q: 'Is it just a background remover?',
        a: 'No. Background removal (Remove.bg) returns one cutout. Image Layered keeps products, people, text, decorations, shadows, and backgrounds as independent layers, so you can revise each one and re-export the whole composition.',
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
    quotaHint: '免费试用 3 张 · 无需注册',
    socialProof: '超过 10,000+ 张图片已完成分层',
    trust: '适合广告创意、电商商品图、AI 海报和自媒体视觉素材',
    visualLabel: '工作流预览',
    studioTitle: '图层工作台',
    stepOriginal: '原图',
    stepDecompose: 'AI 自动分层',
    decomposeHint: '识别出 5 个可编辑图层',
    caseBadge: '原图 → 结果',
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
      {
        q: '和 Photoshop / Canva 有什么区别？',
        a: 'Photoshop 和 Canva 提供的是手动工具——需要自己选区、蒙版、手工重建。Image Layered 会先把图片自动拆成 RGBA 图层，然后用一句话描述改动即可。改文字、换产品、重做背景这些需要几分钟手动抠图的操作，在这里一次提示词就能完成。',
      },
      {
        q: '它只是去背景工具吗？',
        a: '不是。Remove.bg 这类工具只输出一个主体抠图。Image Layered 会把产品、人物、文字、装饰、阴影和背景拆成独立图层，可以分别修改后再重新合成导出整张图。',
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
    <div className="min-h-screen bg-[#0b090d] text-white [font-family:var(--font-body)]">
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#0d0b10]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(243,59,114,0.16),transparent_32rem),radial-gradient(circle_at_10%_30%,rgba(121,72,255,0.1),transparent_28rem)]" />
        <div className="relative mx-auto grid min-h-[92vh] max-w-[1440px] items-center gap-10 px-4 py-8 md:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:py-12">
          <div className="max-w-3xl pt-16 lg:pt-8">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#ff6b96]">{t.eyebrow}</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] text-white [font-family:var(--font-display)] md:text-7xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#aaa4b1] md:text-lg">{t.description}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="group relative block cursor-pointer">
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
                <span className="relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#f33b72] px-7 py-3 text-sm font-black text-white shadow-[0_0_0_1px_rgba(243,59,114,0.35),0_18px_38px_rgba(243,59,114,0.28)] transition-transform group-hover:-translate-y-0.5 group-hover:bg-[#ff4f83] group-active:translate-y-0">
                  <span className="pointer-events-none absolute inset-0 animate-pulse bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.35)_50%,transparent_75%)] bg-[length:250%_100%] [animation-duration:2.4s]" />
                  <Zap className="size-4" />
                  {isPreparing ? t.loading : t.chooseFile}
                </span>
              </label>
              <a
                href={editorPath(params?.locale)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.045] px-5 py-3 text-sm font-bold text-[#d8d2dc] transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                {t.secondaryCta}
                <ArrowRight className="size-4" />
              </a>
            </div>

            <p className="mt-3 text-sm font-semibold text-[#ff7ca2]">{t.quotaHint}</p>

            <div className="mt-5 max-w-[560px] rounded-xl border border-white/[0.07] bg-[#17141c] p-4 shadow-[0_16px_32px_rgba(0,0,0,0.22)]">
              <p className="text-sm font-bold text-white">{isPreparing ? t.uploadLoading : t.uploadTitle}</p>
              <p className="mt-1 text-sm leading-6 text-[#9993a3]">{t.uploadHint}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              {t.metrics.map(([value, label], index) => (
                <div key={value} className="flex items-center gap-2 text-sm">
                  {index > 0 && <ArrowRight className="size-4 text-[#b8aa99]" />}
                  <span className="font-black text-white">{value}</span>
                  <span className="font-medium text-[#77717f]">{label}</span>
                </div>
              ))}
            </div>

            <p className="mt-5 max-w-xl text-sm font-medium leading-6 text-[#9993a3]">
              {t.socialProof} · {t.trust}
            </p>
          </div>

          <div className="relative pb-8 lg:pb-0">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121016] shadow-[0_34px_90px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] bg-[#191620] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                    <span className="h-3 w-3 rounded-full bg-[#facc15]" />
                    <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#ff7ca2]">{t.visualLabel}</p>
                </div>
                <p className="truncate text-xs font-semibold text-slate-300">{t.studioTitle}</p>
              </div>

              <div className="space-y-4 bg-[#111015] p-4 md:p-5">
                {/* 01 · original */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">01 · {t.stepOriginal}</p>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">1600×900</span>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-white/10">
                    <img
                      src="/imgs/features/hero-case-1.jpg"
                      alt="Original image before layer decomposition"
                      className="aspect-[16/9] w-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-black text-white">
                      {t.caseBadge}
                    </div>
                  </div>
                </div>

                {/* 02 · decompose */}
                <div className="rounded-xl border border-[#f33b72]/20 bg-[#1b1720] p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f33b72]/14 text-[#ff7ca2]">
                      <Layers3 className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white">02 · {t.stepDecompose}</p>
                      <p className="truncate text-[11px] text-slate-400">{t.decomposeHint}</p>
                    </div>
                    <div className="ml-auto flex shrink-0 -space-x-1.5">
                      {['#f97316', '#22d3ee', '#f43f5e', '#fde047', '#a78bfa'].map((color) => (
                        <span
                          key={color}
                          className="h-4 w-4 rounded-full border border-black/40"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* layer chips */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {t.layers.map((layer, index) => (
                    <div
                      key={layer}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-2.5 py-2"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: ['#f97316', '#22d3ee', '#f43f5e', '#fde047', '#a78bfa'][index] }}
                      />
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-100">{layer}</span>
                      <CheckCircle2 className="size-3.5 shrink-0 text-emerald-300" />
                    </div>
                  ))}
                </div>

                {/* prompt bar */}
                <div className="rounded-xl border border-[#f33b72]/20 bg-[#1b1720] p-3.5">
                  <div className="mb-1.5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#ff7ca2]">
                    <PenLine className="size-3.5" />
                    {t.promptLabel}
                  </div>
                  <p className="text-xs leading-5 text-slate-300">{t.prompt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.06] bg-[#0b090d] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ff6b96]">Process</p>
            <h2 className="mt-4 text-3xl font-black text-white [font-family:var(--font-display)] md:text-5xl">
              {t.workflowTitle}
            </h2>
            <p className="mt-4 text-base leading-8 text-[#9993a3]">{t.workflowDescription}</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {t.workflow.map((item, index) => {
              const icons = [Layers3, MousePointer2, Sparkles, Download];
              const Icon = icons[index] ?? Layers3;
              return (
                <article key={item.title} className="rounded-xl border border-white/[0.07] bg-[#17141c] p-5 shadow-[0_18px_46px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f33b72]/14 text-[#ff7ca2]">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#9993a3]">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.06] bg-[#0f0d12] px-4 py-16 text-white md:px-8 md:py-20">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="max-w-3xl text-3xl font-black [font-family:var(--font-display)] md:text-5xl">{t.useCasesTitle}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {t.useCases.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/[0.07] bg-[#1a1720] p-6 transition-colors hover:border-[#f33b72]/25">
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid border-b border-white/[0.06] bg-[#0b090d] md:grid-cols-[0.88fr_1.12fr]">
        <div className="px-4 py-14 md:px-8 md:py-16 lg:pl-[calc((100vw-1180px)/2)]">
          <h2 className="text-3xl font-black text-white [font-family:var(--font-display)] md:text-4xl">{t.seoTitle}</h2>
        </div>
        <div className="grid gap-px bg-white/[0.06] md:grid-cols-2">
          {seoLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="bg-[#151219] p-5 text-sm font-black text-[#d8d2dc] transition-colors hover:bg-[#211d28] hover:text-[#ff7ca2]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>

      <section className="bg-[#0b090d] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-3xl font-black text-white [font-family:var(--font-display)] md:text-4xl">{t.faqTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {t.faqs.map((faq) => (
              <article key={faq.q} className="rounded-xl border border-white/[0.07] bg-[#17141c] p-5">
                <h3 className="text-base font-black text-white">{faq.q}</h3>
                <p className="mt-3 text-sm leading-7 text-[#9993a3]">{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </div>
  );
}
