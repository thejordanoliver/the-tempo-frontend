import AsyncStorage from "@react-native-async-storage/async-storage";

export const USER_PROFILE_CACHE_VERSION = 1;
export const USER_PROFILE_CACHE_TTL = 1000 * 60 * 10;
export const USER_PROFILE_STALE_TTL = 1000 * 60 * 60 * 24;
export const USER_PROFILE_CACHE_KEY_PREFIX = "userProfileCache:";

const CURRENT_USER_PROFILE_CACHE_KEY_PREFIX = `${USER_PROFILE_CACHE_KEY_PREFIX}v${USER_PROFILE_CACHE_VERSION}:`;

export type UserProfileCacheState = "none" | "fresh" | "stale";

export type CachedUserProfilePayload = {
  id: string;
  username: string | null;
  fullName: string | null;
  bio: string | null;
  profileImage: string | null;
  bannerImage: string | null;
  favorites: string[];
  updatedAt?: string | null;
  cachedAt: number;
  version: number;
};

export type CachedUserProfileResult = {
  profile: CachedUserProfilePayload;
  cacheState: Exclude<UserProfileCacheState, "none">;
};

const getUserProfileCacheKey = (userId: string) =>
  `${CURRENT_USER_PROFILE_CACHE_KEY_PREFIX}${userId}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;

  return value;
};

const normalizeImageUrl = (value: unknown): string | null => {
  const normalized = normalizeString(value);
  if (!normalized?.startsWith("http")) return null;

  return normalized;
};

const normalizeId = (value: unknown): string | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return normalizeString(value);
};

const normalizeFavorites = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (favorite): favorite is string =>
      typeof favorite === "string" && favorite.includes(":"),
  );
};

const parseDateTime = (value?: string | null) => {
  if (!value) return null;

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const shouldKeepExistingCache = (
  existing: CachedUserProfilePayload | null,
  incoming: CachedUserProfilePayload,
) => {
  const existingUpdatedAt = parseDateTime(existing?.updatedAt);
  const incomingUpdatedAt = parseDateTime(incoming.updatedAt);

  return (
    existingUpdatedAt !== null &&
    incomingUpdatedAt !== null &&
    existingUpdatedAt > incomingUpdatedAt
  );
};

const parseCachedPayload = (
  value: unknown,
  userId: string,
): CachedUserProfilePayload | null => {
  if (!isRecord(value)) return null;
  if (value.version !== USER_PROFILE_CACHE_VERSION) return null;

  const id = normalizeId(value.id);
  if (!id || id !== userId) return null;

  const cachedAt =
    typeof value.cachedAt === "number" && Number.isFinite(value.cachedAt)
      ? value.cachedAt
      : null;

  if (cachedAt === null) return null;

  return {
    id,
    username: normalizeString(value.username),
    fullName: normalizeString(value.fullName),
    bio: normalizeString(value.bio),
    profileImage: normalizeImageUrl(value.profileImage),
    bannerImage: normalizeImageUrl(value.bannerImage),
    favorites: normalizeFavorites(value.favorites),
    updatedAt: normalizeString(value.updatedAt),
    cachedAt,
    version: USER_PROFILE_CACHE_VERSION,
  };
};

const safeRemoveItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to remove user profile cache entry:", error);
  }
};

const readCachedProfile = async (
  key: string,
  userId: string,
  removeInvalid = true,
): Promise<CachedUserProfilePayload | null> => {
  try {
    const raw = await AsyncStorage.getItem(key);

    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const profile = parseCachedPayload(parsed, userId);

    if (!profile && removeInvalid) {
      await safeRemoveItem(key);
    }

    return profile;
  } catch {
    if (removeInvalid) {
      await safeRemoveItem(key);
    }

    return null;
  }
};

export async function getCachedUserProfile(
  userId: string,
): Promise<CachedUserProfileResult | null> {
  const key = getUserProfileCacheKey(userId);
  const profile = await readCachedProfile(key, userId);

  if (!profile) return null;

  const age = Math.max(0, Date.now() - profile.cachedAt);

  if (age > USER_PROFILE_STALE_TTL) {
    await safeRemoveItem(key);
    return null;
  }

  return {
    profile,
    cacheState: age <= USER_PROFILE_CACHE_TTL ? "fresh" : "stale",
  };
}

export async function setCachedUserProfile(
  userId: string,
  profile: CachedUserProfilePayload,
) {
  const key = getUserProfileCacheKey(userId);
  const id = normalizeId(profile.id) ?? userId;

  if (id !== userId) return;

  const safeProfile: CachedUserProfilePayload = {
    id,
    username: normalizeString(profile.username),
    fullName: normalizeString(profile.fullName),
    bio: normalizeString(profile.bio),
    profileImage: normalizeImageUrl(profile.profileImage),
    bannerImage: normalizeImageUrl(profile.bannerImage),
    favorites: normalizeFavorites(profile.favorites),
    updatedAt: normalizeString(profile.updatedAt),
    cachedAt: Date.now(),
    version: USER_PROFILE_CACHE_VERSION,
  };

  try {
    const existing = await readCachedProfile(key, userId, false);

    if (shouldKeepExistingCache(existing, safeProfile)) {
      return;
    }

    await AsyncStorage.setItem(key, JSON.stringify(safeProfile));
  } catch (error) {
    console.warn("Failed to write user profile cache:", error);
  }
}

export async function removeCachedUserProfile(userId: string) {
  await safeRemoveItem(getUserProfileCacheKey(userId));
}

export async function clearExpiredUserProfileCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const profileKeys = keys.filter((key) =>
      key.startsWith(USER_PROFILE_CACHE_KEY_PREFIX),
    );

    if (profileKeys.length === 0) return;

    const now = Date.now();
    const entries = await AsyncStorage.multiGet(profileKeys);
    const keysToRemove = entries.reduce<string[]>((keysToDelete, entry) => {
      const [key, raw] = entry;

      if (!key.startsWith(CURRENT_USER_PROFILE_CACHE_KEY_PREFIX) || !raw) {
        keysToDelete.push(key);
        return keysToDelete;
      }

      const userId = key.slice(CURRENT_USER_PROFILE_CACHE_KEY_PREFIX.length);

      try {
        const profile = parseCachedPayload(JSON.parse(raw), userId);

        if (!profile || now - profile.cachedAt > USER_PROFILE_STALE_TTL) {
          keysToDelete.push(key);
        }
      } catch {
        keysToDelete.push(key);
      }

      return keysToDelete;
    }, []);

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.warn("Failed to clear expired user profile cache:", error);
  }
}

export async function clearAllUserProfileCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const profileKeys = keys.filter((key) =>
      key.startsWith(USER_PROFILE_CACHE_KEY_PREFIX),
    );

    if (profileKeys.length > 0) {
      await AsyncStorage.multiRemove(profileKeys);
    }
  } catch (error) {
    console.warn("Failed to clear user profile cache:", error);
  }
}
