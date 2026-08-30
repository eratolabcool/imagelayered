'use client';

import { Check, Layers3, Sparkles } from 'lucide-react';

interface LayerSettingsPanelProps {
  isZh: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
  isProcessing: boolean;
  hasImage: boolean;
}

export default function LayerSettingsPanel({
  isZh,
  onGenerate,
  canGenerate,
  isProcessing,
  hasImage,
}: LayerSettingsPanelProps) {
  const generateLabel = isProcessing
    ? isZh
      ? '正在识别并拆分图层…'
      : 'Finding and separating layers…'
    : hasImage
      ? isZh
        ? '开始自动分层'
        : 'Create editable layers'
      : isZh
        ? '请先上传图片'
        : 'Upload an image first';

  const outcomes = isZh
    ? [
        '自动识别主体、文字与背景',
        '保留透明边缘与原始位置',
        '完成后直接进入图层编辑器',
      ]
    : [
        'Find subjects, text, and background',
        'Keep transparent edges and alignment',
        'Open the editable layer workspace',
      ];

  return (
    <section
      aria-labelledby="layer-settings-title"
      className="rounded-2xl border border-white/[0.07] bg-[#191620] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-start justify-between gap-3 px-1 pt-1">
        <div className="min-w-0">
          <h2
            id="layer-settings-title"
            className="text-base font-semibold text-white"
          >
            {isZh
              ? '将图片变成可编辑图层'
              : 'Turn this image into editable layers'}
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-[#aaa4b1]">
            {isZh
              ? '无需选择模型或配置参数，系统会自动完成最合适的拆分。'
              : 'No model or technical setup needed. The best available workflow is applied automatically.'}
          </p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f33b72]/12 text-[#ff6b96]">
          <Layers3 className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-[#0f0d13] p-3">
        {outcomes.map((outcome) => (
          <div
            key={outcome}
            className="flex items-center gap-2.5 text-[11px] leading-5 text-[#b8b2bd]"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-[#f33b72]/12 text-[#ff7ca2]">
              <Check className="size-3" aria-hidden="true" />
            </span>
            <span>{outcome}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f33b72] px-3 py-3 text-sm font-bold text-white shadow-[0_14px_34px_rgba(243,59,114,0.24)] transition-all duration-200 outline-none hover:bg-[#ff4f83] hover:shadow-[0_18px_42px_rgba(243,59,114,0.3)] focus-visible:ring-2 focus-visible:ring-[#ff9ab7] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/[0.07] disabled:text-[#625c68] disabled:shadow-none"
      >
        <Sparkles
          className={`size-3.5 ${isProcessing ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
        {generateLabel}
      </button>
    </section>
  );
}
