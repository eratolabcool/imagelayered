import type { StudioLayer, StudioProject } from '../types';
import { getCanvasSafeImageUrl } from './image-url';

type AlphaMask = {
  width: number;
  height: number;
  alpha: Uint8ClampedArray;
};

const maskCache = new Map<string, Promise<AlphaMask | null>>();

function loadMask(url: string): Promise<AlphaMask | null> {
  const cached = maskCache.get(url);
  if (cached) return cached;

  const promise = new Promise<AlphaMask | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, image.naturalWidth);
        canvas.height = Math.max(1, image.naturalHeight);
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return resolve(null);
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;
        const alpha = new Uint8ClampedArray(canvas.width * canvas.height);
        for (let source = 3, target = 0; source < pixels.length; source += 4) {
          alpha[target++] = pixels[source];
        }
        resolve({ width: canvas.width, height: canvas.height, alpha });
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = getCanvasSafeImageUrl(url);
  });

  maskCache.set(url, promise);
  return promise;
}

function pointInRotatedLayer(layer: StudioLayer, x: number, y: number) {
  const width = layer.width * Math.abs(layer.scaleX || 1);
  const height = layer.height * Math.abs(layer.scaleY || 1);
  const centerX = layer.x + layer.width / 2;
  const centerY = layer.y + layer.height / 2;
  const radians = (-layer.rotation * Math.PI) / 180;
  const dx = x - centerX;
  const dy = y - centerY;
  const localX = dx * Math.cos(radians) - dy * Math.sin(radians);
  const localY = dx * Math.sin(radians) + dy * Math.cos(radians);

  if (Math.abs(localX) > width / 2 || Math.abs(localY) > height / 2) {
    return null;
  }

  return {
    u: localX / width + 0.5,
    v: localY / height + 0.5,
  };
}

export async function pickStudioLayerAtPoint(
  project: StudioProject,
  layers: StudioLayer[],
  x: number,
  y: number,
  alphaThreshold = 12
): Promise<StudioLayer | null> {
  if (x < 0 || y < 0 || x > project.width || y > project.height) return null;

  const ordered = [...layers]
    .filter((layer) => layer.visible && layer.opacity > 0 && layer.assetId)
    .sort((a, b) => b.zIndex - a.zIndex);

  for (const layer of ordered) {
    const point = pointInRotatedLayer(layer, x, y);
    if (!point) continue;

    const mask = await loadMask(layer.assetId);
    if (!mask) return layer;

    const pixelX = Math.min(
      mask.width - 1,
      Math.max(0, Math.floor(point.u * mask.width))
    );
    const pixelY = Math.min(
      mask.height - 1,
      Math.max(0, Math.floor(point.v * mask.height))
    );
    if (mask.alpha[pixelY * mask.width + pixelX] >= alphaThreshold) {
      return layer;
    }
  }

  return null;
}

export function pointerToProjectPoint(
  project: StudioProject,
  canvas: HTMLElement,
  clientX: number,
  clientY: number
) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * project.width,
    y: ((clientY - rect.top) / rect.height) * project.height,
  };
}
