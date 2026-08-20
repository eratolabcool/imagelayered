import Link from 'next/link';
import {
  ArrowRight,
  ImageIcon,
  Megaphone,
  Package,
  UserRound,
} from 'lucide-react';

import WorkspaceResourceShell from '@/shared/blocks/crooked/components/WorkspaceResourceShell';
import { workflowPresets } from '@/shared/blocks/crooked/workflows';

const icons = {
  product: Package,
  poster: Megaphone,
  'ai-image': ImageIcon,
  character: UserRound,
};

export default async function WorkflowsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === 'zh';

  return (
    <WorkspaceResourceShell
      locale={locale}
      title={
        isZh ? '从正确的图层结构开始' : 'Start with the right layer structure'
      }
      description={
        isZh
          ? '不同图片需要不同的拆分逻辑。选择与你的素材最接近的工作流，模型、图层数量与编辑建议会提前配置好。'
          : 'Different images need different decomposition logic. Choose the closest workflow and the editor will preconfigure the model context, layer count, and edit suggestions.'
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {workflowPresets.map((preset) => {
          const Icon = icons[preset.id];
          const title = isZh
            ? (
                {
                  product: '商品图片',
                  poster: '海报与广告',
                  'ai-image': 'AI 图片修复',
                  character: '角色与动漫',
                } as const
              )[preset.id]
            : preset.title;
          const outcome = isZh
            ? (
                {
                  product: '保护商品本身，只替换背景、道具、标签或阴影。',
                  poster:
                    '从一张扁平海报生成可改文案、Logo、主体和背景的广告变体。',
                  'ai-image': '只修复错误细节，同时保留构图、主体与风格。',
                  character: '在保持角色身份一致的前提下修改服装、场景和光线。',
                } as const
              )[preset.id]
            : preset.goal;

          return (
            <article
              key={preset.id}
              className="group flex min-h-[280px] flex-col rounded-2xl bg-[#0b162c] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100">
                  <Icon className="size-5" />
                </span>
                <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[10px] font-extrabold tracking-[0.12em] text-cyan-100/70 uppercase">
                  {preset.layerCount} {isZh ? '层' : 'layers'}
                </span>
              </div>
              <h2 className="mt-7 text-2xl font-extrabold tracking-[-0.025em] text-white">
                {title}
              </h2>
              <p className="mt-3 max-w-[48ch] text-sm leading-6 text-slate-300">
                {outcome}
              </p>
              <p className="mt-4 text-xs leading-5 text-cyan-100/55">
                {preset.subtitle}
              </p>
              <Link
                href={`/${locale}/qwenimagelayered?workflow=${preset.id}`}
                className="mt-auto flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#071123] transition-colors outline-none hover:bg-cyan-100 focus-visible:ring-2 focus-visible:ring-[#b89fff]"
              >
                {isZh ? '用此工作流开始' : 'Start with this workflow'}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </article>
          );
        })}
      </div>
    </WorkspaceResourceShell>
  );
}
