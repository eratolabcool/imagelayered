export const IMAGE_LAYERED_CAPABILITIES = {
  decompose: {
    provider: 'kie',
    model: 'seedream/5-pro-layer-decomposition',
  },
  editLayer: {
    provider: 'fal',
    model: 'bytedance/seedream/v5/pro/edit',
  },
} as const;

export const LEGACY_IMAGE_LAYERED_MODELS = {
  decompose: 'fal-ai/qwen-image-layered',
  editLayer: 'openai/gpt-image-2/edit',
} as const;

export const DEFAULT_DECOMPOSITION_LAYER_COUNT = 6;
