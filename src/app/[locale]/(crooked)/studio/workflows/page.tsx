import { redirect } from 'next/navigation';

export default async function WorkflowsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/studio`);
}
