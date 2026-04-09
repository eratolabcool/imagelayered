'use client';

import React from 'react';
import { Layer, ToolType } from '../types';
import { Icons } from './Icon';
import { useCrookedCopy } from '../i18n';

interface CollapsibleRightSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  layers: Layer[];
  selectedLayerId: string | null;
  onToggleLayerVisibility: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onSelectLayer: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  editInstruction: string;
  setEditInstruction: (instruction: string) => void;
  onGenerateEdit: () => void;
  isProcessing: boolean;
}

const CollapsibleRightSidebar: React.FC<CollapsibleRightSidebarProps> = ({
  isCollapsed,
  onToggle,
  layers,
  selectedLayerId,
  onToggleLayerVisibility,
  onDeleteLayer,
  onSelectLayer,
  onUpdateLayer,
  activeTool,
  setActiveTool,
  editInstruction,
  setEditInstruction,
  onGenerateEdit,
  isProcessing,
}) => {
  const copy = useCrookedCopy();
  const layerPanel = copy.layerPanel;
  const tb = copy.toolbar;
  const editBar = copy.editBar;

  const editPlaceholder =
    activeTool === 'recolor' ? editBar.recolorPlaceholder :
    activeTool === 'replace' ? editBar.replacePlaceholder :
    activeTool === 'remove' ? editBar.removePlaceholder :
    editBar.defaultPlaceholder;

  if (isCollapsed) {
    return (
      <div className="w-16 flex flex-col items-center gap-3 py-4 rounded-[34px] bg-[rgba(20,31,56,0.78)] shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[22px]">
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
          title="Expand sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 12"></polyline>
            <polyline points="15 12 9 12 15 12"></polyline>
            <polyline points="15 6 9 12 15 12"></polyline>
          </svg>
        </button>

        {/* Layer Count */}
        <div className="text-[10px] font-semibold text-slate-400">
          {layers.length}
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 flex flex-col gap-4 py-4 px-4 rounded-[34px] bg-[rgba(20,31,56,0.78)] shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[22px]">
      {/* Header with Toggle Button */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-100/55">{layerPanel.title}</span>
        <button
          onClick={onToggle}
          className="p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
          title="Collapse sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 15 12"></polyline>
            <polyline points="9 12 15 12 15 12"></polyline>
            <polyline points="9 6 15 12 15 12"></polyline>
          </svg>
        </button>
      </div>

      {/* Layers - Photoshop Style */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[40vh] custom-scrollbar">
        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => onSelectLayer(layer.id)}
            className={`relative rounded-xl p-3 transition-all cursor-pointer border ${
              selectedLayerId === layer.id
                ? 'bg-blue-600/20 border-blue-500/50'
                : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
            }`}
          >
            {/* Layer Row - Photoshop Style */}
            <div className="flex items-center gap-2">
              {/* Visibility Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLayerVisibility(layer.id);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  layer.visible
                    ? 'text-white hover:bg-white/10'
                    : 'text-slate-500 hover:bg-white/10'
                }`}
                title={layer.visible ? 'Hide' : 'Show'}
              >
                {layer.visible ? <Icons.Eye /> : <Icons.EyeOff />}
              </button>

              {/* Layer Thumbnail */}
              <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-black/20 flex-shrink-0 border border-white/10">
                <img
                  src={layer.url}
                  alt={layer.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Layer Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{layer.name}</p>
                <p className="text-[10px] text-slate-400">
                  {Math.round(layer.width)}×{Math.round(layer.height)}
                </p>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLayer(layer.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title={layerPanel.remove}
              >
                <Icons.Trash />
              </button>
            </div>

            {/* Opacity Slider - Only show for selected layer */}
            {selectedLayerId === layer.id && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">{layerPanel.opacity}</span>
                  <span className="text-[10px] font-mono text-slate-400">{Math.round(layer.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={layer.opacity * 100}
                  onChange={(e) => onUpdateLayer(layer.id, { opacity: e.target.value / 100 })}
                  className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400"
                />
              </div>
            )}
          </div>
        ))}

        {layers.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Icons.Layer className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-xs">No layers yet</p>
          </div>
        )}
      </div>

      {/* Edit Tools */}
      {layers.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-white/10">
          {/* Tool Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">Edit Tools</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'recolor' as ToolType, label: tb.recolor, icon: <Icons.Colors /> },
                { id: 'replace' as ToolType, label: tb.aiReplace, icon: <Icons.Magic /> },
                { id: 'remove' as ToolType, label: tb.removeObject, icon: <Icons.Trash /> },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 text-xs transition-all ${
                    activeTool === tool.id
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-transparent'
                  }`}
                  title={tool.label}
                >
                  <span className="text-sm">{tool.icon}</span>
                  <span className="text-[9px] font-medium">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input - Only show when edit tool is selected */}
          {activeTool !== 'select' && activeTool !== 'move' && (
            <label className="block space-y-2 rounded-xl bg-[linear-gradient(180deg,rgba(17,26,49,0.96),rgba(9,19,40,0.92))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">Prompt</span>
              <div className="relative">
                <textarea
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  placeholder={editPlaceholder}
                  rows={3}
                  className="w-full rounded-lg bg-[#0b152b] px-3 py-2 text-xs text-white outline-none transition-all placeholder:text-slate-500 hover:bg-[#101d39] focus:bg-[#101d39] shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)] border border-white/5 focus:border-purple-500/30 resize-none pr-20"
                />
                {/* Generate Button */}
                <button
                  onClick={onGenerateEdit}
                  disabled={isProcessing || !editInstruction.trim()}
                  className={`absolute bottom-2 right-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                    isProcessing || !editInstruction.trim()
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-[linear-gradient(135deg,#ff86b2,#b48dff)] text-white shadow-[0_14px_24px_rgba(180,141,255,0.18)] hover:shadow-[0_18px_36px_rgba(180,141,255,0.28)]'
                  }`}
                >
                  {isProcessing ? '...' : 'Go'}
                </button>
              </div>
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsibleRightSidebar;
