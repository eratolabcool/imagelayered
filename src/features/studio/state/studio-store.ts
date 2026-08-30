'use client';

import type { StudioLayer, StudioOperation, StudioProject } from '../types';

export type StudioTool = 'select' | 'pan' | 'replace' | 'recolor' | 'remove';

export interface StudioViewState {
  zoom: number;
  pan: { x: number; y: number };
}

export interface StudioState {
  project: StudioProject | null;
  layers: StudioLayer[];
  selectedLayerIds: string[];
  activeTool: StudioTool;
  view: StudioViewState;
  activeOperation: StudioOperation | null;
  dirty: boolean;
}

export const initialStudioState: StudioState = {
  project: null,
  layers: [],
  selectedLayerIds: [],
  activeTool: 'select',
  view: {
    zoom: 1,
    pan: { x: 0, y: 0 },
  },
  activeOperation: null,
  dirty: false,
};

export function selectLayer(state: StudioState, layerId: string): StudioState {
  return {
    ...state,
    selectedLayerIds: [layerId],
  };
}

export function updateLayer(
  state: StudioState,
  layerId: string,
  patch: Partial<StudioLayer>
): StudioState {
  return {
    ...state,
    dirty: true,
    layers: state.layers.map((layer) =>
      layer.id === layerId ? { ...layer, ...patch } : layer
    ),
  };
}

export function reorderLayers(
  state: StudioState,
  orderedLayerIds: string[]
): StudioState {
  const zIndex = new Map(
    orderedLayerIds.map((layerId, index) => [layerId, index])
  );

  return {
    ...state,
    dirty: true,
    layers: state.layers
      .map((layer) => ({
        ...layer,
        zIndex: zIndex.get(layer.id) ?? layer.zIndex,
      }))
      .sort((a, b) => a.zIndex - b.zIndex),
  };
}
