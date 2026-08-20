'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  BookOpen,
  FolderClosed,
  Home,
  Layers3,
  Sparkles,
  Workflow,
} from 'lucide-react';

import { Icons } from './Icon';

const WorkspaceSidebar = () => {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'en';
  const isZh = locale === 'zh';

  const items = [
    {
      href: `/${locale}/qwenimagelayered`,
      label: isZh ? '分层工作区' : 'Layer workspace',
      description: isZh ? '上传、拆分与编辑' : 'Upload, split, and edit',
      icon: Layers3,
      exact: true,
    },
    {
      href: `/${locale}/settings/projects`,
      label: isZh ? '我的项目' : 'My projects',
      description: isZh ? '继续最近的设计' : 'Continue recent work',
      icon: FolderClosed,
    },
    {
      href: `/${locale}/qwenimagelayered/workflows`,
      label: isZh ? '工作流模板' : 'Workflows',
      description: isZh ? '按图片类型开始' : 'Start by image type',
      icon: Workflow,
    },
    {
      href: `/${locale}/qwenimagelayered/guide`,
      label: isZh ? '分层指南' : 'Layering guide',
      description: isZh ? '获得更干净的图层' : 'Get cleaner layers',
      icon: BookOpen,
    },
  ];

  return (
    <aside className="hidden w-[248px] shrink-0 flex-col bg-[#091328]/88 px-3 py-4 shadow-[18px_0_56px_rgba(0,0,0,0.18)] lg:flex">
      <Link
        href={`/${locale}/qwenimagelayered`}
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors outline-none hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#b89fff]"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#b89fff,#4de4ff)] text-[#071123] shadow-[0_12px_30px_rgba(77,228,255,0.18)]">
          <Icons.Layer />
        </span>
        <span className="min-w-0">
          <strong className="block truncate text-sm font-extrabold tracking-[-0.02em] text-[#dee5ff]">
            Image Layered
          </strong>
          <span className="mt-0.5 block text-[11px] text-cyan-100/58">
            AI layer studio
          </span>
        </span>
      </Link>

      <nav
        className="mt-7 space-y-1"
        aria-label={isZh ? '工作区导航' : 'Workspace navigation'}
      >
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#b89fff] ${
                active
                  ? 'bg-[#192540] text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)]'
                  : 'text-slate-300 hover:bg-white/[0.055] hover:text-white'
              }`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ${active ? 'text-cyan-100' : 'text-slate-400 group-hover:text-cyan-100'}`}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">
                  {item.label}
                </span>
                <span
                  className={`mt-0.5 block truncate text-[10px] ${active ? 'text-cyan-100/55' : 'text-slate-500'}`}
                >
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <div className="rounded-2xl bg-[#141f38] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-2 text-cyan-100">
            <Sparkles className="size-4" />
            <span className="text-xs font-extrabold">
              {isZh ? '推荐流程' : 'Recommended flow'}
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-400">
            {isZh
              ? '先选工作流，再上传图片。AI 会自动匹配更合适的分层方式。'
              : 'Pick a workflow before uploading so the model starts with the right layer structure.'}
          </p>
          <Link
            href={`/${locale}/qwenimagelayered/workflows`}
            className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.07] px-3 py-2 text-xs font-bold text-white transition-colors outline-none hover:bg-white/[0.11] focus-visible:ring-2 focus-visible:ring-[#b89fff]"
          >
            {isZh ? '选择工作流' : 'Choose workflow'}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 transition-colors outline-none hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[#b89fff]"
        >
          <Home className="size-3.5" />
          {isZh ? '返回网站首页' : 'Back to website'}
        </Link>
      </div>
    </aside>
  );
};

export default WorkspaceSidebar;
