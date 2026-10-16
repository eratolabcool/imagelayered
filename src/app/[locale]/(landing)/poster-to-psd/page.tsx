import type { Metadata } from 'next';
import { ToolLandingPage } from '../tool-pages';

export const metadata: Metadata = {
  title: 'Poster to PSD — Rework Advertising Graphics with AI Layers',
  description: 'Separate poster artwork, typography, product subjects, and backgrounds into a PSD you can revise.',
  alternates: { canonical: '/poster-to-psd' },
};

export default function PosterToPsdPage() {
  return <ToolLandingPage config={{
    eyebrow: 'Poster to PSD',
    title: 'Rework a poster without rebuilding it',
    description: 'Upload an advertising or campaign graphic, select the text or subject you need to change, and export a multi-layer raster PSD.',
    scenarios: ['Change headline, keep the model', 'Replace a campaign background', 'Reuse product art in a new size'],
    faqs: [['Does it recover editable text?', 'Text is exported as a raster layer. The original font and native text box are not reconstructed.'], ['Can I compare the source?', 'Use Compare in Studio to slide between the original and current layered composition.']],
  }} />;
}
