import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react';

import { Layer } from '../types';

interface LayerTimeline {
  past: Layer[][];
  present: Layer[];
  future: Layer[][];
}

const HISTORY_LIMIT = 50;
const GROUP_WINDOW_MS = 280;

export function useLayerHistory(initialLayers: Layer[] = []) {
  const [timeline, setTimeline] = useState<LayerTimeline>({
    past: [],
    present: initialLayers,
    future: [],
  });
  const lastChangeAt = useRef(0);

  const setLayers = useCallback<Dispatch<SetStateAction<Layer[]>>>((action) => {
    setTimeline((current) => {
      const next =
        typeof action === 'function' ? action(current.present) : action;
      if (Object.is(next, current.present)) return current;

      const now = Date.now();
      const shouldGroup =
        now - lastChangeAt.current < GROUP_WINDOW_MS && current.past.length > 0;
      lastChangeAt.current = now;

      return {
        past: shouldGroup
          ? current.past
          : [...current.past, current.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
      };
    });
  }, []);

  const resetLayers = useCallback((layers: Layer[]) => {
    lastChangeAt.current = 0;
    setTimeline({ past: [], present: layers, future: [] });
  }, []);

  const undo = useCallback(() => {
    setTimeline((current) => {
      const previous = current.past.at(-1);
      if (!previous) return current;

      lastChangeAt.current = 0;
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future].slice(0, HISTORY_LIMIT),
      };
    });
  }, []);

  const redo = useCallback(() => {
    setTimeline((current) => {
      const next = current.future[0];
      if (!next) return current;

      lastChangeAt.current = 0;
      return {
        past: [...current.past, current.present].slice(-HISTORY_LIMIT),
        present: next,
        future: current.future.slice(1),
      };
    });
  }, []);

  return {
    layers: timeline.present,
    setLayers,
    resetLayers,
    undo,
    redo,
    canUndo: timeline.past.length > 0,
    canRedo: timeline.future.length > 0,
  };
}
