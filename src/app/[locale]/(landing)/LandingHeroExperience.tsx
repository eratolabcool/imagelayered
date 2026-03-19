'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { toast } from 'sonner';

import { PreparedImagePayload, prepareImageFile } from '@/shared/blocks/crooked/lib/image-upload';

const CrookedApp = dynamic(() => import('@/shared/blocks/crooked').then((mod) => mod.CrookedApp), {
  ssr: false,
});

export default function LandingHeroExperience() {
  const [image, setImage] = useState<PreparedImagePayload | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  const handleUpload = async (file: File) => {
    setIsPreparing(true);
    try {
      const prepared = await prepareImageFile(file);
      setImage(prepared);
      requestAnimationFrame(() => {
        document.getElementById('hero-tool')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (error) {
      console.error('[LandingHeroExperience] upload failed', error);
      toast.error('Failed to load image. Please try another one.');
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060e20] text-white [font-family:var(--font-body)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(92,118,255,0.24),transparent_28%),radial-gradient(circle_at_82%_4%,rgba(255,92,138,0.18),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(68,217,255,0.12),transparent_28%),linear-gradient(180deg,#081121_0%,#060e20_58%,#050b17_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:76px_76px]" />
        <div className="relative mx-auto max-w-[1440px] px-4 pb-10 pt-6 md:px-6 md:pb-14 md:pt-8">
          <div className="mx-auto flex max-w-[980px] flex-col items-center px-2 pb-10 pt-20 text-center md:pt-28">
            <p className="text-[10px] uppercase tracking-[0.42em] text-cyan-100/55">Image layered</p>
            <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-[-0.06em] text-white [font-family:var(--font-display)] md:text-7xl">
              Effortless Image Layering with AI
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
              Upload a product image and immediately generate a clean, editable stack of layers below.
            </p>

            <label className="mt-10 block w-full max-w-[620px] cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleUpload(file);
                  }
                  event.target.value = '';
                }}
              />
              <div className="rounded-[30px] bg-[rgba(20,31,56,0.78)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[22px] transition-transform duration-300 hover:-translate-y-1">
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,rgba(97,120,255,0.32),rgba(77,228,255,0.18))] text-white shadow-[0_18px_36px_rgba(77,228,255,0.18)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3v12" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white [font-family:var(--font-display)]">{isPreparing ? 'Preparing image...' : 'Upload image to start'}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-400">JPG, PNG, WEBP. We will drop you straight into the layered workspace.</p>
                  </div>
                  <span className="rounded-full bg-[linear-gradient(135deg,#89a2ff,#4de4ff)] px-5 py-3 text-sm font-semibold text-[#071123] shadow-[0_18px_36px_rgba(77,228,255,0.22)]">
                    {isPreparing ? 'Loading...' : 'Choose file'}
                  </span>
                </div>
              </div>
            </label>
          </div>
        </div>
      </section>

      <section id="hero-tool" className="mx-auto max-w-[1460px] px-4 pb-16 md:px-6 md:pb-24">
        <CrookedApp embedded initialImage={image} />
      </section>
    </div>
  );
}
