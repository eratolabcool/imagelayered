import type { StudioOperation, StudioOperationType, StudioProject } from '../types';

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Studio request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function createStudioProject(input: {
  title?: string;
  width: number;
  height: number;
  originalAssetId: string;
}) {
  return request<StudioProject>('/api/studio/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  });
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
    body: JSON.stringify(input),
  });
}

export function getStudioOperation(operationId: string) {
  return request<StudioOperation>(`/api/studio/operations/${operationId}`);
}
