'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  type: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  parentId?: string;
}

interface ProjectData {
  id: string;
  name: string;
  layers: Layer[];
  previewUrl: string | null;
  createdAt: string;
}

export default function PublicSharePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const locale = (params?.locale as string) || 'en';
  const isZh = locale === 'zh';

  const [project, setProject] = useState<ProjectData | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Translations
  const t = {
    loading: isZh ? '正在加载分享画布...' : 'Loading shared poster workspace...',
    notFound: isZh ? '未找到该项目或分享已被关闭' : 'Project not found or sharing has been disabled',
    remixTitle: isZh ? '⚡️ AI 智能分层海报' : '⚡️ AI Layered Poster',
    remixDesc: isZh
      ? '这张海报已由 Image Layered AI 自动分离出图层。您可以任意克隆它并开启自由的 AI 编辑！'
      : 'This flat poster was automatically split into editable AI layers. You can clone it to start AI editing!',
    btnRemix: isZh ? '克隆并编辑此海报 (Remix)' : 'Remix & Edit Poster',
    btnHome: isZh ? '回到首页' : 'Go to Homepage',
    layersHeader: isZh ? '图层结构' : 'Layers',
    layerTip: isZh ? '点击眼睛图标控制图层可见性' : 'Click the eye icon to toggle visibility',
    canvasPreview: isZh ? '画布预览' : 'Poster Preview',
    toastRemix: isZh ? '正在克隆项目，即将进入编辑器...' : 'Cloning project, redirecting to editor...',
  };

  useEffect(() => {
    if (!projectId) return;

    const fetchSharedProject = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/share?id=${projectId}`);
        if (!res.ok) {
          throw new Error('Project not found');
        }
        const data = await res.json();
        if (data.code === 0 && data.data) {
          setProject(data.data);
          const loadedLayers = data.data.layers || [];
          setLayers(loadedLayers.map((l: any) => ({ ...l, visible: l.visible !== false })));
        } else {
          throw new Error(data.message || 'Failed to load project');
        }
      } catch (err) {
        console.error('[PublicSharePage] fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedProject();
  }, [projectId]);

  // Adjust zoom automatically to fit the screen
  useEffect(() => {
    if (layers.length === 0) return;
    const baseLayer = layers[0];
    const handleResize = () => {
      const containerWidth = window.innerWidth > 1024 ? window.innerWidth - 480 : window.innerWidth - 40;
      const containerHeight = window.innerHeight - 180;
      
      const widthScale = containerWidth / baseLayer.width;
      const heightScale = containerHeight / baseLayer.height;
      const optimalScale = Math.min(widthScale, heightScale, 1) * 0.9;
      setZoom(optimalScale);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, [layers]);

  const toggleLayerVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleRemix = () => {
    if (!project) return;
    toast.success(t.toastRemix);

    // Create a new guest project draft and save to sessionStorage
    const remixedDraft = {
      id: crypto.randomUUID(),
      name: `${project.name} (Remix)`,
      layers: layers,
    };

    sessionStorage.setItem('guest_project_draft', JSON.stringify(remixedDraft));

    // Redirect to editor
    router.push(`/${locale}/qwenimagelayered`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-[#060e20] text-white">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
        <p className="text-sm font-mono text-gray-400">{t.loading}</p>
      </div>
    );
  }

  if (!project || layers.length === 0) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-[#060e20] px-4 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-400">
          <EyeOff className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">{t.notFound}</h2>
          <p className="text-sm text-gray-500">Please verify the link address or ask the owner to reshare.</p>
        </div>
        <button
          onClick={() => router.push(`/${locale}`)}
          className="rounded-xl bg-white/5 px-6 py-3 text-sm font-semibold hover:bg-white/10"
        >
          {t.btnHome}
        </button>
      </div>
    );
  }

  const baseLayer = layers[0];
  const displayedLayers = layers
    .filter((l) => l.visible)
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#060e20] text-white">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(89,120,255,0.2),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,92,138,0.12),transparent_25%),linear-gradient(180deg,#081121_0%,#060e20_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#091225]/40 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/${locale}`)}
              className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white md:text-base">{project.name}</h1>
              <p className="text-[10px] font-mono text-gray-500">Shared via Image Layered</p>
            </div>
          </div>

          <button
            onClick={handleRemix}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/15 transition-all hover:scale-[1.02] active:scale-98"
          >
            <Sparkles className="size-4" />
            <span>{t.btnRemix}</span>
          </button>
        </header>

        {/* Content area split */}
        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Main Interactive Canvas Area */}
          <div className="relative flex flex-1 items-center justify-center p-6 min-h-[500px]">
            <div className="pointer-events-none absolute left-6 top-6 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500/40">
              {t.canvasPreview}
            </div>

            {/* Scale Wrapper */}
            <div
              className="relative overflow-hidden rounded-[26px] bg-[#09101f] shadow-[0_36px_120px_rgba(0,0,0,0.55)] border border-white/5 transition-transform duration-300"
              style={{
                width: baseLayer.width,
                height: baseLayer.height,
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              {displayedLayers.map((layer) => {
                const isRootLayer = !layer.parentId;
                return (
                  <div
                    key={layer.id}
                    className={`absolute select-none transition-all duration-200 ${
                      selectedLayerId === layer.id ? 'z-20 ring-2 ring-cyan-400/80 outline-none' : ''
                    }`}
                    style={{
                      left: isRootLayer ? layer.x : 0,
                      top: isRootLayer ? layer.y : 0,
                      width: isRootLayer ? layer.width : baseLayer.width,
                      height: isRootLayer ? layer.height : baseLayer.height,
                      opacity: layer.opacity,
                      zIndex: layer.zIndex,
                      backgroundImage: `url(${layer.url})`,
                      backgroundPosition: isRootLayer ? `-${layer.x}px -${layer.y}px` : '0 0',
                      backgroundSize: isRootLayer ? `${baseLayer.width}px ${baseLayer.height}px` : 'cover',
                      backgroundRepeat: 'no-repeat',
                    }}
                    onClick={() => setSelectedLayerId(layer.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Remix Call to Action & Layer Toggles */}
          <div className="w-full shrink-0 border-t border-white/5 bg-[#081020]/60 p-6 backdrop-blur-lg lg:w-96 lg:border-l lg:border-t-0 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Floating Remix Card */}
              <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/10 to-transparent p-6 shadow-lg">
                <div className="absolute -right-10 -top-10 size-24 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="size-5 text-cyan-400" />
                  {t.remixTitle}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  {t.remixDesc}
                </p>
                <button
                  onClick={handleRemix}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 py-3.5 text-sm font-bold text-[#071123] shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-98"
                >
                  <Sparkles className="size-4" />
                  <span>{t.btnRemix}</span>
                </button>
              </div>

              {/* Layer list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/50 mb-3">
                  {t.layersHeader}
                </h4>
                <p className="text-[10px] text-gray-500 mb-4">{t.layerTip}</p>
                
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-colors cursor-pointer ${
                        selectedLayerId === layer.id
                          ? 'bg-blue-600/10 border-blue-500/30'
                          : 'bg-white/5 border-transparent hover:bg-white/8'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-400">
                          <Layers className="size-3.5" />
                        </div>
                        <span className="truncate text-xs font-medium text-slate-200">
                          {layer.name}
                        </span>
                      </div>

                      <button
                        onClick={(e) => toggleLayerVisibility(layer.id, e)}
                        className={`flex size-8 items-center justify-center rounded-lg hover:bg-white/5 transition-colors ${
                          layer.visible ? 'text-cyan-400' : 'text-gray-600'
                        }`}
                      >
                        {layer.visible ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a
                href={`/${locale}`}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                image-layered.app
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
