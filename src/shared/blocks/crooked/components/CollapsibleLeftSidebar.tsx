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

  if (isCollapsed) {
    return (
      <div className="w-16 flex flex-col items-center gap-4 py-4 rounded-[34px] bg-[rgba(20,31,56,0.78)] shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[22px]">
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
          title="Expand sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 15 12"></polyline>
            <polyline points="9 12 15 12 15 12"></polyline>
            <polyline points="9 6 15 12 15 12"></polyline>
          </svg>
        </button>

        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          className="p-3 rounded-xl bg-[linear-gradient(135deg,rgba(93,106,255,0.3),rgba(73,223,255,0.18))] text-white shadow-[0_16px_34px_rgba(83,108,255,0.24)] hover:shadow-[0_20px_40px_rgba(83,108,255,0.34)] transition-all"
          title={layers.length > 0 ? copy.buttons.changeImage : empty.title}
        >
          <Icons.Upload />
        </button>

        {/* Layer Count */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">{tb.numberOfLayers}</span>
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#0b152b] text-white font-bold text-sm">
            {layerCount}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 flex flex-col gap-4 py-4 px-4 rounded-[34px] bg-[rgba(20,31,56,0.78)] shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[22px]">
      {/* Header with Toggle Button */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-100/55">Settings</span>
        <button
          onClick={onToggle}
          className="p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
          title="Collapse sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 12"></polyline>
            <polyline points="15 12 9 12 15 12"></polyline>
            <polyline points="15 6 9 12 15 12"></polyline>
          </svg>
        </button>
      </div>

      {/* Upload Button */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(93,106,255,0.3),rgba(73,223,255,0.18))] text-white shadow-[0_16px_34px_rgba(83,108,255,0.24)]">
            <Icons.Upload />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{layers.length > 0 ? copy.buttons.changeImage : empty.title}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">PNG, JPG, WEBP</p>
          </div>
        </div>
      </div>

      {/* Layer Count */}
      <div className="rounded-[26px] bg-[linear-gradient(180deg,rgba(14,24,46,0.96),rgba(9,19,40,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <label className="flex-1 space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">{tb.numberOfLayers}</span>
            <input
              type="number"
              min="1"
              max="20"
              value={layerCount}
              onChange={(e) => setLayerCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="w-full rounded-xl bg-[#0b152b] px-3 py-2 text-center text-base font-bold text-white outline-none transition-all hover:bg-[#101d39] focus:bg-[#101d39]"
            />
          </label>
        </div>
      </div>

      {/* Model Selection */}
      <div className="rounded-[26px] bg-[linear-gradient(180deg,rgba(14,24,46,0.96),rgba(9,19,40,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">{adv.aiModel}</span>
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

      {/* Prompt (Optional) */}
      <div className="rounded-[26px] bg-[linear-gradient(180deg,rgba(14,24,46,0.96),rgba(9,19,40,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <label className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">{adv.prompt}</span>
          <textarea
            value={advancedConfig.prompt}
            onChange={(e) => setAdvancedConfig({ ...advancedConfig, prompt: e.target.value })}
            placeholder={adv.promptPlaceholder}
            rows={3}
            className="w-full rounded-xl bg-[#0b152b] px-3 py-2 text-xs text-white outline-none transition-all placeholder:text-slate-500 hover:bg-[#101d39] focus:bg-[#101d39] border border-white/5 focus:border-blue-500/30 resize-none"
          />
        </label>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Decompose Button */}
        {canDecompose && (
          <button
            onClick={() => onDecompose(layerCount)}
            disabled={isProcessing}
            className="w-full rounded-xl bg-[linear-gradient(135deg,#89a2ff,#4de4ff)] px-4 py-3 text-xs font-semibold text-[#071123] shadow-[0_18px_36px_rgba(77,228,255,0.22)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : `Decompose into ${layerCount} layers`}
          </button>
        )}

        {/* Export Button */}
        <button
          onClick={onExport}
          disabled={!canExport || isProcessing}
          className="w-full rounded-xl bg-white/8 px-4 py-3 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export Project
        </button>
      </div>
    </div>
  );
};

export default CollapsibleLeftSidebar;
