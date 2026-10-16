import { writePsd } from 'ag-psd';
import JSZip from 'jszip';
import type { StudioLayer, StudioProject } from '../types';
import { getCanvasSafeImageUrl } from './image-url';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error('Unable to load a layer for export.'));
    image.src = getCanvasSafeImageUrl(url);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Unable to encode PNG export.'));
      }, 'image/png');
    } catch {
      reject(
        new Error(
          'Export was blocked by image CORS policy. Re-save the project assets to first-party storage and try again.'
        )
      );
    }
  });
}

/**
 * The Studio preview uses CSS object-contain for every layer. Keep the
 * exported pixels on the same aspect ratio instead of stretching a cropped
 * provider result to the full layer box.
 */
function getContainedImageSize(
  image: HTMLImageElement,
  boxWidth: number,
  boxHeight: number
) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) {
    return { width: boxWidth, height: boxHeight };
  }

  const scale = Math.min(boxWidth / sourceWidth, boxHeight / sourceHeight);
  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
}

function drawLayer(
  context: CanvasRenderingContext2D,
  layer: StudioLayer,
  image: HTMLImageElement
) {
  const centerX = layer.x + layer.width / 2;
  const centerY = layer.y + layer.height / 2;
  const contained = getContainedImageSize(image, layer.width, layer.height);

  context.save();
  context.globalAlpha = layer.opacity;
  context.translate(centerX, centerY);
  context.rotate((layer.rotation * Math.PI) / 180);
  context.scale(layer.scaleX, layer.scaleY);
  context.drawImage(
    image,
    -contained.width / 2,
    -contained.height / 2,
    contained.width,
    contained.height
  );
  context.restore();
}

/**
 * Renders an individual layer onto a canvas with project dimensions and exact transform.
 */
async function renderLayerCanvas(
  projectWidth: number,
  projectHeight: number,
  layer: StudioLayer
): Promise<HTMLCanvasElement | null> {
  if (!layer.assetId) return null;
  const image = await loadImage(layer.assetId);
  const canvas = document.createElement('canvas');
  canvas.width = projectWidth;
  canvas.height = projectHeight;
  const context = canvas.getContext('2d');
  if (!context) return null;

  drawLayer(context, layer, image);
  return canvas;
}

async function renderMaskCanvas(
  projectWidth: number,
  projectHeight: number,
  layer: StudioLayer
): Promise<HTMLCanvasElement | null> {
  if (!layer.maskAssetId) return null;
  const image = await loadImage(layer.maskAssetId);
  const canvas = document.createElement('canvas');
  canvas.width = projectWidth;
  canvas.height = projectHeight;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, projectWidth, projectHeight);
  drawLayer(context, { ...layer, assetId: layer.maskAssetId }, image);
  return canvas;
}

export async function exportStudioComposite(
  project: StudioProject,
  layers: StudioLayer[]
) {
  const canvas = document.createElement('canvas');
  canvas.width = project.width;
  canvas.height = project.height;
  const context = canvas.getContext('2d');
  if (!context)
    throw new Error('Canvas export is unavailable in this browser.');

  const visibleLayers = [...layers]
    .filter((layer) => layer.visible && layer.assetId)
    .sort((a, b) => a.zIndex - b.zIndex);

  for (const layer of visibleLayers) {
    const image = await loadImage(layer.assetId);
    drawLayer(context, layer, image);
  }

  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, `${project.title || 'image-layered-project'}.png`);
}

export async function exportStudioLayer(layer: StudioLayer) {
  if (!layer.assetId) throw new Error('The selected layer has no image asset.');

  const image = await loadImage(layer.assetId);
  const width = Math.max(1, Math.round(layer.width * Math.abs(layer.scaleX)));
  const height = Math.max(1, Math.round(layer.height * Math.abs(layer.scaleY)));
  const contained = getContainedImageSize(image, width, height);
  const radians = (layer.rotation * Math.PI) / 180;
  const rotatedWidth = Math.ceil(
    Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians))
  );
  const rotatedHeight = Math.ceil(
    Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians))
  );

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, rotatedWidth);
  canvas.height = Math.max(1, rotatedHeight);
  const context = canvas.getContext('2d');
  if (!context)
    throw new Error('Canvas export is unavailable in this browser.');

  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(radians);
  context.globalAlpha = layer.opacity;
  context.drawImage(
    image,
    -contained.width / 2,
    -contained.height / 2,
    contained.width,
    contained.height
  );

  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, `${layer.name || 'layer'}.png`);
}

/**
 * Exports project as a standard multi-layer Adobe Photoshop (.psd) file.
 * Each layer preserves its name, z-index order, visibility, and transparency.
 */
