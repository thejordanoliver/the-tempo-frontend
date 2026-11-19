// Keep prediction prompts spaced through the feed; short feeds still show available matchups.
export function interleavePredictions<T>(content: T[], predictions: T[]): T[] {
  const pending = predictions.slice(0, 3);
  const result: T[] = [];
  content.forEach((item, index) => {
    result.push(item);
    if (index % 6 === 0 && pending.length) result.push(pending.shift()!);
  });
  return [...result, ...pending];
}

/** Append only genuinely new feed items, preserving the order of each page. */
export function onlyNewItems<T>(
  existing: readonly T[],
  incoming: readonly T[],
  getKey: (item: T) => string,
): T[] {
  const seen = new Set(existing.map(getKey));
  return incoming.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
