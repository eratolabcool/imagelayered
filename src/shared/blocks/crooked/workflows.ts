import { WorkflowPreset } from './types';

export const workflowPresets: WorkflowPreset[] = [
  {
    id: 'product',
    title: 'Product Photo',
    subtitle: 'Product, background, shadow, label',
    goal: 'Protect the product while changing the commercial scene around it.',
    outcome: 'Ready for marketplace, Shopify, ads, or campaign variants.',
    layerCount: 4,
    prompt:
      'Separate the product, background, natural shadow, label or text, and small props into clean editable RGBA layers.',
    steps: [
      'Upload a product image.',
      'Create product, background, shadow, and label layers.',
      'Edit the background or props while keeping the product unchanged.',
      'Export the final image or download the product layer.',
    ],
    chips: [
      {
        label: 'White studio background',
        tool: 'replace',
        prompt:
          'Replace only the background with a clean white studio background. Keep the product shape, label, color, and shadow natural.',
      },
      {
        label: 'Premium minimal scene',
        tool: 'replace',
        prompt:
          'Replace only the background with a premium minimal commercial scene. Keep the product unchanged and preserve realistic lighting.',
      },
      {
        label: 'Remove props',
        tool: 'remove',
        prompt:
          'Remove distracting props from this layer and reconstruct the background naturally.',
      },
    ],
  },
  {
    id: 'poster',
    title: 'Poster / Ad',
    subtitle: 'Subject, headline, logo, product, background',
    goal: 'Remix a flattened campaign image without rebuilding the whole design.',
    outcome: 'New ad variants, translated posters, and test creatives from one image.',
    layerCount: 7,
    prompt:
      'Separate the poster into subject, headline text, logo, product, background, effects, and shadow layers for ad remixing.',
    steps: [
      'Upload a poster, banner, thumbnail, or ad creative.',
      'Separate subject, headline, logo, product, background, effects, and shadow.',
      'Select text, product, or background for the requested revision.',
      'Recompose the new campaign image and export.',
    ],
    chips: [
      {
        label: 'Rewrite headline',
        tool: 'recolor',
        prompt:
          "Rewrite the selected headline to 'Summer Drop' with a similar visual style. Keep the poster layout unchanged.",
      },
      {
        label: 'Replace product',
        tool: 'replace',
        prompt:
          'Replace only the selected product with a premium perfume bottle. Keep the poster composition, lighting, and subject unchanged.',
      },
      {
        label: 'Cyberpunk remix',
        tool: 'replace',
        prompt:
          'Change only this selected layer into a cyberpunk neon campaign style while preserving the overall poster composition.',
      },
    ],
  },
  {
    id: 'ai-image',
    title: 'AI Image Fix',
    subtitle: 'Local revision without regenerating',
    goal: 'Fix one broken part of an AI-generated image without losing the good parts.',
    outcome: 'A cleaner final image with the same composition, subject, and style.',
    layerCount: 6,
    prompt:
      'Separate the AI-generated image into editable subject, clothing, object, background, lighting, and text layers.',
    steps: [
      'Upload the AI image that is almost finished.',
      'Separate subject, clothing, object, background, lighting, and text.',
      'Choose the layer that contains the artifact or requested change.',
      'Apply a local edit and preserve the rest of the image.',
    ],
    chips: [
      {
        label: 'Change only clothing',
        tool: 'replace',
        prompt:
          'Change only the selected clothing to satin black. Keep the face, pose, lighting, and composition unchanged.',
      },
      {
        label: 'Remove artifact',
        tool: 'remove',
        prompt:
          'Remove the visible AI artifact from the selected layer and reconstruct the missing details naturally.',
      },
      {
        label: 'Cleaner background',
        tool: 'replace',
        prompt:
          'Make only this selected background layer cleaner and more professional. Keep the subject and composition unchanged.',
      },
    ],
  },
  {
    id: 'character',
    title: 'Character / Anime',
    subtitle: 'Face, hair, clothes, background, lighting',
    goal: 'Create controlled character variations while preserving identity.',
    outcome: 'Consistent character images for thumbnails, story scenes, and campaigns.',
    layerCount: 6,
    prompt:
      'Separate the character image into face, hair, clothing, body, background, and lighting layers for consistent character editing.',
    steps: [
      'Upload the base character image.',
      'Separate face, hair, clothing, body, background, and lighting.',
      'Avoid editing identity layers unless needed.',
      'Change clothing, scene, or lighting and export the variation.',
    ],
    chips: [
      {
        label: 'Keep same face',
        tool: 'replace',
        prompt:
          'Keep the same face and identity. Change only the selected clothing layer into a red jacket.',
      },
      {
        label: 'Rainy Tokyo night',
        tool: 'replace',
        prompt:
          'Change only the selected background into a rainy Tokyo night scene. Keep the character face and pose unchanged.',
      },
      {
        label: 'Cinematic lighting',
        tool: 'recolor',
        prompt:
          'Add cinematic lighting to the selected layer while preserving the character identity and pose.',
      },
    ],
  },
];

export function getWorkflowPreset(id: string | null | undefined) {
  return workflowPresets.find((preset) => preset.id === id) ?? workflowPresets[0];
}
