'use client';

import React, { useState } from 'react';
import { Icons } from './Icon';
import { ExportResolution, ExportSettings } from '../types';
import { useCrookedCopy } from '../i18n';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: ExportSettings) => void;
  isProcessing: boolean;
  initialWidth: number;
  initialHeight: number;
}

const CrookedExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isProcessing,
  initialWidth,
  initialHeight
}) => {
  const copy = useCrookedCopy().exportModal;
  const [settings, setSettings] = useState<ExportSettings>({
    width: initialWidth,
    height: initialHeight,
    useOriginalSize: true, // Default to original size to avoid blurriness
    upscale: true,
    resolution: '2K'
  });

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(settings);
  };

  const handleUseOriginalSize = () => {
    setSettings({
      ...settings,
      useOriginalSize: true,
      width: initialWidth,
      height: initialHeight
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[30px] bg-[rgba(20,31,56,0.92)] p-8 text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <Icons.Download />
            {copy.title}
          </h2>
          <button onClick={onClose} className="text-slate-400 transition-colors hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Original Size Button */}
          <button
            onClick={handleUseOriginalSize}
            className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
              settings.useOriginalSize
                ? 'bg-[linear-gradient(135deg,rgba(137,162,255,0.24),rgba(77,228,255,0.18))] text-cyan-50'
                : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            {settings.useOriginalSize
              ? copy.originalSizeSelected.replace('{width}', String(initialWidth)).replace('{height}', String(initialHeight))
              : copy.originalSize.replace('{width}', String(initialWidth)).replace('{height}', String(initialHeight))}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">{copy.width}</label>
              <input
                type="number"
                value={settings.width}
                onChange={(e) => setSettings({ ...settings, width: parseInt(e.target.value) || 0, useOriginalSize: false })}
                disabled={settings.useOriginalSize}
                className={`w-full rounded-xl bg-white/[0.05] px-4 py-3 text-white outline-none transition-colors focus:bg-white/[0.08] ${
                  settings.useOriginalSize ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">{copy.height}</label>
              <input
                type="number"
                value={settings.height}
                onChange={(e) => setSettings({ ...settings, height: parseInt(e.target.value) || 0, useOriginalSize: false })}
                disabled={settings.useOriginalSize}
                className={`w-full rounded-xl bg-white/[0.05] px-4 py-3 text-white outline-none transition-colors focus:bg-white/[0.08] ${
                  settings.useOriginalSize ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.05] p-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{copy.aiUpscale}</span>
                <span className="text-xs text-slate-400">{copy.aiUpscaleSub}</span>
              </div>
              <button
                onClick={() => setSettings({ ...settings, upscale: !settings.upscale })}
                className={`relative h-6 w-12 rounded-full transition-colors ${settings.upscale ? 'bg-cyan-400' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 h-4 w-4 rounded-full bg-[#071123] transition-all ${settings.upscale ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {settings.upscale && (
              <div className="grid grid-cols-3 gap-3">
                {(['1K', '2K', '4K'] as ExportResolution[]).map((res) => (
                  <button
                    key={res}
                    onClick={() => setSettings({ ...settings, resolution: res })}
                    className={`rounded-xl py-3 text-xs font-bold transition-all ${
                      settings.resolution === res
                      ? 'bg-[linear-gradient(135deg,rgba(137,162,255,0.24),rgba(77,228,255,0.18))] text-cyan-50'
                      : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    {res} {res === '4K' ? copy.resolutionPro : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4">
             <button
              onClick={handleExport}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#89a2ff,#4de4ff)] py-4 font-bold text-[#071123] transition-all shadow-xl shadow-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#071123]/20 border-t-[#071123]" />
                  {copy.processing}
                </>
              ) : (
                copy.start
              )}
            </button>
            <p className="mt-4 text-center text-[10px] uppercase tracking-widest leading-relaxed text-slate-500">
              {copy.disclaimer}
              <br />
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">{copy.learnBilling}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrookedExportModal;
