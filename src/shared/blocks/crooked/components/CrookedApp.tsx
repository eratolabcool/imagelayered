'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useSession } from '@/core/auth/client';
import { Share2, Sparkles, X, Mail, CheckCircle, Lightbulb, MousePointer, Layers as LayersIcon, Palette, RefreshCw, Eye, EyeOff, Download, Copy, Wand2, SlidersHorizontal, UploadCloud } from 'lucide-react';
import { Layer, ToolType, ExportSettings, AdvancedDecompositionConfig, WorkflowPresetId, DecompositionModel } from '../types';
import CrookedExportModal from './CrookedExportModal';
import CrookedUpgradeModal from './CrookedUpgradeModal';
import { Icons } from './Icon';
import {
  incrementUploadCount,
  isUploadLimitReached,
  getRemainingUploads,
  isUserLoggedIn
} from '@/shared/lib/guest-usage';
import { useCrookedCopy } from '../i18n';
import { toast } from 'sonner';
import { PreparedImagePayload, prepareImageFile } from '../lib/image-upload';
import { getWorkflowPreset, workflowPresets } from '../workflows';

interface CrookedAppProps {
  embedded?: boolean;
  initialImage?: PreparedImagePayload | null;
}

const decompositionModelOptions: Array<{
  model: DecompositionModel;
  provider: 'fal';
  label: string;
  shortLabel: string;
  description: string;
  badge: string;
  mode: 'native' | 'design-layering' | 'semantic-edit';
  idealFor: string;
}> = [
  {
    model: 'fal-ai/qwen-image-layered',
    provider: 'fal',
    label: 'Qwen Image Layered',
    shortLabel: 'Qwen',
    description: 'Native transparent layer separation',
    badge: 'Best layers',
    mode: 'native',
    idealFor: 'General layer extraction',
  },
  {
    model: 'bytedance/seedream/v5/pro/edit',
    provider: 'fal',
    label: 'Seedream Design Layering',
    shortLabel: 'Seedream Design',
    description: 'Design-aware layering for posters, product pages, infographics, and text-heavy visuals',
    badge: 'Design',
    mode: 'design-layering',
    idealFor: 'Posters, e-commerce, infographics',
  },
  {
    model: 'openai/gpt-image-2/edit',
    provider: 'fal',
    label: 'GPT Image 2',
    shortLabel: 'GPT Image 2',
    description: 'Prompt-accurate image understanding',
    badge: 'Precise',
    mode: 'semantic-edit',
    idealFor: 'Semantic local edits',
  },
];

