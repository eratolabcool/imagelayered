import type { Metadata } from 'next';
import { ToolLandingPage } from '../tool-pages';

export const metadata: Metadata = {
  title: 'AI Image Editing by Layer — Change One Object, Keep the Rest',
  description: 'Select one generated image layer, describe a focused edit, and preserve the rest of your composition.',
  alternates: { canonical: '/ai-image-editing' },
};

export default function AiImageEditingPage() {
  return <ToolLandingPage config={{
    eyebrow: 'AI Image Editing',
    title: 'Edit one object while the rest stays intact',
    description: 'Start with an AI-generated image, separate its visual structure, lock the layers you want to protect, and create a focused variation.',
    scenarios: ['Change a product color', 'Replace a selected object', 'Keep a face while changing the scene'],
    faqs: [['Do edits consume credits?', 'Yes. AI decomposition and edits require a signed-in account with purchased credits.'], ['What if a task fails?', 'Studio reports provider configuration, credit, or image-quality reasons so you can fix the actual problem.']],
  }} />;
}
