'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  Layers3,
  LoaderCircle,
  Lock,
  LockOpen,
  MousePointer2,
  Move,
  RotateCw,
  Sparkles,
} from 'lucide-react';

import {
  createStudioOperation,
  getStudioOperation,
  getStudioProject,
  saveStudioProject,
} from '../services/api';
import type {
  StudioLayer,
  StudioOperation,
  StudioProject,
} from '../types';

type Snapshot = StudioLayer[];

type Props = {
  projectId: string;
};

const GUEST_KEY_PREFIX = 'image-layered:studio-project:';

function cloneLayers(layers: StudioLayer[]): StudioLayer[] {
  return layers.map((layer) => ({ ...layer }));
}

function createLayerFromImage(
  project: StudioProject,
  imageUrl: string,
  index: number
): StudioLayer {
  return {
    id: crypto.randomUUID(),
    projectId: project.id,
    name: `Layer ${index + 1}`,
    type: 'raster',
    semanticType: index === 0 ? 'background' : 'unknown',
    assetId: imageUrl,
    x: 0,
    y: 0,
    width: project.width,
    height: project.height,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: index,
    source: 'decomposition',
    createdAt: new Date().toISOString(),
  };
}

export function StudioShell({ projectId }: Props) {
  const [project, setProject] = useState<StudioProject | null>(null);
  const [layers, setLayers] = useState<StudioLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operation, setOperation] = useState<StudioOperation | null>(null);
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const hydratedRef = useRef(false);
  const draggingRef = useRef<{
    pointerId: number;
    layerId: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    before: Snapshot;
  } | null>(null);

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.id === selectedLayerId) ?? null,
    [layers, selectedLayerId]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const payload = await getStudioProject(projectId);
        if (cancelled) return;
        setProject(payload.project);
        setLayers(payload.layers);
        setSelectedLayerId(payload.layers.at(-1)?.id ?? null);
      } catch {
        const raw = localStorage.getItem(`${GUEST_KEY_PREFIX}${projectId}`);
        if (!raw) {
          if (!cancelled) setError('Project not found. Upload a new image to start again.');
          return;
        }

        try {
          const payload = JSON.parse(raw) as {
            project: StudioProject;
            layers: StudioLayer[];
          };
          if (cancelled) return;
          setProject(payload.project);
          setLayers(payload.layers);
          setSelectedLayerId(payload.layers.at(-1)?.id ?? null);
        } catch {
          if (!cancelled) setError('This local project could not be restored.');
        }
      } finally {
        if (!cancelled) {
          hydratedRef.current = true;
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (!hydratedRef.current || !project || loading) return;

    const timeout = window.setTimeout(() => {
      const payload = { project, layers };
      if (project.userId) {
        void saveStudioProject(project.id, payload).catch((cause) => {
          console.error('[Studio] autosave failed', cause);
        });
      } else {
        localStorage.setItem(
          `${GUEST_KEY_PREFIX}${project.id}`,
          JSON.stringify(payload)
        );
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [layers, loading, project]);

  const commitLayers = useCallback(
    (next: StudioLayer[], before = layers) => {
      setPast((current) => [...current.slice(-49), cloneLayers(before)]);
      setFuture([]);
      setLayers(next);
    },
    [layers]
  );

  function patchLayer(layerId: string, patch: Partial<StudioLayer>) {
    const next = layers.map((layer) =>
      layer.id === layerId ? { ...layer, ...patch } : layer
    );
    commitLayers(next);
  }

  function undo() {
    const previous = past.at(-1);
    if (!previous) return;
    setPast((current) => current.slice(0, -1));
    setFuture((current) => [cloneLayers(layers), ...current].slice(0, 50));
    setLayers(cloneLayers(previous));
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setFuture((current) => current.slice(1));
    setPast((current) => [...current.slice(-49), cloneLayers(layers)]);
    setLayers(cloneLayers(next));
  }

  async function pollOperation(initial: StudioOperation) {
    let current = initial;
    setOperation(current);

    for (let attempt = 0; attempt < 120; attempt += 1) {
      if (current.status === 'succeeded' || current.status === 'failed') break;
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
      current = await getStudioOperation(current);
      setOperation(current);
    }

    if (current.status === 'failed') {
      throw new Error('AI operation failed. Please try again.');
    }
    if (current.status !== 'succeeded') {
      throw new Error('AI operation timed out.');
    }

    return current;
  }

  async function decompose() {
    if (!project || operation?.status === 'running' || operation?.status === 'queued') {
      return;
    }

    const source =
      layers.find((layer) => layer.source === 'original') || layers[0];
    if (!source?.assetId) {
      setError('The source image is missing.');
      return;
    }

    setError(null);
    setProject((current) => (current ? { ...current, status: 'decomposing' } : current));

    try {
      const initial = await createStudioOperation(project.id, {
        type: 'decompose',
        options: {
          image_urls: [source.assetId],
          image_input: [source.assetId],
          image_size: 'auto_2K',
        },
      });
      const completed = await pollOperation(initial);
      const images = completed.result?.images || [];
      if (images.length < 2) {
        throw new Error('Decomposition completed without multiple layer images.');
      }

      const next = images.map((url, index) =>
        createLayerFromImage(project, url, index)
      );
      commitLayers(next);
      setSelectedLayerId(next.at(-1)?.id ?? null);
      setProject((current) => (current ? { ...current, status: 'ready' } : current));
    } catch (cause) {
      setProject((current) => (current ? { ...current, status: 'error' } : current));
      setError(cause instanceof Error ? cause.message : 'Unable to decompose image.');
    }
  }

  async function editSelectedLayer() {
    if (!project || !selectedLayer || !prompt.trim()) return;
    setError(null);
    setProject((current) => (current ? { ...current, status: 'editing' } : current));

    try {
      const initial = await createStudioOperation(project.id, {
        type: 'replace',
        targetLayerIds: [selectedLayer.id],
        prompt: prompt.trim(),
        baseRevisionId: project.activeRevisionId,
        options: {
          image_urls: [selectedLayer.assetId],
          image_input: [selectedLayer.assetId],
          image_size: 'auto_2K',
        },
      });
      const completed = await pollOperation(initial);
      const resultUrl = completed.result?.images?.[0];
      if (!resultUrl) throw new Error('The edit completed without an image result.');

      patchLayer(selectedLayer.id, {
        assetId: resultUrl,
        source: 'ai-edit',
      });
      setPrompt('');
      setProject((current) => (current ? { ...current, status: 'ready' } : current));
    } catch (cause) {
      setProject((current) => (current ? { ...current, status: 'error' } : current));
      setError(cause instanceof Error ? cause.message : 'Unable to edit the layer.');
    }
  }

  function beginDrag(event: React.PointerEvent, layer: StudioLayer) {
    if (layer.locked) return;
    const canvas = event.currentTarget.parentElement;
    if (!canvas || !project) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = {
      pointerId: event.pointerId,
      layerId: layer.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: layer.x,
      startY: layer.y,
      before: cloneLayers(layers),
    };
    setSelectedLayerId(layer.id);
  }

  function moveDrag(event: React.PointerEvent) {
    const drag = draggingRef.current;
    if (!drag || !project) return;
    const canvas = event.currentTarget.parentElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = project.width / rect.width;
    const scaleY = project.height / rect.height;
    const dx = (event.clientX - drag.startClientX) * scaleX;
    const dy = (event.clientY - drag.startClientY) * scaleY;

    setLayers((current) =>
      current.map((layer) =>
        layer.id === drag.layerId
          ? { ...layer, x: drag.startX + dx, y: drag.startY + dy }
          : layer
      )
    );
  }

  function endDrag() {
    const drag = draggingRef.current;
    if (!drag) return;
    setPast((current) => [...current.slice(-49), drag.before]);
    setFuture([]);
    draggingRef.current = null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-300">
        <LoaderCircle className="mr-3 size-5 animate-spin" /> Loading Studio…
      </div>
    );
  }

  if (!project || error && layers.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-300">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-white">Unable to open project</h1>
          <p className="mt-3 text-sm text-zinc-500">{error}</p>
          <a href="/studio" className="mt-6 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
            Start a new project
          </a>
        </div>
      </div>
    );
  }

  const canvasAspect = `${project.width} / ${project.height}`;
  const operationBusy = operation?.status === 'running' || operation?.status === 'queued';

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="font-semibold">Image Layered Studio</div>
          <span className="max-w-60 truncate text-xs text-zinc-500">{project.title}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-zinc-400">
          <button disabled={!past.length} onClick={undo} className="rounded-md px-3 py-2 hover:bg-zinc-900 disabled:opacity-30">Undo</button>
          <button disabled={!future.length} onClick={redo} className="rounded-md px-3 py-2 hover:bg-zinc-900 disabled:opacity-30">Redo</button>
          <button className="ml-2 rounded-md border border-zinc-700 px-3 py-2 text-zinc-300">Export</button>
        </div>
      </header>

      {error ? (
        <div className="border-b border-red-950 bg-red-950/30 px-4 py-2 text-center text-xs text-red-300">{error}</div>
      ) : null}

      <div className="grid flex-1 grid-cols-[250px_minmax(0,1fr)_300px] overflow-hidden">
        <aside className="border-r border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium">Layers</h2>
            <span className="text-xs text-zinc-500">{layers.length}</span>
          </div>
          <button
            type="button"
            disabled={operationBusy}
            onClick={() => void decompose()}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {operationBusy && operation?.type === 'decompose' ? <LoaderCircle className="size-4 animate-spin" /> : <Layers3 className="size-4" />}
            Auto layers
          </button>
          <div className="space-y-1">
            {[...layers].sort((a, b) => b.zIndex - a.zIndex).map((layer) => (
              <button
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left text-sm ${selectedLayerId === layer.id ? 'border-zinc-600 bg-zinc-800' : 'border-transparent hover:bg-zinc-900'}`}
              >
                <span className="size-8 overflow-hidden rounded bg-zinc-800">
                  {layer.assetId.startsWith('http') || layer.assetId.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={layer.assetId} alt="" className="size-full object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 truncate">{layer.name}</span>
                {layer.locked ? <Lock className="size-3.5 text-zinc-500" /> : null}
              </button>
            ))}
          </div>
        </aside>

        <main className="relative flex min-w-0 items-center justify-center overflow-hidden bg-zinc-900 p-8">
          <div className="absolute left-4 top-4 z-50 flex gap-1 rounded-lg border border-zinc-700 bg-zinc-950/90 p-1">
            <button className="rounded-md bg-zinc-800 p-2" title="Select"><MousePointer2 className="size-4" /></button>
            <button className="rounded-md p-2 text-zinc-400" title="Move selected layer"><Move className="size-4" /></button>
          </div>

          <div
            className="relative max-h-[78vh] max-w-full overflow-hidden border border-zinc-700 bg-[linear-gradient(45deg,#18181b_25%,transparent_25%),linear-gradient(-45deg,#18181b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#18181b_75%),linear-gradient(-45deg,transparent_75%,#18181b_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] shadow-2xl"
            style={{ aspectRatio: canvasAspect, width: project.width >= project.height ? 'min(80vw, 960px)' : 'auto', height: project.height > project.width ? 'min(78vh, 900px)' : 'auto' }}
          >
            {[...layers].sort((a, b) => a.zIndex - b.zIndex).map((layer) => {
              if (!layer.visible) return null;
              const selected = layer.id === selectedLayerId;
              return (
                <div
                  key={layer.id}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(event) => beginDrag(event, layer)}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`absolute touch-none ${layer.locked ? 'cursor-not-allowed' : 'cursor-move'} ${selected ? 'outline outline-2 outline-offset-1 outline-white/90' : ''}`}
                  style={{
                    left: `${(layer.x / project.width) * 100}%`,
                    top: `${(layer.y / project.height) * 100}%`,
                    width: `${(layer.width / project.width) * 100}%`,
                    height: `${(layer.height / project.height) * 100}%`,
                    opacity: layer.opacity,
                    zIndex: layer.zIndex,
                    transform: `scale(${layer.scaleX}, ${layer.scaleY}) rotate(${layer.rotation}deg)`,
                    transformOrigin: 'center',
                  }}
                >
                  {layer.assetId.startsWith('http') || layer.assetId.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img draggable={false} src={layer.assetId} alt={layer.name} className="pointer-events-none size-full object-contain" />
                  ) : null}
                </div>
              );
            })}
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
                <button onClick={() => patchLayer(selectedLayer.id, { visible: !selectedLayer.visible })} className="flex items-center justify-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs hover:bg-zinc-900">
                  {selectedLayer.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  {selectedLayer.visible ? 'Visible' : 'Hidden'}
                </button>
                <button onClick={() => patchLayer(selectedLayer.id, { locked: !selectedLayer.locked })} className="flex items-center justify-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs hover:bg-zinc-900">
                  {selectedLayer.locked ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
                  {selectedLayer.locked ? 'Locked' : 'Unlocked'}
                </button>
              </div>

              <label className="block text-xs text-zinc-400">
                Opacity
                <input className="mt-2 w-full" type="range" min="0" max="1" step="0.01" value={selectedLayer.opacity} onChange={(event) => patchLayer(selectedLayer.id, { opacity: Number(event.target.value) })} />
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {([
                  ['X', 'x'],
                  ['Y', 'y'],
                  ['W', 'width'],
                  ['H', 'height'],
                ] as const).map(([label, key]) => (
                  <label key={key} className="rounded-md border border-zinc-800 p-2 text-zinc-500">
                    {label}
                    <input
                      type="number"
                      value={Math.round(selectedLayer[key])}
                      onChange={(event) => patchLayer(selectedLayer.id, { [key]: Number(event.target.value) } as Partial<StudioLayer>)}
                      className="mt-1 w-full bg-transparent text-zinc-100 outline-none"
                    />
                  </label>
                ))}
              </div>

              <label className="block text-xs text-zinc-400">
                <span className="flex items-center gap-2"><RotateCw className="size-3.5" /> Rotation · {Math.round(selectedLayer.rotation)}°</span>
                <input className="mt-2 w-full" type="range" min="-180" max="180" step="1" value={selectedLayer.rotation} onChange={(event) => patchLayer(selectedLayer.id, { rotation: Number(event.target.value) })} />
              </label>

              <div className="border-t border-zinc-800 pt-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500"><Sparkles className="size-3.5" /> AI edit selected layer</div>
                <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="e.g. make this bottle matte black" className="min-h-24 w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-600" />
                <button disabled={!prompt.trim() || operationBusy} onClick={() => void editSelectedLayer()} className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40">
                  {operationBusy && operation?.type !== 'decompose' ? <LoaderCircle className="size-4 animate-spin" /> : null}
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
