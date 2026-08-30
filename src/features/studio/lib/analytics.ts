export const STUDIO_EVENTS = {
  view: 'studio_view',
  demoOpened: 'studio_demo_opened',
  uploadStarted: 'studio_upload_started',
  uploadCompleted: 'studio_upload_completed',
  uploadFailed: 'studio_upload_failed',
  decomposeStarted: 'studio_decompose_started',
  decomposeCompleted: 'studio_decompose_completed',
  decomposeFailed: 'studio_decompose_failed',
  layerSelected: 'studio_layer_selected',
  layerMoved: 'studio_layer_moved',
  layerResized: 'studio_layer_resized',
  layerRotated: 'studio_layer_rotated',
  layerHidden: 'studio_layer_hidden',
  layerLocked: 'studio_layer_locked',
  layerDuplicated: 'studio_layer_duplicated',
  layerDeleted: 'studio_layer_deleted',
  aiEditStarted: 'studio_ai_edit_started',
  aiEditCompleted: 'studio_ai_edit_completed',
  aiEditFailed: 'studio_ai_edit_failed',
  editAccepted: 'studio_edit_accepted',
  editRejected: 'studio_edit_rejected',
  undo: 'studio_undo',
  redo: 'studio_redo',
  exportOpened: 'studio_export_opened',
  exportCompleted: 'studio_export_completed',
  paywallViewed: 'studio_paywall_viewed',
  checkoutStarted: 'studio_checkout_started',
  checkoutCompleted: 'studio_checkout_completed',
} as const;

export type StudioEventName = (typeof STUDIO_EVENTS)[keyof typeof STUDIO_EVENTS];

export function trackStudioEvent(
  event: StudioEventName,
  properties: Record<string, string | number | boolean | null | undefined> = {}
) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('image-layered:analytics', {
      detail: {
        event,
        properties,
      },
    })
  );
}
