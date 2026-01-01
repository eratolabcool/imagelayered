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
}
