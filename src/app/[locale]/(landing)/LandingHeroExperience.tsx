'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import {
  STUDIO_EVENTS,
  trackStudioEvent,
} from '@/features/studio/lib/analytics';
import { ArrowRight, Check, LoaderCircle, Upload } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import { prepareImageFile } from '@/shared/blocks/crooked/lib/image-upload';

const copy = {
  en: {
    title: 'Turn any flat image into editable layers. Export PSD or transparent PNGs.',
    description:
      'Keep the image you love. Separate your AI artwork or character into layers, edit any element, and export directly to multi-layer PSD or transparent PNG ZIP.',
    upload: 'Upload an image',
    examples: 'Try a sample',
    preparing: 'Preparing your image…',
    formats: 'JPG, PNG or WebP · up to 25 MB',
    trial:
      'Upload and arrange layers free. AI decomposition costs 5 credits; PSD and PNG ZIP exports from a completed project do not consume credits.',
    benefits: [
      'AI Semantic Layers',
      'Multi-layer PSD & ZIP Export',
      'Lock, edit, and export',
    ],
    diagram: 'A real layer decomposition result',
    diagramAlt:
      'Image Layered example showing a flat composition separated into background, character, lettering and decorations.',
    diagramCaption:
      'One flat poster on the left, independent transparent layers on the right. Your result depends on the source image and settings.',
    sampleTitle: 'No image ready? Start with one of these.',
    sampleDescription:
      'Start from a real example, then open the same workflow in Studio when you are ready to test your own image.',
    sampleAction: 'Use this image',
    samples: [
      {
        id: 'fashion',
        title: 'Rework a poster',
        description:
          'Separate artwork and lettering before changing your composition.',
        alt: 'Summer Drop fashion poster sample',
      },
      {
        id: 'character',
        title: 'Live2D & Anime Slicing',
        description: 'Separate hair, body, and limbs for rigging and animation.',
        alt: 'Cyberpunk toy character artwork sample',
      },
      {
        id: 'product',
        title: 'Reuse a product visual',
        description: 'Review product and background layers for a new design.',
        alt: 'Skincare product photography sample',
      },
    ],
    workflowTitle: 'From a flat image to your next revision.',
    steps: [
      [
        'Upload',
        'Start with a clear JPG, PNG or WebP. Distinct subjects and backgrounds are easier to separate.',
      ],
      [
        'Separate',
        'Choose a layer count and generate. Inspect the edges and occluded inpainting of each layer.',
      ],
      [
        'Edit',
        'Select a layer to move, hide or adjust it. Describe a focused AI edit when you need a new variation.',
      ],
      [
        'Export PSD / ZIP',
        'Download a multi-layer Adobe Photoshop (.psd) file or full transparent ZIP for Photoshop, Live2D, or After Effects.',
      ],
    ],
    outputTitle: 'Professional multi-layer deliverables.',
    outputDescription:
      'Image Layered generates real, independent raster layers with alpha transparency and completed occlusion backgrounds.',
    outputs: [
      [
        'Multi-layer PSD (.psd)',
        'Export genuine Photoshop files with exact coordinates, layer names, and transparency.',
      ],
      [
        'Transparent PNG ZIP (.zip)',
        'Download all individual transparent slices for Live2D Cubism, Spine, or After Effects.',
      ],
      [
        'Non-destructive Canvas',
        'Move, resize, hide, and remix elements with local AI prompts without re-synthesizing unselected objects.',
      ],
    ],
    outputNote:
      'Studio exports standard Adobe Photoshop (.psd) files, transparent PNG archives, and flattened composite images directly in your browser.',
    faqTitle: 'Before you start',
    faqs: [
      [
        'How is this different from background removal?',
        'Background removal only produces a single cutout. Image Layered separates multiple semantic elements and automatically inpaints occluded background areas so layers are self-contained.',
      ],
      [
        'Can I use the output in Photoshop, Live2D, or Figma?',
        'Yes! Export directly to a multi-layer Adobe Photoshop (.psd) file or a ZIP of transparent PNG layers, ready to open in Photoshop, Clip Studio Paint, Live2D Cubism, Spine, or Figma.',
      ],
      [
        'Can I edit text from a flattened image?',
        'You can work with a separated text region as an image layer and request an AI edit. It is not recovered as a native text box with the original font. Check spelling and edges before exporting.',
      ],
      [
        'Will the layers exactly match the original?',
        'AI decomposition creates an approximation. Fine hair, transparency, overlapping objects and small text can need cleanup. Compare the layers with your source before using the result.',
      ],
      [
        'Do I need an account to start?',
        'You can upload an image and open Studio without signing up. Guest AI usage is limited; Studio will show when you need an account or additional credits.',
      ],
    ],
    finalTitle: 'Give your image a second draft.',
    finalDescription:
      'Start with one image. See what separates, change what needs work, and keep creating.',
    pricing: 'View pricing',
    invalidType: 'Choose a JPG, PNG or WebP image.',
    invalidSize: 'Choose an image smaller than 25 MB.',
    failed:
      'We couldn’t prepare this image. Try a smaller file or upload it directly in Studio.',
    storageFailed:
      'This image is too large for the page transfer. Open Studio and upload it there.',
    retry: 'Upload directly in Studio',
  },
  zh: {
    title: '把一张图拆成可编辑图层，导出 PSD 或透明 PNG。',
    description:
      '保留喜欢的画面。将 AI 作品或角色立绘一键拆解为独立图层，局部修改后直接导出多图层 PSD 或透明 PNG ZIP 包。',
    upload: '上传图片',
    examples: '试用示例图片',
    preparing: '正在准备图片…',
    formats: 'JPG、PNG 或 WebP · 最大 25 MB',
    trial:
      '上传和整理图层免费；AI 分层每次 5 积分，项目完成后导出 PSD 和 PNG ZIP 不再扣积分。',
    benefits: ['AI 语义图层拆解', '多图层 PSD 与透明 PNG ZIP', '锁定、修改并导出'],
    diagram: '真实分层结果预览',
    diagramAlt:
      'Image Layered 分层示例：平面画面拆分为背景、人物、文字和装饰元素。',
    diagramCaption:
      '左侧是平面海报，右侧是独立透明图层。实际结果取决于源图片与分层设置。',
    sampleTitle: '还没有准备图片？先试试这些素材。',
    sampleDescription:
      '先看真实示例，再把同样的工作流带进 Studio，测试你自己的图片。',
    sampleAction: '使用这张图片',
    samples: [
      {
        id: 'fashion',
        title: '修改一张海报',
        description: '尝试分离画面与文字，再调整构图。',
        alt: 'Summer Drop 时尚海报示例素材',
      },
      {
        id: 'character',
        title: 'Live2D 与动漫切片',
        description: '分离头发、五官与四肢，为骨骼绑定和动效做准备。',
        alt: '赛博朋克潮玩角色示例素材',
      },
      {
        id: 'product',
        title: '复用商品素材',
        description: '检查商品和背景图层，为下一份设计准备素材。',
        alt: '护肤品摄影示例素材',
      },
    ],
    workflowTitle: '从平面图片，到下一版设计。',
    steps: [
      [
        '上传图片',
        '使用清晰的 JPG、PNG 或 WebP。主体与背景区分越明显，越容易得到可用的图层。',
      ],
      [
        '生成图层',
        '选择图层数量后开始生成。AI 自动分离元素，并修补被遮挡部位的底图。',
      ],
      [
        '选中修改',
        '移动、隐藏或调整选中的图层；需要新的版本时，用一句话描述局部 AI 修改。',
      ],
      [
        '导出 PSD / ZIP',
        '一键下载多图层 Photoshop (.psd) 文件或全透明 PNG 切片 ZIP 包。',
      ],
    ],
    outputTitle: '专业交付物，无缝衔接设计工具。',
    outputDescription:
      'Image Layered 会生成带透明通道的独立像素图层，并自动修补被遮挡区域。',
    outputs: [
      ['多图层 PSD (.psd)', '直接导出包含独立图层、对齐坐标和透明通道的 Photoshop 文件。'],
      ['透明 PNG ZIP 压缩包', '一键下载全部透明切片，供 Live2D Cubism、Spine 或 After Effects 使用。'],
      ['图层编辑工作区', '移动、缩放、隐藏或局部重绘元素，无需重新生成整张画面。'],
    ],
    outputNote:
      'Studio 支持在浏览器中直接导出标准 Adobe Photoshop (.psd) 文件、透明图层 ZIP 压缩包或合并 PNG。',
    faqTitle: '开始前的常见问题',
    faqs: [
      [
        '它和去背景有什么区别？',
        '去背景通常只抠出单个主体。Image Layered 会自动拆分多个画面元素，并对被遮挡的背景进行智能补全，生成互相独立的图层。',
      ],
      [
        '导出后可以在 Photoshop、Live2D 或 Figma 中使用吗？',
        '可以！你可以直接导出包含所有图层和透明通道的 Adobe Photoshop (.psd) 文件，也可以下载所有透明 PNG 的 ZIP 包，直接导入 Photoshop、Clip Studio Paint、Live2D Cubism 或 Spine。',
      ],
      [
        '能修改平面图片里的文字吗？',
        '可以将分离出的文字区域作为图片图层，尝试 AI 修改。它不会还原为带有原始字体的文本框，导出前请检查文字内容与边缘。',
      ],
      [
        '拆出来的图层会和原图完全一致吗？',
        'AI 分层是近似重建。细碎头发、透明材质、重叠物体和小字可能需要修整，使用结果前应与原图对比。',
      ],
      [
        '开始前需要注册吗？',
        '无需注册即可上传图片并进入 Studio。访客 AI 使用次数有限，需要账号或更多积分时，Studio 会给出提示。',
      ],
    ],
    finalTitle: '让这张图片，继续成为你的作品。',
    finalDescription: '上传一张图，检查分层，修改需要调整的部分，继续创作。',
    pricing: '查看价格',
    invalidType: '请选择 JPG、PNG 或 WebP 图片。',
    invalidSize: '请选择小于 25 MB 的图片。',
    failed: '无法准备这张图片。请换一张较小的图片，或直接在 Studio 上传。',
    storageFailed: '图片过大，无法在页面间传递。请打开 Studio 直接上传。',
    retry: '直接在 Studio 上传',
  },
  ko: {
    title: '단일 이미지를 편집 가능한 레이어로 분리 — PSD & Live2D 내보내기',
    description:
      '마음에 드는 이미지는 그대로. AI 아트워크나 캐릭터 일러스트를 독립된 레이어로 분리하고, 특정 요소만 수정한 뒤 포토샵 PSD나 투명 PNG ZIP으로 바로 내보내세요.',
    upload: '이미지 업로드하기',
    examples: '샘플 이미지로 체험하기',
    preparing: '이미지를 준비하는 중입니다…',
    formats: 'JPG, PNG 또는 WebP · 최대 25 MB',
    trial:
      '업로드와 레이어 정리는 무료입니다. AI 분해는 5크레딧, 완료된 프로젝트의 PSD와 PNG ZIP 내보내기는 추가 크레딧이 들지 않습니다.',
    benefits: [
      'AI 시맨틱 레이어 분해',
      '다중 레이어 PSD & ZIP 내보내기',
      'Live2D & 리깅 즉시 활용',
    ],
    diagram: '평면 이미지가 레이어로 분리되는 원리',
    diagramAlt:
      'Image Layered 분해 예시: 배경, 캐릭터, 레터링, 장식 파츠로 분리된 모습.',
    diagramCaption:
      '이미지 분해 예시. 실제 결과는 원본 이미지의 복잡도와 레이어 설정에 따라 달라집니다.',
    sampleTitle: '준비된 이미지가 없으신가요? 샘플로 먼저 테스트해 보세요.',
    sampleDescription:
      '실제 예시를 먼저 확인한 뒤, 준비가 되면 같은 흐름을 Studio에서 직접 테스트해 보세요.',
    sampleAction: '이 이미지로 체험하기',
    samples: [
      {
        id: 'fashion',
        title: '포스터 수정 & 리믹스',
        description: '일러스트와 텍스트 레터링을 분리해 레이아웃을 다시 배치하세요.',
        alt: 'Summer Drop 패션 포스터 샘플',
      },
      {
        id: 'character',
        title: 'Live2D & 캐릭터 파츠 분리',
        description: '머리카락, 얼굴, 의상, 사지를 분리하여 리깅과 모션에 맞게 준비하세요.',
        alt: '사이버펑크 토이 캐릭터 샘플',
      },
      {
        id: 'product',
        title: '제품 상업 사진 재활용',
        description: '제품과 배경을 분리하고 새로운 시즌 배경으로 교체하세요.',
        alt: '스킨케어 제품 사진 샘플',
      },
    ],
    workflowTitle: '평면 이미지에서 완성도 높은 2차 작업까지.',
    steps: [
      [
        '이미지 업로드',
        '선명한 JPG, PNG, WebP 이미지를 선택합니다. 피사체와 배경이 구분될수록 더 정밀하게 분리됩니다.',
      ],
      [
        'AI 레이어 분리',
        '레이어 개수를 선택하고 분리를 시작합니다. 가려진 뒷면까지 자연스럽게 인페인팅 복원됩니다.',
      ],
      [
        '캔버스 확인 및 수정',
        '특정 레이어를 숨기거나 이동하고, 프롬프트로 원하는 파츠만 핀포인트로 수정하세요.',
      ],
      [
        'PSD / ZIP 내보내기',
        '포토샵, 클립 스튜디오, Live2D 큐비즘에서 바로 열 수 있는 .psd 파일이나 투명 PNG 압축팩으로 저장하세요.',
      ],
    ],
    outputTitle: '작업에 바로 쓸 수 있는 전문 포맷 제공.',
    outputDescription:
      'Image Layered는 투명 알파 채널과 가려진 영역 복원이 완료된 실제 래스터 레이어를 생성합니다.',
    outputs: [
      [
        '다중 레이어 PSD (.psd)',
        '레이어 이름, 정렬 좌표, 투명도가 보존된 표준 포토샵 파일로 내보냅니다.',
      ],
      [
        '투명 PNG 압축팩 (.zip)',
        'Live2D 큐비즘, 스파인, 애프터 이펙트에 즉시 넣을 수 있는 투명 개별 파츠 묶음입니다.',
      ],
      [
        '비파괴 편집 스튜디오',
        '선택되지 않은 다른 요소들의 구도와 픽셀을 건드리지 않고 원하는 파츠만 안전하게 수정합니다.',
      ],
    ],
    outputNote:
      '브라우저에서 표준 Adobe Photoshop (.psd) 파일, 투명 PNG 압축팩 또는 단일 합성 이미지를 직접 내보낼 수 있습니다.',
    faqTitle: '시작 전 자주 묻는 질문',
    faqs: [
      [
        '일반 누끼 따기(배경 제거)와 무엇이 다른가요?',
        '단순 배경 제거는 단일 피사체만 남깁니다. Image Layered는 여러 개체를 의미 단위로 쪼개고, 앞선 물체 뒤로 가려져 있던 배경과 몸체를 AI로 자연스럽게 채워 넣어 레이어를 완성합니다.',
      ],
      [
        '포토샵, 클립 스튜디오, Live2D에서 쓸 수 있나요?',
        '네! 표준 다중 레이어 PSD 파일로 직접 내보내거나 투명 PNG ZIP으로 다운로드하여 포토샵, 클립 스튜디오, Live2D 큐비즘, 스파인, 피그마에서 바로 작업할 수 있습니다.',
      ],
      [
        '평면 이미지 속 텍스트도 편집할 수 있나요?',
        '분리된 텍스트 영역을 레이어로 선택한 후 AI 프롬프트로 문구를 수정할 수 있습니다. 폰트 텍스트 상자로 복원되는 것은 아니므로 다운로드 전 스펠링과 가장자리를 확인해 주세요.',
      ],
      [
        '분리된 레이어가 원본과 완벽히 일치하나요?',
        'AI 레이어 분해는 생성형 근사 복원입니다. 흩날리는 잔머리, 반투명 재질, 겹친 장식 등은 미세한 정리가 필요할 수 있으므로 캔버스에서 원본과 비교해 보시길 권장합니다.',
      ],
      [
        '시작하려면 계정이 필요한가요?',
        '회원가입 없이도 이미지를 업로드하고 스튜디오를 체험하실 수 있습니다. 게스트 AI 사용 한도에 도달하면 계정 가입 또는 크레딧 안내가 표시됩니다.',
      ],
    ],
    finalTitle: '이미지에 새로운 가능성을 더해보세요.',
    finalDescription:
      '이미지 한 장으로 시작하세요. 레이어를 분리하고 필요한 부분만 수정하여 작업을 완성하세요.',
    pricing: '요금제 안내',
    invalidType: 'JPG, PNG 또는 WebP 이미지를 선택해 주세요.',
    invalidSize: '25 MB 이하의 이미지를 선택해 주세요.',
    failed:
      '이미지를 준비할 수 없습니다. 더 작은 파일을 사용하거나 스튜디오에서 직접 업로드해 보세요.',
    storageFailed:
      '이미지 용량이 너무 큽니다. 스튜디오를 열고 직접 업로드해 주세요.',
    retry: '스튜디오에서 직접 업로드하기',
  },
};

