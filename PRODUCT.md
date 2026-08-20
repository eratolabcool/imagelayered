# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Image creators, marketers, e-commerce operators, and designers who have a flattened poster, product visual, or AI-generated image and need to revise one part without rebuilding or regenerating the whole composition.

## Product Purpose

Image Layered turns a flat image into independently visible and editable layers. A successful session moves clearly from upload, to automatic decomposition, to selecting and adjusting a layer, and finally to exporting or saving the result.

## Positioning

Unlike a background remover or a full-image generator, Image Layered recovers a multi-layer working structure and lets the user protect the parts that already work while changing only the selected visual element.

## Operating Context

The core workflow is upload, choose a decomposition workflow or model, generate layers, inspect the composite and original, select a layer, make a local edit or visibility adjustment, and export or save. Users may return to saved projects, learn through use-case workflows, or open a focused guide before starting.

## Capabilities and Constraints

- Accepts image uploads and decomposes them with supported AI models.
- Supports poster, product, character, text, and general semantic-layer workflows.
- Provides layer visibility, opacity, duplication, solo, extraction, prompt editing, comparison, project saving, sharing, and export.
- The main editor must remain usable on desktop and mobile web.
- Existing authentication, credits, model APIs, project persistence, sharing, export, localization, and SEO behavior must be preserved.

## Brand Commitments

The product name is Image Layered. Its voice is direct, capable, and workflow-oriented. Existing logo assets and the established dark “luminous precision” design system remain authoritative.

## Evidence on Hand

- Existing editor implementation under `src/shared/blocks/crooked/`.
- Existing product and use-case copy in `src/shared/seo/image-layered-pages.ts`.
- Existing saved-projects page under `src/app/[locale]/(landing)/settings/projects/`.
- Existing quick test, ComfyUI guide, sharing, API, and export flows in the application.
- No testimonials, customer logos, or performance claims should be fabricated.

## Product Principles

- Make the next action obvious at every stage of the workflow.
- Keep the image and its layer stack visible while the user edits.
- Preserve successful parts of an image and localize change to the selected layer.
- Reveal advanced model and layer controls progressively.
- Give returning users fast access to projects, workflows, and guidance.

## Accessibility & Inclusion

Interactive controls must remain keyboard accessible, have visible focus states and descriptive labels, preserve adequate contrast, and provide touch-friendly targets on mobile web.
