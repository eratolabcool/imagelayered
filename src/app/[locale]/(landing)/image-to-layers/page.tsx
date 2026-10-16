import type { Metadata } from 'next';
import { ToolLandingPage } from '../tool-pages';

export const metadata: Metadata = {
  title: 'Image to Layers — Separate Any Image into Editable Layers',
  description: 'Turn a flat photo or AI image into semantic editable layers for local edits and PSD export.',
  alternates: { canonical: '/image-to-layers' },
};

export default function ImageToLayersPage() {
  return <ToolLandingPage config={{
    eyebrow: 'Image to Layers',
    title: 'Separate a flat image into editable layers',
    description: 'Keep the subject, product, text, shadows, and background independent so one revision does not destroy the rest of the composition.',
    scenarios: ['Product and background separation', 'Character and hair slicing', 'Logo, text, and shadow extraction'],
    faqs: [['Can I lock a layer?', 'Yes. Lock any layer before moving or editing another object.'], ['Are names semantic?', 'Seedream results are mapped to names such as Background, Main Subject, Product, Text / Graphics, Shadow, and Lighting / Effects.']],
  }} />;
}
