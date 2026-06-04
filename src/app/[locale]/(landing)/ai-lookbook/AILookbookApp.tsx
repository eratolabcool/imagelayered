'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Download,
  IdCard,
  ImagePlus,
  LoaderCircle,
  Shirt,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';

type UploadSlot = 'face' | 'body';

const styles = [
  { id: 'japanese', label: 'Japanese', note: 'Quiet layers, clean proportions' },
  { id: 'korean', label: 'Korean', note: 'Polished contemporary styling' },
  { id: 'chill', label: 'Chill', note: 'Relaxed everyday confidence' },
  { id: 'business', label: 'Business', note: 'Modern office presence' },
  { id: 'streetwear', label: 'Streetwear', note: 'Graphic urban energy' },
  { id: 'sleepwear', label: 'Sleepwear', note: 'Soft private comfort' },
  { id: 'date', label: 'Date Mode', note: 'Warm, intentional, expressive' },
  { id: 'airport', label: 'Airport Mode', note: 'Comfortable travel polish' },
];

const defaultProfile = {
  identity: 'Identity anchored from face and full-body references',
  appearance: 'Preserve facial features, hair, body proportions, and natural skin tone',
  direction: 'Contemporary personal fashion identity',
};

function extractImages(task: any): string[] {
  const candidates = [task?.taskInfo, task?.taskResult];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = typeof candidate === 'string' ? JSON.parse(candidate) : candidate;
      const images = parsed?.images || parsed?.output;
      if (Array.isArray(images)) {
        return images
          .map((image: any) =>
            typeof image === 'string'
              ? image
              : image?.imageUrl || image?.url || image?.image_url
          )
          .filter(Boolean);
      }
    } catch {
      // Continue through the other possible result shape.
    }
  }
  return [];
}

