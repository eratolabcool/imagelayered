'use client';

import { useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ImagePlus, LoaderCircle, Upload } from 'lucide-react';

import { STUDIO_EVENTS, trackStudioEvent } from '../lib/analytics';
import { createStudioProject, uploadStudioImage } from '../services/api';

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

          {error ? <p className="mt-4 text-center text-sm text-red-400">{error}</p> : null}
          <p className="mt-6 text-center text-xs text-zinc-500">
            No sign-in required to try the editor. Sign in later to save projects across devices.
          </p>
        </section>
      </div>
    </main>
  );
}
