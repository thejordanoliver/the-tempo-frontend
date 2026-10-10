const listeners = new Set<(userId?: number) => void>();
export function notifyPredictionPicksChanged(userId?: number) {
  listeners.forEach(listener => listener(userId));
}
export function subscribePredictionPicksChanged(listener: (userId?: number) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
