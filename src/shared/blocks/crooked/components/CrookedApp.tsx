'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Layer, ToolType, DecomposeResponse, ExportSettings, AdvancedDecompositionConfig } from '../types';
import CrookedToolbar from './CrookedToolbar';
import CrookedLayerPanel from './CrookedLayerPanel';
import CrookedExportModal from './CrookedExportModal';
import { Icons } from './Icon';

const CrookedApp: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const [layerDragOffset, setLayerDragOffset] = useState({ x: 0, y: 0 });
  const [layerCount, setLayerCount] = useState<number>(5);
  const [collapsedLayerIds, setCollapsedLayerIds] = useState<Set<string>>(new Set());

  // Advanced Settings State
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedDecompositionConfig>({
    prompt: '',
    negativePrompt: '',
    seed: 42,
    randomizeSeed: true,
    enableCfgNormalization: true,
    autoCaptionLanguageEn: true,
    guidanceScale: 7.5,
    inferenceSteps: 30
  });

  const mainRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Panning Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    // Start panning if clicking the background or using the 'move' tool
    if (e.target === mainRef.current || activeTool === 'move') {
      setIsDraggingCanvas(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

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

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const availableWidth = window.innerWidth - 450;
        const availableHeight = window.innerHeight - 200;

        const scaleX = availableWidth / img.width;
        const scaleY = availableHeight / img.height;
        const initialScale = Math.min(scaleX, scaleY, 0.9);

        const newLayer: Layer = {
          id: crypto.randomUUID(),
          name: 'Main Canvas',
          type: 'image',
          url: base64,
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: 0
        };

        setLayers([newLayer]);
        setSelectedLayerId(newLayer.id);
        setZoom(initialScale);
        setDragOffset({ x: 0, y: 0 });
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const smartDecompose = async (count: number, targetLayerId?: string) => {
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

    console.log('[smartDecompose] Starting decomposition', { count, targetId, targetName: target.name });

    setIsProcessing(true);
    try {
      // Check if target.url is a valid data URI
      if (!target.url || !target.url.startsWith('data:')) {
        console.error('[smartDecompose] Invalid image data:', { hasUrl: !!target.url, startsWithData: target.url?.startsWith('data:') });
        throw new Error('Invalid image data. Please upload a valid image.');
      }

      // Upload the image to storage using FormData
      // Convert base64 to Blob
      const base64Data = target.url.split(',')[1];
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
        // sync_mode: true, // Note: sync_mode may not be supported by qwen-image-layered
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
          model: 'fal-ai/qwen-image-layered',
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
      if (genData.data?.status === 'SUCCESS') {
        console.log('[smartDecompose] Task completed successfully (sync mode)');

        // Try to parse taskInfo
        if (genData.data.taskInfo) {
          try {
            const taskInfo = JSON.parse(genData.data.taskInfo);
            console.log('[smartDecompose] Parsed taskInfo keys:', Object.keys(taskInfo));
            console.log('[smartDecompose] taskInfo.images:', taskInfo.images);

            if (taskInfo?.images && Array.isArray(taskInfo.images)) {
              layerImages = taskInfo.images;
              console.log('[smartDecompose] Found images in taskInfo:', layerImages.length);
            }
          } catch (e) {
            console.error('[smartDecompose] Failed to parse immediate taskInfo:', e);
          }
        }

        // Try to parse taskResult
        if ((!layerImages || layerImages.length === 0) && genData.data.taskResult) {
          try {
            const parsedResult = JSON.parse(genData.data.taskResult);
            console.log('[smartDecompose] Parsed taskResult keys:', Object.keys(parsedResult));
            console.log('[smartDecompose] parsedResult.output:', parsedResult.output);
            console.log('[smartDecompose] parsedResult.images:', parsedResult.images);

            // Check for images in taskResult
            if (parsedResult?.images && Array.isArray(parsedResult.images)) {
              layerImages = parsedResult.images.map((img: any) => ({
                imageUrl: img.url || img,
              }));
              console.log('[smartDecompose] Found images in taskResult:', layerImages.length);
            }
            // Check for output array (fal.ai qwen-image-layered returns layers in output)
            else if (parsedResult?.output && Array.isArray(parsedResult.output)) {
              console.log('[smartDecompose] Output array length:', parsedResult.output.length);
              console.log('[smartDecompose] First output item:', parsedResult.output[0]);

              // qwen-image-layered returns an array of layer objects with url property
              layerImages = parsedResult.output.map((img: any, idx: number) => {
                const url = typeof img === 'string' ? img : (img.url || img.image_url || img);
                console.log(`[smartDecompose] Layer ${idx} URL:`, url);
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
      if ((!layerImages || layerImages.length === 0) && genData.data?.status === 'PENDING') {
        const taskId = genData.data?.id;
        if (!taskId) {
          throw new Error('Task ID missing in response');
        }

        console.log('[smartDecompose] Task is pending, starting polling...');
        const POLL_INTERVAL = 2000; // 2 seconds
        const MAX_POLL_TIME = 120000; // 2 minutes max for sync mode timeout
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
            body: JSON.stringify({ taskId }),
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

          if (task.status === 'SUCCESS') {
            console.log('[smartDecompose] Task completed after', Math.floor(elapsed / 1000), 'seconds');

            if (task.taskInfo) {
              try {
                const parsedTaskInfo = JSON.parse(task.taskInfo);
                if (parsedTaskInfo?.images && Array.isArray(parsedTaskInfo.images)) {
                  layerImages = parsedTaskInfo.images;
                  console.log('[smartDecompose] Found images in taskInfo:', layerImages.length);
                  break;
                }
              } catch (e) {
                console.error('[smartDecompose] Failed to parse taskInfo:', e);
              }
            }

            if (task.taskResult && (!layerImages || layerImages.length === 0)) {
              try {
                const parsedResult = JSON.parse(task.taskResult);
                if (parsedResult?.images && Array.isArray(parsedResult.images)) {
                  layerImages = parsedResult.images.map((img: any) => ({
                    imageUrl: img.url || img,
                  }));
                  console.log('[smartDecompose] Found images in taskResult:', layerImages.length);
                  break;
                }
                if (parsedResult?.output && Array.isArray(parsedResult.output)) {
                  layerImages = parsedResult.output.map((img: any) => ({
                    imageUrl: typeof img === 'string' ? img : (img.url || img),
                  }));
                  console.log('[smartDecompose] Found images in output:', layerImages.length);
                  break;
                }
              } catch (e) {
                console.error('[smartDecompose] Failed to parse taskResult:', e);
              }
            }
            break;
          }

          if (task.status === 'FAILED') {
            const errorMsg = task.taskInfo
              ? JSON.parse(task.taskInfo)?.errorMessage || 'Decomposition failed'
              : 'Decomposition failed';
            console.error('[smartDecompose] Task failed:', errorMsg);
            throw new Error(errorMsg);
          }

          if (pollCount % 10 === 0) {
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

      // Create a layer for each generated image
      const newLayers: Layer[] = layerImages.map((img: any, idx: number) => {
        return {
          id: crypto.randomUUID(),
          name: `Layer ${idx + 1}`,
          type: 'image',
          url: img.imageUrl,
          x: target.x,
          y: target.y,
          width: target.width,
          height: target.height,
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
        alert(`Decomposition failed: ${errMsg}\n\nPlease check the browser console for more details.`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditAction = async (instruction: string) => {
    const target = layers.find(l => l.id === selectedLayerId);
    if (!target || target.locked) return;

    setIsProcessing(true);
    try {
      // Determine scene based on active tool
      const scene = activeTool === 'recolor' ? 'image-recolor' :
                    activeTool === 'replace' ? 'image-replace' :
                    'image-remove';

      // Check if target.url is a valid data URI
      if (!target.url || !target.url.startsWith('data:')) {
        throw new Error('Invalid image data. Please upload a valid image.');
      }

      // Convert base64 to Blob and upload
      const base64Data = target.url.split(',')[1];
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
      } else {
        throw new Error('No image generated');
      }
    } catch (err) {
      console.error(err);
      alert("Edit failed. Please try again.");
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

  const toggleCollapse = (id: string) => {
    setCollapsedLayerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = async (settings: ExportSettings) => {
    setIsProcessing(true);
    try {
      const originalLayer = layers[0];
      if (!originalLayer) return;

      let finalUrl = originalLayer.url;

      // If upscale is enabled, call AI upscaling
      if (settings.upscale) {
        const uploadRes = await fetch('/api/storage/upload-image', {
          method: 'POST',
          body: JSON.stringify({
            file: originalLayer.url,
            contentType: 'image/jpeg',
          }),
        });

        const uploadData = await uploadRes.json();
        if (uploadData.code !== 0) {
          throw new Error(uploadData.message || 'Upload failed');
        }

        const imageUrl = uploadData.data.url;

        // Call AI for upscaling
        const genRes = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaType: 'image',
            scene: 'text-to-image',
            provider: 'openrouter',
            model: 'qwen/qwen3-vl-8b-instruct',
            prompt: `Redraw this image with extreme high quality, sharpness, and high resolution. Maintain every detail from the original but upscale and enhance it to ${settings.resolution}.`,
            options: {
              image_input: [imageUrl],
              resolution: settings.resolution,
            },
          }),
        });

        const genData = await genRes.json();
        if (genData.code !== 0) {
          throw new Error(genData.message || 'Upscale failed');
        }

        const taskInfo = genData.data.taskInfo ? JSON.parse(genData.data.taskInfo) : null;
        finalUrl = taskInfo?.images?.[0]?.imageUrl || finalUrl;
      }

      const link = document.createElement('a');
      link.href = finalUrl;
      link.download = `QwenImageLayered-export-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExportModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Export failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleLayerVisibility = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const removeLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex bg-[#0d0d0d]">
      {/* Home Icon - Canvas Top Right */}
      <a
        href="/"
        className="absolute top-4 right-[360px] z-30 p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all shadow-lg"
        title="Back to Home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </a>

      <div className="absolute top-6 left-6 flex items-center gap-6 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Icons.CrookedLogo />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Qwen Image Layered</h1>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest opacity-80">Vision Intelligence</p>
          </div>
        </div>

        {layers.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 glass-panel rounded-xl hover:bg-white/5 transition-all text-xs font-semibold text-gray-300 border border-white/10"
            >
              <Icons.Image />
              <span>Change Image</span>
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 transition-all text-xs font-bold"
            >
              <Icons.Download />
              <span>Export Project</span>
            </button>
          </div>
        )}
      </div>

      <main
        ref={mainRef}
        onMouseDown={handleMouseDown}
        className={`flex-1 relative flex items-center justify-center overflow-hidden canvas-container ${isDraggingCanvas ? 'cursor-grabbing' : activeTool === 'move' ? 'cursor-grab' : 'cursor-default'}`}
      >
        <div
          className="relative transition-transform duration-300 ease-out will-change-transform flex items-center justify-center"
          style={{
            transform: `scale(${zoom}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          {layers.length > 0 ? (
            <div
              className="relative shadow-[0_0_80px_rgba(0,0,0,0.8)] bg-black/50"
              style={{ width: layers[0].width, height: layers[0].height }}
            >
              {layers.filter(l => {
                // Check if any ancestor is collapsed
                let current = l;
                while (current.parentId) {
                  if (collapsedLayerIds.has(current.parentId)) return false;
                  const parent = layers.find(pl => pl.id === current.parentId);
                  if (!parent) break;
                  current = parent;
                }
                return l.visible;
              }).sort((a, b) => a.zIndex - b.zIndex).map(layer => (
                <div
                  key={layer.id}
                  className={`absolute pointer-events-auto transition-shadow duration-200 ${!layer.locked ? 'cursor-move' : 'cursor-default'} ${selectedLayerId === layer.id ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-[#0d0d0d] z-50' : ''} ${draggingLayerId === layer.id ? 'cursor-grabbing' : ''}`}
                  style={{
                    left: layer.x,
                    top: layer.y,
                    width: layer.width,
                    height: layer.height,
                    opacity: layer.opacity,
                    zIndex: layer.zIndex,
                    backgroundImage: `url(${layer.url})`,
                    backgroundPosition: `-${layer.x}px -${layer.y}px`,
                    backgroundSize: `${layers[0].width}px ${layers[0].height}px`,
                    backgroundRepeat: 'no-repeat'
                  }}
                  onMouseDown={(e) => handleLayerMouseDown(e, layer)}
                  onClick={(e) => {
                    if (draggingLayerId !== layer.id) {
                      e.stopPropagation();
                      setSelectedLayerId(layer.id);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-[600px] h-[400px] rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 hover:bg-white/5 hover:border-blue-500/30 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform text-white">
                <Icons.Upload />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-300">Upload image to <span className="text-blue-500 font-bold italic">Qwen Image Layered</span></p>
                <p className="text-sm text-gray-500 mt-1">Start your multi-layered AI editing experience</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 p-2 glass-panel rounded-full z-20">
          <button onClick={() => setZoom(z => Math.max(0.05, z - 0.1))} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <span className="text-xs font-mono text-gray-500 min-w-[3.5rem] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors">
             <Icons.Plus />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={() => {
               if (layers[0]) {
                 const availableWidth = window.innerWidth - 450;
                 const availableHeight = window.innerHeight - 200;
                 const scaleX = availableWidth / layers[0].width;
                 const scaleY = availableHeight / layers[0].height;
                 setZoom(Math.min(scaleX, scaleY, 0.9));
                 setDragOffset({ x: 0, y: 0 });
               }
            }}
            className="px-3 py-1 text-[10px] font-bold text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors uppercase tracking-widest"
          >
            Reset View
          </button>
        </div>
      </main>

      <CrookedToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onDecompose={(count) => smartDecompose(count)}
        isProcessing={isProcessing}
        layerCount={layerCount}
        setLayerCount={setLayerCount}
        advancedConfig={advancedConfig}
        setAdvancedConfig={setAdvancedConfig}
      />

      <CrookedLayerPanel
        layers={layers}
        selectedLayerId={selectedLayerId}
        onSelectLayer={setSelectedLayerId}
        onToggleVisibility={toggleLayerVisibility}
        onRecursiveDecompose={(id) => smartDecompose(layerCount, id)}
        onRemoveLayer={removeLayer}
        onUpdateLayer={handleUpdateLayer}
        onDuplicateLayer={handleDuplicateLayer}
        collapsedLayerIds={collapsedLayerIds}
        onToggleCollapse={toggleCollapse}
      />

      {selectedLayerId && activeTool !== 'select' && activeTool !== 'move' && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[500px] glass-panel p-4 rounded-2xl z-30 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 shadow-2xl border-blue-500/20">
           <input
            type="text"
            placeholder={
                activeTool === 'recolor' ? "Describe new color (e.g., change car to metallic red)..." :
                activeTool === 'replace' ? "What do you want to replace it with? (e.g., a cyberpunk warrior)..." :
                activeTool === 'remove' ? "Removing object precisely..." : "Enter editing instruction..."
            }
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-600 px-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditAction((e.target as HTMLInputElement).value);
            }}
           />
           <button
            onClick={(e) => {
              const input = (e.currentTarget.previousElementSibling as HTMLInputElement).value;
              handleEditAction(input || 'Apply edit');
            }}
            disabled={isProcessing}
            className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
           >
             {isProcessing ? 'Processing...' : 'Execute'}
           </button>
        </div>
      )}

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

      {isProcessing && !isExportModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="w-24 h-24 relative">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-lg font-black text-white tracking-[0.3em] uppercase italic">Qwen Image Layered Engine Running</p>
            <p className="text-sm text-gray-400 mt-2 font-mono uppercase tracking-widest">Neural Decomposition in Progress...</p>
        </div>
      )}
    </div>
  );
};

export default CrookedApp;
