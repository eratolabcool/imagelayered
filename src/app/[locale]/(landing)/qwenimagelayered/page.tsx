import { redirect } from 'next/navigation';

import { defaultLocale } from '@/config/locale';

/**
 * Compatibility entry for links and indexed pages that still use the legacy
 * model-specific route. Keep this temporary (307) until the SEO migration is
 * reviewed; the product runtime itself is now the model-agnostic Studio.
 */
export default async function LegacyQwenImageLayeredPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const target = locale === defaultLocale ? '/studio' : `/${locale}/studio`;
  redirect(target);
}
