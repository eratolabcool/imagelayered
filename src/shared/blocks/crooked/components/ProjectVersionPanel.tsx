'use client';

import { useEffect, useState } from 'react';
import { Camera, History, RotateCcw, Trash2, X } from 'lucide-react';

import type { Layer } from '../types';

export interface ProjectSnapshot {
  id: string;
  name: string;
  createdAt: number;
  layers: Layer[];
  selectedLayerId: string | null;
}

interface ProjectVersionPanelProps {
  open: boolean;
  isZh: boolean;
  snapshots: ProjectSnapshot[];
  onClose: () => void;
  onCreate: (name: string) => void;
  onRestore: (snapshot: ProjectSnapshot) => void;
  onDelete: (id: string) => void;
}

const ProjectVersionPanel = ({ open, isZh, snapshots, onClose, onCreate, onRestore, onDelete }: ProjectVersionPanelProps) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-[#020817]/58" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={isZh ? '项目版本' : 'Project versions'}
        onMouseDown={(event) => event.stopPropagation()}
        className="ml-auto flex h-full w-full max-w-md flex-col bg-[#0b162c] shadow-[-24px_0_80px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-center justify-between bg-[#141f38] px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold text-[#dee5ff]">{isZh ? '项目版本' : 'Project versions'}</h2>
            <p className="mt-1 text-xs text-slate-400">{isZh ? '保存可随时恢复的编辑节点' : 'Save restorable checkpoints while you work'}</p>
          </div>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-xl bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] focus-visible:ring-2 focus-visible:ring-[#b89fff]" aria-label={isZh ? '关闭版本面板' : 'Close versions'}>
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onCreate(name.trim());
            setName('');
          }}
          className="m-4 rounded-2xl bg-[#141f38] p-3"
        >
          <label className="block text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100/58">{isZh ? '新建快照' : 'New snapshot'}</label>
          <div className="mt-2 flex gap-2">
            <input value={name} maxLength={80} onChange={(event) => setName(event.target.value)} placeholder={isZh ? '例如：客户反馈前' : 'e.g. Before client feedback'} className="min-w-0 flex-1 rounded-xl bg-[#071123] px-3 py-2.5 text-base text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-[#b89fff] sm:text-xs" />
            <button type="submit" className="flex shrink-0 items-center gap-2 rounded-xl bg-cyan-300 px-3 py-2.5 text-xs font-black text-[#071123] outline-none hover:bg-cyan-200 focus-visible:ring-2 focus-visible:ring-white">
              <Camera className="size-4" />
              {isZh ? '保存' : 'Save'}
            </button>
          </div>
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5">
          {snapshots.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.04] px-6 py-12 text-center">
              <History className="mx-auto size-7 text-slate-600" />
              <p className="mt-3 text-sm font-bold text-slate-300">{isZh ? '还没有版本快照' : 'No snapshots yet'}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{isZh ? '在重要修改前保存一个版本，之后可以一键恢复。' : 'Save a checkpoint before a major edit so you can restore it later.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {snapshots.map((snapshot) => (
                <article key={snapshot.id} className="rounded-2xl bg-white/[0.05] p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-300/[0.10] text-violet-200"><History className="size-4" /></div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-[#dee5ff]">{snapshot.name}</h3>
                      <p className="mt-1 text-[10px] text-slate-500">{new Date(snapshot.createdAt).toLocaleString(isZh ? 'zh-CN' : 'en-US')} · {snapshot.layers.length} {isZh ? '个图层' : 'layers'}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => onRestore(snapshot)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.07] px-3 py-2 text-xs font-bold text-slate-100 hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-[#b89fff]"><RotateCcw className="size-3.5" />{isZh ? '恢复此版本' : 'Restore'}</button>
                    <button type="button" onClick={() => onDelete(snapshot.id)} className="flex size-9 items-center justify-center rounded-xl bg-rose-400/[0.08] text-rose-200 hover:bg-rose-400/[0.14] focus-visible:ring-2 focus-visible:ring-rose-300" aria-label={isZh ? '删除快照' : 'Delete snapshot'}><Trash2 className="size-3.5" /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default ProjectVersionPanel;
