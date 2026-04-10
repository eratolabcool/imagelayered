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
  const sidebar = copy.sidebar;

  const editPlaceholder =
    activeTool === 'recolor' ? editBar.recolorPlaceholder :
    activeTool === 'replace' ? editBar.replacePlaceholder :
    activeTool === 'remove' ? editBar.removePlaceholder :
    editBar.defaultPlaceholder;

  return (
    <>
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-2 py-3 rounded-[34px] bg-[rgba(20,31,56,0.78)] shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[22px] overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar">
          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
            title={sidebar.expand}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 12"></polyline>
              <polyline points="15 12 9 12 15 12"></polyline>
              <polyline points="15 6 9 12 15 12"></polyline>
            </svg>
          </button>

          {/* Layer Count */}
          <div className="text-[9px] font-semibold text-slate-400 px-1">
            {layers.length}
          </div>

          {/* Divider */}
          <div className="w-8 h-px bg-white/10" />

          {/* Compact Tool Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTool('select')}
              className={`p-2.5 rounded-lg transition-all w-12 h-12 flex items-center justify-center ${
                activeTool === 'select'
                  ? 'bg-blue-600/20 text-blue-400 border-2 border-blue-500/50'
                  : 'bg-white/5 text-white hover:bg-white/10 border-2 border-transparent'
              }`}
              title={sidebar.selectTool}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
                <path d="M13 13l6 6"/>
              </svg>
            </button>

            <button
              onClick={() => setActiveTool('recolor')}
              className={`p-2.5 rounded-lg transition-all w-12 h-12 flex items-center justify-center ${
                activeTool === 'recolor'
                  ? 'bg-purple-600/20 text-purple-400 border-2 border-purple-500/50'
                  : 'bg-white/5 text-white hover:bg-white/10 border-2 border-transparent'
              }`}
              title={sidebar.recolorTool}
            >
              <Icons.Colors />
            </button>

            <button
              onClick={() => setActiveTool('replace')}
              className={`p-2.5 rounded-lg transition-all w-12 h-12 flex items-center justify-center ${
                activeTool === 'replace'
                  ? 'bg-purple-600/20 text-purple-400 border-2 border-purple-500/50'
                  : 'bg-white/5 text-white hover:bg-white/10 border-2 border-transparent'
              }`}
              title={sidebar.replaceTool}
            >
              <Icons.Magic />
            </button>

            <button
              onClick={() => setActiveTool('remove')}
              className={`p-2.5 rounded-lg transition-all w-12 h-12 flex items-center justify-center ${
                activeTool === 'remove'
                  ? 'bg-purple-600/20 text-purple-400 border-2 border-purple-500/50'
                  : 'bg-white/5 text-white hover:bg-white/10 border-2 border-transparent'
              }`}
              title={sidebar.removeTool}
            >
              <Icons.Trash />
            </button>
          </div>

          {/* Compact Prompt Button */}
          {(activeTool === 'recolor' || activeTool === 'replace' || activeTool === 'remove') && layers.length > 0 && (
            <>
              <div className="w-8 h-px bg-white/10" />
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-white text-[9px] font-medium border border-purple-500/30 hover:border-purple-500/50 transition-all"
                title={sidebar.expandPrompt}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 py-4 px-4 rounded-[34px] bg-[rgba(20,31,56,0.78)] shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[22px]">
          {/* Header with Toggle Button */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-100/55">{layerPanel.title}</span>
            <button
              onClick={onToggle}
              className="p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
              title={sidebar.collapse}
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
                    title={layer.visible ? sidebar.hide : sidebar.show}
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
                      onChange={(e) => onUpdateLayer(layer.id, { opacity: Number(e.target.value) / 100 })}
                      className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400"
                    />
                  </div>
                )}
              </div>
            ))}

            {layers.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <div className="mx-auto mb-2 h-8 w-8 opacity-50">
                  <Icons.Layer />
                </div>
                <p className="text-xs">No layers yet</p>
              </div>
            )}
          </div>

          {/* Edit Tools */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            {/* Tool Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">{layerPanel.editTools}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: 'select' as ToolType,
                    label: 'Select',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
                        <path d="M13 13l6 6"/>
                      </svg>
                    )
                  },
                  { id: 'recolor' as ToolType, label: tb.recolor, icon: <Icons.Colors /> },
                  { id: 'replace' as ToolType, label: tb.aiReplace, icon: <Icons.Magic /> },
                  { id: 'remove' as ToolType, label: tb.removeObject, icon: <Icons.Trash /> },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl p-4 text-sm transition-all min-h-[100px] ${
                      activeTool === tool.id
                        ? 'bg-purple-600/20 text-purple-400 border-2 border-purple-500/50'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border-2 border-transparent'
                    }`}
                    title={tool.label}
                  >
                    <span className="text-xl">{tool.icon}</span>
                    <span className="text-xs font-semibold">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input - Only show when edit tool is selected */}
            {activeTool !== 'select' && activeTool !== 'move' && layers.length > 0 && (
              <label className="block space-y-2 rounded-xl bg-[linear-gradient(180deg,rgba(17,26,49,0.96),rgba(9,19,40,0.92))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">{layerPanel.prompt}</span>
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
                    {isProcessing ? '...' : layerPanel.generate}
                  </button>
                </div>
              </label>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CollapsibleRightSidebar;
