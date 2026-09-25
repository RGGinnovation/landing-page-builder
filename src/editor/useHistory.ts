import { useCallback, useRef, useState } from "react";

/**
 * Undo/redo for a single value. Rapid edits to the same field (typing) are merged
 * into one undo step.
 */
export function useHistory<T>(initial: T) {
  const [state, setState] = useState({ past: [] as T[], present: initial, future: [] as T[] });
  const last = useRef<{ key: string; at: number } | null>(null);

  const set = useCallback((next: T, mergeKey?: string) => {
    setState((s) => {
      const now = Date.now();
      const merge = !!mergeKey && last.current?.key === mergeKey && now - last.current.at < 800;
      last.current = mergeKey ? { key: mergeKey, at: now } : null;
      return {
        past: merge ? s.past : [...s.past, s.present].slice(-100),
        present: next,
        future: [],
      };
    });
  }, []);

  const reset = useCallback((next: T) => {
    last.current = null;
    setState({ past: [], present: next, future: [] });
  }, []);

  const undo = useCallback(() => {
    last.current = null;
    setState((s) =>
      s.past.length
        ? {
            past: s.past.slice(0, -1),
            present: s.past[s.past.length - 1]!,
            future: [s.present, ...s.future],
          }
        : s,
    );
  }, []);

  const redo = useCallback(() => {
    last.current = null;
    setState((s) =>
      s.future.length
        ? { past: [...s.past, s.present], present: s.future[0]!, future: s.future.slice(1) }
        : s,
    );
  }, []);

  return {
    value: state.present,
    set,
    reset,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
