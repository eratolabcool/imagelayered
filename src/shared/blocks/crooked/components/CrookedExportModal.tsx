'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

import { ExportSettings } from '../types';
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
  initialHeight,
}) => {
  const copy = useCrookedCopy().exportModal;
  const [settings, setSettings] = useState<ExportSettings>({
    width: initialWidth,
    height: initialHeight,
    useOriginalSize: true,
    upscale: false,
    resolution: '2K',
  });

  useEffect(() => {
    if (!isOpen) return;
    setSettings((current) => ({
      ...current,
      width: initialWidth,
      height: initialHeight,
      useOriginalSize: true,
      upscale: false,
    }));
  }, [initialHeight, initialWidth, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const useOriginalSize = () => {
    setSettings((current) => ({
      ...current,
      useOriginalSize: true,
      width: initialWidth,
      height: initialHeight,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isProcessing) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
        className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#17141c] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.58)] animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#f33b72]/12 text-[#ff7ca2]">
              <Download className="size-4" />
            </span>
            <h2 id="export-dialog-title" className="mt-4 text-xl font-bold tracking-[-0.025em]">
              {copy.title}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-[#9993a3]">
              {copy.disclaimer}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#77717f] outline-none hover:bg-white/[0.055] hover:text-white focus-visible:ring-2 focus-visible:ring-[#ff6b96] disabled:opacity-40"
            aria-label="Close export dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <button
            type="button"
            onClick={useOriginalSize}
            aria-pressed={settings.useOriginalSize}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b96] ${
              settings.useOriginalSize
                ? 'border-[#f33b72]/40 bg-[#f33b72]/10 text-white'
                : 'border-white/[0.07] bg-white/[0.035] text-[#aaa4b1] hover:bg-white/[0.06]'
            }`}
          >
            {settings.useOriginalSize
              ? copy.originalSizeSelected.replace('{width}', String(initialWidth)).replace('{height}', String(initialHeight))
              : copy.originalSize.replace('{width}', String(initialWidth)).replace('{height}', String(initialHeight))}
          </button>

          <div className="grid grid-cols-2 gap-3">
            {([
              ['width', copy.width],
              ['height', copy.height],
            ] as const).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-[11px] font-semibold text-[#9993a3]">{label}</span>
                <input
                  type="number"
                  min="1"
                  max="16384"
                  value={settings[key]}
                  onChange={(event) => setSettings((current) => ({
                    ...current,
                    [key]: Math.max(1, Math.min(16384, Number(event.target.value) || 1)),
                    useOriginalSize: false,
                  }))}
                  className="w-full rounded-xl border border-white/[0.07] bg-[#0f0d13] px-3 py-3 text-sm font-semibold text-white outline-none focus:border-[#f33b72]/45 focus:ring-2 focus:ring-[#f33b72]/18"
                />
              </label>
            ))}
          </div>

          <div className="rounded-xl bg-[#0f0d13] px-4 py-3 text-xs leading-5 text-[#88818f]">
            PNG · {settings.useOriginalSize ? `${initialWidth} × ${initialHeight}` : `${settings.width} × ${settings.height}`}
          </div>

          <button
            type="button"
            onClick={() => onExport(settings)}
            disabled={isProcessing}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f33b72] px-4 py-3 text-sm font-bold text-white shadow-[0_14px_34px_rgba(243,59,114,0.24)] outline-none hover:bg-[#ff4f83] focus-visible:ring-2 focus-visible:ring-[#ff9ab7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isProcessing ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                {copy.processing}
              </>
            ) : (
              <>
                <Download className="size-4" />
                {copy.start}
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default CrookedExportModal;
