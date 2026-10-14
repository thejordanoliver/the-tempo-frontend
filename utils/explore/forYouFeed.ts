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
