'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FolderClosed,
  Trash2,
  Share2,
  ExternalLink,
  Loader2,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ProjectData {
  id: string;
  name: string;
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isZh = locale === 'zh';

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Translations
  const t = {
    title: isZh ? '海报项目库' : 'My Layered Projects',
    description: isZh
      ? '在这里管理、重新加载或分享您用 AI 分层的海报与产品图设计。'
      : 'Manage, reload, or share your layered poster and product design projects.',
    newProject: isZh ? '新建分层海报' : 'New Layered Project',
    noProjects: isZh ? '暂无海报项目' : 'No projects found',
    noProjectsDesc: isZh
      ? '上传一张海报，AI 将自动为您分离图层并开启编辑！'
      : 'Upload a poster and the AI will automatically extract layers and open the editor!',
    uploadBtn: isZh ? '立即上传海报' : 'Upload Poster Now',
    lastUpdated: isZh ? '最后更新' : 'Last updated',
    btnEdit: isZh ? '继续编辑' : 'Edit Project',
    btnShare: isZh ? '分享图层' : 'Share Workspace',
    btnDelete: isZh ? '删除' : 'Delete',
    toastDeleteSuccess: isZh ? '项目删除成功' : 'Project deleted successfully',
    toastDeleteFail: isZh ? '项目删除失败' : 'Failed to delete project',
    toastShareSuccess: isZh ? '分享链接已复制到剪贴板' : 'Share link copied to clipboard!',
    toastShareFail: isZh ? '生成分享链接失败' : 'Failed to generate share link',
    confirmDelete: isZh ? '您确定要永久删除这个海报项目吗？' : 'Are you sure you want to permanently delete this layered project?',
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      if (!res.ok) {
        if (res.status === 401) {
          // Redirect to sign in if unauthenticated
          router.push(`/sign-in?callback=/settings/projects`);
          return;
        }
        throw new Error('Failed to fetch projects');
      }
      const data = await res.json();
      if (data.code === 0) {
        setProjects(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch');
      }
    } catch (err) {
      console.error('[ProjectsPage] fetch failed:', err);
      toast.error(isZh ? '加载项目列表失败' : 'Failed to load projects list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(t.confirmDelete)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');

      toast.success(t.toastDeleteSuccess);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('[ProjectsPage] delete failed:', err);
      toast.error(t.toastDeleteFail);
    } finally {
      setDeletingId(null);
    }
  };

  const handleShare = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const shareUrl = `${window.location.origin}/${locale}/share/${id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success(t.toastShareSuccess);
    } catch (err) {
      console.error('[ProjectsPage] share copy failed:', err);
      toast.error(t.toastShareFail);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm font-mono text-gray-400">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">{t.title}</h2>
          <p className="mt-1 text-sm text-gray-400">{t.description}</p>
        </div>
        <Link
          href="/qwenimagelayered"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="size-4" />
          {t.newProject}
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-gray-400 mb-4">
            <FolderClosed className="size-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{t.noProjects}</h3>
          <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
            {t.noProjectsDesc}
          </p>
          <Link
            href="/qwenimagelayered"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {t.uploadBtn}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/qwenimagelayered?project=${project.id}`)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/5 bg-[#121c32]/40 p-4 transition-all duration-300 hover:border-white/14 hover:bg-[#121c32]/70 hover:-translate-y-1 shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#09101f] shadow-inner mb-4 flex items-center justify-center">
                {project.previewUrl ? (
                  <img
                    src={project.previewUrl}
                    alt={project.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-cyan-500/40">
                    <div className="relative flex size-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Layers className="size-6" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                      Layered Draft
                    </span>
                  </div>
                )}
                
                {/* Floating overlay action badge */}
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-2">
                  <span className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg flex items-center gap-1.5 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                    {t.btnEdit}
                    <ExternalLink className="size-3" />
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="px-1">
                <h4 className="truncate text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  {project.name}
                </h4>
                <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                  <span>{t.lastUpdated}:</span>
                  <span className="font-mono">{formatDate(project.updatedAt)}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-white/5 pt-3.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleShare(project.id, e)}
                  title={t.btnShare}
                  className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Share2 className="size-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(project.id, e)}
                  disabled={deletingId === project.id}
                  title={t.btnDelete}
                  className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-gray-500 hover:bg-red-500/14 hover:text-red-400 transition-colors"
                >
                  {deletingId === project.id ? (
                    <Loader2 className="size-4 animate-spin text-gray-500" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
