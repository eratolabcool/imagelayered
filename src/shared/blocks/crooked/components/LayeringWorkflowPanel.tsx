'use client';

import { Layers3, Sparkles } from 'lucide-react';

import {
  DecompositionModel,
  LayeringMode,
  WorkflowPreset,
  WorkflowPresetId,
} from '../types';

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

interface LayeringWorkflowPanelProps {
  isZh: boolean;
  presets: WorkflowPreset[];
  selectedPresetId: WorkflowPresetId;
  selectedPreset: WorkflowPreset;
  onSelectPreset: (id: WorkflowPresetId) => void;
  models: DecompositionModelOption[];
  selectedModel: DecompositionModel;
  onSelectModel: (model: DecompositionModel) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isProcessing: boolean;
  hasImage: boolean;
  hasLayers: boolean;
  compact?: boolean;
}

export default function LayeringWorkflowPanel({
  isZh,
  presets,
  selectedPresetId,
  selectedPreset,
  onSelectPreset,
  models,
  selectedModel,
  onSelectModel,
  onGenerate,
  canGenerate,
  isProcessing,
  hasImage,
  hasLayers,
  compact = false,
}: LayeringWorkflowPanelProps) {
  const localizedGoal = isZh
    ? {
        product: '保留产品本身，只调整周围的商业场景与陈列元素。',
        poster: '无需重建设计稿，也能重组已经合并的海报与广告素材。',
        'ai-image':
          '只修复 AI 图像中的局部问题，同时保留已经满意的构图与风格。',
        character: '保持角色身份一致，创建可控的服装、场景与光线变化。',
      }[selectedPreset.id]
    : selectedPreset.goal;

  const generateLabel = isProcessing
    ? isZh
      ? '正在生成图层'
      : 'Generating layers'
    : hasLayers
      ? isZh
        ? '图层已生成'
        : 'Layers generated'
      : hasImage
        ? isZh
          ? `生成 ${selectedPreset.layerCount} 个图层`
          : `Generate ${selectedPreset.layerCount} layers`
        : isZh
          ? '上传图片后生成'
          : 'Upload an image to generate';

  return (
    <section
      aria-labelledby="layering-workflow-title"
      className="rounded-2xl bg-[#0d1931] p-3 shadow-[0_18px_48px_rgba(0,0,0,0.24)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="layering-workflow-title"
            className="text-sm font-semibold text-[#dee5ff]"
          >
            {isZh ? '分层工作流' : 'Layering workflow'}
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-cyan-50/58">
            {isZh
              ? '选择素材类型，AI 会配置合适的图层结构。'
              : 'Choose the source type to configure the right layer structure.'}
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-300/12 text-cyan-100">
          <Layers3 className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div
        className="mt-3 grid grid-cols-2 gap-1.5"
        role="group"
        aria-label={isZh ? '工作流类型' : 'Workflow type'}
      >
        {presets.map((preset) => {
          const active = selectedPresetId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectPreset(preset.id)}
              className={`min-h-14 rounded-xl px-2.5 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#b89fff] ${
                active
                  ? 'bg-[#dee5ff] text-[#071123]'
                  : 'bg-white/[0.055] text-slate-200 hover:bg-white/[0.09]'
              }`}
            >
              <span className="block truncate text-[11px] font-bold">
                {preset.title}
              </span>
              <span
                className={`mt-1 block text-[9px] font-semibold ${active ? 'text-[#071123]/55' : 'text-cyan-50/45'}`}
              >
                {preset.layerCount} {isZh ? '个图层' : 'layers'}
              </span>
            </button>
          );
        })}
      </div>

      {!compact && (
        <p className="mt-2 rounded-xl bg-black/16 px-3 py-2 text-[10px] leading-5 text-cyan-50/64">
          {localizedGoal}
        </p>
      )}

      <div
        className="mt-3 rounded-xl bg-[#091328] p-1.5"
        role="group"
        aria-label={isZh ? '分层模型' : 'Layering model'}
      >
        {models.map((option) => {
          const active = selectedModel === option.model;

          return (
            <button
              key={option.model}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectModel(option.model)}
              title={`${option.description} · ${option.idealFor}`}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#b89fff] ${
                active
                  ? 'bg-cyan-300/14 text-cyan-50'
                  : 'text-slate-400 hover:bg-white/[0.055] hover:text-slate-200'
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${active ? 'bg-cyan-300 shadow-[0_0_10px_rgba(77,228,255,0.55)]' : 'bg-slate-600'}`}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-bold">
                  {option.shortLabel}
                </span>
                {!compact && (
                  <span className="mt-0.5 block truncate text-[9px] opacity-55">
                    {option.outputHint}
                  </span>
                )}
              </span>
              {active && (
                <span className="text-[9px] font-bold text-cyan-100/70">
                  {option.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#b89fff,#4de4ff)] px-3 py-2.5 text-xs font-bold text-[#071123] shadow-[0_14px_32px_rgba(77,228,255,0.16)] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-[#dee5ff] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/[0.07] disabled:bg-none disabled:text-slate-500 disabled:shadow-none"
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
