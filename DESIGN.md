# Image Layered Design System — Studio Dark

## Creative north star

Image Layered should feel like a focused professional AI editor: compact controls around a quiet canvas, clear hierarchy, and one unmistakable action color. The interface may take directional inspiration from modern dark AI workspaces such as Pollo, but uses original Image Layered structure, language, icons, and brand identity.

## Visual language

- Base: near-black `#0b090d`.
- Navigation: `#0e0c11`.
- Panels: `#17141c`; raised panels: `#211d28`.
- Primary text: `#f6f3f8`; secondary text: `#9993a3`; quiet text: `#77717f`.
- Brand/action accent: hot pink `#f33b72`; hover `#ff4f83`; focus `#ff6b96`.
- Borders are low-contrast white at 6–9% opacity and only clarify nested controls.
- Use purple-gray surfaces, not blue/cyan dashboard gradients.

## Typography and density

- Manrope is the primary interface face; system sans is the fallback.
- Headlines use tight tracking and strong weight. Tool labels stay compact and sentence case.
- Sidebar rows are 44–52px high; controls use 8–12px internal spacing; workspace modules use 12px radii.
- Avoid decorative microcopy, fake status labels, and controls without a real handler.

## Product shell

- Desktop: compact left navigation, central workspace, contextual settings inside the tool sidebar.
- Mobile: navigation collapses; settings stack before the preview so the primary flow remains linear.
- Active navigation uses a pink inset rail plus a slightly raised purple-gray surface.
- Admin, settings, landing pages, dialogs, and editor surfaces share the same tokens.

## Editor interaction rules

- The canvas is the quietest and darkest region.
- The settings panel exposes only real choices: model, output layer count, and generate.
- Primary action buttons are solid pink; secondary actions are restrained dark surfaces.
- Motion lasts 180–420ms with ease-out curves. Use subtle entry, hover lift, and focus feedback only.
- Respect `prefers-reduced-motion` and preserve strong keyboard focus rings.

## Component rules

- Cards: 12–16px radius, low-contrast border, ambient shadow only when floating.
- Inputs: dark recessed surface, visible pink focus ring, explicit label.
- Buttons: rounded rectangles; reserve pills for metadata and statuses.
- Empty states: one icon, one clear headline, one explanatory sentence, one action.
- Do not add Workflow, Recommended flow, or other preset selectors until they have distinct backend behavior and measurable output differences.
