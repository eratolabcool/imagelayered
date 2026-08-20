import Link from 'next/link';
import { ArrowLeft, Layers3 } from 'lucide-react';

import WorkspaceSidebar from './WorkspaceSidebar';

interface WorkspaceResourceShellProps {
  locale: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

const WorkspaceResourceShell = ({
  locale,
  title,
  description,
  children,
}: WorkspaceResourceShellProps) => {
  const isZh = locale === 'zh';

  return (
    <div className="min-h-screen bg-[#060e20] [font-family:var(--font-body)] text-[#dee5ff]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(184,159,255,0.14),transparent_30%),radial-gradient(circle_at_35%_100%,rgba(77,228,255,0.09),transparent_34%)]" />
      <div className="relative flex min-h-screen">
        <WorkspaceSidebar />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between gap-4 lg:hidden">
              <Link
                href={`/${locale}/qwenimagelayered`}
                className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#b89fff]"
              >
                <ArrowLeft className="size-4" />
                {isZh ? '返回工作区' : 'Back to workspace'}
              </Link>
              <span className="flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#b89fff,#4de4ff)] text-[#071123]">
                <Layers3 className="size-4" />
              </span>
            </div>

            <header className="max-w-3xl pt-10 lg:pt-3">
              <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-balance text-white sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                {description}
              </p>
            </header>

            <div className="mt-10">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkspaceResourceShell;
