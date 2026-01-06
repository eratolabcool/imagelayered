'use client';

import React from 'react';
import { Layer } from '../types';
import { Icons } from './Icon';

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
}

const CrookedLayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onRecursiveDecompose,
  onRemoveLayer,
  onUpdateLayer,
  onDuplicateLayer,
  collapsedLayerIds,
  onToggleCollapse
}) => {
  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  // Helper to render layers with hierarchical nesting
  const renderLayerTree = (parentId: string | undefined = undefined, depth: number = 0) => {
    return layers
      .filter(l => l.parentId === parentId)
      .sort((a, b) => b.zIndex - a.zIndex)
      .map((layer) => {
        const isCollapsed = collapsedLayerIds.has(layer.id);
        const hasChildren = layers.some(l => l.parentId === layer.id);

        return (
          <React.Fragment key={layer.id}>
            <div
              onClick={() => onSelectLayer(layer.id)}
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
                        onClick={(e) => { e.stopPropagation(); onToggleCollapse(layer.id); }}
                        className={`p-0.5 text-gray-500 hover:text-white transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
                    >
                        <Icons.ChevronRight />
                    </button>
                )}
                <div className="w-10 h-10 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-white/10 mt-1">
                    <img src={layer.url} alt={layer.name} className="w-full h-full object-cover opacity-80" />
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
                  onClick={(e) => { e.stopPropagation(); onRecursiveDecompose(layer.id); }}
                  className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400"
                  title="Deep Decomposition"
                >
                  <Icons.Plus />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                  className="p-1.5 hover:bg-white/10 rounded"
                >
                  {layer.visible ? <Icons.Eye /> : <Icons.EyeOff />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveLayer(layer.id); }}
                  className="p-1.5 hover:bg-red-500/20 rounded text-red-400"
                >
                  <Icons.Trash />
                </button>
              </div>
            </div>
            {/* Recursively render children if not collapsed */}
            {!isCollapsed && renderLayerTree(layer.id, depth + 1)}
          </React.Fragment>
        );
      });
  };

  return (
    <div className="absolute right-6 top-6 bottom-6 w-80 glass-panel rounded-3xl flex flex-col p-5 z-20 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tighter">
          <Icons.Layer />
          Layers
        </h2>
        <span className="bg-white/5 px-2 py-1 rounded text-[10px] text-gray-400 font-mono">
          {layers.length} NODE(S)
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {layers.length > 0 ? renderLayerTree() : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center space-y-4 px-4 opacity-50">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <Icons.Layer />
             </div>
             <p className="text-xs font-medium italic">Empty workspace. Qwen Image Layered awaits input.</p>
          </div>
        )}
      </div>

      {selectedLayer && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
            Properties: {selectedLayer.name}
          </p>

          <div className="space-y-4">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Opacity</label>
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
                onClick={() => onUpdateLayer(selectedLayer.id, { locked: !selectedLayer.locked })}
                className={`py-2 px-3 flex items-center justify-center gap-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  selectedLayer.locked
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {selectedLayer.locked ? <Icons.Lock /> : <Icons.Unlock />}
                {selectedLayer.locked ? 'Locked' : 'Lock'}
              </button>
              <button
                onClick={() => onDuplicateLayer(selectedLayer.id)}
                className="py-2 px-3 flex items-center justify-center gap-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-400 transition-all"
              >
                <Icons.Copy />
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrookedLayerPanel;
