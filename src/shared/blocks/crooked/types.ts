export type LayerBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'color'
  | 'luminosity';

export interface LayerEditMetadata {
  tool: Extract<ToolType, 'recolor' | 'replace' | 'remove'>;
  prompt: string;
  createdAt: number;
  sourceLayerId: string;
}

export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape';
  url: string; // Data URL or external link
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  blur?: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  blendMode?: LayerBlendMode;
  maskUrl?: string; // White editable area derived from the layer alpha channel
  parentId?: string; // For recursive decomposition
  sourceLayerId?: string; // Original layer retained by a non-destructive AI variation
  editMetadata?: LayerEditMetadata;
  groupId?: string;
  groupName?: string;
  preserve?: {
    shape?: boolean;
    logo?: boolean;
    label?: boolean;
    shadow?: boolean;
  };
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
export type DecompositionModel =
  | 'fal-ai/qwen-image-layered'
  | 'fal-ai/qwen-image-layered/lora'
  | 'bytedance/seedream/v5/pro/edit'
  | 'openai/gpt-image-2/edit';

export type LayeringMode = 'native-layering' | 'seedream-design-layering' | 'semantic-layering';

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
  model: DecompositionModel;
}
