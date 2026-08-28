export type ExpiringCacheValue = {
  expiresAt: string;
};

export function createExpiringRequestCache<T extends ExpiringCacheValue>(
  options: {
    now?: () => number;
    refreshBufferMs: number;
  },
) {
  const now = options.now ?? Date.now;
  const entries = new Map<string, T & { expiresAtMs: number }>();
  const requests = new Map<string, Promise<T>>();
  let generation = 0;

  const clear = () => {
    generation += 1;
    entries.clear();
    requests.clear();
  };

  const get = async (
    key: string,
    load: () => Promise<T>,
    getOptions: { forceRefresh?: boolean } = {},
  ): Promise<T> => {
    if (getOptions.forceRefresh) {
      entries.delete(key);
    } else {
      const cached = entries.get(key);

      if (
        cached &&
        cached.expiresAtMs - options.refreshBufferMs > now()
      ) {
        return cached;
      }
    }

    const existingRequest = requests.get(key);
    if (existingRequest) return existingRequest;

    const requestGeneration = generation;
    let request: Promise<T>;

    request = load()
      .then((value) => {
        const expiresAtMs = new Date(value.expiresAt).getTime();

        if (!Number.isFinite(expiresAtMs)) {
          throw new Error("Attachment URL expiration was invalid.");
        }

        if (generation === requestGeneration) {
          entries.set(key, { ...value, expiresAtMs });
        }

        return value;
      })
      .finally(() => {
        if (requests.get(key) === request) {
          requests.delete(key);
        }
      });

    requests.set(key, request);
    return request;
  };

  return { clear, get };
}
