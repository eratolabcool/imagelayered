import Link from 'next/link';
import { ArrowRight, CheckCircle2, Layers3, Upload } from 'lucide-react';

export type ToolPageConfig = {
  eyebrow: string;
  title: string;
  description: string;
  scenarios: string[];
  faqs: Array<[string, string]>;
};

export function ToolLandingPage({ config }: { config: ToolPageConfig }) {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 px-6 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
            <Layers3 className="size-3.5" /> {config.eyebrow}
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">{config.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">{config.description}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/studio" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500">
              <Upload className="size-4" /> Open Studio <ArrowRight className="size-4" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-6 py-3 font-medium text-zinc-200 hover:bg-zinc-900">
              View credits and export plans
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-500">Local upload and layer arrangement are free. AI decomposition and selected-layer edits require sign-in and credits; PSD and PNG ZIP exports from a completed project do not consume credits.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 py-14 md:grid-cols-3">
        {config.scenarios.map((scenario) => (
          <Link key={scenario} href="/studio" className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition hover:-translate-y-1 hover:border-blue-500/50">
            <CheckCircle2 className="size-5 text-emerald-400" />
            <h2 className="mt-4 text-lg font-semibold">{scenario}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Upload an image, inspect the semantic layers, lock what must stay unchanged, then export the revision.</p>
          </Link>
        ))}
      </section>

      <section className="border-y border-zinc-800 bg-zinc-900/30 px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold">What the PSD export preserves</h2>
          <p className="mt-4 leading-7 text-zinc-400">The download is a multi-layer raster PSD. It keeps layer names, transparency, visibility, order, and canvas coordinates. Native fonts, vectors, smart objects, masks, blend modes, and complete edit history are not reconstructed.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <h2 className="text-2xl font-bold">Common questions</h2>
        <div className="mt-6 space-y-5">
          {config.faqs.map(([question, answer]) => (
            <div key={question}>
              <h3 className="font-semibold text-zinc-200">{question}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
