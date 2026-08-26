'use client';

/**
 * [INPUT]: none (browser-only; reads window.plausible installed by the
 *   Plausible script in src/app/layout.tsx for domain image-layered.app)
 * [OUTPUT]: trackFunnel(name, props) and the FunnelEvent union
 *   (upload_image, decompose_start, layers_generated, decompose_fail,
 *   export_start, export_done, paywall_view, paywall_click, signup_click)
 * [POS]: crooked/lib analytics helper consumed by CrookedApp.tsx and
 *   CrookedUpgradeModal.tsx; mirrors the official Plausible queue stub so
 *   pre-init events are replayed, and swallows errors so analytics can
 *   never break the editor
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
/**
 * Funnel event names sent to Plausible (image-layered.app).
 * Dashboard: define these as custom events to see the conversion funnel.
 */
export type FunnelEvent =
  | 'upload_image'
  | 'decompose_start'
  | 'layers_generated'
  | 'decompose_fail'
  | 'export_start'
  | 'export_done'
  | 'paywall_view'
  | 'paywall_click'
  | 'signup_click';

export function trackFunnel(
  name: FunnelEvent,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as {
    plausible?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  };
  if (typeof w.plausible !== 'function') {
    w.plausible = (...args: unknown[]) => {
      w.plausible!.q = w.plausible!.q || [];
      w.plausible!.q.push(args);
    };
  }
  try {
    w.plausible(name, props ? { props } : undefined);
  } catch {
    // analytics must never break the editor
  }
}
