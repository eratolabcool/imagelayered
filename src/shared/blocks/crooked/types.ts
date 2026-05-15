export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape';
  url: string; // Data URL or external link
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  maskUrl?: string; // White editable area derived from the layer alpha channel
  parentId?: string; // For recursive decomposition
}

export interface CanvasState {
  layers: Layer[];
  selectedLayerId: string | null;
  zoom: number;
}

export type ToolType = 'select' | 'move' | 'recolor' | 'replace' | 'remove' | 'scale' | 'decompose';

export interface DecomposeResponse {
  layers: Array<{
    name: string;
    description: string;
    bbox: [number, number, number, number]; // [x, y, w, h] normalized 0-1
  }>;
}

export type ExportResolution = '1K' | '2K' | '4K';

export interface ExportSettings {
  width: number;
  height: number;
  useOriginalSize: boolean; // When true, ignore width/height and use original image dimensions
  upscale: boolean;
  resolution: ExportResolution;
}

export interface AdvancedDecompositionConfig {
  prompt: string;
  negativePrompt: string;
  seed: number;
  randomizeSeed: boolean;
  enableCfgNormalization: boolean;
  autoCaptionLanguageEn: boolean; // True for EN, False for ZH
  guidanceScale: number;
  inferenceSteps: number;
  model: 'fal-ai/qwen-image-layered' | 'fal-ai/qwen-image-layered/lora';
}