const CrookedApp: React.FC<CrookedAppProps> = ({ embedded = false, initialImage = null }) => {
  const copy = useCrookedCopy();
  const { brand, editBar, workflow } = copy;
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');

  // Growth & Cloud Save States
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('My Poster');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentEmail, setExitIntentEmail] = useState('');
  const [exitIntentSubmitting, setExitIntentSubmitting] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const [layerDragOffset, setLayerDragOffset] = useState({ x: 0, y: 0 });
  const [layerCount, setLayerCount] = useState<number>(workflowPresets[1].layerCount);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<WorkflowPresetId>('poster');
  const [collapsedLayerIds, setCollapsedLayerIds] = useState<Set<string>>(new Set());
  const [editInstruction, setEditInstruction] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const isZh = params?.locale === 'zh';
  const projectIdQuery = searchParams ? searchParams.get('project') : null;
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  // 1. On Mount: Load Project if projectIdQuery is present
  useEffect(() => {
    if (!projectIdQuery) return;

    const loadProject = async () => {
      try {
        setSaveStatus('saving');
        const res = await fetch(`/api/projects/share?id=${projectIdQuery}`);
        if (!res.ok) {
          throw new Error('Failed to load project');
        }
        const data = await res.json();
        if (data && data.code === 0 && data.data) {
          const { id, name, layers: loadedLayers } = data.data;
          setProjectId(id);
          setProjectName(name || 'Untitled Poster');
          if (Array.isArray(loadedLayers)) {
            setLayers(loadedLayers);
            if (loadedLayers.length > 0) {
              setSelectedLayerId(loadedLayers[0].id);
            }
          }
          setSaveStatus('saved');
          toast.success(isZh ? '项目加载成功' : 'Project loaded successfully');
        } else {
          throw new Error(data?.message || 'Failed to parse project');
        }
      } catch (err: any) {
        console.error('[loadProject] Error:', err);
        setSaveStatus('error');
        toast.error(isZh ? '无法加载该项目' : 'Failed to load project: ' + err.message);
      }
    };

    loadProject();
  }, [projectIdQuery, isZh]);

  // 2. Debounced Autosave / Guest Save to sessionStorage
  useEffect(() => {
    if (layers.length === 0) return;

    if (!projectId) {
      setProjectId(crypto.randomUUID());
      return;
    }

    if (!isLoggedIn) {
      const draft = {
        id: projectId,
        name: projectName,
        layers
      };
      sessionStorage.setItem('guest_project_draft', JSON.stringify(draft));
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const bgLayer = layers.find(l => l.zIndex === 0) || layers[0];
        const previewUrl = bgLayer?.url || null;

        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: projectId,
            name: projectName,
            layers,
            previewUrl
          })
        });

        if (!res.ok) throw new Error('Save failed');
        const data = await res.json();
        if (data.code === 0) {
          setSaveStatus('saved');
        } else {
          throw new Error(data.message || 'Unknown save error');
        }
      } catch (err) {
        console.error('[Autosave] Failed:', err);
        setSaveStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [layers, projectName, projectId, isLoggedIn]);

  // 3. Session Restore / Auto-Resume after registration
  useEffect(() => {
    if (isLoggedIn) {
      const guestDraftStr = sessionStorage.getItem('guest_project_draft');
      if (guestDraftStr) {
        try {
          const draft = JSON.parse(guestDraftStr);
          if (draft && draft.layers && draft.layers.length > 0) {
            setProjectId(draft.id);
            setProjectName(draft.name || 'My Poster');
            setLayers(draft.layers);
            if (draft.layers.length > 0) {
              setSelectedLayerId(draft.layers[0].id);
            }

            const bgLayer = draft.layers.find((l: any) => l.zIndex === 0) || draft.layers[0];
            const previewUrl = bgLayer?.url || null;

            fetch('/api/projects', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                id: draft.id,
                name: draft.name || 'My Poster',
                layers: draft.layers,
                previewUrl
              })
            }).then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                if (data.code === 0) {
                  toast.success(isZh 
                    ? '🎉 欢迎回来！我们已自动将您刚才编辑的海报保存到云端项目。' 
                    : '🎉 Welcome back! We have automatically saved your poster draft to your cloud account.'
                  );
                  sessionStorage.removeItem('guest_project_draft');
                  setSaveStatus('saved');
                }
              }
            }).catch(err => {
              console.error('[Auto-resume] Failed to save guest draft to database:', err);
            });
          }
        } catch (e) {
          console.error('[Auto-resume] Error parsing guest draft:', e);
        }
      }
    }
  }, [isLoggedIn, isZh]);

  // 4. Exit Intent Detector
  useEffect(() => {
    const subscribed = localStorage.getItem('layered_newsletter_subscribed') === 'true';
    const dismissed = sessionStorage.getItem('layered_exit_intent_dismissed') === 'true';
    if (subscribed || dismissed || isLoggedIn) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 20) {
        if (layers.length > 0 && !showExitIntent) {
          setShowExitIntent(true);
          sessionStorage.setItem('layered_exit_intent_dismissed', 'true');
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [layers.length, isLoggedIn, showExitIntent]);

  // 5. Onboarding Tour logic
  useEffect(() => {
    if (layers.length > 0) {
      const completed = localStorage.getItem('layered_tour_completed') === 'true';
      if (!completed && onboardingStep === null) {
        setOnboardingStep(0);
      }
    }
  }, [layers.length, onboardingStep]);

  // Guest conversion modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalType, setUpgradeModalType] = useState<'save' | 'export' | 'limit' | 'login'>('login');

  // Advanced Settings State
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedDecompositionConfig>({
    prompt: workflowPresets[1].prompt,
    negativePrompt: '',
    seed: 42,
    randomizeSeed: true,
    enableCfgNormalization: true,
    autoCaptionLanguageEn: true,
    guidanceScale: 7.5,
    inferenceSteps: 30,
    model: 'fal-ai/qwen-image-layered'
  });

  const selectedWorkflow = React.useMemo(
    () => getWorkflowPreset(selectedWorkflowId),
    [selectedWorkflowId]
  );
  const selectedDecompositionModel = React.useMemo(
    () => decompositionModelOptions.find((option) => option.model === advancedConfig.model) ?? decompositionModelOptions[0],
    [advancedConfig.model]
  );

  const mainRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editPlaceholder = React.useMemo(() => {
    if (activeTool === 'recolor') return editBar.recolorPlaceholder;
    if (activeTool === 'replace') return editBar.replacePlaceholder;
    if (activeTool === 'remove') return editBar.removePlaceholder;
    return editBar.defaultPlaceholder;
  }, [activeTool, editBar]);

  const handleSelectWorkflow = useCallback((id: WorkflowPresetId) => {
    const preset = getWorkflowPreset(id);
    setSelectedWorkflowId(id);
    setLayerCount(preset.layerCount);
    setAdvancedConfig((prev) => ({
      ...prev,
      prompt: preset.prompt,
    }));
    setActiveTool('select');
    setEditInstruction('');
  }, []);

  useEffect(() => {
    handleSelectWorkflow(selectedWorkflowId);
    // Initialize the editor with the default workflow preset once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getImageFetchUrl = useCallback((url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `/api/storage/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return url;
  }, []);

  const uploadImageBlob = useCallback(async (blob: Blob, filename: string) => {
    const formData = new FormData();
    formData.append('files', new File([blob], filename, { type: blob.type || 'image/png' }));

    const uploadRes = await fetch('/api/storage/upload-image', {
      method: 'POST',
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (uploadData.code !== 0) {
      throw new Error(uploadData.message || 'Upload failed');
    }

    return uploadData.data.urls[0] as string;
  }, []);

  const loadCanvasImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url.substring(0, 80)}`));
      img.src = getImageFetchUrl(url);
    });
  }, [getImageFetchUrl]);

  const canvasToBlob = useCallback((canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        resolve(blob);
      }, 'image/png');
    });
  }, []);

  const createMaskFromLayer = useCallback(async (imageUrl: string) => {
    const img = await loadCanvasImage(imageUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to create mask canvas');

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let hasVisiblePixels = false;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 8) hasVisiblePixels = true;
      const maskValue = alpha > 8 ? 255 : 0;
      data[i] = maskValue;
      data[i + 1] = maskValue;
      data[i + 2] = maskValue;
      data[i + 3] = 255;
    }

    if (!hasVisiblePixels) {
      return null;
    }

    ctx.putImageData(imageData, 0, 0);
    const blob = await canvasToBlob(canvas);
    return uploadImageBlob(blob, `layer-mask-${Date.now()}.png`);
  }, [canvasToBlob, loadCanvasImage, uploadImageBlob]);

  const applyMaskToEditedLayer = useCallback(async (imageUrl: string, maskUrl: string) => {
    const [image, mask] = await Promise.all([
      loadCanvasImage(imageUrl),
      loadCanvasImage(maskUrl),
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = mask.naturalWidth;
    canvas.height = mask.naturalHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to create masked layer canvas');

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const edited = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
    const maskData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 0; i < edited.data.length; i += 4) {
      edited.data[i + 3] = maskData[i];
    }

    ctx.putImageData(edited, 0, 0);
    const blob = await canvasToBlob(canvas);
    return uploadImageBlob(blob, `edited-layer-${Date.now()}.png`);
  }, [canvasToBlob, loadCanvasImage, uploadImageBlob]);

  const placeImageLayer = useCallback((base64: string, width: number, height: number, name: string = 'Main Canvas') => {
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      name,
      type: 'image',
      url: base64,
      x: 0,
      y: 0,
      width,
      height,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0
    };

    setLayers([newLayer]);
    setSelectedLayerId(newLayer.id);
    setZoom(1);
    setDragOffset({ x: 0, y: 0 });
  }, []); // 移除依赖，避免侧边栏状态变化时重复创建

  useEffect(() => {
    if (initialImage && layers.length === 0) {
      placeImageLayer(initialImage.base64, initialImage.width, initialImage.height, initialImage.name || 'Main Canvas');
    }
  }, [initialImage, layers.length, placeImageLayer]);

  const fitCanvasToImage = useCallback(() => {
    const viewport = mainRef.current;
    const baseLayer = layers[0];
    if (!viewport || !baseLayer) return;

    const rect = viewport.parentElement?.getBoundingClientRect() ?? viewport.getBoundingClientRect();
    const padding = 28;
    const availableWidth = Math.max(160, rect.width - padding * 2);
    const availableHeight = Math.max(160, rect.height - padding * 2);
    const nextZoom = Math.min(
      availableWidth / baseLayer.width,
      availableHeight / baseLayer.height,
      1
    );

    setZoom(Number.isFinite(nextZoom) && nextZoom > 0 ? nextZoom : 1);
    setDragOffset({ x: 0, y: 0 });
  }, [layers]);

  // Fit the visual canvas to the uploaded image and keep it pinned to the top.
  useEffect(() => {
    if (!layers[0]) return;

    const raf = window.requestAnimationFrame(fitCanvasToImage);
    const viewport = mainRef.current;
    let observer: ResizeObserver | null = null;

    if (viewport) {
      observer = new ResizeObserver(() => fitCanvasToImage());
      observer.observe(viewport);
    }

    window.addEventListener('resize', fitCanvasToImage);
    return () => {
      window.cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener('resize', fitCanvasToImage);
    };
  }, [
    fitCanvasToImage,
    layers.length,
    layers[0]?.width,
    layers[0]?.height,
  ]);

  // 从 sessionStorage 读取上传的图片（用于从首页跳转）
  useEffect(() => {
    if (layers.length === 0) {
      try {
        const savedImage = sessionStorage.getItem('uploadedImage');
        if (savedImage) {
          const parsed = JSON.parse(savedImage);
          placeImageLayer(parsed.base64, parsed.width, parsed.height, parsed.name || 'Uploaded Image');
          // 清除 sessionStorage，避免重复加载
          sessionStorage.removeItem('uploadedImage');
        }
      } catch (error) {
        console.error('[CrookedApp] Failed to load image from sessionStorage:', error);
      }
    }
  }, [layers.length, placeImageLayer]);

  // Handle Panning Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    // Start panning if:
    // 1. Clicking directly on the main canvas container (not on a layer)
    // 2. Using the 'move' tool
    // 3. Holding space key (like Photoshop/Figma)
    const target = e.target as HTMLElement;
    const isClickingOnCanvas = target === mainRef.current || target.classList.contains('canvas-container');

    if (isClickingOnCanvas || activeTool === 'move' || isSpacePressed) {
      setIsDraggingCanvas(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle keyboard events for space key panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        setIsSpacePressed(true);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  // Handle layer dragging
  const handleLayerMouseDown = (e: React.MouseEvent, layer: Layer) => {
    if (layer.locked) return;
    e.stopPropagation();
    setSelectedLayerId(layer.id);
    setDraggingLayerId(layer.id);
    setLayerDragOffset({
      x: e.clientX - layer.x,
      y: e.clientY - layer.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Handle canvas dragging
    if (isDraggingCanvas) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      setDragOffset(prev => ({
        x: prev.x + deltaX / zoom,
        y: prev.y + deltaY / zoom
      }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }

    // Handle layer dragging
    if (draggingLayerId) {
      const newX = e.clientX - layerDragOffset.x;
      const newY = e.clientY - layerDragOffset.y;

      setLayers(prev => prev.map(l =>
        l.id === draggingLayerId
          ? { ...l, x: newX, y: newY }
          : l
      ));
    }
  }, [isDraggingCanvas, lastMousePos, zoom, draggingLayerId, layerDragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingCanvas(false);
    setDraggingLayerId(null);
  }, []);

  useEffect(() => {
    if (activeTool !== 'select' && activeTool !== 'move' && !selectedLayerId && layers.length > 0) {
      setSelectedLayerId(layers[0].id);
    }
  }, [activeTool, selectedLayerId, layers]);

  useEffect(() => {
    if (isDraggingCanvas || draggingLayerId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCanvas, draggingLayerId, handleMouseMove, handleMouseUp]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const prepared = await prepareImageFile(file);
      placeImageLayer(prepared.base64, prepared.width, prepared.height, prepared.name);

      console.log('[handleFileUpload] Image loaded successfully', {
        width: prepared.width,
        height: prepared.height,
      });
    } catch (error) {
      console.error('[handleFileUpload] Error processing image:', error);
      toast.error(copy.notifications.loadImageFail);
    }

    // Reset input to allow uploading the same file again
    e.target.value = '';
  };

  const extractLayerImagesFromPayload = (payload: any) => {
    if (!payload) return [];

    const normalize = (item: any) => {
      const url = typeof item === 'string'
        ? item
        : item?.imageUrl || item?.image_url || item?.url || item?.image?.url;

      return url ? { imageUrl: url } : null;
    };

    if (Array.isArray(payload.images)) {
      return payload.images.map(normalize).filter(Boolean);
    }
    if (Array.isArray(payload.output)) {
      return payload.output.map(normalize).filter(Boolean);
    }

    const single = normalize(payload);
    return single ? [single] : [];
  };

  const smartDecompose = async (count: number, targetLayerId?: string) => {
    // Check guest limits before processing
    const isLoggedIn = isUserLoggedIn();
    if (!isLoggedIn && isUploadLimitReached()) {
      setUpgradeModalType('limit');
      setUpgradeModalOpen(true);
      return;
    }

    const targetId = targetLayerId || selectedLayerId || (layers.length > 0 ? layers[0].id : null);
    if (!targetId) {
      console.error('[smartDecompose] No target layer found');
      return;
    }

    const target = layers.find(l => l.id === targetId);
    if (!target) {
      console.error('[smartDecompose] Target layer not found in layers array');
      return;
    }

    console.log('[smartDecompose] Starting decomposition', { count, targetId, targetName: target.name, urlType: target.url?.substring(0, 50) });

    setIsProcessing(true);
    try {
      // Check if target.url is valid
      if (!target.url) {
        console.error('[smartDecompose] No image URL found');
        throw new Error('No image data found. Please upload a valid image.');
      }

      // Handle different image URL formats:
      // 1. Base64 data URI (data:image/png;base64,...) - use directly
      // 2. HTTP/HTTPS URL - fetch and convert to base64
      // 3. Object URL (blob:http://...) - fetch and convert
      let imageToUpload = target.url;

      if (!target.url.startsWith('data:')) {
        // Need to fetch the image and convert to base64
        // Use backend proxy for external URLs to avoid CORS
        let fetchUrl = target.url;
        console.log('[smartDecompose] Fetching image from URL:', target.url.substring(0, 100));

        if (target.url.startsWith('http://') || target.url.startsWith('https://')) {
          // Use backend proxy for external URLs
          fetchUrl = `/api/storage/proxy-image?url=${encodeURIComponent(target.url)}`;
          console.log('[smartDecompose] Using backend proxy for external image');
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        imageToUpload = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        console.log('[smartDecompose] Converted to base64, length:', imageToUpload.length);
      }

      // Upload the image to storage using FormData
      // Convert base64 to Blob
      const base64Data = imageToUpload.split(',')[1];
      if (!base64Data) {
        console.error('[smartDecompose] Failed to extract base64 data');
        throw new Error('Invalid image format. Please try uploading again.');
      }

      console.log('[smartDecompose] Converting base64 to file...', { base64Length: base64Data.length });

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const file = new File([blob], 'image.png', { type: 'image/png' });

      console.log('[smartDecompose] File created', { fileSize: file.size, fileType: file.type });

      // Create FormData
      const formData = new FormData();
      formData.append('files', file);

      console.log('[smartDecompose] Uploading image to storage...', { fileSize: file.size });

      const uploadRes = await fetch('/api/storage/upload-image', {
        method: 'POST',
        body: formData,
      });

      console.log('[smartDecompose] Upload response status:', uploadRes.status);

      const uploadData = await uploadRes.json();
      console.log('[smartDecompose] Upload response:', uploadData);

      if (uploadData.code !== 0) {
        console.error('[smartDecompose] Upload failed:', uploadData);
        throw new Error(uploadData.message || 'Upload failed');
      }

      const imageUrl = uploadData.data.urls[0];
      console.log('[smartDecompose] Uploaded image URL:', imageUrl);

      const isNativeLayerModel =
        advancedConfig.model === 'fal-ai/qwen-image-layered' ||
        advancedConfig.model === 'fal-ai/qwen-image-layered/lora';
      const isSeedreamDesignLayering = advancedConfig.model === 'bytedance/seedream/v5/pro/edit';
      const targetLayerCount = count > 0 ? count : 4;
      const decompositionPrompt = isNativeLayerModel
        ? `Decompose this image into ${targetLayerCount} transparent editable layers`
        : isSeedreamDesignLayering
          ? [
              `Seedream Design Layering task.`,
              `Analyze this image as a professional design file, not a flat picture.`,
              `Separate the design into up to ${Math.min(Math.max(targetLayerCount, 4), 8)} independent editable PNG layers.`,
              `Prioritize design semantics: background plate, main subject or product, text blocks, logo or brand marks, decorative objects, foreground effects, shadows, and lighting accents.`,
              `For posters, e-commerce images, infographics, UI mockups, and text-heavy visuals, preserve the original canvas alignment, element scale, typography placement, spacing, and visual hierarchy.`,
              `Each returned image should be a clean layer asset with transparent areas where possible, aligned to the original canvas, suitable for dragging, hiding, recoloring, extracting, and recompositing.`,
              `If the background is covered by a subject, restore the hidden background region naturally so the background layer can stand alone.`,
              `Do not redesign the composition. Do not merge unrelated elements. Keep text blocks independent from background and subject layers when possible.`,
            ].join(' ')
          : [
              `Analyze this image as an AI layer editing workspace.`,
              `Create the cleanest editable visual separation possible for ${targetLayerCount} major elements.`,
              `Preserve the original composition, scale, lighting, and object boundaries.`,
              `Return production-ready PNG image outputs suitable for layer editing.`,
            ].join(' ');

      const requestOptions: any = isNativeLayerModel
        ? {
            image_input: [imageUrl],
            num_layers: count > 0 ? count : 4,
            num_inference_steps: advancedConfig.inferenceSteps,
            guidance_scale: advancedConfig.guidanceScale,
            enable_safety_checker: true,
            sync_mode: true,
          }
        : {
            image_input: [imageUrl],
            image_urls: [imageUrl],
            num_images: isSeedreamDesignLayering
              ? Math.min(Math.max(targetLayerCount, 4), 8)
              : Math.min(Math.max(targetLayerCount, 1), 4),
            image_size: advancedConfig.model === 'bytedance/seedream/v5/pro/edit' ? 'auto_2K' : 'auto',
            quality: 'high',
            output_format: 'png',
            sync_mode: true,
          };

      // Add optional parameters if provided
      if (advancedConfig.prompt) {
        requestOptions.prompt = isNativeLayerModel
          ? advancedConfig.prompt
          : `${decompositionPrompt}\n\nAdditional instructions: ${advancedConfig.prompt}`;
      }
      if (advancedConfig.negativePrompt) {
        requestOptions.negative_prompt = advancedConfig.negativePrompt;
      }
      if (!advancedConfig.randomizeSeed) {
        requestOptions.seed = advancedConfig.seed;
      }

      console.log('[smartDecompose] Request options:', requestOptions);

      const genRes = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType: 'image',
          scene: 'image-decomposition',
          provider: selectedDecompositionModel.provider,
          model: advancedConfig.model,
          prompt: requestOptions.prompt || decompositionPrompt,
          options: requestOptions,
        }),
      });

      console.log('[smartDecompose] AI generate response status:', genRes.status);

      const genData = await genRes.json();
      console.log('[smartDecompose] AI generate response:', genData);

      if (genData.code !== 0) {
        const errorMsg = genData.message || 'Decomposition failed';
        console.error('[smartDecompose] API Error:', errorMsg, genData);
        throw new Error(errorMsg);
      }

      let layerImages: any[] = [];

      // Log full response structure for debugging
      console.log('[smartDecompose] Full genData.data structure:', JSON.stringify(genData.data, null, 2));

      // With sync_mode=true, results should be available immediately in the response
      if (genData.data?.status === 'SUCCESS' || genData.data?.status === 'success') {
        console.log('[smartDecompose] Task completed successfully (sync mode)');

        // Debug: log raw taskInfo before parsing
        console.log('[smartDecompose] Raw taskInfo type:', typeof genData.data.taskInfo);
        console.log('[smartDecompose] Raw taskInfo value:', genData.data.taskInfo);
        console.log('[smartDecompose] Raw taskResult type:', typeof genData.data.taskResult);
        console.log('[smartDecompose] Raw taskResult value:', genData.data.taskResult?.substring(0, 200));

        // Try to parse taskInfo
        if (genData.data.taskInfo) {
          try {
            // taskInfo might already be an object or a string
            let taskInfo;
            if (typeof genData.data.taskInfo === 'string') {
              console.log('[smartDecompose] Parsing taskInfo as JSON string');
              taskInfo = JSON.parse(genData.data.taskInfo);
            } else {
              console.log('[smartDecompose] taskInfo is already an object');
              taskInfo = genData.data.taskInfo;
            }
            console.log('[smartDecompose] Parsed taskInfo keys:', Object.keys(taskInfo));
            console.log('[smartDecompose] taskInfo.images:', JSON.stringify(taskInfo.images, null, 2));

            if (taskInfo?.images && Array.isArray(taskInfo.images)) {
              layerImages = taskInfo.images.map((img: any) => {
                const url = typeof img === 'string' ? img : (img.imageUrl || img.url || img.image_url);
                console.log('[smartDecompose] TaskInfo image URL:', url ? url.substring(0, 100) : 'undefined');
                return { imageUrl: url };
              }).filter((img: any) => img.imageUrl);
              console.log('[smartDecompose] Found images in taskInfo:', layerImages.length);
            }
            if ((!layerImages || layerImages.length === 0) && taskInfo) {
              layerImages = extractLayerImagesFromPayload(taskInfo);
              console.log('[smartDecompose] Found generic images in taskInfo:', layerImages.length);
            }
          } catch (e) {
            console.error('[smartDecompose] Failed to parse immediate taskInfo:', e);
          }
        }

        // Try to parse taskResult
        if ((!layerImages || layerImages.length === 0) && genData.data.taskResult) {
          try {
            let parsedResult;
            if (typeof genData.data.taskResult === 'string') {
              parsedResult = JSON.parse(genData.data.taskResult);
            } else {
              parsedResult = genData.data.taskResult;
            }
            console.log('[smartDecompose] Parsed taskResult keys:', Object.keys(parsedResult));
            console.log('[smartDecompose] parsedResult.output:', parsedResult.output);
            console.log('[smartDecompose] parsedResult.images:', parsedResult.images);

            // Check for images in taskResult
            if (parsedResult?.images && Array.isArray(parsedResult.images)) {
              layerImages = parsedResult.images.map((img: any) => {
                const url = typeof img === 'string' ? img : (img.url || img.image_url || img);
                console.log('[smartDecompose] Image URL:', url ? url.substring(0, 100) : 'undefined');
                return { imageUrl: url };
              }).filter((img: any) => img.imageUrl);
              console.log('[smartDecompose] Found images in taskResult:', layerImages.length);
            }
            // Check for output array (fal.ai qwen-image-layered returns layers in output)
            else if (parsedResult?.output && Array.isArray(parsedResult.output)) {
              console.log('[smartDecompose] Output array length:', parsedResult.output.length);
              console.log('[smartDecompose] First output item:', parsedResult.output[0]);

              // qwen-image-layered returns an array of layer objects with url property
              layerImages = parsedResult.output.map((img: any, idx: number) => {
                const url = typeof img === 'string' ? img : (img.url || img.image_url || img);
                console.log(`[smartDecompose] Layer ${idx} URL:`, url ? url.substring(0, 100) : 'undefined');
                return { imageUrl: url };
              }).filter((img: any) => img.imageUrl);
              console.log('[smartDecompose] Found images in output:', layerImages.length);
            }
            if ((!layerImages || layerImages.length === 0) && parsedResult) {
              layerImages = extractLayerImagesFromPayload(parsedResult);
              console.log('[smartDecompose] Found generic images in taskResult:', layerImages.length);
            }
          } catch (e) {
            console.error('[smartDecompose] Failed to parse taskResult:', e);
          }
        }
      }

      // If still no images and task is pending, we need to poll
      if ((!layerImages || layerImages.length === 0) && (genData.data?.status === 'PENDING' || genData.data?.status === 'pending')) {
        const dbTaskId = genData.data?.id; // Use database task ID, not fal.ai taskId
        if (!dbTaskId) {
          throw new Error('Task ID missing in response');
        }

        console.log('[smartDecompose] Task is pending, starting polling...');
        console.log('[smartDecompose] Database task ID:', dbTaskId);

        // 🚀 智能轮询优化：图像分解使用指数退避策略
        const INITIAL_INTERVAL = 2000; // 2秒
        const MAX_INTERVAL = 10000; // 10秒
        const BACKOFF_MULTIPLIER = 1.5;
        const MAX_POLL_TIME = 300000; // 5 minutes max
        const startTime = Date.now();
        let pollCount = 0;
        let currentInterval = INITIAL_INTERVAL;
        let shouldContinue = true;

        while (shouldContinue && Date.now() - startTime < MAX_POLL_TIME) {
          pollCount++;
          const elapsed = Date.now() - startTime;

          // Wait before polling (使用动态间隔)
          await new Promise(resolve => setTimeout(resolve, currentInterval));

          console.log(`[smartDecompose] Poll #${pollCount} (${Math.floor(elapsed / 1000)}s elapsed, interval: ${currentInterval}ms)`);

          const queryRes = await fetch('/api/ai/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: dbTaskId }),
          });

          if (!queryRes.ok) {
            console.error('[smartDecompose] Query request failed:', queryRes.status);
            continue;
          }

          const queryData = await queryRes.json();

          if (queryData.code !== 0) {
            console.error('[smartDecompose] Query error:', queryData.message);
            continue;
          }

          const task = queryData.data;
          console.log('[smartDecompose] Task status:', task.status);

          // Log taskResult to see what fal.ai returns during polling
          if (task.taskResult) {
            try {
              const resultObj = typeof task.taskResult === 'string' ? JSON.parse(task.taskResult) : task.taskResult;
              console.log('[smartDecompose] Task result status:', resultObj.status);
            } catch (e) {
              console.log('[smartDecompose] Task result (raw):', task.taskResult?.substring(0, 100));
            }
          }

          if (task.status === 'SUCCESS' || task.status === 'success') {
            console.log('[smartDecompose] Task completed after', Math.floor(elapsed / 1000), 'seconds');

            if (task.taskInfo) {
              try {
                let parsedTaskInfo;
                if (typeof task.taskInfo === 'string') {
                  parsedTaskInfo = JSON.parse(task.taskInfo);
                } else {
                  parsedTaskInfo = task.taskInfo;
                }
                if (parsedTaskInfo?.images && Array.isArray(parsedTaskInfo.images)) {
                  layerImages = parsedTaskInfo.images.map((img: any) => {
                    const url = typeof img === 'string' ? img : (img.imageUrl || img.url || img.image_url);
                    console.log('[smartDecompose] Poll TaskInfo image URL:', url ? url.substring(0, 100) : 'undefined');
                    return { imageUrl: url };
                  }).filter((img: any) => img.imageUrl);
                  console.log('[smartDecompose] Found images in taskInfo:', layerImages.length);
                  break;
                }
                layerImages = extractLayerImagesFromPayload(parsedTaskInfo);
                if (layerImages.length > 0) {
                  console.log('[smartDecompose] Found generic images in taskInfo:', layerImages.length);
                  break;
                }
              } catch (e) {
                console.error('[smartDecompose] Failed to parse taskInfo:', e);
              }
            }

            if (task.taskResult && (!layerImages || layerImages.length === 0)) {
              try {
                let parsedResult;
                if (typeof task.taskResult === 'string') {
                  parsedResult = JSON.parse(task.taskResult);
                } else {
                  parsedResult = task.taskResult;
                }
                if (parsedResult?.images && Array.isArray(parsedResult.images)) {
                  layerImages = parsedResult.images.map((img: any) => {
                    const url = typeof img === 'string' ? img : (img.url || img.image_url || img);
                    console.log('[smartDecompose] Poll: Image URL:', url ? url.substring(0, 100) : 'undefined');
                    return { imageUrl: url };
                  }).filter((img: any) => img.imageUrl);
                  console.log('[smartDecompose] Found images in taskResult:', layerImages.length);
                  break;
                }
                if (parsedResult?.output && Array.isArray(parsedResult.output)) {
                  layerImages = parsedResult.output.map((img: any, idx: number) => {
                    const url = typeof img === 'string' ? img : (img.url || img.image_url || img);
                    console.log(`[smartDecompose] Poll: Layer ${idx} URL:`, url ? url.substring(0, 100) : 'undefined');
                    return { imageUrl: url };
                  }).filter((img: any) => img.imageUrl);
                  console.log('[smartDecompose] Found images in output:', layerImages.length);
                  break;
                }
                layerImages = extractLayerImagesFromPayload(parsedResult);
                if (layerImages.length > 0) {
                  console.log('[smartDecompose] Found generic images in taskResult:', layerImages.length);
                  break;
                }
              } catch (e) {
                console.error('[smartDecompose] Failed to parse taskResult:', e);
              }
            }
            break;
          }

          if (task.status === 'FAILED' || task.status === 'failed') {
            const errorMsg = task.taskInfo
              ? JSON.parse(task.taskInfo)?.errorMessage || 'Decomposition failed'
              : 'Decomposition failed';
            console.error('[smartDecompose] Task failed:', errorMsg);
            throw new Error(errorMsg);
          }

          // Log status every 5 polls to avoid too much output
          if (pollCount % 5 === 0) {
            console.log(`[smartDecompose] Still polling... (${Math.floor(elapsed / 1000)}s elapsed, status: ${task.status})`);
          }

          // 🎯 智能退避：如果任务仍在处理中，增加间隔
          if (task.status === 'PENDING' || task.status === 'PROCESSING' || task.status === 'pending') {
            const nextInterval = Math.min(
              currentInterval * BACKOFF_MULTIPLIER,
              MAX_INTERVAL
            );
            currentInterval = nextInterval;
          }
        }

        if (Date.now() - startTime >= MAX_POLL_TIME) {
          const finalElapsed = Math.floor((Date.now() - startTime) / 1000);
          throw new Error(`Decomposition timed out after ${finalElapsed}s. Please try again.`);
        }
      }

      console.log('[smartDecompose] Final layer images:', layerImages);

      if (!layerImages || layerImages.length === 0) {
        throw new Error('No layers generated. The task completed but returned no images.');
      }

      // Helper function to load image and get its natural dimensions
      const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
          };
          img.onerror = () => {
            // Fallback to parent dimensions if load fails
            console.warn('[smartDecompose] Failed to load image for dimensions, using parent dimensions');
            resolve({ width: target.width, height: target.height });
          };
          img.src = url;
        });
      };

      // Load all images to get their natural dimensions
      console.log('[smartDecompose] Loading images to get natural dimensions...');
      const layerDimensions = await Promise.all(
        layerImages.map(async (img: any) => {
          // Use proxy for external URLs to avoid CORS
          let imageUrl = img.imageUrl;
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            imageUrl = `/api/storage/proxy-image?url=${encodeURIComponent(imageUrl)}`;
          }
          return getImageDimensions(imageUrl);
        })
      );

      console.log('[smartDecompose] Layer dimensions:', layerDimensions);

      console.log('[smartDecompose] Generating alpha masks for decomposed layers...');
      const layerMaskUrls = await Promise.all(
        layerImages.map(async (img: any, idx: number) => {
          try {
            const maskUrl = await createMaskFromLayer(img.imageUrl);
            console.log(`[smartDecompose] Layer ${idx + 1} mask:`, maskUrl ? maskUrl.substring(0, 100) : 'none');
            return maskUrl;
          } catch (error) {
            console.warn(`[smartDecompose] Failed to create mask for layer ${idx + 1}:`, error);
            return null;
          }
        })
      );

      const layerNamePresets: Record<WorkflowPresetId, string[]> = {
        product: ['Product', 'Background', 'Shadow', 'Label / Text', 'Props', 'Reflection'],
        poster: ['Subject', 'Headline Text', 'Logo', 'Product', 'Background', 'Effects', 'Shadow', 'Decoration'],
        'ai-image': ['Subject', 'Clothing', 'Object', 'Background', 'Lighting', 'Text', 'Detail'],
        character: ['Face', 'Hair', 'Clothing', 'Body', 'Background', 'Lighting', 'Props'],
      };
      const names = layerNamePresets[selectedWorkflowId];

      // Create a layer for each generated image with correct dimensions
      const newLayers: Layer[] = layerImages.map((img: any, idx: number) => {
        const dims = layerDimensions[idx];
        return {
          id: crypto.randomUUID(),
          name: names[idx] || `${selectedWorkflow.title} Layer ${idx + 1}`,
          type: 'image',
          url: img.imageUrl,
          x: target.x,
          y: target.y,
          width: dims.width,
          height: dims.height,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: layers.length + idx + 1,
          maskUrl: layerMaskUrls[idx] || undefined,
          parentId: target.id
        };
      });

      console.log('[smartDecompose] Created new layers:', newLayers.length);

      setLayers(prev => [...prev, ...newLayers]);
      if (newLayers.length > 0) setSelectedLayerId(newLayers[0].id);

      // Auto-expand the parent if it was collapsed
      setCollapsedLayerIds(prev => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });

      console.log('[smartDecompose] Decomposition completed successfully');

      // Increment usage count on success for guest users
      if (!isLoggedIn) {
        incrementUploadCount();
      }
    } catch (err) {
      console.error('[smartDecompose] Error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown error';

      // Check if it's a credits issue and show a helpful message
      if (errMsg === 'insufficient credits' || errMsg.includes('credits')) {
        const shouldGoToPricing = confirm(
          'Insufficient credits to perform image decomposition.\n\n' +
          'Image decomposition requires 5 credits.\n\n' +
          'Click OK to go to Pricing page to purchase credits,\n' +
          'or Cancel to stay on this page.'
        );

        if (shouldGoToPricing) {
          window.location.href = '/pricing';
        }
      } else {
        toast.error(copy.notifications.decomposeFail.replace('{reason}', errMsg));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const canGenerateLayers = !!layers[0] && layers.length === 1 && !isProcessing;
  const handleGenerateLayers = () => {
    if (!layers[0] || isProcessing) return;
    smartDecompose(layerCount, layers[0].id);
  };

  const handleEditAction = async (instruction: string) => {
    // Check guest limits before processing
    const isLoggedIn = isUserLoggedIn();
    if (!isLoggedIn && isUploadLimitReached()) {
      setUpgradeModalType('limit');
      setUpgradeModalOpen(true);
      return;
    }

    const target = layers.find(l => l.id === selectedLayerId);
    if (!target || target.locked) return;

    setIsProcessing(true);
    try {
      // Determine scene based on active tool
      const scene = activeTool === 'recolor' ? 'image-recolor' :
                    activeTool === 'replace' ? 'image-replace' :
                    'image-remove';

      if (!target.url) {
        throw new Error('Invalid image data. Please upload a valid image.');
      }

      let imageToUpload = target.url;
      if (!target.url.startsWith('data:')) {
        let fetchUrl = target.url;
        if (target.url.startsWith('http://') || target.url.startsWith('https://')) {
          fetchUrl = `/api/storage/proxy-image?url=${encodeURIComponent(target.url)}`;
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        imageToUpload = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const base64Data = imageToUpload.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid image format. Please try uploading again.');
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const file = new File([blob], 'image.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('files', file);

      const uploadRes = await fetch('/api/storage/upload-image', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (uploadData.code !== 0) {
        throw new Error(uploadData.message || 'Upload failed');
      }

      const imageUrl = uploadData.data.urls[0];

      // Call AI generate for high-quality poster editing. The API route can
      // override these defaults from admin settings; fal GPT Image 2 is the
      // first-stage default editing engine after Qwen layer decomposition.
      const genRes = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType: 'image',
          scene,
          prompt: instruction,
          options: {
            image_urls: [imageUrl],
            image_size: 'auto',
            quality: 'high',
            num_images: 1,
            output_format: 'png',
            ...(target.maskUrl ? { mask_url: target.maskUrl } : {}),
            sync_mode: true,
          },
        }),
      });

      const genData = await genRes.json();
      if (genData.code !== 0) {
        throw new Error(genData.message || 'Edit failed');
      }

      // Extract result image
      const taskInfo = genData.data.taskInfo ? JSON.parse(genData.data.taskInfo) : null;
      let newUrl = taskInfo?.images?.[0]?.imageUrl;

      if (newUrl) {
        if (target.maskUrl) {
          try {
            newUrl = await applyMaskToEditedLayer(newUrl, target.maskUrl);
          } catch (maskError) {
            console.warn('[handleEditAction] Failed to reapply layer mask, using raw edit result:', maskError);
          }
        }

        setLayers(prev => prev.map(l =>
          l.id === selectedLayerId ? { ...l, url: newUrl } : l
        ));

        // Increment usage count on success for guest users
        if (!isLoggedIn) {
          incrementUploadCount();
        }
      } else {
        throw new Error('No image generated');
      }
    } catch (err) {
      console.error(err);
      toast.error(copy.notifications.editFail);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (settings: ExportSettings) => {
    // ========================================
    // GUEST EXPORT CONVERSION TRIGGER
    // ========================================
    const isLoggedIn = isUserLoggedIn();
    if (!isLoggedIn) {
      setIsProcessing(false);
      setIsExportModalOpen(false);
      setUpgradeModalType('export');
      setUpgradeModalOpen(true);
      return;
    }
    // ========================================

    setIsProcessing(true);
    try {
      console.log('[handleExport] Starting export with settings:', settings);

      // Get only visible layers, filtered by visibility and sorted by zIndex
      const visibleLayers = layers
        .filter(l => {
          // Check if layer itself is visible
          if (!l.visible) return false;
          // Check if any ancestor is collapsed
          let current = l;
          while (current.parentId) {
            if (collapsedLayerIds.has(current.parentId)) return false;
            const parent = layers.find(pl => pl.id === current.parentId);
            if (!parent) break;
            current = parent;
          }
          return true;
        })
        .sort((a, b) => a.zIndex - b.zIndex);

      console.log('[handleExport] Visible layers:', visibleLayers.length, 'Total layers:', layers.length);

      if (visibleLayers.length === 0) {
        toast.error(copy.notifications.noVisibleLayers);
        setIsProcessing(false);
        return;
      }

      // Create a canvas to composite all visible layers (exactly as displayed on screen)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to create canvas context');
      }

      // Helper function to load an image
      // For external URLs, use backend GET proxy to avoid CORS issues and quality loss
      const loadImage = async (url: string): Promise<HTMLImageElement> => {
        console.log('[handleExport] Loading image:', url?.substring(0, 80));

        let finalUrl = url;

        // For external URLs, use backend GET proxy (returns binary data, no base64 conversion)
        if (url.startsWith('http://') || url.startsWith('https://')) {
          // Use GET method with URL parameter - proxy returns raw image data
          finalUrl = `/api/storage/proxy-image?url=${encodeURIComponent(url)}`;
          console.log('[handleExport] Using backend GET proxy for external image');
        }

        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            console.log('[handleExport] Image loaded successfully, natural size:', img.naturalWidth, 'x', img.naturalHeight);
            resolve(img);
          };
          img.onerror = (e) => {
            console.error('[handleExport] Image load error:', e);
            reject(new Error(`Failed to load image: ${url?.substring(0, 50)}`));
          };
          // Set crossOrigin to anonymous for CORS
          img.crossOrigin = 'anonymous';
          img.src = finalUrl;
        });
      };

      // Use the base layer's dimensions
      const baseLayer = layers[0];

      // For original size, we need to load the base layer image to get its natural dimensions
      let targetWidth = settings.width || baseLayer.width;
      let targetHeight = settings.height || baseLayer.height;
      let baseNaturalWidth = baseLayer.width;
      let baseNaturalHeight = baseLayer.height;

      if (settings.useOriginalSize) {
        // Load the base layer image to get natural dimensions
        const baseImg = await loadImage(baseLayer.url);
        baseNaturalWidth = baseImg.naturalWidth;
        baseNaturalHeight = baseImg.naturalHeight;
        targetWidth = baseNaturalWidth;
        targetHeight = baseNaturalHeight;
        console.log('[handleExport] Using base layer natural dimensions:', { targetWidth, targetHeight });
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      console.log('[handleExport] Canvas size:', { width: targetWidth, height: targetHeight, original: { width: baseLayer.width, height: baseLayer.height }, useOriginalSize: settings.useOriginalSize });

      // Fill with transparent background first
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw each visible layer exactly as displayed
      for (const layer of visibleLayers) {
        try {
          console.log('[handleExport] Drawing layer:', layer.name, {
            url: layer.url?.substring(0, 50),
            x: layer.x,
            y: layer.y,
            width: layer.width,
            height: layer.height,
            opacity: layer.opacity,
            zIndex: layer.zIndex
          });

          const img = await loadImage(layer.url);

          // Use the image's natural dimensions for best quality
          const naturalWidth = img.naturalWidth;
          const naturalHeight = img.naturalHeight;

          console.log('[handleExport] Image natural size:', {
            naturalWidth,
            naturalHeight,
            layerSize: { width: layer.width, height: layer.height },
            canvasSize: { width: targetWidth, height: targetHeight },
            useOriginalSize: settings.useOriginalSize
          });

          // Save context state
          ctx.save();

          // Apply layer opacity
          ctx.globalAlpha = layer.opacity;

          // When using original size, use the image's natural dimensions
          // Calculate scale factor based on baseLayer's natural size vs stored size
          if (settings.useOriginalSize) {
            // Calculate the ratio between natural and stored dimensions for base layer
            const baseScaleX = baseNaturalWidth / baseLayer.width;
            const baseScaleY = baseNaturalHeight / baseLayer.height;

            // Apply this scale to position and size
            ctx.drawImage(
              img,
              layer.x * baseScaleX,
              layer.y * baseScaleY,
              layer.width * baseScaleX,
              layer.height * baseScaleY
            );
          } else {
            // Scale to match target export size
            const scaleX = targetWidth / baseLayer.width;
            const scaleY = targetHeight / baseLayer.height;

            ctx.drawImage(
              img,
              layer.x * scaleX,
              layer.y * scaleY,
              layer.width * scaleX,
              layer.height * scaleY
            );
          }

          // Restore context state
          ctx.restore();
        } catch (err) {
          console.error('[handleExport] Failed to draw layer:', layer.name, err);
        }
      }

      console.log('[handleExport] All layers drawn, converting to blob...');

      // Convert canvas to blob and download
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsProcessing(false);
          throw new Error('Failed to export image');
        }

        console.log('[handleExport] Blob created:', blob.size, 'bytes');

        let finalUrl = URL.createObjectURL(blob);
        let fileName = `ImageLayered-poster-export-${targetWidth}x${targetHeight}-${Date.now()}.png`;

        // If upscale is enabled, call AI upscaling
        if (settings.upscale) {
          console.log('[handleExport] Upscaling enabled, resolution:', settings.resolution);

          try {
            // Convert blob to base64 for upload
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });

            const base64Url = await base64Promise;
            console.log('[handleExport] Converted to base64, length:', base64Url.length);

            // Upload to storage
            const uploadRes = await fetch('/api/storage/upload-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                file: base64Url,
                contentType: 'image/png',
              }),
            });

            const uploadData = await uploadRes.json();
            if (uploadData.code !== 0) {
              throw new Error(uploadData.message || 'Upload failed');
            }

            const imageUrl = uploadData.data.url;
            console.log('[handleExport] Image uploaded to storage:', imageUrl);

            // For now, skip AI upscaling as it may cause issues
            // Just use the composited image
            console.log('[handleExport] Skipping AI upscaling, using composited image');
          } catch (err) {
            console.error('[handleExport] Upscaling failed, using original:', err);
            // Continue with original image if upscaling fails
          }
        }

        // Download the image
        console.log('[handleExport] Starting download:', fileName);
        const link = document.createElement('a');
        link.href = finalUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up object URL
        setTimeout(() => {
          if (finalUrl.startsWith('blob:')) {
            URL.revokeObjectURL(finalUrl);
          }
        }, 100);

        setIsExportModalOpen(false);
        setIsProcessing(false);
        console.log('[handleExport] Export completed successfully');
      }, 'image/png');

    } catch (err: any) {
      console.error('[handleExport] Export failed:', err);
      toast.error(err.message || copy.notifications.exportFail);
      setIsProcessing(false);
    }
  };

  const downloadBlob = useCallback((blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, []);

  const handleDownloadLayer = useCallback(async (id: string) => {
    const layer = layers.find((item) => item.id === id);
    if (!layer) return;

    try {
      const image = await loadCanvasImage(layer.url);
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || layer.width;
      canvas.height = image.naturalHeight || layer.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to create layer export canvas');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await canvasToBlob(canvas);
      const safeName = layer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'layer';
      downloadBlob(blob, `image-layered-${safeName}-${Date.now()}.png`);
      toast.success(isZh ? '图层已下载' : 'Layer downloaded');
    } catch (error) {
      console.error('[handleDownloadLayer] Failed:', error);
      toast.error(isZh ? '图层下载失败' : 'Failed to download layer');
    }
  }, [canvasToBlob, downloadBlob, isZh, layers, loadCanvasImage]);

  const handleDuplicateLayer = useCallback((id: string) => {
    const layer = layers.find((item) => item.id === id);
    if (!layer) return;

    const maxZ = Math.max(...layers.map((item) => item.zIndex), 0);
    const copyLayer: Layer = {
      ...layer,
      id: crypto.randomUUID(),
      name: `${layer.name} Copy`,
      x: layer.x + 16,
      y: layer.y + 16,
      zIndex: maxZ + 1,
      locked: false,
      visible: true,
    };

    setLayers((prev) => [...prev, copyLayer]);
    setSelectedLayerId(copyLayer.id);
    toast.success(isZh ? '已复制图层' : 'Layer duplicated');
  }, [isZh, layers]);

  const handleSoloLayer = useCallback((id: string) => {
    setLayers((prev) => prev.map((layer) => ({ ...layer, visible: layer.id === id })));
    setSelectedLayerId(id);
    toast.success(isZh ? '已提取预览该图层' : 'Showing selected layer only');
  }, [isZh]);

  const handleShowAllLayers = useCallback(() => {
    setLayers((prev) => prev.map((layer) => ({ ...layer, visible: true })));
    toast.success(isZh ? '已显示全部图层' : 'All layers visible');
  }, [isZh]);

  // Copying link helper
  const handleCopyShareLink = () => {
    try {
      const shareUrl = `${window.location.origin}/${params?.locale || 'en'}/share/${projectId}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success(isZh ? '项目分享链接已复制到剪贴板！' : 'Project share link copied to clipboard!');
    } catch (err) {
      toast.error(isZh ? '复制链接失败' : 'Failed to copy link');
    }
  };

  const handleExitIntentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitIntentEmail || exitIntentSubmitting) return;

    setExitIntentSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: exitIntentEmail,
          utmSource: 'editor_exit_intent',
        }),
      });

      if (!res.ok) throw new Error('Subscription failed');
      const data = await res.json();
      if (data.code === 0) {
        localStorage.setItem('layered_newsletter_subscribed', 'true');
        toast.success(isZh ? '🎉 订阅成功！欢迎手册与额度已发送至您的邮箱！' : '🎉 Subscribed! Your manual & credits are on the way!');
        setShowExitIntent(false);
      } else {
        throw new Error(data.message || 'Error subscribing');
      }
    } catch (err: any) {
      console.error('[ExitIntent] Failed to subscribe:', err);
      toast.error(err.message || (isZh ? '订阅失败，请稍后重试' : 'Failed to subscribe. Please try again.'));
    } finally {
      setExitIntentSubmitting(false);
    }
  };

  const handleNextOnboardingStep = () => {
    if (onboardingStep === null) return;
    
    const nextStep = onboardingStep + 1;
    if (nextStep >= 4) {
      setOnboardingStep(null);
      localStorage.setItem('layered_tour_completed', 'true');
      toast.success(isZh ? '🎓 恭喜完成新手教程，开始您的创作吧！' : '🎓 Congratulations! You completed the tour. Happy designing!');
    } else {
      setOnboardingStep(nextStep);
    }
  };

  const handleSkipOnboarding = () => {
    setOnboardingStep(null);
    localStorage.setItem('layered_tour_completed', 'true');
  };

  const tourSteps = [
    {
      title: isZh ? '1. AI 智能分层' : '1. AI Poster Decomposition',
      content: isZh
        ? '点击左侧栏的“Smart Decompose”将上传的单一图层海报一键提取并拆分为多个独立的 AI 图层！'
        : 'Click "Smart Decompose" in the left sidebar to extract and split your uploaded poster into multiple editable layers automatically.',
    },
    {
      title: isZh ? '2. 自由交互式画布' : '2. Interactive Canvas Workspace',
      content: isZh
        ? '在画布中，您可以直接点击任意元素，拖拽进行移动，或者在底部缩放画布。'
        : 'On the main canvas, click to select any layer, drag to reposition, and use the zoom controls to inspect details.',
    },
    {
      title: isZh ? '3. AI 局部魔法重塑' : '3. AI Magic Brush & Editor',
      content: isZh
        ? '点击任何图层后，您可以在右侧编辑栏中输入文字提示词（Prompt），为选中的元素执行 Recoloring (改色)、Replace (产品替换) 或 Remove (擦除)。'
        : 'Select any layer, and use the edit tools (Recolor, Replace, Remove) in the right sidebar. Just write a simple prompt to let AI do the work!',
    },
    {
      title: isZh ? '4. 分享与高清导出' : '4. Share & Export Designs',
      content: isZh
        ? '点击顶部的“Share Poster”可以生成公开克隆链接与同事分享；点击左侧/右上角“Export”即可导出高质量 PNG。'
        : 'Click "Share Poster" in the header to generate a public view-remix link, or click "Export" to download your high-resolution PNG.',
    }
  ];

  const selectedLayer = layers.find(layer => layer.id === selectedLayerId) ?? layers[0] ?? null;
  const displayedLayers = layers
    .filter(layer => {
      if (!layer.visible) return false;
      let current = layer;
      while (current.parentId) {
        if (collapsedLayerIds.has(current.parentId)) return false;
        const parent = layers.find(parentLayer => parentLayer.id === current.parentId);
        if (!parent) break;
        current = parent;
      }
      return true;
    })
    .sort((a, b) => a.zIndex - b.zIndex);
  const baseLayer = layers[0] ?? null;
  const renderLayerStack = (interactive = true) => {
    if (!baseLayer) return null;

    return displayedLayers.map((layer) => {
      const isRootLayer = !layer.parentId;

      return (
        <div
          key={layer.id}
          className={`absolute transition-all duration-200 ${interactive && selectedLayerId === layer.id ? 'z-20' : ''}`}
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
            outline: interactive && selectedLayerId === layer.id ? '2px solid rgba(113,190,255,0.92)' : 'none',
            outlineOffset: interactive && selectedLayerId === layer.id ? '2px' : '0',
            pointerEvents: interactive ? 'auto' : 'none',
          }}
          onMouseDown={interactive ? (e) => handleLayerMouseDown(e, layer) : undefined}
          onClick={interactive ? (e) => {
            e.stopPropagation();
            setSelectedLayerId(layer.id);
          } : undefined}
        />
      );
    });
  };

  return (
    <div className={`relative w-full overflow-hidden ${embedded ? 'rounded-[36px]' : 'min-h-screen'} bg-[#060e20] text-white [font-family:var(--font-body)]`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(89,120,255,0.26),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(255,92,138,0.18),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(68,217,255,0.12),transparent_28%),linear-gradient(180deg,#081121_0%,#060e20_46%,#050b17_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className={`relative w-full flex ${embedded ? 'min-h-[920px]' : 'min-h-screen'} flex-col gap-6 px-4 py-4 md:px-6 md:py-6`}>
        <header className="rounded-[30px] bg-[rgba(20,31,56,0.72)] px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-[22px] md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#89a2ff,#4de4ff)] text-[#071123] shadow-[0_18px_36px_rgba(77,228,255,0.2)]">
                <Icons.Layer />
              </div>
              <div className="min-w-0">
                {layers.length > 0 ? (
                  <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-3">
                    <div className="min-w-0">
                      <h1 className="truncate text-lg font-semibold text-white md:text-xl">
                        {isZh ? 'Layer Editor' : 'Layer Editor'}
                      </h1>
                      <p className="mt-1 text-xs text-cyan-100/58">
                        {layers.length === 1
                          ? (isZh ? '已上传图片，点击 Generate 开始分层' : 'Image uploaded. Click Generate to create layers.')
                          : (isZh ? `${layers.length - 1} 个可编辑图层` : `${layers.length - 1} editable layers`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-cyan-200/60 font-mono px-2 py-0.5 rounded-full bg-white/5 w-fit">
                      {saveStatus === 'saving' && (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Autosaving...</span>
                        </>
                      )}
                      {saveStatus === 'saved' && (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>Autosaved</span>
                        </>
                      )}
                      {saveStatus === 'error' && (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce" />
                          <span>Save Error</span>
                        </>
                      )}
                      {saveStatus === 'idle' && (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                          <span>Saved Local</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="truncate text-lg font-semibold text-white md:text-xl">{brand.title}</h1>
                    <p className="mt-1 text-xs text-cyan-100/65">{brand.tagline}</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-cyan-300/14 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.24)]">
                <Sparkles className="size-3.5" />
                {selectedWorkflow.title}
              </div>
              {[
                { label: workflow.upload, active: layers.length > 0 },
                { label: workflow.decompose, active: layers.length > 1 },
                { label: workflow.edit, active: !!selectedLayer?.maskUrl },
              ].map((step, idx) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    step.active
                      ? 'bg-cyan-300/14 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.24)]'
                      : 'bg-white/5 text-slate-400 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]">{idx + 1}</span>
                  {step.label}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {layers.length > 0 && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/10 transition-all active:scale-95"
                >
                  <Share2 className="size-3.5" />
                  <span>{isZh ? '分享海报' : 'Share Poster'}</span>
                </button>
              )}
              <span className="rounded-full bg-white/6 px-4 py-2 text-xs font-medium text-cyan-100/70">
                {workflow.editingEngine}
              </span>
              {!embedded && (
                <a
                  href="/"
                  className="rounded-full bg-white/6 px-4 py-2 text-sm font-medium text-white/78 transition-colors hover:bg-white/10"
                  title={brand.backHome}
                >
                  {brand.backHome}
                </a>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-[24px] border border-white/10 bg-[#071123]/62 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] xl:flex-row xl:items-center xl:justify-between">
            <div className="px-2">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/44">
                {isZh ? '分层模式' : 'Layering mode'}
              </p>
              <p className="mt-1 text-xs text-slate-300/68">
                {isZh
                  ? '选择普通分层或 Seedream Design Layering，上传图片后点击 Generate。'
                  : 'Choose native layers or Seedream Design Layering, upload an image, then click Generate.'}
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-2 lg:flex-row xl:max-w-5xl">
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                {decompositionModelOptions.map((option) => (
                  <button
                    key={option.model}
                    onClick={() => setAdvancedConfig(prev => ({ ...prev, model: option.model }))}
                    className={`group rounded-2xl border px-3 py-3 text-left transition-all ${
                      advancedConfig.model === option.model
                        ? 'border-cyan-200/45 bg-cyan-300 text-[#071123] shadow-[0_14px_36px_rgba(34,211,238,0.16)]'
                        : 'border-white/8 bg-white/[0.045] text-slate-200 hover:border-cyan-200/22 hover:bg-white/[0.075]'
                    }`}
                    title={option.description}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-black">{option.shortLabel}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${
                        advancedConfig.model === option.model ? 'bg-[#071123]/10 text-[#071123]/70' : 'bg-cyan-300/10 text-cyan-100/58'
                      }`}>
                        {option.badge}
                      </span>
                    </span>
                  <span className={`mt-1 block text-[11px] leading-5 ${
                    advancedConfig.model === option.model ? 'text-[#071123]/68' : 'text-slate-400'
                  }`}>
                    {option.description}
                  </span>
                  <span className={`mt-2 block truncate text-[10px] font-bold ${
                    advancedConfig.model === option.model ? 'text-[#071123]/52' : 'text-cyan-100/42'
                  }`}>
                    {option.idealFor}
                  </span>
                </button>
              ))}
              </div>
              <button
                onClick={handleGenerateLayers}
                disabled={!canGenerateLayers}
                className="flex min-h-[72px] items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#89a2ff,#4de4ff)] px-5 py-3 text-sm font-black text-[#071123] shadow-[0_18px_42px_rgba(77,228,255,0.16)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-none disabled:bg-white/8 disabled:text-slate-500 disabled:shadow-none"
              >
                <Sparkles className="size-4" />
                {isProcessing
                  ? (isZh ? 'Generating' : 'Generating')
                  : layers.length > 1
                    ? (isZh ? '已生成' : 'Generated')
                    : layers.length === 1
                      ? (selectedDecompositionModel.mode === 'design-layering' ? (isZh ? 'Generate Design Layers' : 'Generate Design Layers') : 'Generate')
                      : (isZh ? '先上传图片' : 'Upload first')}
              </button>
            </div>
          </div>
        </header>

        <section className="relative flex flex-1 overflow-hidden rounded-[34px] bg-[radial-gradient(circle_at_20%_0%,rgba(89,120,255,0.20),transparent_30%),radial-gradient(circle_at_82%_8%,rgba(77,228,255,0.12),transparent_26%),linear-gradient(180deg,rgba(9,19,40,0.92),rgba(5,11,23,0.98))] shadow-[0_30px_110px_rgba(0,0,0,0.50)] ring-1 ring-white/10">
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:56px_56px]" />
          <div className="pointer-events-none absolute left-7 top-6 z-20 text-2xl font-semibold tracking-tight text-cyan-100/22">AI</div>

          {layers.length <= 1 ? (
            <div className="relative flex min-h-[calc(100vh-190px)] flex-1 items-center justify-center p-5 md:p-8">
              {baseLayer ? (
                <div
                  ref={mainRef}
                  className="canvas-container relative flex h-full max-h-[calc(100vh-230px)] w-full items-start justify-center overflow-auto p-4"
                >
                  <div
                    className="transition-[width,height] duration-200 ease-out"
                    style={{
                      width: baseLayer.width * zoom,
                      height: baseLayer.height * zoom,
                    }}
                  >
                    <div
                      className="relative overflow-hidden rounded-[22px] bg-[#020817] shadow-[0_34px_100px_rgba(0,0,0,0.72)] ring-1 ring-cyan-100/42"
                      style={{
                        width: baseLayer.width,
                        height: baseLayer.height,
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left',
                      }}
                    >
                      <img
                        src={baseLayer.url}
                        alt={projectName}
                        className="absolute inset-0 h-full w-full object-cover"
                        draggable={false}
                      />
                      {!isProcessing && (
                        <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/12 bg-[#071123]/82 p-2 backdrop-blur-xl">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/16"
                          >
                            {isZh ? '更换图片' : 'Change image'}
                          </button>
                          <button
                            onClick={handleGenerateLayers}
                            disabled={!canGenerateLayers}
                            className="rounded-xl bg-cyan-300 px-5 py-2 text-xs font-black text-[#071123] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {selectedDecompositionModel.mode === 'design-layering'
                              ? (isZh ? 'Generate 设计图层' : 'Generate design layers')
                              : (isZh ? 'Generate 分层' : 'Generate layers')}
                          </button>
                        </div>
                      )}
                      {isProcessing && (
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="layer-scan-line absolute inset-x-[-12%] top-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(178,255,245,0.18),rgba(255,255,255,0.68),rgba(114,255,238,0.22),transparent)] blur-[1px]" />
                          <div className="layer-scan-grid absolute inset-0 opacity-35" />
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/18 bg-black/72 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/86 backdrop-blur-md">
                            {selectedDecompositionModel.mode === 'design-layering'
                              ? (isZh ? 'Seedream 正在理解设计图层' : 'Seedream understanding design layers')
                              : (isZh ? 'AI 正在扫描图层' : 'AI scanning layers')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex min-h-[460px] w-full max-w-3xl flex-col items-center justify-center rounded-[30px] border border-white/10 bg-[#071123]/58 px-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-all hover:border-cyan-200/24 hover:bg-[#0b152b]/72"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#89a2ff,#4de4ff)] text-[#071123] transition-transform group-hover:scale-105">
                    <UploadCloud className="size-7" />
                  </span>
                  <span className="mt-7 text-[11px] font-black uppercase tracking-[0.36em] text-cyan-100/52">Image Layered AI</span>
                  <span className="mt-3 max-w-xl text-3xl font-semibold leading-tight text-white md:text-5xl">
                    {isZh ? '上传图片，自动拆成可编辑图层' : 'Upload an image, get editable layers'}
                  </span>
                  <span className="mt-4 max-w-lg text-sm leading-7 text-slate-300/70">
                    {isZh ? '处理时会在图片上显示扫描动画，完成后进入左侧图层、右侧画布的编辑工作台。' : 'The image is scanned while the model works, then opens as a layer list beside the canvas.'}
                  </span>
                  <span className="mt-5 rounded-full border border-cyan-200/18 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-100/78">
                    {isZh ? `当前模型：${selectedDecompositionModel.label}` : `Model: ${selectedDecompositionModel.label}`}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid min-h-[calc(100vh-190px)] flex-1 gap-4 p-4 md:p-5 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
              <aside className="flex min-h-0 flex-col gap-3 rounded-[28px] border border-white/10 bg-[#071123]/72 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-cyan-100/42">{isZh ? '图层' : 'Layers'}</p>
                    <h2 className="mt-1 max-w-[180px] truncate text-base font-semibold text-white">{isZh ? '图层列表' : 'Layer Stack'}</h2>
                    <p className="mt-1 text-[10px] font-semibold text-cyan-100/46">{selectedDecompositionModel.shortLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full bg-white/8 px-3 py-2 text-[11px] font-bold text-cyan-50/78 transition-colors hover:bg-white/14"
                    >
                      {isZh ? '换图' : 'Change'}
                    </button>
                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      className="rounded-full bg-cyan-300 px-3 py-2 text-[11px] font-black text-[#071123] transition-transform active:scale-95"
                    >
                      {isZh ? '导出' : 'Export'}
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-1.5 overflow-auto pr-1">
                  {layers.slice().sort((a, b) => b.zIndex - a.zIndex).map((layer, index) => {
                    const isSelected = selectedLayerId === layer.id;
                    const label = layer.name || `Layer ${layers.length - index}`;

                    return (
                      <div
                        key={layer.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedLayerId(layer.id);
                          if (!layer.visible) {
                            setLayers(prev => prev.map(item => item.id === layer.id ? { ...item, visible: true } : item));
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedLayerId(layer.id);
                          }
                        }}
                        className={`flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-left transition-all ${
                          isSelected
                            ? 'bg-white text-[#071123] shadow-[0_12px_30px_rgba(34,211,238,0.10)]'
                            : 'bg-white/[0.065] text-slate-200 hover:bg-white/[0.10]'
                        }`}
                      >
                        <div className={`h-11 w-11 shrink-0 overflow-hidden rounded-xl ${isSelected ? 'bg-black/8' : 'bg-black/28'}`}>
                          <img src={layer.url} alt={label} className="h-full w-full object-contain" draggable={false} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold tracking-tight">{label}</p>
                          <p className="mt-0.5 truncate text-[9px] font-black uppercase tracking-[0.14em] opacity-50">
                            {layer.maskUrl ? (isZh ? '可编辑蒙版' : 'editable mask') : (isZh ? '图像图层' : 'image layer')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setLayers(prev => prev.map(item => item.id === layer.id ? { ...item, visible: !item.visible } : item));
                          }}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isSelected ? 'bg-[#071123]/8 text-[#071123]' : 'bg-white/7 text-slate-300/64'
                          }`}
                          aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
                        >
                          {layer.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {selectedLayer && (
                  <div className="rounded-[22px] border border-white/10 bg-[#0b152b]/78 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{selectedLayer.name}</p>
                        <p className="mt-1 text-[11px] text-cyan-100/42">{isZh ? '对当前图层进行局部修改' : 'Edit the selected layer only'}</p>
                      </div>
                      <div className="flex rounded-full bg-black/28 p-1">
                        {[
                          { tool: 'select' as ToolType, icon: MousePointer, label: 'Select' },
                          { tool: 'recolor' as ToolType, icon: Palette, label: 'Color' },
                          { tool: 'replace' as ToolType, icon: Wand2, label: 'Replace' },
                          { tool: 'remove' as ToolType, icon: X, label: 'Remove' },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.tool}
                              onClick={() => setActiveTool(item.tool)}
                              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                                activeTool === item.tool ? 'bg-white text-black' : 'text-white/56 hover:bg-white/10 hover:text-white'
                              }`}
                              title={item.label}
                            >
                              <Icon className="size-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3 rounded-2xl bg-black/26 px-3 py-2.5">
                      <SlidersHorizontal className="size-4 text-white/52" />
                      <span className="text-xs font-bold text-white/52">{isZh ? '透明度' : 'Opacity'}</span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={Math.round((selectedLayer.opacity ?? 1) * 100)}
                        onChange={(event) => {
                          const opacity = Number(event.target.value) / 100;
                          setLayers(prev => prev.map(layer => layer.id === selectedLayer.id ? { ...layer, opacity } : layer));
                        }}
                        className="h-1 flex-1 accent-white"
                      />
                      <span className="w-9 text-right text-xs font-bold text-white/72">{Math.round((selectedLayer.opacity ?? 1) * 100)}%</span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        { label: isZh ? '更暖' : 'Warmer', prompt: 'Make this selected layer warmer and more cinematic.' },
                        { label: isZh ? '更亮' : 'Brighter', prompt: 'Brighten this selected layer while preserving its details.' },
                        { label: isZh ? '高级感' : 'Premium', prompt: 'Make this selected layer look more premium, polished, and advertising-ready.' },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          onClick={() => {
                            setActiveTool('recolor');
                            setEditInstruction(chip.prompt);
                          }}
                          className="rounded-xl bg-white/8 px-3 py-2 text-xs font-bold text-white/70 transition-colors hover:bg-white/14 hover:text-white"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={editInstruction}
                      onChange={(event) => setEditInstruction(event.target.value)}
                      placeholder={editPlaceholder}
                      className="mt-3 min-h-[76px] w-full resize-none rounded-2xl border border-white/10 bg-[#071123] px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-cyan-200/28"
                    />

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleEditAction(editInstruction || editPlaceholder)}
                        disabled={isProcessing}
                        className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-black transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (isZh ? '处理中' : 'Working') : (isZh ? '生成修改' : 'Generate Edit')}
                      </button>
                      <button
                        onClick={() => handleDownloadLayer(selectedLayer.id)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/16"
                      >
                        <Download className="size-4" />
                        {isZh ? '提取' : 'Extract'}
                      </button>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleDuplicateLayer(selectedLayer.id)}
                        className="flex items-center justify-center gap-1 rounded-xl bg-white/8 px-3 py-2 text-xs font-bold text-white/68 hover:bg-white/14"
                      >
                        <Copy className="size-3.5" />
                        {isZh ? '复制' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleSoloLayer(selectedLayer.id)}
                        className="rounded-xl bg-white/8 px-3 py-2 text-xs font-bold text-white/68 hover:bg-white/14"
                      >
                        Solo
                      </button>
                      <button
                        onClick={handleShowAllLayers}
                        className="rounded-xl bg-white/8 px-3 py-2 text-xs font-bold text-white/68 hover:bg-white/14"
                      >
                        {isZh ? '显示全部' : 'Show All'}
                      </button>
                    </div>
                  </div>
                )}
              </aside>

              <main
                ref={mainRef}
                onMouseDown={handleMouseDown}
                className={`canvas-container relative flex min-h-[520px] items-start justify-center overflow-auto rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#0b152b,#070d1b)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${isDraggingCanvas ? 'cursor-grabbing' : activeTool === 'move' || isSpacePressed ? 'cursor-grab' : 'cursor-default'}`}
              >
                <div className="pointer-events-none absolute left-5 top-4 z-20 rounded-full border border-white/10 bg-black/26 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/56">
                  {isZh ? '预览' : 'Preview'}
                </div>
                {baseLayer && (
                  <div
                    className="transition-[width,height] duration-200 ease-out"
                    style={{
                      width: baseLayer.width * zoom,
                      height: baseLayer.height * zoom,
                    }}
                  >
                    <div
                      className="relative overflow-hidden rounded-[22px] bg-[#020817] shadow-[0_34px_100px_rgba(0,0,0,0.72)] ring-1 ring-cyan-100/42"
                      style={{
                        width: baseLayer.width,
                        height: baseLayer.height,
                        transform: `translate(${dragOffset.x * zoom}px, ${dragOffset.y * zoom}px) scale(${zoom})`,
                        transformOrigin: 'top left',
                      }}
                    >
                      {renderLayerStack(true)}
                      {isProcessing && (
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="layer-scan-line absolute inset-x-[-12%] top-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(178,255,245,0.18),rgba(255,255,255,0.68),rgba(114,255,238,0.22),transparent)] blur-[1px]" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </main>
            </div>
          )}

          <style jsx>{`
            .layer-scan-line {
              animation: layer-scan 1.55s ease-in-out infinite;
            }

            .layer-scan-grid {
              background-image:
                linear-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.16) 1px, transparent 1px);
              background-size: 34px 34px;
            }

            @keyframes layer-scan {
              0% {
                transform: translateY(-120%);
                opacity: 0.2;
              }
              45% {
                opacity: 1;
              }
              100% {
                transform: translateY(720%);
                opacity: 0.2;
              }
            }
          `}</style>
        </section>

        <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*"
      />

      <CrookedExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isProcessing={isProcessing}
        initialWidth={layers[0]?.width || 1024}
        initialHeight={layers[0]?.height || 1024}
      />

      {/* Guest Conversion Modal */}
      <CrookedUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        type={upgradeModalType}
        remainingUploads={getRemainingUploads()}
      />

      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-white/10 bg-[#0d1527]/90 p-6 shadow-[0_32px_96px_rgba(0,0,0,0.6)] backdrop-blur-[24px]">
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <Share2 className="size-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isZh ? '分享您的创作空间' : 'Share Your Workspace'}
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                {isZh
                  ? '生成一个公开只读链接，其他人可以查看您的图层，并一键克隆到他们自己的工作区。'
                  : 'Generate a public, view-only link. Others can view your layers and clone (Remix) them into their own workspace.'}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/50">
                  {isZh ? '分享地址' : 'Share Link'}
                </label>
                <div className="mt-1.5 flex gap-2 rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
                  <input
                    type="text"
                    readOnly
                    value={projectId ? `${window.location.origin}/${params?.locale || 'en'}/share/${projectId}` : ''}
                    className="w-full bg-transparent px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyShareLink}
                    className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-500"
                  >
                    {isZh ? '复制' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 flex gap-3">
                <Sparkles className="size-5 shrink-0 text-cyan-400 animate-pulse" />
                <div className="text-left text-xs leading-relaxed text-slate-400">
                  <p className="font-bold text-slate-200">
                    {isZh ? '什么是裂变 Remix？' : 'What is a Remix?'}
                  </p>
                  <p className="mt-1">
                    {isZh
                      ? '访客可以通过此链接查看您的每一层设计、开启或隐藏图层，然后点击“克隆海报”复制到自己的编辑器中继续创作。这对于传播非常有效！'
                      : 'Visitors will see a high-end interactive canvas. They can toggle layer visibilities and click "Remix Poster" to start editing. Great for viral loops!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExitIntent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-cyan-500/20 bg-[#070e1c]/90 p-8 shadow-[0_32px_96px_rgba(6,182,212,0.15)] backdrop-blur-[24px]">
            <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl animate-pulse" />
            <button
              onClick={() => {
                setShowExitIntent(false);
                sessionStorage.setItem('layered_exit_intent_dismissed', 'true');
              }}
              className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                <Mail className="size-7" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {isZh ? '🎁 挽留礼包：带走您的海报图层' : '🎁 Wait! Keep Your Layers & Master AI Posters'}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {isZh
                  ? '这是一个退出前的保存提醒。留下邮箱即可获得 5 个高清导出额度和 AI 海报提示词手册，方便之后继续完成这张图。'
                  : 'This is an exit reminder. Leave your email to get 5 HD export credits and our AI poster prompt guide so you can continue this image later.'}
              </p>
            </div>

            <form onSubmit={handleExitIntentSubmit} className="mt-6 space-y-3">
              <input
                type="email"
                required
                value={exitIntentEmail}
                onChange={(e) => setExitIntentEmail(e.target.value)}
                placeholder={isZh ? '输入您的电子邮箱' : 'Enter your email address'}
                className="w-full rounded-xl border border-cyan-100/20 bg-white px-4 py-3 text-sm font-semibold text-[#071123] placeholder:text-slate-500 shadow-[inset_0_1px_2px_rgba(15,23,42,0.10)] ring-1 ring-transparent focus:border-cyan-400 focus:outline-none focus:ring-cyan-500/20"
              />
              <button
                type="submit"
                disabled={exitIntentSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {exitIntentSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isZh ? '正在提交...' : 'Submitting...'}
                  </span>
                ) : (
                  <span>{isZh ? '订阅并获取礼包' : 'Subscribe & Claim Gift'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {onboardingStep !== null && onboardingStep >= 0 && onboardingStep < 4 && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-[24px] border border-cyan-500/20 bg-[#0d1627]/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              {isZh ? `步骤 ${onboardingStep + 1} / 4` : `Step ${onboardingStep + 1} / 4`}
            </span>
            <button
              onClick={handleSkipOnboarding}
              className="text-[10px] text-gray-500 hover:text-white"
            >
              {isZh ? '跳过' : 'Skip Tour'}
            </button>
          </div>

          <h4 className="mt-2 text-base font-bold text-white">
            {tourSteps[onboardingStep].title}
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            {tourSteps[onboardingStep].content}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    s === onboardingStep ? 'bg-cyan-400' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleNextOnboardingStep}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-[#071123] transition-all hover:bg-cyan-400 active:scale-95 flex items-center gap-1"
            >
              <span>{onboardingStep === 3 ? (isZh ? '完成' : 'Finish') : (isZh ? '下一步' : 'Next')}</span>
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default CrookedApp;