export default function AILookbookApp() {
  const [faceUrl, setFaceUrl] = useState('');
  const [bodyUrl, setBodyUrl] = useState('');
  const [characterId, setCharacterId] = useState('');
  const [profile, setProfile] = useState(defaultProfile);
  const [selectedStyle, setSelectedStyle] = useState('japanese');
  const [results, setResults] = useState<string[]>([]);
  const [uploading, setUploading] = useState<UploadSlot | null>(null);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);

  const uploadImage = async (slot: UploadSlot, file: File) => {
    setUploading(slot);
    try {
      const formData = new FormData();
      formData.append('files', file);
      const response = await fetch('/api/storage/upload-image', {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json();
      if (payload.code !== 0) throw new Error(payload.message || 'Upload failed');
      const url = payload.data.urls[0];
      if (slot === 'face') setFaceUrl(url);
      else setBodyUrl(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const createCharacter = async () => {
    if (!faceUrl || !bodyUrl) {
      toast.error('Upload both a clear face photo and a full-body photo first.');
      return;
    }

    setCreating(true);
    const localId = crypto.randomUUID();
    const characterProfile = JSON.stringify(profile);
    try {
      const response = await fetch('/api/lookbook/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'My Fashion Persona',
          faceImageUrl: faceUrl,
          fullBodyImageUrl: bodyUrl,
          characterProfile,
        }),
      });
      const payload = await response.json();
      setCharacterId(payload.code === 0 ? payload.data.id : localId);
      if (payload.code !== 0) {
        toast.info('Character ID is ready for this session. Sign in to save it permanently.');
      } else {
        toast.success('Character ID saved.');
      }
    } catch {
      setCharacterId(localId);
      toast.info('Character ID is ready for this session.');
    } finally {
      setCreating(false);
    }
  };

  const generateLookbook = async () => {
    if (!characterId) {
      toast.error('Create your Character ID first.');
      return;
    }

    const style = styles.find((item) => item.id === selectedStyle) ?? styles[0];
    setGenerating(true);
    setResults([]);

    try {
      const prompt = [
        'Use the uploaded person as the only character reference.',
        'Maintain identity consistency across every generated image.',
        'Preserve facial features, hairstyle, body proportions, age, and natural skin tone.',
        `Create a cohesive four-image personal fashion lookbook in ${style.label} style.`,
        style.note + '.',
        'Each image should show a different natural pose and complementary setting.',
        'This is a personal fashion identity editorial, not a virtual try-on.',
        'High-end fashion photography, realistic fabric, clean composition, full person visible.',
      ].join(' ');

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType: 'image',
          scene: 'lookbook-generate',
          provider: 'fal',
          model: 'openai/gpt-image-2/edit',
          prompt,
          options: {
            image_urls: [faceUrl, bodyUrl],
            num_images: 4,
            image_size: 'portrait_4_3',
            quality: 'high',
            output_format: 'png',
            sync_mode: true,
          },
        }),
      });
      const payload = await response.json();
      if (payload.code !== 0) throw new Error(payload.message || 'Lookbook generation failed');

      let images = extractImages(payload.data);
      if (!images.length && payload.data?.id) {
        for (let attempt = 0; attempt < 30 && !images.length; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 2500));
          const queryResponse = await fetch('/api/ai/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: payload.data.id }),
          });
          const queryPayload = await queryResponse.json();
          images = extractImages(queryPayload.data);
          if (queryPayload.data?.status === 'FAILED') {
            throw new Error('Lookbook generation failed');
          }
        }
      }

      if (!images.length) throw new Error('No lookbook images were returned.');
      setResults(images.slice(0, 4));
      toast.success('Your fashion identity lookbook is ready.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lookbook generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const selected = styles.find((item) => item.id === selectedStyle) ?? styles[0];

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#171717]">
      <section className="border-b border-black/10 bg-[#111827] px-4 py-10 text-white md:px-8">
        <div className="mx-auto max-w-[1280px]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200/70">
            AI Personal Fashion Identity
          </p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black leading-none md:text-6xl">AI Lookbook</h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                You are not trying on clothes. You are building a visual identity for the person
                you are becoming.
              </p>
            </div>
            <div className="flex gap-2">
              {['Upload', 'Character ID', 'Generate'].map((label, index) => {
                const active =
                  index === 0 ? !!faceUrl && !!bodyUrl : index === 1 ? !!characterId : !!results.length;
                return (
                  <span
                    key={label}
                    className={`rounded-full px-3 py-2 text-xs font-black ${
                      active ? 'bg-cyan-300 text-[#071123]' : 'bg-white/8 text-slate-300'
                    }`}
                  >
                    {index + 1}. {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-5 px-4 py-6 md:px-8 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="space-y-5">
          <section className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <ImagePlus className="size-5 text-[#0f766e]" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">Step 1</p>
                <h2 className="text-xl font-black">Upload your references</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { slot: 'face' as const, label: 'Clear face photo', url: faceUrl },
                { slot: 'body' as const, label: 'Full-body photo', url: bodyUrl },
              ].map((item) => (
                <label
                  key={item.slot}
                  className="relative flex aspect-[4/5] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-black/20 bg-[#f4f1eb]"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadImage(item.slot, file);
                      event.target.value = '';
                    }}
                  />
                  {item.url ? (
                    <img src={item.url} alt={item.label} className="h-full w-full object-cover" />
                  ) : (
                    <div className="p-4 text-center">
                      {uploading === item.slot ? (
                        <LoaderCircle className="mx-auto size-6 animate-spin" />
                      ) : (
                        <UserRound className="mx-auto size-6" />
                      )}
                      <p className="mt-3 text-sm font-black">{item.label}</p>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex items-center gap-3">
              <IdCard className="size-5 text-[#0f766e]" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">Step 2</p>
                <h2 className="text-xl font-black">Build Character ID</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {Object.entries(profile).map(([key, value]) => (
                <label key={key} className="block">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
                    {key}
                  </span>
                  <input
                    value={value}
                    onChange={(event) =>
                      setProfile((current) => ({ ...current, [key]: event.target.value }))
                    }
                    className="mt-2 w-full rounded-md border border-black/10 bg-[#f4f1eb] px-3 py-2 text-sm font-semibold outline-none focus:border-[#0f766e]"
                  />
                </label>
              ))}
            </div>
            <button
              onClick={createCharacter}
              disabled={!faceUrl || !bodyUrl || creating}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-3 text-sm font-black text-white disabled:opacity-40"
            >
              {creating ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {characterId ? 'Rebuild Character ID' : 'Create Character ID'}
            </button>
            {characterId && (
              <div className="mt-3 rounded-md bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                Character ID: {characterId.slice(0, 12)}
              </div>
            )}
          </section>
        </aside>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">Step 3</p>
              <h2 className="mt-1 text-3xl font-black">Choose your future style</h2>
              <p className="mt-2 text-sm font-semibold text-neutral-500">
                Four consistent images. One visual identity.
              </p>
            </div>
            <button
              onClick={generateLookbook}
              disabled={!characterId || generating}
              className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0f766e] px-5 text-sm font-black text-white disabled:opacity-40"
            >
              {generating ? <LoaderCircle className="size-4 animate-spin" /> : <Shirt className="size-4" />}
              Generate 4 images
              {!generating && <ArrowRight className="size-4" />}
            </button>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`min-h-24 rounded-md border p-3 text-left ${
                  selectedStyle === style.id
                    ? 'border-[#0f766e] bg-emerald-50'
                    : 'border-black/10 bg-[#f4f1eb] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-black">{style.label}</span>
                  {selectedStyle === style.id && <Check className="size-4 text-[#0f766e]" />}
                </div>
                <p className="mt-2 text-xs font-semibold leading-5 text-neutral-500">{style.note}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 grid min-h-[520px] gap-3 rounded-lg bg-[#111827] p-3 sm:grid-cols-2">
            {results.length ? (
              results.map((url, index) => (
                <article key={url} className="group relative overflow-hidden rounded-md bg-black">
                  <img
                    src={url}
                    alt={`${selected.label} lookbook ${index + 1}`}
                    className="aspect-[4/5] h-full w-full object-cover"
                  />
                  <a
                    href={url}
                    download
                    className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition group-hover:opacity-100"
                    title="Download image"
                  >
                    <Download className="size-4" />
                  </a>
                  <span className="absolute bottom-3 left-3 rounded-md bg-black/65 px-2 py-1 text-xs font-black text-white">
                    {selected.label} 0{index + 1}
                  </span>
                </article>
              ))
            ) : (
              <div className="col-span-full flex min-h-[496px] flex-col items-center justify-center text-center text-white">
                <Sparkles className="size-8 text-cyan-200" />
                <h3 className="mt-4 text-2xl font-black">Your future self appears here</h3>
                <p className="mt-2 max-w-md text-sm font-semibold leading-7 text-slate-400">
                  Create a Character ID, select a style, and generate a four-image personal
                  fashion story.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
