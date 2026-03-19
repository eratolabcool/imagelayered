'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Layer, ToolType, ExportSettings, AdvancedDecompositionConfig } from '../types';
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
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/core/i18n/navigation';
import { PreparedImagePayload, prepareImageFile } from '../lib/image-upload';

interface CrookedAppProps {
  embedded?: boolean;
  initialImage?: PreparedImagePayload | null;
}

const CrookedApp: React.FC<CrookedAppProps> = ({ embedded = false, initialImage = null }) => {
  const copy = useCrookedCopy();
  const { brand, buttons, empty, editBar } = copy;
  const tb = copy.toolbar;
  const adv = copy.advanced;
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const toggleLocale = useCallback(() => {
    const next = locale?.startsWith('zh') ? 'en' : 'zh';
    router.replace(pathname, { locale: next });
  }, [locale, router, pathname]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const [layerDragOffset, setLayerDragOffset] = useState({ x: 0, y: 0 });
  const [layerCount, setLayerCount] = useState<number>(5);
  const [collapsedLayerIds, setCollapsedLayerIds] = useState<Set<string>>(new Set());
  const [editInstruction, setEditInstruction] = useState('');

  // Guest conversion modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalType, setUpgradeModalType] = useState<'save' | 'export' | 'limit' | 'login'>('login');

  // Theme state
  const [isLightTheme, setIsLightTheme] = useState(true);

  // Advanced Settings State
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedDecompositionConfig>({
    prompt: '',
    negativePrompt: '',
    seed: 42,
    randomizeSeed: true,
    enableCfgNormalization: true,
    autoCaptionLanguageEn: true,
    guidanceScale: 7.5,
    inferenceSteps: 30,
    model: 'fal-ai/qwen-image-layered'
  });

  const mainRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editPlaceholder = React.useMemo(() => {
    if (activeTool === 'recolor') return editBar.recolorPlaceholder;
    if (activeTool === 'replace') return editBar.replacePlaceholder;
    if (activeTool === 'remove') return editBar.removePlaceholder;
    return editBar.defaultPlaceholder;
  }, [activeTool, editBar]);
  const placeImageLayer = useCallback((base64: string, width: number, height: number, name: string = 'Main Canvas') => {
    const isMobile = window.innerWidth < 768;
    const availableWidth = isMobile ? window.innerWidth - 20 : window.innerWidth - 450;
    const availableHeight = window.innerHeight - 200;

    const scaleX = availableWidth / width;
    const scaleY = availableHeight / height;
    const initialScale = Math.min(scaleX, scaleY, 0.9);

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
  }, []);

  useEffect(() => {
    if (initialImage && layers.length === 0) {
      placeImageLayer(initialImage.base64, initialImage.width, initialImage.height, initialImage.name || 'Main Canvas');
    }
  }, [initialImage, layers.length, placeImageLayer]);

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
        const POLL_INTERVAL = 2000; // 2 seconds
        const MAX_POLL_TIME = 300000; // 5 minutes max (image decomposition can take a while)
        const startTime = Date.now();
        let pollCount = 0;

        while (Date.now() - startTime < MAX_POLL_TIME) {
          pollCount++;
          const elapsed = Date.now() - startTime;

          // Wait before polling
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

          console.log(`[smartDecompose] Poll #${pollCount} (${Math.floor(elapsed / 1000)}s elapsed)`);

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
        return new Promise((resolve, reject) => {
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

      // Create a layer for each generated image with correct dimensions
      const newLayers: Layer[] = layerImages.map((img: any, idx: number) => {
        const dims = layerDimensions[idx];
        return {
          id: crypto.randomUUID(),
          name: `${target.name} - Layer ${idx + 1}`,
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

      // Call AI generate for editing
      const genRes = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType: 'image',
          scene,
          provider: 'openrouter',
          model: 'qwen/qwen3-vl-8b-instruct',
          prompt: instruction,
          options: {
            image_input: [imageUrl],
          },
        }),
      });

      const genData = await genRes.json();
      if (genData.code !== 0) {
        throw new Error(genData.message || 'Edit failed');
      }

      // Extract result image
      const taskInfo = genData.data.taskInfo ? JSON.parse(genData.data.taskInfo) : null;
      const newUrl = taskInfo?.images?.[0]?.imageUrl;

      if (newUrl) {
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

  const handleUpdateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleDuplicateLayer = (id: string) => {
    const target = layers.find(l => l.id === id);
    if (!target) return;
    const newLayer: Layer = {
      ...target,
      id: crypto.randomUUID(),
      name: `${target.name} Copy`,
      x: target.x + 20,
      y: target.y + 20,
      zIndex: layers.length + 1
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
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
        let fileName = `QwenImageLayered-export-${targetWidth}x${targetHeight}-${Date.now()}.png`;

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

  const removeLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

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

  return (
    <div className={`relative overflow-hidden ${embedded ? 'min-h-[900px] rounded-[32px]' : 'min-h-screen'} ${isLightTheme ? 'bg-[#f6f1e8] text-slate-900' : 'bg-[#0e1420] text-white'}`}>
      <div className={`pointer-events-none absolute inset-0 ${isLightTheme ? 'bg-[radial-gradient(circle_at_top_left,rgba(240,122,61,0.18),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(47,109,246,0.14),transparent_24%),linear-gradient(180deg,#fffdf8,#f6f1e8)]' : 'bg-[radial-gradient(circle_at_top_left,rgba(240,122,61,0.14),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(47,109,246,0.16),transparent_22%),linear-gradient(180deg,#101722,#0c121c)]'}`} />
      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
        <header className={`rounded-[30px] border px-5 py-4 md:px-6 ${isLightTheme ? 'border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]' : 'border-white/10 bg-[#131b28] shadow-[0_18px_50px_rgba(0,0,0,0.32)]'}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Icons.CrookedLogo />
              <div>
                <p className={`text-xs uppercase tracking-[0.24em] ${isLightTheme ? 'text-slate-500' : 'text-blue-200/80'}`}>{brand.tagline}</p>
                <h1 className={`text-2xl font-black tracking-tight ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>{brand.title}</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!embedded && (
                <a
                  href="/"
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${isLightTheme ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
                  title={brand.backHome}
                >
                  {brand.backHome}
                </a>
              )}
              <button
                onClick={toggleLocale}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${isLightTheme ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
              >
                {locale?.startsWith('zh') ? 'EN' : '中文'}
              </button>
              <button
                onClick={() => setIsLightTheme((value) => !value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${isLightTheme ? 'border-slate-200 bg-slate-900 text-white hover:bg-slate-700' : 'border-white/10 bg-white text-slate-900 hover:bg-slate-100'}`}
              >
                {isLightTheme ? tb.darkMode : tb.lightMode}
              </button>
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-6 lg:grid-cols-[430px_minmax(0,1fr)]">
          <aside className={`rounded-[32px] border p-5 md:p-6 ${isLightTheme ? 'border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]' : 'border-white/10 bg-[#131b28] shadow-[0_24px_80px_rgba(0,0,0,0.34)]'}`}>
            <div className="space-y-6">
              <div>
                <p className={`text-xs uppercase tracking-[0.22em] ${isLightTheme ? 'text-[#f07a3d]' : 'text-orange-200/80'}`}>Image layered workflow</p>
                <p className={`mt-2 text-sm leading-6 ${isLightTheme ? 'text-slate-600' : 'text-slate-300'}`}>Upload first, then set layer count and run decomposition or prompt-based edits.</p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-[28px] border border-dashed p-5 transition-colors ${isLightTheme ? 'border-slate-300 bg-[#fbf8f3] hover:border-[#2f6df6] hover:bg-[#f5f8ff]' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isLightTheme ? 'bg-slate-900 text-white' : 'bg-white/10 text-white'}`}>
                    <Icons.Upload />
                  </div>
                  <div>
                    <p className={`text-base font-semibold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>{layers.length > 0 ? buttons.changeImage : empty.title}</p>
                    <p className={`mt-1 text-sm ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>JPG, PNG, WEBP. Upload image first.</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-[24px] border p-4 ${isLightTheme ? 'border-slate-200 bg-[#fcfaf6]' : 'border-white/10 bg-white/5'}`}>
                <div className="grid gap-4 lg:grid-cols-[96px_minmax(0,1fr)]">
                  <label className="space-y-2">
                    <span className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>{tb.numberOfLayers}</span>
                    <div className={`inline-flex w-[88px] items-center justify-center rounded-[18px] border ${isLightTheme ? 'border-slate-200 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.04)]' : 'border-white/10 bg-[#111827]'}`}>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={layerCount}
                        onChange={(e) => setLayerCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                        className={`w-full bg-transparent px-2 py-2.5 text-center text-base font-bold outline-none ${isLightTheme ? 'text-slate-900' : 'text-white'}`}
                      />
                    </div>
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>{adv.aiModel}</span>
                      <span className={`text-[11px] ${isLightTheme ? 'text-slate-400' : 'text-slate-500'}`}>Choose the mood of decomposition</span>
                    </div>
                    <div className={`inline-grid w-full grid-cols-2 gap-1 rounded-[18px] p-1 ${isLightTheme ? 'bg-[#f3eee6] border border-slate-200' : 'bg-[#0f172a] border border-white/10'}`}>
                      <button
                        onClick={() => setAdvancedConfig({ ...advancedConfig, model: 'fal-ai/qwen-image-layered' })}
                        className={`group rounded-[14px] px-3 py-3 text-left transition-all ${
                          advancedConfig.model === 'fal-ai/qwen-image-layered'
                            ? 'bg-white text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.08)]'
                            : isLightTheme
                              ? 'text-slate-600 hover:bg-white/60'
                              : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{adv.standard}</p>
                            <p className={`mt-1 text-[11px] leading-4 ${advancedConfig.model === 'fal-ai/qwen-image-layered' ? 'text-slate-500' : isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                              Clean layers
                            </p>
                          </div>
                          <div className={`mt-1 h-2.5 w-2.5 rounded-full ${advancedConfig.model === 'fal-ai/qwen-image-layered' ? 'bg-[#2f6df6]' : isLightTheme ? 'bg-slate-300' : 'bg-slate-600'}`} />
                        </div>
                      </button>
                      <button
                        onClick={() => setAdvancedConfig({ ...advancedConfig, model: 'fal-ai/qwen-image-layered/lora' })}
                        className={`group rounded-[14px] px-3 py-3 text-left transition-all ${
                          advancedConfig.model === 'fal-ai/qwen-image-layered/lora'
                            ? 'bg-white text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.08)]'
                            : isLightTheme
                              ? 'text-slate-600 hover:bg-white/60'
                              : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{adv.lora}</p>
                            <p className={`mt-1 text-[11px] leading-4 ${advancedConfig.model === 'fal-ai/qwen-image-layered/lora' ? 'text-slate-500' : isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                              Expressive split
                            </p>
                          </div>
                          <div className={`mt-1 h-2.5 w-2.5 rounded-full ${advancedConfig.model === 'fal-ai/qwen-image-layered/lora' ? 'bg-[#f07a3d]' : isLightTheme ? 'bg-slate-300' : 'bg-slate-600'}`} />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <label className={`block space-y-2 rounded-[22px] border p-4 ${isLightTheme ? 'border-slate-200 bg-[#fcfaf6]' : 'border-white/10 bg-white/5'}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>{adv.prompt}</span>
                <textarea
                  value={advancedConfig.prompt}
                  onChange={(e) => setAdvancedConfig({ ...advancedConfig, prompt: e.target.value })}
                  placeholder={adv.promptPlaceholder}
                  className={`min-h-[92px] w-full rounded-[18px] border px-4 py-3 text-sm outline-none ${isLightTheme ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#2f6df6]' : 'border-white/10 bg-white/5 text-white placeholder:text-slate-500'}`}
                />
              </label>

              <div className={`space-y-3 rounded-[22px] border p-4 ${isLightTheme ? 'border-slate-200 bg-[#fcfaf6]' : 'border-white/10 bg-white/5'}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Tools</span>
                  <span className={`text-[11px] ${isLightTheme ? 'text-slate-400' : 'text-slate-500'}`}>Pick one mode before running a prompt</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'remove' as ToolType, label: tb.removeObject },
                    { id: 'replace' as ToolType, label: tb.aiReplace },
                    { id: 'recolor' as ToolType, label: tb.recolor },
                    { id: 'move' as ToolType, label: tb.panView },
                  ].map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`rounded-[16px] px-3 py-2.5 text-sm font-medium transition-colors ${activeTool === tool.id ? 'bg-[#f07a3d] text-white shadow-[0_6px_16px_rgba(240,122,61,0.18)]' : isLightTheme ? 'bg-white text-slate-700 border border-slate-200' : 'bg-white/5 text-slate-300'}`}
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeTool !== 'select' && activeTool !== 'move' && (
                <label className={`block space-y-2 rounded-[22px] border p-4 ${isLightTheme ? 'border-slate-200 bg-[#fff7f2]' : 'border-white/10 bg-white/5'}`}>
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Prompt</span>
                  <textarea
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    placeholder={editPlaceholder}
                    className={`min-h-[112px] w-full rounded-[18px] border px-4 py-3 text-sm outline-none ${isLightTheme ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[#f07a3d]' : 'border-white/10 bg-white/5 text-white placeholder:text-slate-500'}`}
                  />
                </label>
              )}

              <div className="grid gap-3">
                <button
                  onClick={() => smartDecompose(layerCount)}
                  disabled={isProcessing || layers.length === 0}
                  className="rounded-[18px] bg-[#2f6df6] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(47,109,246,0.18)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? tb.processing : tb.decomposeCallToAction.replace('{count}', String(layerCount))}
                </button>
                <button
                  onClick={() => handleEditAction(editInstruction || editPlaceholder)}
                  disabled={isProcessing || !selectedLayer || activeTool === 'move' || activeTool === 'select'}
                  className="rounded-[18px] bg-[#f07a3d] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(240,122,61,0.18)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? buttons.processing : buttons.execute}
                </button>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  disabled={layers.length === 0}
                  className={`rounded-[18px] px-4 py-3 text-[13px] font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${isLightTheme ? 'bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]' : 'bg-white text-slate-900'}`}
                >
                  {buttons.exportProject}
                </button>
              </div>

              {!isUserLoggedIn() && (
                <div className={`rounded-[24px] border px-4 py-3 text-sm ${isLightTheme ? 'border-slate-200 bg-[#fbf8f3] text-slate-600' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                  {buttons.guestQuota.replace('{count}', String(getRemainingUploads()))}
                </div>
              )}
            </div>
          </aside>

          <main className={`rounded-[32px] border p-4 md:p-6 ${isLightTheme ? 'border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]' : 'border-white/10 bg-[#111927] shadow-[0_24px_80px_rgba(0,0,0,0.34)]'}`}>
            <div className="flex h-full flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-xs uppercase tracking-[0.28em] ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Preview</p>
                  <p className={`mt-1 text-sm ${isLightTheme ? 'text-slate-600' : 'text-slate-300'}`}>{selectedLayer ? `${selectedLayer.name} · ${Math.round(zoom * 100)}%` : 'Upload an image to preview layered output.'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setZoom((value) => Math.max(0.1, value - 0.1))} className={`rounded-full px-3 py-2 text-sm ${isLightTheme ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-white'}`}>-</button>
                  <button onClick={() => setZoom((value) => Math.min(4, value + 0.1))} className={`rounded-full px-3 py-2 text-sm ${isLightTheme ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-white'}`}>+</button>
                  <button
                    onClick={() => {
                      if (layers[0]) {
                        const availableWidth = window.innerWidth - 560;
                        const availableHeight = window.innerHeight - 280;
                        setZoom(Math.min(availableWidth / layers[0].width, availableHeight / layers[0].height, 0.95));
                        setDragOffset({ x: 0, y: 0 });
                      }
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${isLightTheme ? 'bg-[#fbf8f3] text-slate-700' : 'bg-white/5 text-white'}`}
                  >
                    {buttons.fitToScreen}
                  </button>
                </div>
              </div>

              <div
                ref={mainRef}
                onMouseDown={handleMouseDown}
                className={`relative flex min-h-[540px] flex-1 items-center justify-center overflow-hidden rounded-[28px] border ${isLightTheme ? 'border-slate-200 bg-[linear-gradient(135deg,#fcfaf6,#f4efe6)]' : 'border-white/10 bg-[linear-gradient(135deg,#111827,#0b1220)]'} ${isDraggingCanvas ? 'cursor-grabbing' : activeTool === 'move' || isSpacePressed ? 'cursor-grab' : 'cursor-default'}`}
              >
                <div
                  className="relative flex items-center justify-center transition-transform duration-300 ease-out"
                  style={{
                    transform: `scale(${zoom}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                    transformOrigin: 'center center',
                  }}
                >
                  {layers.length > 0 ? (
                    <div className="relative overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.18)]" style={{ width: layers[0].width, height: layers[0].height }}>
                      {displayedLayers.map((layer) => {
                        const isRootLayer = !layer.parentId;
                        const baseLayer = layers[0];

                        return (
                          <div
                            key={layer.id}
                            className={`absolute transition-all duration-200 ${selectedLayerId === layer.id ? 'z-20' : ''}`}
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
                              outline: selectedLayerId === layer.id ? '2px solid rgba(47,109,246,0.95)' : 'none',
                              outlineOffset: selectedLayerId === layer.id ? '2px' : '0',
                            }}
                            onMouseDown={(e) => handleLayerMouseDown(e, layer)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLayerId(layer.id);
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`flex w-full max-w-xl flex-col items-center gap-4 rounded-[28px] border border-dashed p-10 text-center ${isLightTheme ? 'border-slate-300 bg-[#fbf8f3]' : 'border-white/15 bg-white/5'}`}>
                      <Icons.Upload />
                      <h3 className={`text-2xl font-bold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>{empty.title}</h3>
                      <p className={`max-w-md text-sm ${isLightTheme ? 'text-slate-600' : 'text-slate-400'}`}>{empty.subtitle}</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full bg-[#2f6df6] px-5 py-3 text-sm font-bold text-white"
                      >
                        {buttons.changeImage}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_320px]">
                <div className={`rounded-[24px] border p-4 ${isLightTheme ? 'border-slate-200 bg-[#fbf8f3]' : 'border-white/10 bg-white/5'}`}>
                  <p className={`text-xs uppercase tracking-[0.24em] ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Layers</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {displayedLayers.length > 0 ? displayedLayers.map((layer) => (
                      <button
                        key={layer.id}
                        onClick={() => setSelectedLayerId(layer.id)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${selectedLayerId === layer.id ? 'bg-[#2f6df6] text-white' : isLightTheme ? 'bg-white text-slate-700 border border-slate-200' : 'bg-[#111827] text-slate-300'}`}
                      >
                        {layer.name}
                      </button>
                    )) : (
                      <p className={`text-sm ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>No layers yet. Upload and generate to start.</p>
                    )}
                  </div>
                </div>

                <div className={`rounded-[24px] border p-4 ${isLightTheme ? 'border-slate-200 bg-[#fbf8f3]' : 'border-white/10 bg-white/5'}`}>
                  <p className={`text-xs uppercase tracking-[0.24em] ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Selection</p>
                  {selectedLayer ? (
                    <div className="mt-3 space-y-3">
                      <p className={`text-sm font-semibold ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>{selectedLayer.name}</p>
                      <label className="block space-y-2">
                        <span className={`text-xs ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Opacity</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={selectedLayer.opacity}
                          onChange={(e) => handleUpdateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) })}
                          className="w-full accent-[#2f6df6]"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleDuplicateLayer(selectedLayer.id)}
                          className={`rounded-2xl px-3 py-2 text-sm font-semibold ${isLightTheme ? 'border border-slate-200 bg-white text-slate-700' : 'bg-[#111827] text-white'}`}
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => removeLayer(selectedLayer.id)}
                          className="rounded-2xl bg-[#f07a3d] px-3 py-2 text-sm font-semibold text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={`mt-3 text-sm ${isLightTheme ? 'text-slate-500' : 'text-slate-400'}`}>Select a layer to edit opacity or manage it.</p>
                  )}
                </div>
              </div>
            </div>
          </main>
        </section>
      </div>

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
  );
};

export default CrookedApp;
