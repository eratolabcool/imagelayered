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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Icons.Download />
            {copy.title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Original Size Button */}
          <button
            onClick={handleUseOriginalSize}
            className={`w-full py-3 rounded-xl text-sm font-bold border transition-all ${
              settings.useOriginalSize
                ? 'bg-green-600/20 border-green-500 text-green-400'
                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
            }`}
          >
            {settings.useOriginalSize
              ? copy.originalSizeSelected.replace('{width}', String(initialWidth)).replace('{height}', String(initialHeight))
              : copy.originalSize.replace('{width}', String(initialWidth)).replace('{height}', String(initialHeight))}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">{copy.width}</label>
              <input
                type="number"
                value={settings.width}
                onChange={(e) => setSettings({ ...settings, width: parseInt(e.target.value) || 0, useOriginalSize: false })}
                disabled={settings.useOriginalSize}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors ${
                  settings.useOriginalSize ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">{copy.height}</label>
              <input
                type="number"
                value={settings.height}
                onChange={(e) => setSettings({ ...settings, height: parseInt(e.target.value) || 0, useOriginalSize: false })}
                disabled={settings.useOriginalSize}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors ${
                  settings.useOriginalSize ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{copy.aiUpscale}</span>
                <span className="text-xs text-gray-500">{copy.aiUpscaleSub}</span>
              </div>
              <button
                onClick={() => setSettings({ ...settings, upscale: !settings.upscale })}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.upscale ? 'bg-blue-600' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.upscale ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {settings.upscale && (
              <div className="grid grid-cols-3 gap-3">
                {(['1K', '2K', '4K'] as ExportResolution[]).map((res) => (
                  <button
                    key={res}
                    onClick={() => setSettings({ ...settings, resolution: res })}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                      settings.resolution === res
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
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
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {copy.processing}
                </>
              ) : (
                copy.start
              )}
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-widest leading-relaxed">
              {copy.disclaimer}
              <br />
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{copy.learnBilling}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrookedExportModal;
