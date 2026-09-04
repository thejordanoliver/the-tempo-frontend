const TEAM_GAME_CACHE_TTL_MS = 5 * 60 * 1000;

type TeamGameCacheEntry = {
  value: unknown;
  expiresAt: number;
};

export type TeamGameCacheResult<T> =
  | { hit: true; value: T | null }
  | { hit: false; value: null };

const teamGameCache = new Map<string, TeamGameCacheEntry>();
const pendingTeamGameRequests = new Map<string, Promise<unknown>>();

export function readTeamGameCache<T>(key: string): TeamGameCacheResult<T> {
  const entry = teamGameCache.get(key);

  if (!entry) {
    return { hit: false, value: null };
  }

  if (entry.expiresAt <= Date.now()) {
    teamGameCache.delete(key);
    return { hit: false, value: null };
  }

  return { hit: true, value: entry.value as T | null };
}

export async function loadTeamGameWithCache<T>(
  key: string,
  loader: () => Promise<T | null>,
  forceRefresh = false,
): Promise<T | null> {
  if (!forceRefresh) {
    const cached = readTeamGameCache<T>(key);

    if (cached.hit) {
      return cached.value;
    }
  }

  const pendingRequest = pendingTeamGameRequests.get(key);

  if (pendingRequest) {
    return pendingRequest as Promise<T | null>;
  }

  const request = loader()
    .then((value) => {
      teamGameCache.set(key, {
        value,
        expiresAt: Date.now() + TEAM_GAME_CACHE_TTL_MS,
      });

      return value;
    })
    .finally(() => {
      pendingTeamGameRequests.delete(key);
    });

  pendingTeamGameRequests.set(key, request);

  return request;
}
