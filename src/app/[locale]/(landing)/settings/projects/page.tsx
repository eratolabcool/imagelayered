'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ExternalLink, FolderClosed, Layers3, Plus, Search, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectData {
  id: string;
  name: string;
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

type ProjectSort = 'updated-desc' | 'updated-asc' | 'name';

export default function ProjectsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isZh = locale === 'zh';
  const editorPath = `/${locale}/qwenimagelayered`;

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<ProjectSort>('updated-desc');

  const copy = {
    title: isZh ? '我的分层项目' : 'My layered projects',
    description: isZh ? '继续最近的设计、查找历史作品，或分享一个可查看的分层工作区。' : 'Continue recent designs, find earlier work, or share a viewable layered workspace.',
    newProject: isZh ? '新建项目' : 'New project',
    search: isZh ? '搜索项目名称' : 'Search projects',
    empty: isZh ? '还没有分层项目' : 'No layered projects yet',
    emptyDescription: isZh ? '上传一张图片并完成首次分层后，项目会自动出现在这里。' : 'Upload an image and create its first layers. Your project will then appear here automatically.',
    noMatch: isZh ? '没有匹配的项目' : 'No matching projects',
    noMatchDescription: isZh ? '尝试更换关键词，或清除搜索条件。' : 'Try another name or clear the current search.',
    updated: isZh ? '最近更新' : 'Last updated',
    edit: isZh ? '继续编辑' : 'Continue editing',
    share: isZh ? '复制分享链接' : 'Copy share link',
    delete: isZh ? '删除项目' : 'Delete project',
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setLoadError(false);
        const response = await fetch('/api/projects', { signal: controller.signal });
        if (response.status === 401) {
          router.push(`/${locale}/sign-in?callback=/${locale}/settings/projects`);
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        if (data.code !== 0) throw new Error(data.message || 'Failed to fetch projects');
        setProjects(data.data || []);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('[ProjectsPage] Failed to load projects:', error);
        setLoadError(true);
        toast.error(isZh ? '项目加载失败，请刷新后重试。' : 'Projects failed to load. Refresh and try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchProjects();
    return () => controller.abort();
  }, [isZh, locale, retryToken, router]);

  const visibleProjects = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const filtered = normalized
      ? projects.filter((project) => project.name.toLocaleLowerCase().includes(normalized))
      : projects;
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, isZh ? 'zh-CN' : 'en-US');
      const difference = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sort === 'updated-asc' ? difference : -difference;
    });
  }, [isZh, projects, query, sort]);

  const formatDate = (date: string) => new Date(date).toLocaleString(isZh ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleShare = async (project: ProjectData, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${locale}/share/${project.id}`);
      toast.success(isZh ? '分享链接已复制' : 'Share link copied');
    } catch (error) {
      console.error('[ProjectsPage] Failed to copy share link:', error);
      toast.error(isZh ? '无法复制链接，请检查浏览器权限。' : 'Could not copy the link. Check browser permissions.');
    }
  };

  const handleDelete = async (project: ProjectData, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const confirmed = window.confirm(isZh ? `确定永久删除“${project.name}”吗？` : `Permanently delete “${project.name}”?`);
    if (!confirmed) return;
    try {
      setDeletingId(project.id);
      const response = await fetch(`/api/projects?id=${project.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setProjects((current) => current.filter((item) => item.id !== project.id));
      toast.success(isZh ? '项目已删除' : 'Project deleted');
    } catch (error) {
      console.error('[ProjectsPage] Failed to delete project:', error);
      toast.error(isZh ? '项目删除失败，请稍后重试。' : 'Project deletion failed. Try again later.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 [font-family:var(--font-body)]">
      <header className="flex flex-col gap-5 rounded-2xl bg-[#091328] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-extrabold tracking-[-0.025em] text-[#dee5ff]">{copy.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{copy.description}</p>
        </div>
        <Link href={editorPath} className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#b89fff,#4de4ff)] px-4 py-2.5 text-sm font-extrabold text-[#071123] outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white">
          <Plus className="size-4" />
          {copy.newProject}
        </Link>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl bg-[#141f38] p-3 sm:flex-row sm:items-center">
        <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#091328] px-3 focus-within:ring-2 focus-within:ring-[#b89fff]">
          <Search className="size-4 shrink-0 text-cyan-100/50" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} className="min-w-0 flex-1 bg-transparent text-sm text-[#dee5ff] outline-none placeholder:text-slate-500" />
        </label>
        <select value={sort} onChange={(event) => setSort(event.target.value as ProjectSort)} aria-label={isZh ? '项目排序' : 'Sort projects'} className="min-h-11 rounded-xl bg-[#091328] px-3 text-xs font-bold text-slate-200 outline-none focus:ring-2 focus:ring-[#b89fff]">
          <option value="updated-desc">{isZh ? '最近更新优先' : 'Recently updated'}</option>
          <option value="updated-asc">{isZh ? '较早更新优先' : 'Oldest updated'}</option>
          <option value="name">{isZh ? '按名称排序' : 'Project name'}</option>
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label={isZh ? '正在加载项目' : 'Loading projects'}>
          {[0, 1, 2].map((item) => <div key={item} className="h-[310px] animate-pulse rounded-2xl bg-[#091328]" />)}
        </div>
      ) : loadError ? (
        <div className="rounded-2xl bg-[#091328] px-6 py-16 text-center shadow-[0_18px_54px_rgba(0,0,0,0.2)]" role="alert">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-400/[0.08] text-rose-200"><FolderClosed className="size-6" /></div>
          <h2 className="mt-4 text-lg font-extrabold text-[#dee5ff]">{isZh ? '项目暂时无法加载' : 'Projects are temporarily unavailable'}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{isZh ? '请检查网络连接后重试。现有项目不会受到影响。' : 'Check your connection and try again. Your existing projects are unaffected.'}</p>
          <button type="button" onClick={() => setRetryToken((value) => value + 1)} className="mt-5 min-h-11 rounded-xl bg-white/[0.07] px-4 py-2.5 text-sm font-bold text-white hover:bg-white/[0.11] focus-visible:ring-2 focus-visible:ring-[#b89fff]">{isZh ? '重新加载' : 'Try again'}</button>
        </div>
      ) : visibleProjects.length === 0 ? (
        <div className="rounded-2xl bg-[#091328] px-6 py-16 text-center shadow-[0_18px_54px_rgba(0,0,0,0.2)]">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white/[0.055] text-slate-400"><FolderClosed className="size-6" /></div>
          <h2 className="mt-4 text-lg font-extrabold text-[#dee5ff]">{projects.length === 0 ? copy.empty : copy.noMatch}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{projects.length === 0 ? copy.emptyDescription : copy.noMatchDescription}</p>
          {projects.length === 0 ? (
            <Link href={editorPath} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/[0.07] px-4 py-2.5 text-sm font-bold text-white hover:bg-white/[0.11] focus-visible:ring-2 focus-visible:ring-[#b89fff]"><Plus className="size-4" />{copy.newProject}</Link>
          ) : (
            <button type="button" onClick={() => setQuery('')} className="mt-5 min-h-11 rounded-xl bg-white/[0.07] px-4 py-2.5 text-sm font-bold text-white hover:bg-white/[0.11] focus-visible:ring-2 focus-visible:ring-[#b89fff]">{isZh ? '清除搜索' : 'Clear search'}</button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <article key={project.id} className="group overflow-hidden rounded-2xl bg-[#091328] shadow-[0_18px_54px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:-translate-y-0.5">
              <button type="button" onClick={() => router.push(`${editorPath}?project=${project.id}`)} className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#b89fff]">
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#050b17]">
                  {project.previewUrl ? <img src={project.previewUrl} alt={project.name} loading="lazy" className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" /> : <div className="flex flex-col items-center gap-2 text-slate-600"><Layers3 className="size-8" /><span className="text-[10px] font-bold uppercase tracking-[0.14em]">Layered draft</span></div>}
                  <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-[#141f38]/92 px-3 py-2 text-[11px] font-bold text-white opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.32)] transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{copy.edit}<ExternalLink className="size-3" /></span>
                </div>
                <div className="px-4 pb-3 pt-4">
                  <h2 className="truncate text-base font-extrabold text-[#dee5ff]">{project.name}</h2>
                  <p className="mt-1.5 text-xs text-slate-500">{copy.updated} · {formatDate(project.updatedAt)}</p>
                </div>
              </button>
              <div className="flex items-center justify-between bg-white/[0.035] px-3 py-2.5">
                <button type="button" onClick={(event) => handleShare(project, event)} className="flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold text-slate-300 hover:bg-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-[#b89fff]" title={copy.share}><Share2 className="size-3.5" />{isZh ? '分享' : 'Share'}</button>
                <button type="button" onClick={(event) => handleDelete(project, event)} disabled={deletingId === project.id} className="flex size-9 items-center justify-center rounded-xl text-rose-200/70 hover:bg-rose-400/[0.09] hover:text-rose-200 focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-40" aria-label={copy.delete}><Trash2 className="size-3.5" /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
