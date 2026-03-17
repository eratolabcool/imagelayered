'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { Layer } from '../types';
import { Icons } from './Icon';
import { useCrookedCopy } from '../i18n';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onRecursiveDecompose: (id: string) => void;
  onRemoveLayer: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDuplicateLayer: (id: string) => void;
  collapsedLayerIds: Set<string>;
  onToggleCollapse: (id: string) => void;
  layerCount?: number;
  onLayerCountChange?: (count: number) => void;
  onDecompose?: (count: number) => void;
  isProcessing?: boolean;
}

// Separate memoized component for each layer item to improve performance
const LayerItem = memo(({
  layer,
  depth,
  selectedLayerId,
  collapsedLayerIds,
  hasChildren,
  onSelectLayer,
  onToggleCollapse,
  onRecursiveDecompose,
  onToggleVisibility,
  onRemoveLayer,
  deepLabel
}: {
  layer: Layer;
  depth: number;
  selectedLayerId: string | null;
  collapsedLayerIds: Set<string>;
  hasChildren: boolean;
  onSelectLayer: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onRecursiveDecompose: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onRemoveLayer: (id: string) => void;
  deepLabel: string;
}) => {
  const isCollapsed = collapsedLayerIds.has(layer.id);

  const handleSelect = useCallback(() => {
    onSelectLayer(layer.id);
  }, [layer.id, onSelectLayer]);

  const handleToggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCollapse(layer.id);
  }, [layer.id, onToggleCollapse]);

  const handleRecursiveDecompose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRecursiveDecompose(layer.id);
  }, [layer.id, onRecursiveDecompose]);

  const handleToggleVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisibility(layer.id);
  }, [layer.id, onToggleVisibility]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveLayer(layer.id);
  }, [layer.id, onRemoveLayer]);

  return (
    <div
      onClick={handleSelect}
      className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
        selectedLayerId === layer.id
          ? 'bg-blue-600/20 border-blue-500/40'
          : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
      }`}
      style={{ marginLeft: `${depth * 16}px` }}
    >
      {depth > 0 && <div className="absolute left-[-8px] top-1/2 w-2 h-px bg-white/20" />}

      <div className="flex flex-col items-center">
        {hasChildren && (
            <button
                onClick={handleToggleCollapse}
                className={`p-0.5 text-gray-500 hover:text-white transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
            >
                <Icons.ChevronRight />
            </button>
        )}
        <div className="w-10 h-10 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-white/10 mt-1">
            <img
              src={layer.url}
              alt={layer.name}
              className="w-full h-full object-cover opacity-80"
              loading="lazy"
              decoding="async"
            />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate ${layer.locked ? 'text-gray-500' : ''}`}>
          {layer.name}
        </p>
        <p className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">
          {Math.round(layer.opacity * 100)}% OPAC
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleRecursiveDecompose}
          className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400"
          title={deepLabel}
        >
          <Icons.Plus />
        </button>
        <button
          onClick={handleToggleVisibility}
          className="p-1.5 hover:bg-white/10 rounded"
        >
          {layer.visible ? <Icons.Eye /> : <Icons.EyeOff />}
        </button>
        <button
          onClick={handleRemove}
          className="p-1.5 hover:bg-red-500/20 rounded text-red-400"
        >
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
});

LayerItem.displayName = 'LayerItem';

const CrookedLayerPanel: React.FC<LayerPanelProps> = memo(({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onRecursiveDecompose,
  onRemoveLayer,
  onUpdateLayer,
  onDuplicateLayer,
  collapsedLayerIds,
  onToggleCollapse,
  layerCount = 5,
  onLayerCountChange,
  onDecompose,
  isProcessing = false
}) => {
  const copy = useCrookedCopy();
  const lp = copy.layerPanel;
  const tb = copy.toolbar;
  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  // Memoize layer tree for performance - only recalculate when dependencies change
  const layerTree = useMemo(() => {
    const renderTree = (parentId: string | undefined = undefined, depth: number = 0): React.ReactNode => {
      return layers
        .filter(l => l.parentId === parentId)
        .sort((a, b) => b.zIndex - a.zIndex)
        .map((layer) => {
          const isCollapsed = collapsedLayerIds.has(layer.id);
          const hasChildren = layers.some(l => l.parentId === layer.id);

          return (
            <React.Fragment key={layer.id}>
              <LayerItem
                layer={layer}
                depth={depth}
                selectedLayerId={selectedLayerId}
                collapsedLayerIds={collapsedLayerIds}
                hasChildren={hasChildren}
                onSelectLayer={onSelectLayer}
                onToggleCollapse={onToggleCollapse}
                onRecursiveDecompose={onRecursiveDecompose}
                onToggleVisibility={onToggleVisibility}
                onRemoveLayer={onRemoveLayer}
                deepLabel={lp.deep}
              />
              {!isCollapsed && renderTree(layer.id, depth + 1)}
            </React.Fragment>
          );
        });
    };
    return renderTree();
  }, [layers, selectedLayerId, collapsedLayerIds, onSelectLayer, onToggleCollapse, onRecursiveDecompose, onToggleVisibility, onRemoveLayer]);

  const handleLayerCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
    onLayerCountChange?.(newCount);
  }, [onLayerCountChange]);

  const handleDecompose = useCallback(() => {
    if (onDecompose && !isProcessing) {
      onDecompose(layerCount);
    }
  }, [onDecompose, layerCount, isProcessing]);

  const handleLock = useCallback(() => {
    if (selectedLayer) {
      onUpdateLayer(selectedLayer.id, { locked: !selectedLayer.locked });
    }
  }, [selectedLayer, onUpdateLayer]);

  const handleDuplicate = useCallback(() => {
    if (selectedLayer) {
      onDuplicateLayer(selectedLayer.id);
    }
  }, [selectedLayer, onDuplicateLayer]);

  const shiftLayer = useCallback((direction: 'up' | 'down') => {
    if (!selectedLayer) return;
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex(l => l.id === selectedLayer.id);
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const current = sorted[idx];
    const target = sorted[targetIdx];
    onUpdateLayer(current.id, { zIndex: target.zIndex });
    onUpdateLayer(target.id, { zIndex: current.zIndex });
  }, [layers, onUpdateLayer, selectedLayer]);

  return (
    <div className="absolute right-6 top-6 bottom-6 w-80 glass-panel rounded-3xl flex flex-col p-5 z-20 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tighter">
          <Icons.Layer />
          {lp.title}
        </h2>
        <span className="bg-white/5 px-2 py-1 rounded text-[10px] text-gray-400 font-mono">
          {lp.nodeCount.replace('{count}', String(layers.length))}
        </span>
      </div>

      {/* Layer Count Control - New Feature */}
      {(onDecompose || onLayerCountChange) && (
        <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{lp.layersLabel}</label>
            <input
              type="number"
              min="1"
              max="20"
              value={layerCount}
              onChange={handleLayerCountChange}
              disabled={isProcessing}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg py-1 px-2 text-center text-xs text-blue-400 font-mono focus:border-blue-500/50 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50"
            />
            <button
              onClick={handleDecompose}
              disabled={isProcessing}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                isProcessing
                  ? 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
              }`}
            >
              {isProcessing ? copy.buttons.processing : tb.autoDecompose}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {layers.length > 0 ? layerTree : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center space-y-4 px-4 opacity-50">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <Icons.Layer />
             </div>
             <p className="text-xs font-medium italic">{copy.empty.subtitle}</p>
          </div>
        )}
      </div>

      {selectedLayer && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
            {lp.title}: {selectedLayer.name}
          </p>

          <div className="space-y-4">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{lp.opacity}</label>
                <span className="text-[10px] font-mono text-blue-400">{Math.round(selectedLayer.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedLayer.opacity}
                className="w-full accent-blue-600 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                onInput={(e) => onUpdateLayer(selectedLayer.id, { opacity: parseFloat((e.target as HTMLInputElement).value) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleLock}
                className={`py-2 px-3 flex items-center justify-center gap-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  selectedLayer.locked
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {selectedLayer.locked ? <Icons.Lock /> : <Icons.Unlock />}
                {selectedLayer.locked ? lp.unlock : lp.lock}
              </button>
              <button
                onClick={handleDuplicate}
                className="py-2 px-3 flex items-center justify-center gap-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-400 transition-all"
              >
                <Icons.Copy />
                {lp.duplicate}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => shiftLayer('up')}
                className="py-2 px-3 flex items-center justify-center gap-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                {lp.moveUp}
              </button>
              <button
                onClick={() => shiftLayer('down')}
                className="py-2 px-3 flex items-center justify-center gap-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-300 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                {lp.moveDown}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CrookedLayerPanel.displayName = 'CrookedLayerPanel';

export default CrookedLayerPanel;
