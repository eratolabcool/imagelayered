'use client';

import { Layers3, Sparkles } from 'lucide-react';

import { DecompositionModel, LayeringMode } from '../types';

export interface DecompositionModelOption {
  model: DecompositionModel;
  provider: 'fal';
  label: string;
  shortLabel: string;
  description: string;
  badge: string;
  mode: 'native' | 'design-layering' | 'semantic-edit';
  layeringMode: LayeringMode;
  idealFor: string;
  outputHint: string;
}

interface LayerSettingsPanelProps {
  isZh: boolean;
  models: DecompositionModelOption[];
  selectedModel: DecompositionModel;
  onSelectModel: (model: DecompositionModel) => void;
  layerCount: number;
  onLayerCountChange: (count: number) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isProcessing: boolean;
  hasImage: boolean;
  hasLayers: boolean;
  compact?: boolean;
}

export default function LayerSettingsPanel({
  isZh,
  models,
  selectedModel,
  onSelectModel,
  layerCount,
  onLayerCountChange,
  onGenerate,
  canGenerate,
  isProcessing,
  hasImage,
  hasLayers,
  compact = false,
}: LayerSettingsPanelProps) {
  const generateLabel = isProcessing
    ? isZh
      ? '正在生成图层'
      : 'Generating layers'
    : hasLayers
      ? isZh
        ? '重新生成图层'
        : 'Regenerate layers'
      : hasImage
        ? isZh
          ? `生成 ${layerCount} 个图层`
          : `Generate ${layerCount} layers`
        : isZh
          ? '上传图片后生成'
          : 'Upload an image to generate';

  return (
    <section
      aria-labelledby="layer-settings-title"
      className="rounded-2xl border border-white/[0.07] bg-[#191620] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-start justify-between gap-3 px-1 pt-1">
        <div className="min-w-0">
          <h2 id="layer-settings-title" className="text-sm font-semibold text-white">
            {isZh ? '分层设置' : 'Layer settings'}
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-[#9993a3]">
            {isZh ? '选择真实模型和输出数量。' : 'Choose the model and output count.'}
          </p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f33b72]/12 text-[#ff6b96]">
          <Layers3 className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3 space-y-1.5" role="radiogroup" aria-label={isZh ? '分层模型' : 'Layering model'}>
        {models.map((option) => {
          const active = selectedModel === option.model;
          return (
            <button
              key={option.model}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelectModel(option.model)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#ff5b8c] ${
                active
                  ? 'border-[#f33b72]/45 bg-[#f33b72]/10 text-white'
                  : 'border-transparent bg-white/[0.035] text-[#aaa4b1] hover:bg-white/[0.065] hover:text-white'
              }`}
            >
              <span className={`size-2 shrink-0 rounded-full ${active ? 'bg-[#ff4f83] shadow-[0_0_14px_rgba(243,59,114,0.7)]' : 'bg-[#5b5563]'}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-semibold">{option.shortLabel}</span>
                {!compact && <span className="mt-0.5 block truncate text-[9px] text-[#77717f]">{option.outputHint}</span>}
              </span>
              {active && <span className="rounded-md bg-[#f33b72]/14 px-1.5 py-1 text-[9px] font-bold text-[#ff82a5]">{option.badge}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-[#0f0d13] px-3 py-2.5">
        <div>
          <p className="text-[11px] font-semibold text-white">{isZh ? '输出图层' : 'Output layers'}</p>
          <p className="mt-0.5 text-[9px] text-[#77717f]">{isZh ? '范围 2–12' : 'Range 2–12'}</p>
        </div>
        <div className="flex items-center rounded-lg border border-white/[0.08] bg-[#17141c] p-0.5">
          <button type="button" aria-label={isZh ? '减少图层' : 'Decrease layers'} onClick={() => onLayerCountChange(Math.max(2, layerCount - 1))} className="size-7 rounded-md text-sm text-[#aaa4b1] transition-colors hover:bg-white/[0.07] hover:text-white">−</button>
          <output className="w-8 text-center text-xs font-semibold text-white">{layerCount}</output>
          <button type="button" aria-label={isZh ? '增加图层' : 'Increase layers'} onClick={() => onLayerCountChange(Math.min(12, layerCount + 1))} className="size-7 rounded-md text-sm text-[#aaa4b1] transition-colors hover:bg-white/[0.07] hover:text-white">+</button>
        </div>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f33b72] px-3 py-2.5 text-xs font-bold text-white shadow-[0_14px_34px_rgba(243,59,114,0.24)] outline-none transition-all duration-200 hover:bg-[#ff4f83] hover:shadow-[0_18px_42px_rgba(243,59,114,0.3)] focus-visible:ring-2 focus-visible:ring-[#ff9ab7] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/[0.07] disabled:text-[#625c68] disabled:shadow-none"
      >
        <Sparkles className={`size-3.5 ${isProcessing ? 'animate-pulse' : ''}`} aria-hidden="true" />
        {generateLabel}
      </button>
    </section>
  );
}
