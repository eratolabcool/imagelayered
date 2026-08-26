'use client';

export interface PreparedImagePayload {
  base64: string;
  width: number;
  height: number;
  name: string;
}

const MAX_IMAGE_EDGE = 4096;
const MAX_IMAGE_PIXELS = 16_000_000;
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export async function prepareImageFile(file: File): Promise<PreparedImagePayload> {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) throw new Error('Use a JPEG, PNG, WebP, or AVIF image');
  if (file.size <= 0 || file.size > MAX_SOURCE_BYTES) throw new Error('Image must be smaller than 25 MB');

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const edgeScale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const pixelScale = Math.min(1, Math.sqrt(MAX_IMAGE_PIXELS / (image.naturalWidth * image.naturalHeight)));
  const scale = Math.min(edgeScale, pixelScale);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to prepare image');
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/webp';

  return {
    base64: canvas.toDataURL(outputType, 0.9),
    width,
    height,
    name: file.name,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = src;
  });
}
