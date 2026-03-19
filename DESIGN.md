# Design System Strategy: The Luminous Precision Framework

## 1. Overview & Creative North Star
**Creative North Star: "The Chromatic Architect"**

This design system is built to facilitate complex creative workflows through a lens of high-end editorial precision. We are moving away from the "cluttered dashboard" trope of AI tools. Instead, we treat the canvas as a sacred space. By utilizing intentional asymmetry, overlapping modular panels, and high-contrast typographic scales, we create a UI that feels less like a software utility and more like a high-end physical light table. 

The experience is defined by "The Breathable Tech" aesthetic: expansive negative space punctuated by hyper-vibrant interactive nodes. We break the grid by allowing certain floating panels to overlap the main workspace, creating a sense of physical depth and "active layering" that mirrors the product’s core functionality.

---

## 2. Colors & Surface Architecture
The color strategy utilizes a "Void-to-Vibrant" spectrum. Deep slates provide a sophisticated, low-fatigue environment for long creative sessions, while neon accents drive the eye toward AI-augmented actions.

### The "No-Line" Rule
**Borders are a failure of hierarchy.** In this system, 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through background color shifts or subtle tonal transitions. For example, a sidebar should be `surface-container-low` sitting against a `surface` background, creating a natural, soft-edge distinction.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of frosted glass.
- **Base Layer:** `surface` (#060e20)
- **Primary Workspaces:** `surface-container-low` (#091328)
- **Floating Tool Palettes:** `surface-container-high` (#141f38)
- **Active Modals/Popovers:** `surface-container-highest` (#192540)

### The "Glass & Gradient" Rule
To elevate the "tech-forward" feel, floating elements should use Glassmorphism. Apply `surface-variant` with a 60% opacity and a 20px backdrop-blur. 
- **Signature Textures:** For primary CTAs, use a linear gradient: `primary` (#b89fff) to `primary-container` (#ac8eff). This provides a visual "soul" that flat hex codes lack.

---

## 3. Typography
We utilize a dual-font system to balance "Tech Precision" with "Editorial Sophistication."

*   **Display & Headlines (Space Grotesk):** A high-character, modern sans-serif. Used for large data points and section headers. The wide apertures feel "open" and futuristic.
*   **Body & Labels (Manrope):** A workhorse geometric sans-serif designed for legibility at small scales, perfect for tool labels and nested property panels.

**Scale Highlights:**
- **Display-LG (3.5rem):** Reserved for hero AI generation prompts.
- **Headline-SM (1.5rem):** Standard for panel titles; always uppercase with +0.05em tracking.
- **Label-SM (0.6875rem):** Used for technical metadata (e.g., "Resolution: 300dpi").

---

## 4. Elevation & Depth
Depth in this system is organic, not structural. We mimic natural light refraction rather than artificial "shadow drops."

*   **The Layering Principle:** Stacking is the primary driver of importance. Place a `surface-container-lowest` (#000000) card on a `surface-container-low` (#091328) section to create a soft, natural "recessed" lift.
*   **Ambient Shadows:** For floating AI prompts, use extra-diffused shadows.
    *   *Spec:* `0px 20px 40px rgba(0, 0, 0, 0.4)`. The shadow color must never be pure black; it should be a deep tint of the background slate.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token (#40485d) at **15% opacity**. 100% opaque borders are strictly forbidden as they "trap" the user's eye and break the fluid experience.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`) with `on_primary` text. Use `rounded-md` (0.375rem).
*   **Secondary:** Solid `secondary_container` (#006875) with `on_secondary_container` text.
*   **Tertiary:** Ghost style. No background; text in `primary` (#b89fff).

### Chips (The "Layer Tags")
Use `rounded-full` for all AI-generated tags. Active state uses `secondary` (#00e3fd) with a subtle outer glow (2px blur).

### Cards & Lists
**Forbid the use of divider lines.** Separate list items using the spacing scale (e.g., `spacing-4` / 0.9rem) or by alternating background tones between `surface-container-low` and `surface-container`.

### Input Fields
*   **Resting:** `surface-container-high` background, no border.
*   **Focus:** An outer glow of 2px using `primary` (#b89fff) and a subtle increase in background brightness to `surface-bright`.

### Custom: The "Layer Stack" Component
A vertical list of image layers. Each layer card should use `surface-container-low`. The *Active Layer* should not have a border but should instead "lift" using a subtle 4% opacity white overlay (`surface-tint`) to indicate selection.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. If the left sidebar is 240px, let the right properties panel be 300px to avoid a "template" feel.
*   **Do** use `primary` and `secondary` accents sparingly. If everything is electric blue, nothing is electric blue.
*   **Do** prioritize `spacing-8` (1.75rem) between major modules to let the AI-generated imagery "breathe."

### Don't
*   **Don't** use 100% white (#ffffff) for text. Use `on_surface` (#dee5ff) to reduce eye strain in dark mode.
*   **Don't** use standard "drop shadows" with 0 blur. Shadows must feel like ambient environmental light.
*   **Don't** use sharp corners. Stick to the `md` (0.375rem) scale for containers and `xl` (0.75rem) for large image previews to maintain a "tech-forward" but approachable vibe.