import type {
  StudioLayer,
  StudioOperation,
  StudioOperationType,
  StudioProject,
  StudioRevision,
  StudioSnapshot,
} from '../types';

type ApiEnvelope<T> = {
  code: number;
  message?: string;
  data?: T;
};

type UploadResult = {
  url: string;
  key: string;
  filename: string;
  deduped: boolean;
};

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || payload.code !== 0 || payload.data === undefined) {
    throw new Error(payload.message || `Studio request failed (${response.status})`);
  }

  return payload.data;
}

export async function uploadStudioImage(file: File) {
  const body = new FormData();
  body.append('files', file);

  const payload = await request<{
    urls: string[];
    results: UploadResult[];
  }>('/api/storage/upload-image', { method: 'POST', body });

  const uploaded = payload.results[0];
  if (!uploaded?.url || !uploaded.key) {
    throw new Error('Image upload completed without a usable asset');
  }

  return uploaded;
}

export function createStudioProject(input: {
  title?: string;
  width: number;
  height: number;
  originalAssetId: string;
  originalUrl?: string;
}) {
  return request<{ project: StudioProject; layers: StudioLayer[] }>(
    '/api/studio/projects',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  );
}

export function getStudioProject(projectId: string) {
  return request<{ project: StudioProject; layers: StudioLayer[] }>(
    `/api/studio/projects/${projectId}`
  );
}

export function saveStudioProject(
  projectId: string,
  input: { project?: Partial<StudioProject>; layers: StudioLayer[] }
) {
  return request<{ project: StudioProject; layers: StudioLayer[] }>(
    `/api/studio/projects/${projectId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  );
}

export function createStudioOperation(
  projectId: string,
  input: {
    type: StudioOperationType;
    targetLayerIds?: string[];
    prompt?: string;
    baseRevisionId?: string | null;
    options?: Record<string, unknown>;
  }
) {
  return request<StudioOperation>(`/api/studio/projects/${projectId}/operations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function getStudioOperation(operation: StudioOperation) {
  return request<StudioOperation>(`/api/studio/operations/${operation.id}`);
}

export function listStudioRevisions(projectId: string) {
  return request<StudioRevision[]>(`/api/studio/projects/${projectId}/revisions`);
}

export function createStudioRevision(
  projectId: string,
  input: {
    parentRevisionId?: string | null;
    operationId?: string | null;
    snapshot: StudioSnapshot;
  }
) {
  return request<StudioRevision>(`/api/studio/projects/${projectId}/revisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
