'use client';

import dynamic from 'next/dynamic';

const CrookedApp = dynamic(() => import('@/shared/blocks/crooked').then(mod => mod.CrookedApp), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-[#0d0d0d] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm font-mono text-gray-500">Loading Editor...</p>
      </div>
    </div>
  )
});

export default function CrookedAppWrapper() {
  return <CrookedApp />;
}