export async function exportStudioPsd(
  project: StudioProject,
  layers: StudioLayer[]
) {
  const sortedLayers = [...layers]
    .filter((l) => l.assetId)
    .sort((a, b) => a.zIndex - b.zIndex);

  if (sortedLayers.length === 0) {
    throw new Error('No valid layers to export to PSD.');
  }

  const psdChildren: any[] = [];
  const groups = new Map<string, any>();

  // Preserve explicit Studio groups in Photoshop. Raster layers without a
  // parent remain at the document root.
  for (const group of [...layers]
    .filter((layer) => layer.type === 'group')
    .sort((a, b) => a.zIndex - b.zIndex)) {
    const entry = {
      name: group.name || 'Group',
      children: [] as any[],
      opened: true,
      hidden: !group.visible,
      opacity: group.opacity,
      blendMode: group.blendMode || 'pass through',
    };
    groups.set(group.id, entry);
    psdChildren.push(entry);
  }

  for (let i = 0; i < sortedLayers.length; i++) {
    const layer = sortedLayers[i];
    const layerCanvas = await renderLayerCanvas(
      project.width,
      project.height,
      layer
    );
    if (!layerCanvas) continue;

    const maskCanvas = await renderMaskCanvas(project.width, project.height, layer);
    const psdLayer: any = {
      name: layer.name || `Layer ${i + 1}`,
      top: 0,
      left: 0,
      canvas: layerCanvas,
      opacity: layer.opacity,
      hidden: !layer.visible,
      blendMode: layer.blendMode || 'normal',
    };
    if (maskCanvas) {
      psdLayer.mask = {
        canvas: maskCanvas,
        top: 0,
        left: 0,
        bottom: project.height,
        right: project.width,
      };
    }
    const parent = layer.parentId ? groups.get(layer.parentId) : undefined;
    (parent?.children || psdChildren).push(psdLayer);
  }

  if (psdChildren.length === 0) {
    throw new Error('Failed to render layers for PSD export.');
  }

  const psd = {
    width: project.width,
    height: project.height,
    children: psdChildren,
  };

  const buffer = writePsd(psd);
  const blob = new Blob([buffer], { type: 'image/vnd.adobe.photoshop' });
  downloadBlob(blob, `${project.title || 'image-layered-project'}.psd`);

  const manifest = {
    format: 'multi-layer-raster-psd',
    generatedAt: new Date().toISOString(),
    project: {
      id: project.id,
      title: project.title,
      width: project.width,
      height: project.height,
    },
    limitations: [
      'Preserves raster layers, transparency, visibility, order, opacity, groups, masks, and blend modes.',
      'Does not preserve native fonts, vectors, smart objects, or complete edit history.',
    ],
    layers: [...layers]
      .sort((a, b) => a.zIndex - b.zIndex)
      .map((layer) => ({
        id: layer.id,
        name: layer.name,
        type: layer.type,
        semanticType: layer.semanticType,
        zIndex: layer.zIndex,
        parentId: layer.parentId || null,
        opacity: layer.opacity,
        visible: layer.visible,
        locked: layer.locked,
        blendMode: layer.blendMode || 'normal',
        maskAssetId: layer.maskAssetId || null,
        source: layer.source,
      })),
  };
  downloadBlob(
    new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' }),
    `${project.title || 'image-layered-project'}.psd.manifest.json`
  );
}

/**
 * Exports all individual layers as transparent PNGs inside a single ZIP archive.
 */
export async function exportStudioZip(
  project: StudioProject,
  layers: StudioLayer[]
) {
  const sortedLayers = [...layers]
    .filter((l) => l.assetId)
    .sort((a, b) => a.zIndex - b.zIndex);

  if (sortedLayers.length === 0) {
    throw new Error('No layers available to export.');
  }

  const zip = new JSZip();
  const folder = zip.folder(project.title || 'layers') || zip;

  for (let i = 0; i < sortedLayers.length; i++) {
    const layer = sortedLayers[i];
    const layerCanvas = await renderLayerCanvas(
      project.width,
      project.height,
      layer
    );
    if (!layerCanvas) continue;

    const layerBlob = await canvasToBlob(layerCanvas);
    const sanitizedName = (layer.name || `layer-${i + 1}`).replace(
      /[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g,
      '_'
    );
    const fileName = `${String(i + 1).padStart(2, '0')}_${sanitizedName}.png`;
    folder.file(fileName, layerBlob);
  }

  // Also include the composite preview
  const compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = project.width;
  compositeCanvas.height = project.height;
  const compositeContext = compositeCanvas.getContext('2d');
  if (compositeContext) {
    for (const layer of sortedLayers.filter((l) => l.visible)) {
      const image = await loadImage(layer.assetId);
      drawLayer(compositeContext, layer, image);
    }
    const compositeBlob = await canvasToBlob(compositeCanvas);
    folder.file('00_full_composite.png', compositeBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blobOrFallback(zipBlob), `${project.title || 'layers'}.zip`);
}

function blobOrFallback(blob: Blob): Blob {
  return blob.type ? blob : new Blob([blob], { type: 'application/zip' });
}
