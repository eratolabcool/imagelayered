'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ImagePlus, LoaderCircle, Upload } from 'lucide-react';

import { STUDIO_EVENTS, trackStudioEvent } from '../lib/analytics';
import { createStudioProject, uploadStudioImage } from '../services/api';

function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function getImageSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to read image dimensions'));
    };
    image.src = url;
  });
}

export function StudioStart() {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SAMPLE_DEMOS = [
    {
      id: 'product',
      title: 'Luxury Cosmetic',
      tag: 'E-commerce',
      url: '/imgs/demos/demo-product.jpg',
      filename: 'luxury-skincare-product.jpg',
    },
    {
      id: 'fashion',
      title: 'Summer Drop Poster',
      tag: 'Fashion Ad',
      url: '/imgs/demos/demo-fashion.jpg',
      filename: 'summer-drop-poster.jpg',
    },
    {
      id: 'character',
      title: 'Cyberpunk Vinyl Toy',
      tag: '3D Art',
      url: '/imgs/demos/demo-character.jpg',
      filename: 'cyberpunk-vinyl-character.jpg',
    },
  ];

  async function loadSample(sample: (typeof SAMPLE_DEMOS)[number]) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const resp = await fetch(sample.url);
      if (!resp.ok) throw new Error('Failed to load sample image');
      const blob = await resp.blob();
      const file = new File([blob], sample.filename, {
        type: blob.type || 'image/jpeg',
      });
      await start(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sample image');
      setBusy(false);
    }
  }

  // Auto-ingest image uploaded from landing page hero
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('uploadedImage');
      if (stored) {
        sessionStorage.removeItem('uploadedImage');
        const parsed = JSON.parse(stored);
        if (parsed?.base64 && parsed?.name) {
          const file = base64ToFile(parsed.base64, parsed.name);
          void start(file);
        }
      }
    } catch (e) {
      console.error('[StudioStart] Failed to restore uploaded image:', e);
    }
  }, []);

  async function start(file?: File) {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    trackStudioEvent(STUDIO_EVENTS.uploadStarted, {
      filename: file.name,
      bytes: file.size,
    });

    try {
      const [{ width, height }, uploaded] = await Promise.all([
        getImageSize(file),
        uploadStudioImage(file),
      ]);
      const bootstrap = await createStudioProject({
        title: file.name.replace(/\.[^.]+$/, '') || 'Untitled project',
        width,
        height,
        originalAssetId: uploaded.key,
        originalUrl: uploaded.url,
      });

      if (!bootstrap.project.userId) {
        localStorage.setItem(
          `image-layered:studio-project:${bootstrap.project.id}`,
          JSON.stringify(bootstrap)
        );
      }

      trackStudioEvent(STUDIO_EVENTS.uploadCompleted, {
        project_id: bootstrap.project.id,
        width,
        height,
      });
      const studioBase = (pathname || '/studio').replace(/\/$/, '');
      router.push(`${studioBase}/${bootstrap.project.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to start Studio');
      setBusy(false);
      trackStudioEvent(STUDIO_EVENTS.uploadFailed, { filename: file.name });
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-50">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
        <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-white text-zinc-950">
              <ImagePlus className="size-6" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Image Layered Studio</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Upload one image, decompose it into editable layers, then change only the object you select.
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void start(event.dataTransfer.files?.[0]);
            }}
            className="flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 px-6 transition hover:border-white/40 hover:bg-black/30 disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? (
              <LoaderCircle className="mb-4 size-8 animate-spin" />
            ) : (
              <Upload className="mb-4 size-8" />
            )}
            <span className="font-medium">
              {busy ? 'Preparing your project…' : 'Drop an image here or click to upload'}
            </span>
            <span className="mt-2 text-xs text-zinc-500">PNG, JPG or WEBP · up to 25 MB</span>
          </button>

          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => void start(event.target.files?.[0])}
          />

          {/* Sample Demos Showcase */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Or try with sample images
              </span>
              <span className="text-xs text-zinc-500">1-click decomposition</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SAMPLE_DEMOS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void loadSample(sample)}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-2 text-left transition hover:-translate-y-0.5 hover:border-pink-500/50 hover:bg-white/[0.05] disabled:opacity-50"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-900">
                    <img
                      src={sample.url}
                      alt={sample.title}
                      className="size-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                      {sample.tag}
                    </span>
                  </div>
                  <span className="mt-2 truncate text-xs font-medium text-zinc-300 group-hover:text-white">
                    {sample.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="mt-4 text-center text-sm text-red-400">{error}</p> : null}
          <p className="mt-6 text-center text-xs text-zinc-500">
            Uploading and arranging a local project is free. AI decomposition costs 5 credits and selected-layer edits cost 3–4 credits. PSD and PNG ZIP exports from a completed project do not consume credits.
          </p>
        </section>
      </div>
    </main>
  );
}
