import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Eye,
  Layers3,
  MousePointer2,
  UploadCloud,
} from 'lucide-react';

import WorkspaceResourceShell from '@/shared/blocks/crooked/components/WorkspaceResourceShell';

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === 'zh';
  const steps = isZh
    ? [
        {
          title: '上传清晰的原图',
          body: '优先使用主体边缘清楚、压缩较少的 PNG、JPG 或 WebP。',
          icon: UploadCloud,
        },
        {
          title: '选择分层模型和数量',
          body: '根据图片结构选择真实可用的模型，并设置希望输出的图层数量。',
          icon: Layers3,
        },
        {
          title: '检查图层堆栈',
          body: '逐层开关可见性，确认主体、文字、背景与效果是否被正确分离。',
          icon: Eye,
        },
        {
          title: '只编辑目标图层',
          body: '选中目标后说明要改变什么，也明确哪些部分需要保持不变。',
          icon: MousePointer2,
        },
      ]
    : [
        {
          title: 'Upload a clean source image',
          body: 'Start with a clear PNG, JPG, or WebP with defined subject edges and limited compression.',
          icon: UploadCloud,
        },
        {
          title: 'Choose a model and layer count',
          body: 'Pick an available model for the image structure and set the number of layers to generate.',
          icon: Layers3,
        },
        {
          title: 'Inspect the layer stack',
          body: 'Toggle visibility one layer at a time to verify subjects, text, backgrounds, and effects.',
          icon: Eye,
        },
        {
          title: 'Edit only the target layer',
          body: 'Describe the requested change and explicitly state what must remain unchanged.',
          icon: MousePointer2,
        },
      ];

  return (
    <WorkspaceResourceShell
      locale={locale}
      title={
        isZh
          ? '第一次分层，也能得到干净结果'
          : 'Get clean results on your first layer pass'
      }
      description={
        isZh
          ? '这套短流程覆盖从素材准备到局部编辑的关键判断。你可以边看边在工作区操作，不需要先学完整套图像软件。'
          : 'This short path covers the key decisions from source preparation to local editing. Follow it beside the workspace—there is no full design suite to learn first.'
      }
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ol className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex gap-5 rounded-2xl bg-[#0b162c] p-5 shadow-[0_18px_52px_rgba(0,0,0,0.24)]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-300/12 text-cyan-100">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-cyan-100/55">
                    {isZh ? `步骤 ${index + 1}` : `Step ${index + 1}`}
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold tracking-[-0.02em] text-white">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <aside className="h-fit rounded-2xl bg-[#141f38] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.3)] lg:sticky lg:top-9">
          <h2 className="text-xl font-extrabold tracking-[-0.02em] text-white">
            {isZh ? '提示词要点' : 'Prompt essentials'}
          </h2>
          <ul className="mt-5 space-y-4">
            {(isZh
              ? [
                  '说明只修改哪个图层',
                  '写清希望保留的主体、构图和光线',
                  '一次只提出一个主要修改',
                  '生成后先对比原图再继续',
                ]
              : [
                  'Name the layer to change',
                  'State which subject, composition, and lighting to preserve',
                  'Make one primary change at a time',
                  'Compare with the original before continuing',
                ]
            ).map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-6 text-slate-300"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-300/12 text-emerald-200">
                  <Check className="size-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href={`/${locale}/studio`}
            className="mt-7 flex items-center justify-between rounded-xl bg-[linear-gradient(135deg,#b89fff,#4de4ff)] px-4 py-3 text-sm font-extrabold text-[#071123] outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {isZh ? '打开分层工作区' : 'Open layer workspace'}
            <ArrowRight className="size-4" />
          </Link>
        </aside>
      </div>
    </WorkspaceResourceShell>
  );
}
