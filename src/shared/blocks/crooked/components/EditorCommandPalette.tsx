'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Command, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface EditorCommand {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  icon: LucideIcon;
  disabled?: boolean;
  run: () => void;
}

interface EditorCommandPaletteProps {
  open: boolean;
  isZh: boolean;
  commands: EditorCommand[];
  onClose: () => void;
}

const EditorCommandPalette = ({ open, isZh, commands, onClose }: EditorCommandPaletteProps) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.description}`.toLocaleLowerCase().includes(normalized)
    );
  }, [commands, query]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 px-4 pt-[12vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isZh ? '编辑器命令' : 'Editor commands'}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#17141c] shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
      >
        <label className="flex items-center gap-3 bg-[#211d28] px-4 py-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#ff6b96]">
          <Search className="size-5 shrink-0 text-[#ff7ca2]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isZh ? '搜索命令或操作' : 'Search commands and actions'}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#dee5ff] outline-none placeholder:text-slate-500"
          />
          <kbd className="rounded-md bg-white/[0.07] px-2 py-1 text-[10px] font-bold text-slate-400">ESC</kbd>
        </label>

        <div className="max-h-[430px] overflow-y-auto p-2">
          {filtered.length ? filtered.map((command) => {
            const Icon = command.icon;
            return (
              <button
                key={command.id}
                type="button"
                disabled={command.disabled}
                onClick={() => {
                  command.run();
                  onClose();
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left outline-none transition-colors hover:bg-white/[0.055] focus-visible:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-[#ff6b96] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f33b72]/10 text-[#ff7ca2] group-hover:bg-[#f33b72] group-hover:text-white">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[#dee5ff]">{command.label}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-400">{command.description}</span>
                </span>
                {command.shortcut && <kbd className="rounded-md bg-white/[0.055] px-2 py-1 text-[10px] font-bold text-slate-500">{command.shortcut}</kbd>}
              </button>
            );
          }) : (
            <div className="px-4 py-12 text-center">
              <Command className="mx-auto size-6 text-slate-600" />
              <p className="mt-3 text-sm font-bold text-slate-300">{isZh ? '没有匹配的命令' : 'No matching commands'}</p>
              <p className="mt-1 text-xs text-slate-500">{isZh ? '尝试搜索“导出”或“版本”' : 'Try searching for “export” or “version”'}</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditorCommandPalette;
