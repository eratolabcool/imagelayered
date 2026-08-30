import type { StudioLayer, StudioProject } from '../types';

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
    image.onerror = () => reject(new Error('Unable to load a layer for export.'));
    image.src = url;
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

function drawLayer(
  context: CanvasRenderingContext2D,
  layer: StudioLayer,
  image: HTMLImageElement
) {
  const centerX = layer.x + layer.width / 2;
  const centerY = layer.y + layer.height / 2;

  context.save();
  context.globalAlpha = layer.opacity;
  context.translate(centerX, centerY);
  context.rotate((layer.rotation * Math.PI) / 180);
  context.scale(layer.scaleX, layer.scaleY);
  context.drawImage(
    image,
    -layer.width / 2,
    -layer.height / 2,
    layer.width,
    layer.height
  );
  context.restore();
}

export async function exportStudioComposite(
  project: StudioProject,
  layers: StudioLayer[]
) {
  const canvas = document.createElement('canvas');
  canvas.width = project.width;
  canvas.height = project.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas export is unavailable in this browser.');

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
  if (!context) throw new Error('Canvas export is unavailable in this browser.');

  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(radians);
  context.globalAlpha = layer.opacity;
  context.drawImage(image, -width / 2, -height / 2, width, height);

  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, `${layer.name || 'layer'}.png`);
}
