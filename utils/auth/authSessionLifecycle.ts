let sessionVersion = 0;
let storageQueue: Promise<void> = Promise.resolve();

export const getAuthSessionVersion = () => sessionVersion;

export const isAuthSessionCurrent = (version: number) =>
  version === sessionVersion;

// Token rotations keep their version. Signing in or clearing a session changes it.
export const invalidateAuthSession = () => ++sessionVersion;

// A write that already reached native storage cannot be cancelled. Serialize
// profile writes, token rotations, cleanup and sign-in so cleanup/new credentials
// always finish after any older write that was already in progress.
export function withAuthStorageLock<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const pending = storageQueue.then(operation);
  storageQueue = pending.then(
    () => {},
    () => {},
  );
  return pending;
}
