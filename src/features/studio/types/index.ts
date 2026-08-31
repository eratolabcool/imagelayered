export type StudioProjectStatus =
  | 'uploading'
  | 'ready'
  | 'decomposing'
  | 'editing'
  | 'error';

export type StudioLayerType = 'raster' | 'text' | 'group';

export type StudioSemanticType =
  | 'subject'
  | 'product'
  | 'text'
  | 'logo'
  | 'background'
  | 'shadow'
  | 'effect'
  | 'unknown';

export type StudioLayerSource =
  | 'original'
  | 'decomposition'
  | 'ai-edit'
  | 'duplicate'
  | 'user';

export type StudioOperationType =
  | 'decompose'
  | 'replace'
  | 'recolor'
  | 'remove'
  | 'restyle'
  | 'rewrite-text'
  | 'refine-mask'
  | 'upscale';

export type StudioOperationStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed';

export type StudioCreditState =
  | 'none'
  | 'guest'
  | 'charged'
  | 'refunded'
  | 'released';

export interface StudioProject {
  id: string;
  userId: string | null;
  title: string;
  width: number;
  height: number;
  originalAssetId: string;
  activeRevisionId: string | null;
  status: StudioProjectStatus;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudioAsset {
  id: string;
  ownerId?: string;
  storageKey: string;
  mimeType: string;
  width: number;
  height: number;
  bytes: number;
  sha256?: string;
  kind: 'original' | 'layer' | 'mask' | 'edit-result' | 'export';
  createdAt: string;
}

export interface StudioLayer {
  id: string;
  projectId: string;
  name: string;
  type: StudioLayerType;
  semanticType: StudioSemanticType;
  assetId: string;
  storageKey?: string;
  maskAssetId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  parentId?: string;
  source: StudioLayerSource;
  createdAt: string;
}

export interface StudioSnapshotLayerState {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  assetId: string;
}

export interface StudioSnapshot {
  width: number;
  height: number;
  layerIds: string[];
  layerState: Record<string, StudioSnapshotLayerState>;
}

export interface StudioRevision {
  id: string;
  projectId: string;
  parentRevisionId?: string;
  operationId?: string;
  snapshot: StudioSnapshot;
  createdAt: string;
}

export interface StudioOperationResult {
  images?: string[];
  taskInfo?: unknown;
  taskResult?: unknown;
}

export interface StudioOperation {
  id: string;
  projectId: string;
  type: StudioOperationType;
  inputRevisionId: string;
  targetLayerIds: string[];
  prompt?: string;
  provider?: string;
  model?: string;
  status: StudioOperationStatus;
  aiTaskId?: string;
  creditReservationId?: string;
  creditState?: StudioCreditState;
  outputRevisionId?: string;
  costCredits?: number;
  errorCode?: string;
  result?: StudioOperationResult;
  createdAt: string;
  completedAt?: string;
}
