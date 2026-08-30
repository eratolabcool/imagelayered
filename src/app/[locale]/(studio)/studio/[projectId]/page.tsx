import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { StudioShell } from '@/features/studio/components/StudioShell';

export const metadata: Metadata = {
  title: 'Project · Image Layered Studio',
  description: 'Edit and refine layered image projects in Image Layered Studio.',
};

export default async function StudioProjectPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  return <StudioShell projectId={projectId} />;
}
