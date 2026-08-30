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

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || payload.code !== 0 || payload.data === undefined) {
    throw new Error(payload.message || `Studio request failed (${response.status})`);
  }

  return payload.data;
}

export function uploadStudioImage(file: File) {
  const body = new FormData();
  body.append('file', file);

  return request<{ url: string; key: string; size: number; type: string }>(
    '/api/storage/upload-image',
    { method: 'POST', body }
  );
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
