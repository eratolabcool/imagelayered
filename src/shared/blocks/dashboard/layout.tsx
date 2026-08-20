import { ReactNode } from 'react';

import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { Sidebar as SidebarType } from '@/shared/types/blocks/dashboard';

import { Sidebar } from './sidebar';

export function DashboardLayout({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: SidebarType;
}) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 14)',
        } as React.CSSProperties
      }
    >
      {sidebar && (
        <Sidebar variant={sidebar.variant || 'inset'} sidebar={sidebar} />
      )}
      <SidebarInset className="bg-[#0b090d] md:m-2 md:rounded-2xl md:border md:border-white/[0.06] md:shadow-[0_26px_80px_rgba(0,0,0,0.32)]">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
