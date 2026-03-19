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
    <div className="min-h-screen bg-[#f6f1e8] text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,122,61,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(47,109,246,0.14),transparent_24%),linear-gradient(180deg,#fffdfa,#f6f1e8)]" />
        <div className="relative mx-auto max-w-[1040px] px-4 pb-10 pt-10 md:px-6 md:pb-14 md:pt-14">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              ProductViews
            </div>
            <h1 className="mt-8 max-w-5xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
              One image in. A stack of editable possibilities out.
            </h1>
            <div className="mt-8">
              <label className="block">
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
                <span className="inline-flex cursor-pointer items-center rounded-full bg-[#2f6df6] px-6 py-3 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(47,109,246,0.22)] transition hover:bg-[#245ce0]">
                  {isPreparing ? 'Preparing upload...' : 'Upload Image'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section id="hero-tool" className="mx-auto max-w-[1320px] px-4 pb-16 md:px-6 md:pb-24">
        <CrookedApp embedded initialImage={image} />
      </section>
    </div>
  );
}
