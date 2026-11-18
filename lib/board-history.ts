export interface UndoEntry<TState> {
  id: string;
  label: string;
  snapshot: TState;
  timestamp: number;
}

export function pushUndoEntry<TState>(
  stack: UndoEntry<TState>[],
  entry: Omit<UndoEntry<TState>, "id" | "timestamp">,
  maxSteps: number
): UndoEntry<TState>[] {
  if (maxSteps <= 0) return [];
  const next: UndoEntry<TState> = {
    ...entry,
    id: `undo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  };
  const updated = [next, ...stack];
  return updated.slice(0, maxSteps);
}

export function popUndoEntry<TState>(stack: UndoEntry<TState>[]): {
  entry: UndoEntry<TState> | null;
  remaining: UndoEntry<TState>[];
} {
  if (stack.length === 0) {
    return { entry: null, remaining: [] };
  }
  const [entry, ...remaining] = stack;
  return { entry, remaining };
}
