import { Link } from '@/core/i18n/navigation';
import { ArrowUpRight } from 'lucide-react';

/**
 * Creative Solutions & Toolkit Index.
 * Establishes strong internal linking authority across core workflow landing pages.
 */
export default function SeoTopicLinks({ locale }: { locale: string }) {
  const isZh = locale === 'zh';
  const isKo = locale === 'ko';

  const solutions = isKo
    ? [
        {
          href: '/solutions/character-into-layers',
          title: 'Live2D 캐릭터 파츠 분리',
          desc: '머리카락, 신체, 의상을 분리하고 가려진 배경을 복원하여 Live2D/스파인 리깅을 준비합니다.',
          tag: '인기 워크플로우',
        },
        {
          href: '/image-to-psd',
          title: '이미지 다중 레이어 PSD 변환',
          desc: '펜툴 누끼 작업 없이 평면 이미지를 포토샵 투명 레이어와 정렬 좌표가 살아있는 .psd로 변환합니다.',
          tag: '핵심 기능',
        },
        {
          href: '/solutions/animator-prep',
          title: '애니메이션 & 패럴랙스 준비',
          desc: '애프터 이펙트, LoopFlow 및 움직이는 배경화면을 위해 전경/중경/원경 레이어를 분리합니다.',
          tag: '모션 그래픽',
        },
        {
          href: '/solutions/logo-into-layers',
          title: '로고 및 아이콘 파츠 추출',
          desc: '원본 벡터 파일이 없어도 평면 로고에서 심볼 기호, 브랜드 텍스트, 배경을 깔끔히 분리합니다.',
          tag: '브랜드 디자인',
        },
      ]
    : isZh
    ? [
        {
          href: '/solutions/character-into-layers',
          title: 'Live2D 动漫角色切片',
          desc: '自动拆分头发、肢体与服饰，遮挡部位智能补全，导出 PSD 供 Live2D/Spine 绑定。',
          tag: '热门场景',
        },
        {
          href: '/image-to-psd',
          title: '图片转多图层 PSD',
          desc: '无需手动钢笔抠图，将静态图片一键转为带透明图层和对齐坐标的 Photoshop 文件。',
          tag: '核心功能',
        },
        {
          href: '/solutions/animator-prep',
          title: '动效与视差图层准备',
          desc: '为 After Effects、LoopFlow 和动态壁纸拆解前景、中景与纵深背景层。',
          tag: '动效必备',
        },
        {
          href: '/solutions/logo-into-layers',
          title: 'Logo 与图标分层提取',
          desc: '将扁平 Logo 分解为独立的图符、品牌文字和背景材质。',
          tag: '设计物料',
        },
      ]
    : [
        {
          href: '/solutions/character-into-layers',
          title: 'Live2D & Character Slicing',
          desc: 'Split anime art into raster layers with occlusion inpainting. Export a PSD for the next rigging step.',
          tag: 'Top Traffic',
        },
        {
          href: '/image-to-psd',
          title: 'Image to PSD with Layers',
          desc: 'Turn any flat JPG, PNG, or AI render into genuine Photoshop layers with transparency.',
          tag: 'Essential',
        },
        {
          href: '/solutions/animator-prep',
          title: 'Animator Prep (Parallax & AE)',
          desc: 'Decompose flat scenes into 2.5D depth planes for After Effects camera moves and loop animations.',
          tag: 'Motion',
        },
        {
          href: '/solutions/logo-into-layers',
          title: 'Logo & Icon into Layers',
          desc: 'Isolate symbols, typography, and badges from flattened graphic files without the vector original.',
          tag: 'Branding',
        },
      ];

  const guides = isKo
    ? [
        {
          href: '/studio/guide',
          title: '이미지 레이어 분리 가이드',
          text: '업로드부터 레이어 분리 및 다중 레이어 내보내기까지의 작업 과정을 확인하세요.',
        },
        {
          href: '/blog/how-to-split-an-image-into-layers',
          title: 'AI 기반 레이어 분리 및 인페인팅 원리',
          text: '가려진 영역 복원과 투명 PNG/PSD 레이어 생성 원리를 알아봅니다.',
        },
        {
          href: '/seo',
          title: '창작 워크플로우 & FAQ',
          text: 'Live2D 리깅, 포토샵 편집, 애프터 이펙트 모션 관련 가이드를 둘러보세요.',
        },
      ]
    : isZh
    ? [
        {
          href: '/studio/guide',
          title: '图片分层操作指南',
          text: '了解从上传、分层到导出的操作过程。',
        },
        {
          href: '/blog/how-to-split-an-image-into-layers',
          title: '图片分层使用指南',
          text: '了解上传、检查图层、局部编辑和 PSD 导出的完整流程。',
        },
        {
          href: '/seo',
          title: '全部垂直场景与多语言指南',
          text: '浏览所有细分场景指南与常见问题。',
        },
      ]
    : [
        {
          href: '/blog/how-to-split-an-image-into-layers',
          title: 'How to split an image into layers',
          text: 'Choose a source, inspect the separation and understand the limits.',
        },
        {
          href: '/blog/edit-one-object-in-an-ai-image-without-regenerating',
          title: 'Edit one object in an AI image',
          text: 'Work on a selected element without restarting your composition.',
        },
        {
          href: '/blog/export-layers-to-photoshop-and-figma',
          title: 'Use your layers in Photoshop and Figma',
          text: 'Continue working with individual transparent PNG & PSD assets.',
        },
      ];

  return (
    <section className="border-t border-zinc-800/80 bg-[#09090b] px-5 py-16 text-zinc-100 md:px-8">
      <div className="mx-auto max-w-[1216px]">
        {/* Solutions Grid */}
        <div className="mb-14">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                {isKo ? '크리에이티브 솔루션 & 워크플로우' : isZh ? '垂直场景解决方案' : 'Creative Solutions & Workflows'}
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {isKo
                  ? '크리에이터 및 디자이너를 위한 맞춤형 워크플로우'
                  : isZh
                  ? '针对不同创作者的专属分层工作流'
                  : 'Tailored Workflows for Creators & Designers'}
              </h2>
            </div>
            <p className="text-xs text-zinc-400 sm:text-sm">
              {isKo
                ? 'Live2D 리깅, 그래픽 디자인, 모션 그래픽을 위한 다중 레이어 PSD 및 ZIP 내보내기'
                : isZh
                ? '精准满足 Live2D 建模、平面设计与动效制作需求'
                : 'Direct multi-layer PSD and ZIP outputs for modern pipelines'}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/90 bg-zinc-900/40 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                      {item.tag}
                    </span>
                    <ArrowUpRight className="size-4 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-400" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-zinc-100 group-hover:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] font-medium text-blue-400 group-hover:underline">
                  {isKo ? '워크플로우 둘러보기 →' : isZh ? '了解工作流 →' : 'Explore workflow →'}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Knowledge & Guides */}
        <div className="border-t border-zinc-800/80 pt-10">
          <h3 className="text-lg font-bold text-white">
            {isKo ? '사용 가이드 및 튜토리얼' : isZh ? '使用指南与原理解析' : 'Image Layering Guides & Resources'}
          </h3>
          <nav
            aria-label={isKo ? '이미지 레이어 튜토리얼' : isZh ? '图片分层教程' : 'Image layering guides'}
            className="mt-6 grid gap-6 md:grid-cols-3"
          >
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/60"
              >
                <span className="font-semibold text-zinc-200 group-hover:text-white underline underline-offset-4">
                  {guide.title}
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-zinc-400">
                  {guide.text}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
