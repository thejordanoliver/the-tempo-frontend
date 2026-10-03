import type { DirectMessageItem } from '../types/messages';

const matches = (a: DirectMessageItem, b: DirectMessageItem) =>
  a.id === b.id || Boolean(a.clientId && a.clientId === b.clientId);

// The server snapshot replaces cached history. Keep local sends and realtime
// changes that happened during the request, including deletions.
export function reconcileDirectMessages(
  initial: DirectMessageItem[],
  current: DirectMessageItem[],
  snapshot: DirectMessageItem[],
  deletedIds: ReadonlySet<string> = new Set(),
): DirectMessageItem[] {
  const deleted = initial.filter(item => !current.some(next => matches(item, next)));
  const result = snapshot.filter(item =>
    !deletedIds.has(item.id) && !deleted.some(old => matches(item, old)),
  );
  for (const item of current) {
    if (deletedIds.has(item.id)) continue;
    const original = initial.find(old => matches(item, old));
    const index = result.findIndex(saved => matches(item, saved));
    const local = item.status === 'pending' || item.status === 'failed';
    if (local && index >= 0) continue;
    if (local || item !== original) {
      if (index >= 0) result[index] = item;
      else result.push(item);
    }
  }
  return result;
}
