import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import AILookbookApp from './AILookbookApp';

export const metadata: Metadata = {
  title: 'AI Lookbook Generator - Create Your Fashion Persona | Image Layered',
  description:
    'Upload a face photo and full-body photo, create your Character ID, and generate a consistent four-image personal fashion lookbook.',
  keywords: [
    'AI lookbook generator',
    'AI personal stylist',
    'AI fashion identity',
    'AI outfit generator',
    'AI avatar fashion',
    'AI style generator',
  ],
  alternates: { canonical: '/ai-lookbook' },
  openGraph: {
    title: 'AI Lookbook - See Your Future Style',
    description:
      'Build your fashion persona from two photos and generate a consistent four-image style story.',
    type: 'website',
    url: '/ai-lookbook',
    siteName: 'Image Layered',
  },
};

export default async function AILookbookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AILookbookApp />;
}
