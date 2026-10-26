type Change = { path: string[]; value: unknown };
export type LiveDelta = {
  representation: "delta-v1";
  revision: number;
  baseRevision?: number;
  snapshot?: unknown;
  changes?: Change[];
  removed?: string[][];
};
const object = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const validPath = (path: unknown): path is string[] =>
  Array.isArray(path) &&
  path.length > 0 &&
  path.length <= 2 &&
  path.every(
    (key) =>
      typeof key === "string" &&
      !["__proto__", "constructor", "prototype"].includes(key),
  );

/** Returns undefined for missing revisions or malformed patches; caller requests a snapshot. */
export function applyLiveDelta(
  previous: unknown,
  revision: number | undefined,
  message: LiveDelta,
): unknown | undefined {
  if (!Number.isSafeInteger(message.revision) || message.revision < 1)
    return undefined;
  if (Object.prototype.hasOwnProperty.call(message, "snapshot"))
    return message.snapshot;
  if (
    !object(previous) ||
    message.baseRevision !== revision ||
    message.revision !== (revision ?? 0) + 1 ||
    !Array.isArray(message.changes) ||
    !Array.isArray(message.removed)
  )
    return undefined;
  if (
    !message.changes.every((item) => object(item) && validPath(item.path)) ||
    !message.removed.every(validPath)
  )
    return undefined;
  const result = { ...previous };
  for (const { path, value } of message.changes) {
    if (path.length === 1) result[path[0]] = value;
    else {
      const current = result[path[0]];
      result[path[0]] = {
        ...(object(current) ? current : {}),
        [path[1]]: value,
      };
    }
  }
  for (const path of message.removed) {
    if (path.length === 1) delete result[path[0]];
    else {
      const current = result[path[0]];
      if (object(current)) {
        const child = { ...current };
        delete child[path[1]];
        result[path[0]] = child;
      }
    }
  }
  return result;
}
