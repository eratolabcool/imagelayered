'use client';

import React from 'react';
import { Icons } from './Icon';
import { useCrookedCopy } from '../i18n';

interface CollapsibleLeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  layers: any[];
  layerCount: number;
  setLayerCount: (count: number) => void;
  advancedConfig: any;
  setAdvancedConfig: (config: any) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadClick: () => void;
  onDecompose: (count: number) => void;
  onExport: () => void;
  isProcessing: boolean;
  canDecompose: boolean;
  canExport: boolean;
}

const CollapsibleLeftSidebar: React.FC<CollapsibleLeftSidebarProps> = ({
  isCollapsed,
  onToggle,
  layers,
  layerCount,
  setLayerCount,
  advancedConfig,
  setAdvancedConfig,
  fileInputRef,
  onUploadClick,
  onDecompose,
  onExport,
  isProcessing,
  canDecompose,
  canExport,
}) => {
  const copy = useCrookedCopy();
  const tb = copy.toolbar;
  const adv = copy.advanced;
  const empty = copy.empty;
  const sidebar = copy.sidebar;
  const workflow = copy.workflow;
  const hasImage = layers.length > 0;

  if (isCollapsed && layers.length > 1) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[26px] bg-[rgba(15,25,48,0.84)] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.34)] ring-1 ring-white/8 backdrop-blur-[22px]">
        <button
          onClick={onToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-white transition-colors hover:bg-white/12"
          title={sidebar.expand}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 15 12"></polyline>
            <polyline points="9 12 15 12 15 12"></polyline>
            <polyline points="9 6 15 12 15 12"></polyline>
          </svg>
        </button>

        <button
          onClick={onUploadClick}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8fa3ff,#4de4ff)] text-[#071123] shadow-[0_16px_34px_rgba(77,228,255,0.22)] transition-transform hover:-translate-y-0.5"
          title={layers.length > 0 ? copy.buttons.changeImage : empty.title}
        >
          <Icons.Upload />
        </button>

        <div className="flex w-12 flex-col items-center rounded-2xl bg-[#eef6ff] px-1.5 py-2 text-[#071123] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.85)]">
          <span className="text-[8px] font-black uppercase tracking-wide text-slate-500">Auto</span>
          <div className="leading-none text-2xl font-black tabular-nums">
            {layerCount}
          </div>
          <span className="mt-0.5 text-[8px] font-bold uppercase text-slate-500">Layers</span>
        </div>

        <button
          onClick={() => onDecompose(layerCount)}
          disabled={!canDecompose || isProcessing}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/14 text-cyan-100 ring-1 ring-cyan-200/20 transition-colors hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-40"
          title={tb.autoDecompose}
        >
          <Icons.Magic />
        </button>
      </div>
    );
  }

  return (
    <div className="flex max-h-[calc(100vh-150px)] flex-col gap-4 overflow-y-auto rounded-[28px] bg-[rgba(15,25,48,0.84)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.34)] ring-1 ring-white/8 backdrop-blur-[22px] custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-100/55">{workflow.decompose}</p>
          <h2 className="mt-1 text-base font-semibold text-white">{tb.numberOfLayers}</h2>
        </div>
        <button
          onClick={onToggle}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-white transition-colors hover:bg-white/12"
          title={sidebar.collapse}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 12"></polyline>
            <polyline points="15 12 9 12 15 12"></polyline>
            <polyline points="15 6 9 12 15 12"></polyline>
          </svg>
        </button>
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="group rounded-2xl bg-[linear-gradient(135deg,rgba(137,162,255,0.22),rgba(77,228,255,0.14))] p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-cyan-100/10 transition-transform duration-300 hover:-translate-y-0.5 hover:ring-cyan-100/20"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8fa3ff,#4de4ff)] text-[#071123] shadow-[0_16px_34px_rgba(77,228,255,0.22)]">
            <Icons.Upload />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{hasImage ? copy.buttons.changeImage : empty.title}</p>
            <p className="mt-1 text-xs text-slate-400">{adv.supportedFormats}</p>
          </div>
        </div>
      </button>

      <div className="rounded-2xl bg-[#eef6ff] p-4 text-[#071123] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.88)]">
        <label className="space-y-3">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Auto-Layers</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="20"
              value={layerCount}
              onChange={(e) => setLayerCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="h-16 w-24 rounded-2xl border border-slate-200 bg-white px-3 text-center text-4xl font-black tabular-nums text-[#071123] outline-none transition-all hover:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">{workflow.decompose}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">Qwen separates the poster into transparent RGBA elements. More layers means finer control, but slower processing.</p>
            </div>
          </div>
        </label>
      </div>

      <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(14,24,46,0.96),rgba(9,19,40,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{adv.aiModel}</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAdvancedConfig({ ...advancedConfig, model: 'fal-ai/qwen-image-layered' })}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                advancedConfig.model === 'fal-ai/qwen-image-layered'
                  ? 'bg-blue-600/20 text-blue-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.5)]'
                  : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              {adv.standard}
            </button>
            <button
              onClick={() => setAdvancedConfig({ ...advancedConfig, model: 'fal-ai/qwen-image-layered/lora' })}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                advancedConfig.model === 'fal-ai/qwen-image-layered/lora'
                  ? 'bg-purple-600/20 text-purple-400 shadow-[inset_0_0_0_1px_rgba(147,51,234,0.5)]'
                  : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              {adv.lora}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(14,24,46,0.96),rgba(9,19,40,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <label className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{adv.prompt}</span>
          <textarea
            value={advancedConfig.prompt}
            onChange={(e) => setAdvancedConfig({ ...advancedConfig, prompt: e.target.value })}
            placeholder={adv.promptPlaceholder}
            rows={3}
            className="w-full rounded-xl bg-[#0b152b] px-3 py-2 text-xs text-white outline-none transition-all placeholder:text-slate-500 hover:bg-[#101d39] focus:bg-[#101d39] border border-white/5 focus:border-blue-500/30 resize-none"
          />
        </label>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => onDecompose(layerCount)}
          disabled={!canDecompose || isProcessing}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#89a2ff,#4de4ff)] px-4 py-3 text-sm font-black text-[#071123] shadow-[0_18px_36px_rgba(77,228,255,0.22)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
        >
          <Icons.Magic />
          {isProcessing ? copy.buttons.processing : `Create ${layerCount} editable layers`}
        </button>

        <button
          onClick={onExport}
          disabled={!canExport || isProcessing}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/8 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icons.Download />
          {copy.buttons.exportProject}
        </button>
      </div>
    </div>
  );
};

export default CollapsibleLeftSidebar;
