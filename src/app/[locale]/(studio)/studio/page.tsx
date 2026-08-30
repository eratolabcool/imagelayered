import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { StudioStart } from '@/features/studio/components/StudioStart';

export const metadata: Metadata = {
  title: 'Image Layered Studio',
  description:
    'Upload an image, work with editable layers, and make focused AI edits without regenerating the whole composition.',
};

export default async function StudioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <StudioStart />;
}
