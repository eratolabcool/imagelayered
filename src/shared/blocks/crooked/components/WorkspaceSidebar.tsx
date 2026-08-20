'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
  BookOpen,
  FolderClosed,
  Home,
  Layers3,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

import { Icons } from './Icon';

const WorkspaceSidebar = () => {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'en';
  const isZh = locale === 'zh';
  const [collapsed, setCollapsed] = useState(false);

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
      href: `/${locale}/qwenimagelayered/guide`,
      label: isZh ? '分层指南' : 'Layering guide',
      description: isZh ? '获得更干净的图层' : 'Get cleaner layers',
      icon: BookOpen,
    },
  ];

  return (
    <aside className={`hidden shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0b10] px-3 py-4 transition-[width] duration-200 lg:flex ${collapsed ? 'w-[72px]' : 'w-[236px]'}`}>
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="mb-3 ml-auto flex size-8 items-center justify-center rounded-lg text-[#77717f] outline-none hover:bg-white/[0.055] hover:text-white focus-visible:ring-2 focus-visible:ring-[#ff6b96]"
        aria-label={collapsed ? (isZh ? '展开主侧栏' : 'Expand main sidebar') : (isZh ? '折叠主侧栏' : 'Collapse main sidebar')}
        title={collapsed ? (isZh ? '展开主侧栏' : 'Expand main sidebar') : (isZh ? '折叠主侧栏' : 'Collapse main sidebar')}
      >
        {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
      </button>
      <Link
        href={`/${locale}/qwenimagelayered`}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors outline-none hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-[#ff6b96]"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#f33b72] text-white shadow-[0_12px_30px_rgba(243,59,114,0.24)]">
          <Icons.Layer />
        </span>
        <span className={`min-w-0 ${collapsed ? 'hidden' : ''}`}>
          <strong className="block truncate text-sm font-extrabold tracking-[-0.02em] text-white">
            Image Layered
          </strong>
          <span className="mt-0.5 block text-[11px] text-[#77717f]">
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
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b96] ${
                active
                  ? 'bg-[#211d28] text-white shadow-[inset_3px_0_0_#f33b72]'
                  : 'text-[#9993a3] hover:bg-white/[0.045] hover:text-white'
              }`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-[#f33b72]/12 text-[#ff6b96]' : 'bg-white/[0.035] text-[#77717f] group-hover:text-white'}`}
              >
                <Icon className="size-4" />
              </span>
              <span className={`min-w-0 flex-1 ${collapsed ? 'hidden' : ''}`}>
                <span className="block truncate text-sm font-bold">
                  {item.label}
                </span>
                <span
                  className={`mt-0.5 block truncate text-[10px] ${active ? 'text-[#938b9b]' : 'text-[#5f5966]'}`}
                >
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#77717f] transition-colors outline-none hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[#ff6b96]"
          title={isZh ? '返回网站首页' : 'Back to website'}
        >
          <Home className="size-3.5" />
          {!collapsed && (isZh ? '返回网站首页' : 'Back to website')}
        </Link>
      </div>
    </aside>
  );
};

export default WorkspaceSidebar;