const focus =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6b96]';
const primary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f33b72] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#d92c60] disabled:cursor-wait disabled:opacity-60 ${focus}`;

export default function LandingHeroExperience() {
  const locale = useLocale();
  const t = locale === 'ko' ? copy.ko : locale === 'zh' ? copy.zh : copy.en;
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const studioPath = locale === 'en' ? '/studio' : `/${locale}/studio`;

  async function openImage(file: File, source: string) {
    if (busyRef.current) return;
    setError(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError(t.invalidType);
      return;
    }
    if (!file.size || file.size > 25 * 1024 * 1024) {
      setError(t.invalidSize);
      return;
    }
    busyRef.current = true;
    setBusy(true);
    trackStudioEvent(STUDIO_EVENTS.landingUploadStarted, { source, locale });
    try {
      const prepared = await prepareImageFile(file);
      try {
        sessionStorage.setItem('uploadedImage', JSON.stringify(prepared));
      } catch {
        throw new Error('storage');
      }
      trackStudioEvent(STUDIO_EVENTS.landingEditorOpened, { source, locale });
      window.location.assign(studioPath);
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message === 'storage'
          ? t.storageFailed
          : t.failed
      );
      trackStudioEvent(STUDIO_EVENTS.landingUploadFailed, { source, locale });
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function openSample(id: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    trackStudioEvent(STUDIO_EVENTS.landingSampleSelected, {
      sample_id: id,
      locale,
    });
    try {
      const response = await fetch(`/imgs/demos/demo-${id}.jpg`);
      if (!response.ok) throw new Error('sample');
      const blob = await response.blob();
      busyRef.current = false;
      await openImage(
        new File([blob], `sample-${id}.jpg`, { type: 'image/jpeg' }),
        `sample_${id}`
      );
    } catch {
      setError(t.failed);
      busyRef.current = false;
      setBusy(false);
      trackStudioEvent(STUDIO_EVENTS.landingUploadFailed, {
        source: `sample_${id}`,
        locale,
      });
    }
  }

  function chooseImage() {
    trackStudioEvent(STUDIO_EVENTS.landingUploadClicked, { locale });
    inputRef.current?.click();
  }

  return (
    <div className="bg-[#0b090d] [font-family:var(--font-body)] text-[#f6f3f8]">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label={t.upload}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void openImage(file, 'upload');
          event.target.value = '';
        }}
      />
      <section className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 pt-28 pb-14 md:px-8 lg:gap-12 lg:pt-36 lg:pb-20 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="max-w-[18ch] [font-family:var(--font-display)] text-[clamp(2.5rem,4.8vw,4.5rem)] leading-[1.08] font-extrabold tracking-[-0.035em] text-balance">
            {t.title}
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-8 text-[#bcb5c5]">
            {t.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={chooseImage}
              disabled={busy}
              className={primary}
              aria-describedby="upload-formats"
            >
              {busy ? (
                <LoaderCircle className="size-4 motion-safe:animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {busy ? t.preparing : t.upload}
            </button>
            <a
              href="#examples"
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white/5 ${focus}`}
            >
              {t.examples}
              <ArrowRight className="size-4" />
            </a>
          </div>
          <p id="upload-formats" className="mt-4 text-sm text-[#bcb5c5]">
            {t.formats}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#bcb5c5]">{t.trial}</p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#e1dbe6]">
            {t.benefits.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-4 text-[#ff7ca2]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <figure className="min-w-0">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30">
            <Image
              src="/imgs/features/hero-case-1.jpg"
              width={1600}
              height={900}
              alt={t.diagramAlt}
              priority
              sizes="(min-width:1280px) 640px, (min-width:768px) 90vw, 100vw"
              className="h-auto w-full"
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[31%] items-end justify-between bg-[#0b090d] px-4 pb-4 text-[11px] font-semibold tracking-[0.08em] text-[#f6f3f8] sm:px-6 sm:pb-5 sm:text-xs">
              <span>{locale === 'zh' ? '平面原图' : locale === 'ko' ? '평면 원본' : 'FLAT IMAGE'}</span>
              <span className="text-[#ff8aaf]">→</span>
              <span>{locale === 'zh' ? '独立透明图层' : locale === 'ko' ? '독립 투명 레이어' : 'INDEPENDENT LAYERS'}</span>
            </div>
          </div>
          <figcaption className="mt-4 text-sm leading-6 text-[#bcb5c5]">
            {t.diagramCaption}
          </figcaption>
        </figure>
      </section>

      <section className="border-b border-white/10 bg-[#0f0d12] px-5 py-14 md:px-8 md:py-18">
        <div className="mx-auto max-w-[1216px]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff7ca2]">
              {locale === 'zh' ? '交付物预览' : locale === 'ko' ? '출력물 미리보기' : 'See the deliverable'}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.025em] md:text-4xl">
              {locale === 'zh' ? '你得到的是图层栈，不是一张被重新包装的图片。' : locale === 'ko' ? '한 장의 이미지를 다시 포장한 파일이 아니라 레이어 스택을 받습니다.' : 'You get a layer stack, not a flat image wrapped in a PSD.'}
            </h2>
            <p className="mt-4 leading-7 text-[#bcb5c5]">
              {locale === 'zh' ? '每个图层都有透明度、顺序和可见性。隐藏主体、替换背景或把 PNG 图层交给下一款工具。' : locale === 'ko' ? '각 레이어에는 투명도, 순서 및 가시성이 있습니다. 주제를 숨기고 배경을 교체하거나 PNG 레이어를 다음 도구로 넘기세요.' : 'Each layer keeps transparency, order, and visibility. Hide the subject, replace the background, or pass transparent PNGs to the next tool.'}
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <Image src="/imgs/demos/demo-fashion.jpg" width={768} height={768} alt="Original image" className="aspect-[4/3] w-full rounded-xl object-cover" />
              <p className="mt-3 text-sm font-semibold">{locale === 'zh' ? '原图' : locale === 'ko' ? '원본' : 'Original'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#17131b] p-2">
                {['Background', 'Main Subject', 'Text / Graphics', 'Shadow'].map((name, index) => (
                  <div key={name} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-2 text-[11px] text-[#e9e2ed]">
                    <Image src={index % 2 ? '/imgs/demos/demo-character.jpg' : '/imgs/demos/demo-fashion.jpg'} width={48} height={48} alt="" className="size-8 rounded object-cover" />
                    <span className="truncate">{locale === 'zh' ? ['背景', '主体', '文字 / 图形', '阴影'][index] : name}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm font-semibold">{locale === 'zh' ? '语义图层栈' : locale === 'ko' ? '의미 레이어 스택' : 'Semantic layer stack'}</p>
            </div>
            <div className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.06] p-6">
              <div className="flex h-full min-h-40 flex-col justify-between rounded-xl border border-blue-300/20 bg-[#111827] p-5">
                <div><p className="text-xs uppercase tracking-widest text-blue-300">PSD + PNG ZIP</p><p className="mt-3 text-lg font-semibold text-white">{locale === 'zh' ? '带透明度的独立图层' : locale === 'ko' ? '투명도를 유지한 독립 레이어' : 'Independent layers with alpha'}</p></div>
                <Link href="/docs" className="text-sm font-semibold text-blue-300 underline underline-offset-4">{locale === 'zh' ? '查看导出说明 →' : locale === 'ko' ? '내보내기 안내 보기 →' : 'Read export details →'}</Link>
              </div>
              <p className="mt-3 text-sm font-semibold">{locale === 'zh' ? '可交付文件' : locale === 'ko' ? '납품 파일' : 'Production files'}</p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="examples"
        className="scroll-mt-24 border-y border-white/10 bg-[#121016] px-5 py-14 md:px-8 md:py-20"
      >
        <div className="mx-auto max-w-[1216px]">
          <h2 className="max-w-3xl text-3xl font-bold tracking-[-0.025em] md:text-4xl">
            {t.sampleTitle}
          </h2>
          <p className="mt-4 max-w-[68ch] leading-7 text-[#bcb5c5]">
            {t.sampleDescription}
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {t.samples.map((sample) => (
              <article key={sample.id} className="min-w-0">
                <Image
                  src={`/imgs/demos/demo-${sample.id}.jpg`}
                  width={768}
                  height={768}
                  alt={sample.alt}
                  sizes="(min-width:768px) 33vw, 100vw"
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
                <h3 className="mt-5 text-xl font-bold">{sample.title}</h3>
                <p className="mt-2 min-h-14 text-sm leading-7 text-[#bcb5c5]">
                  {sample.description}
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void openSample(sample.id)}
                  className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-[#ff8aaf] hover:text-white disabled:opacity-50 ${focus}`}
                >
                  {busy ? t.preparing : t.sampleAction}
                  <ArrowRight className="size-4" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-[1280px] scroll-mt-24 px-5 py-14 md:px-8 md:py-20"
      >
        <h2 className="max-w-3xl text-3xl font-bold tracking-[-0.025em] md:text-4xl">
          {t.workflowTitle}
        </h2>
        <ol className="mt-9 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {t.steps.map(([title, text], index) => (
            <li key={title} className="border-t border-white/15 pt-5">
              <span className="text-sm font-semibold text-[#ff8aaf]">
                {index + 1} / {t.steps.length}
              </span>
              <h3 className="mt-3 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#bcb5c5]">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-white/10 px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-[1216px] gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.025em] md:text-4xl">
              {t.outputTitle}
            </h2>
            <p className="mt-5 max-w-[55ch] leading-8 text-[#bcb5c5]">
              {t.outputDescription}
            </p>
            <p className="mt-5 max-w-[60ch] text-sm leading-7 text-[#bcb5c5]">
              {t.outputNote}
            </p>
          </div>
          <dl className="divide-y divide-white/10">
            {t.outputs.map(([title, text]) => (
              <div key={title} className="pb-5 not-first:pt-5">
                <dt className="text-lg font-semibold">{title}</dt>
                <dd className="mt-2 text-sm leading-7 text-[#bcb5c5]">
                  {text}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="mx-auto max-w-[880px] px-5 py-14 md:px-8 md:py-20">
        <h2 className="text-3xl font-bold tracking-[-0.025em] md:text-4xl">
          {t.faqTitle}
        </h2>
        <div className="mt-8 divide-y divide-white/15">
          {t.faqs.map(([question, answer]) => (
            <details key={question} className="py-5">
              <summary
                className={`cursor-pointer rounded text-base leading-7 font-semibold ${focus}`}
              >
                {question}
              </summary>
              <p className="mt-3 max-w-[70ch] text-sm leading-7 text-[#bcb5c5]">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>
      <section className="border-t border-white/10 bg-[#17141c] px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto flex max-w-[1216px] flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.025em] md:text-4xl">
              {t.finalTitle}
            </h2>
            <p className="mt-4 max-w-[65ch] leading-7 text-[#bcb5c5]">
              {t.finalDescription}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-5">
            <button
              type="button"
              className={primary}
              onClick={chooseImage}
              disabled={busy}
            >
              {busy ? t.preparing : t.upload}
              <ArrowRight className="size-4" />
            </button>
            <Link
              href="/pricing"
              className={`inline-flex min-h-11 items-center rounded text-sm font-semibold underline underline-offset-4 ${focus}`}
            >
              {t.pricing}
            </Link>
          </div>
        </div>
      </section>
      {busy && (
        <p
          role="status"
          className="fixed bottom-5 left-1/2 z-50 w-[min(90vw,32rem)] -translate-x-1/2 rounded-xl bg-[#211d28] p-4 text-center text-sm shadow-lg"
        >
          {t.preparing}
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="fixed bottom-5 left-1/2 z-50 w-[min(90vw,32rem)] -translate-x-1/2 rounded-xl border border-[#ff8aaf]/50 bg-[#211d28] p-5 shadow-lg"
        >
          <p className="text-sm leading-6">{error}</p>
          <Link
            href="/studio"
            className={`mt-3 inline-flex min-h-11 items-center rounded text-sm font-bold text-[#ff8aaf] underline ${focus}`}
          >
            {t.retry}
          </Link>
        </div>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: t.faqs.map(([question, answer]) => ({
              '@type': 'Question',
              name: question,
              acceptedAnswer: { '@type': 'Answer', text: answer },
            })),
          }).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  );
}
