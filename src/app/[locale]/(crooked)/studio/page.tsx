import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { StudioStart } from '@/features/studio/components/StudioStart';

export const metadata: Metadata = {
  title: 'Image Layered Studio',
  description:
    'Upload an image, work with editable layers, and make focused AI edits without regenerating the whole composition.',
  alternates: {
    canonical: '/studio',
  },
  openGraph: {
    title: 'Image Layered Studio — Split Images and Export PSD',
    description:
      'Turn a flat image into transparent layers, edit one object, and export a multi-layer PSD or PNG ZIP.',
    type: 'website',
    url: '/studio',
    siteName: 'Image Layered',
  },
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
