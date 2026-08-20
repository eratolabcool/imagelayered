'use client';

import { useState } from 'react';
import {
  Copy,
  Download,
  Eye,
  EyeOff,
  History,
  Lock,
  Palette,
  Sparkles,
  Trash2,
  Unlock,
  Wand2,
  Layers3,
} from 'lucide-react';

import { Layer, LayerBlendMode, ToolType } from '../types';

interface HistoryEntry {
  id: string;
  time: number;
  action: string;
  layer: string;
}

interface LayerInspectorProps {
  layer: Layer;
  isZh: boolean;
  activeTool: ToolType;
  editInstruction: string;
  editPlaceholder: string;
  isProcessing: boolean;
  history: HistoryEntry[];
  selectedCount?: number;
  onSetTool: (tool: ToolType) => void;
  onInstructionChange: (value: string) => void;
  onGenerate: () => void;
  onUpdate: (changes: Partial<Layer>) => void;
  onDuplicate: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

type InspectorTab = 'properties' | 'ai' | 'history';

const LayerInspector = ({
  layer,
  isZh,
  activeTool,
  editInstruction,
  editPlaceholder,
  isProcessing,
  history,
  selectedCount = 1,
  onSetTool,
  onInstructionChange,
  onGenerate,
  onUpdate,
  onDuplicate,
  onDownload,
  onDelete,
}: LayerInspectorProps) => {
  const [tab, setTab] = useState<InspectorTab>('properties');
  const tabs: Array<{ id: InspectorTab; label: string }> = [
    { id: 'properties', label: isZh ? '属性' : 'Properties' },
    { id: 'ai', label: 'AI' },
    { id: 'history', label: isZh ? '历史' : 'History' },
  ];

  const updateNumber = (key: 'x' | 'y' | 'width' | 'height', value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    onUpdate({
      [key]: Math.max(
        key === 'width' || key === 'height' ? 1 : -100000,
        parsed
      ),
    });
  };

  return (
    <aside className="flex h-full min-h-[760px] flex-col rounded-2xl border border-white/[0.06] bg-[#17141c] p-3 shadow-[0_22px_68px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5 pr-9">
        <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-[#0b090d]">
          <img src={layer.url} alt="" className="size-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <input
            value={layer.name}
            onChange={(event) => onUpdate({ name: event.target.value })}
            aria-label={isZh ? '图层名称' : 'Layer name'}
            className="w-full truncate rounded-md bg-transparent px-1 py-0.5 text-sm font-extrabold text-white outline-none hover:bg-white/[0.05] focus:bg-[#0f0d13] focus:ring-2 focus:ring-[#ff6b96]"
          />
          <p className="mt-1 truncate text-[11px] text-[#77717f]">
            {layer.maskUrl
              ? isZh
                ? '可编辑蒙版已就绪'
                : 'Editable mask ready'
              : isZh
                ? '图像图层'
                : 'Image layer'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onUpdate({ visible: !layer.visible })}
          className="flex size-9 items-center justify-center rounded-xl bg-white/[0.055] text-[#aaa4b1] transition-colors outline-none hover:bg-white/[0.09] hover:text-white focus-visible:ring-2 focus-visible:ring-[#ff6b96]"
          aria-label={
            layer.visible
              ? isZh
                ? '隐藏图层'
                : 'Hide layer'
              : isZh
                ? '显示图层'
                : 'Show layer'
          }
        >
          {layer.visible ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </button>
      </div>

      {selectedCount > 1 && (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#f33b72]/10 px-3 py-2 text-[11px] font-bold text-[#ff8aab]">
          <Layers3 className="size-4" />
          {isZh ? `已选择 ${selectedCount} 个图层，属性应用于主选图层` : `${selectedCount} layers selected; properties apply to the primary layer`}
        </div>
      )}

      <div
        className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-[#0f0d13] p-1"
        role="tablist"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-2 py-2 text-[11px] font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b96] ${
              tab === item.id
                ? 'bg-[#2a2330] text-white'
                : 'text-[#77717f] hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        {tab === 'properties' && (
          <div className="space-y-5">
            <section>
              <h3 className="text-xs font-extrabold text-[#dee5ff]">
                {isZh ? '变换' : 'Transform'}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(
                  [
                    ['x', 'X'],
                    ['y', 'Y'],
                    ['width', 'W'],
                    ['height', 'H'],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 rounded-xl bg-white/[0.055] px-3 py-2.5"
                  >
                    <span className="w-3 text-[10px] font-bold text-cyan-100/48">
                      {label}
                    </span>
                    <input
                      type="number"
                      value={Math.round(layer[key])}
                      onChange={(event) =>
                        updateNumber(key, event.target.value)
                      }
                      className="min-w-0 flex-1 bg-transparent text-right text-xs font-bold text-white outline-none"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[#dee5ff]">
                  {isZh ? '外观' : 'Appearance'}
                </h3>
                <span className="text-[11px] font-bold text-cyan-100/58">
                  {Math.round(layer.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(layer.opacity * 100)}
                onChange={(event) =>
                  onUpdate({ opacity: Number(event.target.value) / 100 })
                }
                className="mt-3 w-full accent-[#f33b72]"
                aria-label={isZh ? '图层透明度' : 'Layer opacity'}
              />
              <label className="mt-3 block">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100/48">
                  {isZh ? '混合模式' : 'Blend mode'}
                </span>
                <select
                  value={layer.blendMode ?? 'normal'}
                  onChange={(event) => onUpdate({ blendMode: event.target.value as LayerBlendMode })}
                  className="mt-2 w-full rounded-xl bg-white/[0.045] px-3 py-2.5 text-xs font-bold text-slate-100 outline-none focus:ring-2 focus:ring-[#ff6b96]"
                >
                  {(['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'color', 'luminosity'] as LayerBlendMode[]).map((mode) => (
                    <option key={mode} value={mode} className="bg-[#17141c]">
                      {mode.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => onUpdate({ locked: !layer.locked })}
                className="mt-3 flex w-full items-center gap-2 rounded-xl bg-white/[0.045] px-3 py-2.5 text-xs font-bold text-slate-200 transition-colors outline-none hover:bg-white/[0.075] focus-visible:ring-2 focus-visible:ring-[#ff6b96]"
              >
                {layer.locked ? (
                  <Lock className="size-4" />
                ) : (
                  <Unlock className="size-4" />
                )}
                {layer.locked
                  ? isZh
                    ? '解除图层锁定'
                    : 'Unlock layer'
                  : isZh
                    ? '锁定图层'
                    : 'Lock layer'}
              </button>
            </section>

            {(layer.maskUrl || layer.editMetadata || layer.groupName) && (
              <section>
                <h3 className="text-xs font-extrabold text-[#dee5ff]">
                  {isZh ? '图层关系' : 'Layer context'}
                </h3>
                {layer.maskUrl && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.045] p-2.5">
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-black/30">
                      <img src={layer.maskUrl} alt={isZh ? '蒙版预览' : 'Mask preview'} className="size-full object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">{isZh ? '蒙版预览' : 'Mask preview'}</p>
                      <p className="mt-1 text-[10px] leading-4 text-slate-400">{isZh ? '白色区域可被 AI 修改' : 'White areas are editable by AI'}</p>
                    </div>
                  </div>
                )}
                {layer.editMetadata && (
                  <div className="mt-2 rounded-xl bg-violet-300/[0.08] px-3 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-violet-200">AI {isZh ? '非破坏式变体' : 'non-destructive variation'}</p>
                    <p className="mt-1.5 text-xs leading-5 text-slate-300">{layer.editMetadata.prompt}</p>
                  </div>
                )}
                {layer.groupName && (
                  <p className="mt-2 rounded-xl bg-white/[0.045] px-3 py-2.5 text-xs text-slate-300">
                    {isZh ? '所属分组' : 'Group'}: <span className="font-bold text-white">{layer.groupName}</span>
                  </p>
                )}
              </section>
            )}

            <section className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={onDuplicate}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.055] px-2 py-3 text-[10px] font-bold text-slate-200 hover:bg-white/[0.09]"
              >
                <Copy className="size-4" />
                {isZh ? '复制' : 'Duplicate'}
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.055] px-2 py-3 text-[10px] font-bold text-slate-200 hover:bg-white/[0.09]"
              >
                <Download className="size-4" />
                {isZh ? '下载' : 'Download'}
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-rose-400/[0.08] px-2 py-3 text-[10px] font-bold text-rose-100 hover:bg-rose-400/[0.14]"
              >
                <Trash2 className="size-4" />
                {isZh ? '删除' : 'Delete'}
              </button>
            </section>
          </div>
        )}

        {tab === 'ai' && (
          <div>
            <h3 className="text-xs font-extrabold text-[#dee5ff]">
              {isZh ? '局部 AI 编辑' : 'Local AI edit'}
            </h3>
            <p className="mt-2 text-xs leading-5 text-cyan-100/58">
              {isZh
                ? '生成独立变体图层，原图层会保留并隐藏，可随时恢复。'
                : 'Create a separate variation while retaining the hidden original for recovery.'}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                {
                  id: 'replace' as ToolType,
                  label: isZh ? '替换' : 'Replace',
                  icon: Wand2,
                },
                {
                  id: 'recolor' as ToolType,
                  label: isZh ? '调色' : 'Recolor',
                  icon: Palette,
                },
                {
                  id: 'remove' as ToolType,
                  label: isZh ? '移除' : 'Remove',
                  icon: Trash2,
                },
              ].map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => onSetTool(tool.id)}
                    aria-pressed={activeTool === tool.id}
                    className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-[10px] font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b96] ${
                      activeTool === tool.id
                        ? 'bg-[#f33b72] text-white'
                        : 'bg-white/[0.055] text-slate-200 hover:bg-white/[0.09]'
                    }`}
                  >
                    <Icon className="size-4" />
                    {tool.label}
                  </button>
                );
              })}
            </div>
            <textarea
              value={editInstruction}
              onChange={(event) => onInstructionChange(event.target.value)}
              placeholder={editPlaceholder}
              rows={6}
              className="mt-4 w-full resize-none rounded-xl bg-[#0f0d13] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-[#625c68] focus:ring-2 focus:ring-[#ff6b96]"
            />
            <button
              type="button"
              onClick={onGenerate}
              disabled={isProcessing || !editInstruction.trim()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f33b72] px-4 py-3 text-sm font-extrabold text-white outline-none hover:bg-[#ff4f83] focus-visible:ring-2 focus-visible:ring-[#ff9ab7] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="size-4" />
              {isProcessing
                ? isZh
                  ? '正在生成'
                  : 'Generating'
                : isZh
                  ? '生成图层变体'
                  : 'Generate layer variation'}
            </button>
          </div>
        )}

        {tab === 'history' && (
          <div>
            <div className="flex items-center gap-2 text-[#dee5ff]">
              <History className="size-4" />
              <h3 className="text-xs font-extrabold">
                {isZh ? '操作历史' : 'Edit history'}
              </h3>
            </div>
            <div className="mt-3 space-y-2">
              {history.length === 0 ? (
                <p className="rounded-xl bg-white/[0.045] px-3 py-6 text-center text-xs leading-5 text-slate-400">
                  {isZh
                    ? '编辑图层后，操作记录会显示在这里。'
                    : 'Layer edits will appear here as you work.'}
                </p>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl bg-white/[0.045] px-3 py-2.5"
                  >
                    <p className="text-xs font-bold text-slate-100">
                      {entry.action}
                    </p>
                    <div className="mt-1 flex justify-between gap-2 text-[10px] text-slate-500">
                      <span className="truncate">{entry.layer}</span>
                      <time>
                        {new Date(entry.time).toLocaleTimeString(
                          isZh ? 'zh-CN' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' }
                        )}
                      </time>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default LayerInspector;
