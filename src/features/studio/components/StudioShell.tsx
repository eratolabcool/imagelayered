'use client';

import { useMemo, useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  MousePointer2,
  Move,
  RotateCw,
} from 'lucide-react';

import type { StudioLayer } from '../types';

const demoLayers: StudioLayer[] = [
  {
    id: 'layer-background',
    projectId: 'demo',
    name: 'Background',
    type: 'raster',
    semanticType: 'background',
    assetId: 'demo-background',
    x: 0,
    y: 0,
    width: 1200,
    height: 800,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: true,
    zIndex: 0,
    source: 'decomposition',
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'layer-product',
    projectId: 'demo',
    name: 'Product',
    type: 'raster',
    semanticType: 'product',
    assetId: 'demo-product',
    x: 430,
    y: 210,
    width: 340,
    height: 430,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 1,
    source: 'decomposition',
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'layer-text',
    projectId: 'demo',
    name: 'Headline',
    type: 'raster',
    semanticType: 'text',
    assetId: 'demo-text',
    x: 120,
    y: 90,
    width: 380,
    height: 100,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 2,
    source: 'decomposition',
    createdAt: new Date(0).toISOString(),
  },
];

export function StudioShell() {
  const [layers, setLayers] = useState(demoLayers);
  const [selectedLayerId, setSelectedLayerId] = useState('layer-product');
  const [prompt, setPrompt] = useState('');

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.id === selectedLayerId) ?? null,
    [layers, selectedLayerId]
  );

  function patchSelectedLayer(patch: Partial<StudioLayer>) {
    if (!selectedLayer) return;
    setLayers((current) =>
      current.map((layer) =>
        layer.id === selectedLayer.id ? { ...layer, ...patch } : layer
      )
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-1px)] flex-col bg-zinc-950 text-zinc-100">
      <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-3">
          <div className="font-semibold">Image Layered Studio</div>
          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
            P0
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <button className="rounded-md px-3 py-2 hover:bg-zinc-900">Undo</button>
          <button className="rounded-md px-3 py-2 hover:bg-zinc-900">Redo</button>
          <button className="rounded-md bg-white px-3 py-2 font-medium text-black">
            Export
          </button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[260px_minmax(0,1fr)_300px] overflow-hidden">
        <aside className="border-r border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium">Layers</h2>
            <span className="text-xs text-zinc-500">{layers.length}</span>
          </div>
          <div className="space-y-1">
            {[...layers]
              .sort((a, b) => b.zIndex - a.zIndex)
              .map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left text-sm ${
                    selectedLayerId === layer.id
                      ? 'border-zinc-600 bg-zinc-800'
                      : 'border-transparent hover:bg-zinc-900'
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-zinc-800 text-[10px] uppercase text-zinc-400">
                    {layer.semanticType.slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{layer.name}</span>
                  {layer.locked ? (
                    <Lock className="h-3.5 w-3.5 text-zinc-500" />
                  ) : null}
                </button>
              ))}
          </div>
        </aside>

        <main className="relative flex min-w-0 items-center justify-center overflow-hidden bg-zinc-900">
          <div className="absolute left-4 top-4 flex gap-1 rounded-lg border border-zinc-700 bg-zinc-950/90 p-1">
            <button className="rounded-md bg-zinc-800 p-2" title="Select">
              <MousePointer2 className="h-4 w-4" />
            </button>
            <button className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800" title="Pan">
              <Move className="h-4 w-4" />
            </button>
          </div>

          <div className="relative aspect-[3/2] w-[min(78%,920px)] overflow-hidden rounded-xl border border-zinc-700 bg-[linear-gradient(45deg,#18181b_25%,transparent_25%),linear-gradient(-45deg,#18181b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#18181b_75%),linear-gradient(-45deg,transparent_75%,#18181b_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px] shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/80 via-zinc-800 to-zinc-950" />
            <button
              onClick={() => setSelectedLayerId('layer-text')}
              className={`absolute left-[10%] top-[10%] z-20 rounded px-3 py-1 text-3xl font-bold tracking-tight ${
                selectedLayerId === 'layer-text' ? 'ring-2 ring-white' : ''
              }`}
            >
              LAYER STUDIO
            </button>
            <button
              onClick={() => setSelectedLayerId('layer-product')}
              className={`absolute left-[36%] top-[27%] z-10 h-[54%] w-[28%] rounded-[30%_30%_18%_18%] border border-white/20 bg-gradient-to-b from-zinc-200 via-zinc-400 to-zinc-700 shadow-2xl ${
                selectedLayerId === 'layer-product'
                  ? 'outline outline-2 outline-offset-4 outline-white'
                  : ''
              }`}
              aria-label="Select product layer"
            />
          </div>
        </main>

        <aside className="border-l border-zinc-800 bg-zinc-950 p-4">
          <h2 className="mb-4 text-sm font-medium">Inspector</h2>
          {selectedLayer ? (
            <div className="space-y-5">
              <div>
                <div className="text-sm font-medium">{selectedLayer.name}</div>
                <div className="text-xs text-zinc-500">{selectedLayer.semanticType}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => patchSelectedLayer({ visible: !selectedLayer.visible })}
                  className="flex items-center justify-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs hover:bg-zinc-900"
                >
                  {selectedLayer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {selectedLayer.visible ? 'Visible' : 'Hidden'}
                </button>
                <button
                  onClick={() => patchSelectedLayer({ locked: !selectedLayer.locked })}
                  className="flex items-center justify-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs hover:bg-zinc-900"
                >
                  {selectedLayer.locked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
                  {selectedLayer.locked ? 'Locked' : 'Unlocked'}
                </button>
              </div>

              <label className="block text-xs text-zinc-400">
                Opacity
                <input
                  className="mt-2 w-full"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectedLayer.opacity}
                  onChange={(event) =>
                    patchSelectedLayer({ opacity: Number(event.target.value) })
                  }
                />
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-md border border-zinc-800 p-2">
                  X<div className="mt-1 text-zinc-100">{Math.round(selectedLayer.x)}</div>
                </div>
                <div className="rounded-md border border-zinc-800 p-2">
                  Y<div className="mt-1 text-zinc-100">{Math.round(selectedLayer.y)}</div>
                </div>
                <div className="rounded-md border border-zinc-800 p-2">
                  <RotateCw className="mb-1 h-3.5 w-3.5" />
                  {selectedLayer.rotation}°
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  AI Action
                </div>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Describe how to edit this selected layer..."
                  className="min-h-28 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                />
                <button
                  disabled={!prompt.trim()}
                  className="mt-2 w-full rounded-md bg-white px-3 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Edit selected layer
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Select a layer to inspect it.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
