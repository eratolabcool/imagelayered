'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useSession } from '@/core/auth/client';
import { Share2, Sparkles, X, Mail, CheckCircle, Lightbulb, MousePointer, Layers as LayersIcon, Palette, RefreshCw } from 'lucide-react';
import { Layer, ToolType, ExportSettings, AdvancedDecompositionConfig, WorkflowPresetId } from '../types';
import CrookedExportModal from './CrookedExportModal';
import CrookedUpgradeModal from './CrookedUpgradeModal';
import CollapsibleLeftSidebar from './CollapsibleLeftSidebar';
import CollapsibleRightSidebar from './CollapsibleRightSidebar';
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

const CrookedApp: React.FC<CrookedAppProps> = ({ embedded = false, initialImage = null }) => {
  const copy = useCrookedCopy();
  const { brand, buttons, empty, editBar, workspace, workflow } = copy;
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
  const [viewMode, setViewMode] = useState<'result' | 'compare'>('result');
  const [comparePosition, setComparePosition] = useState(52);

  // Keep the decomposition controls visible by default; this is the primary action.
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const isZh = params?.locale === 'zh';
  const projectIdQuery = searchParams ? searchParams.get('project') : null;
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    setIsLeftSidebarCollapsed(false);
  }, []);

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
    if (subscribed || isLoggedIn) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 20) {
        if (layers.length > 0 && !showExitIntent) {
          setShowExitIntent(true);
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
    const isMobile = window.innerWidth < 768;

    // 根据侧边栏实际状态计算宽度
    const leftSidebarWidth = isLeftSidebarCollapsed ? 64 : 320;  // w-16 vs w-80
    const rightSidebarWidth = isRightSidebarCollapsed ? 64 : 384; // w-16 vs w-96
    const gaps = 16 * 2; // gap-4 on both sides
    const sidebarWidth = leftSidebarWidth + rightSidebarWidth + gaps;

    const headerHeight = 100;
    const padding = 60; // 减小padding，给图片更多空间
    const availableWidth = isMobile
      ? window.innerWidth - 40
      : window.innerWidth - sidebarWidth - padding;
    const availableHeight = window.innerHeight - headerHeight - padding;

    const scaleX = availableWidth / width;
    const scaleY = availableHeight / height;
    const initialScale = Math.min(scaleX, scaleY, 0.75); // 更保守的缩放

    console.log('[placeImageLayer] Layout calculation:', {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      leftSidebarWidth,
      rightSidebarWidth,
      sidebarWidth,
      availableWidth,
      availableHeight,
      imageWidth: width,
      imageHeight: height,
      scaleX,
      scaleY,
      initialScale,
      isMobile,
      leftCollapsed: isLeftSidebarCollapsed,
      rightCollapsed: isRightSidebarCollapsed
    });

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
    setZoom(initialScale);
    setDragOffset({ x: 0, y: 0 });
  }, []); // 移除依赖，避免侧边栏状态变化时重复创建

  useEffect(() => {
    if (initialImage && layers.length === 0) {
      placeImageLayer(initialImage.base64, initialImage.width, initialImage.height, initialImage.name || 'Main Canvas');
    }
  }, [initialImage, layers.length, placeImageLayer]);

  // 监听侧边栏状态变化，重新计算图片缩放，确保始终在可视区域内
  useEffect(() => {
    if (layers.length > 0) {
      const isMobile = window.innerWidth < 768;
      const leftSidebarWidth = isLeftSidebarCollapsed ? 64 : 320;
      const rightSidebarWidth = isRightSidebarCollapsed ? 64 : 384;
      const gaps = 16 * 2;
      const sidebarWidth = leftSidebarWidth + rightSidebarWidth + gaps;
      const padding = 60;
      const headerHeight = 100;
      const availableWidth = isMobile
        ? window.innerWidth - 40
        : window.innerWidth - sidebarWidth - padding;
      const availableHeight = window.innerHeight - headerHeight - padding;

      const baseLayer = layers[0];
      const scaleX = availableWidth / baseLayer.width;
      const scaleY = availableHeight / baseLayer.height;
      const newScale = Math.min(scaleX, scaleY, 0.75);

      // 只在缩放比例差异较大时才调整，避免频繁重绘
      if (Math.abs(newScale - zoom) > 0.05) {
        setZoom(newScale);
        setDragOffset({ x: 0, y: 0 });
      }
    }
  }, [isLeftSidebarCollapsed, isRightSidebarCollapsed, layers, zoom]);

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

      // Call AI generate for decomposition using fal.ai qwen-image-layered
      // Build options object with advanced config parameters
      const requestOptions: any = {
        image_input: [imageUrl],
        num_layers: count > 0 ? count : 4,
        num_inference_steps: advancedConfig.inferenceSteps,
        guidance_scale: advancedConfig.guidanceScale,
        enable_safety_checker: true,
        sync_mode: true, // Use synchronous mode - qwen-image-layered supports this
      };

      // Add optional parameters if provided
      if (advancedConfig.prompt) {
        requestOptions.prompt = advancedConfig.prompt;
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
          provider: 'fal',
          model: advancedConfig.model,
          prompt: count > 0
            ? `Decompose this image into ${count} layers`
            : 'Decompose this image into layers',
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
      setIsLeftSidebarCollapsed(false);
      setIsRightSidebarCollapsed(true);
    } else {
      setOnboardingStep(nextStep);
      if (nextStep === 1) {
        setIsLeftSidebarCollapsed(true);
        setIsRightSidebarCollapsed(true);
      } else if (nextStep === 2) {
        setIsLeftSidebarCollapsed(true);
        setIsRightSidebarCollapsed(false);
      } else if (nextStep === 3) {
        setIsLeftSidebarCollapsed(true);
        setIsRightSidebarCollapsed(true);
      }
    }
  };

  const handleSkipOnboarding = () => {
    setOnboardingStep(null);
    localStorage.setItem('layered_tour_completed', 'true');
    setIsLeftSidebarCollapsed(false);
    setIsRightSidebarCollapsed(true);
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
                  <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3">
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="max-w-[150px] rounded-xl border border-white/10 bg-[#071123] px-3 py-2 text-base font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-colors placeholder:text-slate-500 hover:bg-[#0b152b] focus:border-cyan-300/45 focus:bg-[#0b152b] focus:ring-4 focus:ring-cyan-300/10 md:max-w-[220px] md:text-lg"
                      placeholder="My Poster"
                    />
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
        </header>

        <section
          className="flex flex-1 flex-col gap-4 lg:grid lg:h-[calc(100vh-156px)] lg:min-h-[640px]"
          style={{
            gridTemplateColumns: `${isLeftSidebarCollapsed ? '72px' : '320px'} minmax(0, 1fr) ${isRightSidebarCollapsed ? '72px' : '400px'}`
          }}
        >
          <aside className="z-20 min-h-0 max-lg:order-1 max-lg:w-full">
            <CollapsibleLeftSidebar
              isCollapsed={isLeftSidebarCollapsed}
              onToggle={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
              layers={layers}
              layerCount={layerCount}
              setLayerCount={setLayerCount}
              advancedConfig={advancedConfig}
              setAdvancedConfig={setAdvancedConfig}
              fileInputRef={fileInputRef}
              onUploadClick={() => fileInputRef.current?.click()}
              onDecompose={smartDecompose}
              onExport={() => setIsExportModalOpen(true)}
              isProcessing={isProcessing}
              canDecompose={layers.length > 0}
              canExport={layers.length > 0}
              workflowPresets={workflowPresets}
              selectedWorkflowId={selectedWorkflowId}
              onSelectWorkflow={handleSelectWorkflow}
            />
          </aside>

          <main
            className="min-h-0 min-w-0 rounded-[34px] bg-[rgba(9,19,40,0.78)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)] ring-1 ring-white/8 backdrop-blur-[22px] transition-all duration-300 md:p-6 max-lg:order-2"
          >
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-[#0f172a]/72 px-4 py-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.38em] text-cyan-100/55">Live workflow studio</p>
                  <p className="mt-2 text-sm font-semibold text-slate-200">
                    {selectedLayer ? selectedLayer.name : workspace.uploadHint}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {layers.length > 0 && (
                    <div className="flex rounded-full bg-white/7 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                      {[
                        { id: 'result' as const, label: isZh ? '结果' : 'Result' },
                        { id: 'compare' as const, label: isZh ? '前后对比' : 'Before / After' },
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setViewMode(mode.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-black transition-colors ${
                            viewMode === mode.id
                              ? 'bg-cyan-300 text-[#071123]'
                              : 'text-slate-300 hover:bg-white/8'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedLayer && (
                    <div className={`rounded-full px-3 py-2 text-xs font-semibold ${
                      selectedLayer.maskUrl
                        ? 'bg-emerald-400/12 text-emerald-100 shadow-[inset_0_0_0_1px_rgba(110,231,183,0.22)]'
                        : 'bg-white/6 text-slate-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                    }`}>
                      {selectedLayer.maskUrl ? workflow.maskReady : workflow.noMask}
                    </div>
                  )}
                  <div className="rounded-full bg-cyan-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-100">
                    {selectedWorkflow.outcome}
                  </div>
                </div>
              </div>

              <div
                ref={mainRef}
                onMouseDown={handleMouseDown}
                className={`relative flex h-[520px] shrink-0 items-center justify-center overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_top,rgba(95,116,255,0.16),transparent_28%),linear-gradient(180deg,#0c1730,#091328)] md:h-[560px] lg:h-auto lg:min-h-0 lg:flex-1 ${isDraggingCanvas ? 'cursor-grabbing' : activeTool === 'move' || isSpacePressed ? 'cursor-grab' : 'cursor-default'}`}
              >
                <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:48px_48px]" />
                <div
                  className="relative flex items-center justify-center"
                >
                  <div
                    className="transition-transform duration-300 ease-out"
                    style={{
                      transform: `scale(${zoom}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                      transformOrigin: 'center center',
                    }}
                  >
                  {baseLayer ? (
                    <div
                      className="relative overflow-hidden rounded-[26px] bg-white shadow-[0_36px_120px_rgba(0,0,0,0.45)]"
                      style={{ width: baseLayer.width, height: baseLayer.height }}
                    >
                      {viewMode === 'compare' ? (
                        <>
                          <img
                            src={baseLayer.url}
                            alt="Before image"
                            className="absolute inset-0 h-full w-full object-cover"
                            draggable={false}
                          />
                          <div
                            className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-cyan-200"
                            style={{ width: `${comparePosition}%` }}
                          >
                            <div
                              className="relative h-full"
                              style={{ width: baseLayer.width, height: baseLayer.height }}
                            >
                              {renderLayerStack(false)}
                            </div>
                          </div>
                          <div
                            className="pointer-events-none absolute inset-y-0 flex items-center"
                            style={{ left: `${comparePosition}%`, transform: 'translateX(-50%)' }}
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-[#071123]/82 text-[10px] font-black uppercase tracking-[0.08em] text-cyan-100 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                              Drag
                            </div>
                          </div>
                          <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/70 px-2.5 py-1 text-xs font-black text-white">
                            {isZh ? '结果' : 'After'}
                          </div>
                          <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/70 px-2.5 py-1 text-xs font-black text-white">
                            {isZh ? '原图' : 'Before'}
                          </div>
                          <input
                            type="range"
                            min="8"
                            max="92"
                            value={comparePosition}
                            onMouseDown={(event) => event.stopPropagation()}
                            onTouchStart={(event) => event.stopPropagation()}
                            onChange={(event) => setComparePosition(Number(event.target.value))}
                            className="absolute inset-x-6 bottom-5 z-30 h-1 cursor-ew-resize appearance-none rounded-full bg-white/30 accent-cyan-300"
                            aria-label="Before after comparison position"
                          />
                        </>
                      ) : (
                        renderLayerStack(true)
                      )}
                    </div>
                  ) : (
                    <div className="relative flex w-full max-w-4xl flex-col gap-5 rounded-[30px] bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:p-7">
                      <div className="grid gap-5 md:grid-cols-[0.92fr_1.08fr] md:items-center">
                        <div className="text-left">
                          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,rgba(97,120,255,0.32),rgba(77,228,255,0.18))]">
                            <Icons.Upload />
                          </div>
                          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/60">
                            Workflow first
                          </p>
                          <h3 className="mt-2 text-3xl font-bold leading-tight text-white [font-family:var(--font-display)]">
                            Choose the result, then upload the image
                          </h3>
                          <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                            {selectedWorkflow.goal} The editor will set the layer count,
                            Qwen prompt, and suggested edit prompts for that workflow.
                          </p>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-5 rounded-full bg-[linear-gradient(135deg,#89a2ff,#4de4ff)] px-5 py-3 text-sm font-bold text-[#071123]"
                          >
                            {buttons.changeImage}
                          </button>
                        </div>

                        <div className="grid gap-2">
                          {workflowPresets.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => handleSelectWorkflow(preset.id)}
                              className={`rounded-2xl border p-4 text-left transition-all ${
                                selectedWorkflowId === preset.id
                                  ? 'border-cyan-300/45 bg-cyan-300/12 text-white shadow-[0_14px_34px_rgba(34,211,238,0.08)]'
                                  : 'border-white/8 bg-white/5 text-slate-300 hover:border-white/14 hover:bg-white/8'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-black">{preset.title}</p>
                                  <p className="mt-1 text-xs leading-5 text-slate-400">{preset.subtitle}</p>
                                </div>
                                <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-black tabular-nums text-cyan-100">
                                  {preset.layerCount} layers
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-2 border-t border-white/10 pt-4 md:grid-cols-4">
                        {selectedWorkflow.steps.map((step, index) => (
                          <div key={step} className="rounded-2xl bg-black/18 p-3 text-left">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-300/14 text-xs font-black text-cyan-100">
                              {index + 1}
                            </span>
                            <p className="mt-3 text-xs font-semibold leading-5 text-slate-300">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="z-20 min-h-0 max-lg:order-3 max-lg:w-full">
            <CollapsibleRightSidebar
            isCollapsed={isRightSidebarCollapsed}
            onToggle={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
            layers={layers}
            selectedLayerId={selectedLayerId}
            onToggleLayerVisibility={(id) => {
              setLayers(prev => prev.map(l =>
                l.id === id ? { ...l, visible: !l.visible } : l
              ));
            }}
            onDeleteLayer={(id) => {
              setLayers(prev => prev.filter(l => l.id !== id));
              if (selectedLayerId === id) {
                setSelectedLayerId(null);
              }
            }}
            onSelectLayer={(id) => {
              setSelectedLayerId(id);
              const layer = layers.find(l => l.id === id);
              if (layer && !layer.visible) {
                // Auto-show layer when selected
                setLayers(prev => prev.map(l =>
                  l.id === id ? { ...l, visible: true } : l
                ));
              }
            }}
            onUpdateLayer={(id, updates) => {
              setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
            }}
            onDuplicateLayer={handleDuplicateLayer}
            onSoloLayer={handleSoloLayer}
            onShowAllLayers={handleShowAllLayers}
            onDownloadLayer={handleDownloadLayer}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            editInstruction={editInstruction}
            setEditInstruction={setEditInstruction}
            onGenerateEdit={() => handleEditAction(editInstruction || editPlaceholder)}
            isProcessing={isProcessing}
            workflowPreset={selectedWorkflow}
          />
          </aside>

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
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {isZh
                  ? '不要让您的分层付之东流！订阅我们的 newsletter，免费获得 5 个高清导出额度 + 20+ 海报 AI 提示词终极手册。'
                  : 'Do not let your layers fade away! Sign up to our newsletter for 5 extra HD exports & our ultimate Guide (20+ premium Poster Prompts).'}
              </p>
            </div>

            <form onSubmit={handleExitIntentSubmit} className="mt-6 space-y-3">
              <input
                type="email"
                required
                value={exitIntentEmail}
                onChange={(e) => setExitIntentEmail(e.target.value)}
                placeholder={isZh ? '输入您的电子邮箱' : 'Enter your email address'}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none ring-1 ring-transparent focus:ring-cyan-500/20"
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

      {isProcessing && !isExportModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="w-24 h-24 relative">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-lg font-black text-white tracking-[0.3em] uppercase italic">{buttons.processingOverlayTitle}</p>
            <p className="text-sm text-gray-400 mt-2 font-mono uppercase tracking-widest">{buttons.processingOverlaySubtitle}</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default CrookedApp;
