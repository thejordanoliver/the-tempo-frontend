import {
  isFavoriteSportId,
  type FavoriteSportId,
} from "constants/leagues";
import {
  normalizeFavoriteTeamKeys,
  type FavoriteTeamKey,
} from "types/favorites";
import { apiClient } from "utils/apiClient";

export type UserSearchResult = {
  id: number | string;
  username: string;
  fullName?: string | null;
  profileImageUrl?: string | null;
  isVerified?: boolean;
};

export type BlockedUser = {
  id: number;
  username: string;
  fullName: string | null;
  profileImage: string | null;
  blockedAt: string;
};

export type ReportReason =
  | "spam"
  | "harassment"
  | "hate"
  | "threats"
  | "sexual_content"
  | "impersonation"
  | "scam"
  | "misinformation"
  | "other";

export type ReportTargetType =
  | "user"
  | "forum_post"
  | "forum_comment"
  | "dm_message"
  | "game_chat_message";

export async function blockUser(userId: string | number): Promise<void> {
  await apiClient.post(`/api/safety/blocks/${encodeURIComponent(String(userId))}`);
}

export async function unblockUser(userId: string | number): Promise<void> {
  await apiClient.delete(`/api/safety/blocks/${encodeURIComponent(String(userId))}`);
}

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  const response = await apiClient.get<{ users?: BlockedUser[] }>(
    "/api/safety/blocks",
  );
  return response.data.users ?? [];
}

export async function getVisibleUserIds(
  userIds: (string | number)[],
): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();

  const response = await apiClient.post<{ visibleUserIds?: number[] }>(
    "/api/safety/visibility/users",
    { userIds },
  );
  return new Set((response.data.visibleUserIds ?? []).map(String));
}

export async function reportUser(
  userId: string | number,
  reasonCode: ReportReason,
  details?: string,
): Promise<void> {
  await apiClient.post("/api/safety/reports", {
    targetType: "user",
    targetId: String(userId),
    reasonCode,
    ...(details?.trim() ? { details: details.trim() } : {}),
  });
}

export async function reportContent(
  targetType: Exclude<ReportTargetType, "user">,
  targetId: string | number,
  reasonCode: ReportReason,
  details?: string,
): Promise<void> {
  await apiClient.post("/api/safety/reports", {
    targetType,
    targetId: String(targetId),
    reasonCode,
    ...(details?.trim() ? { details: details.trim() } : {}),
  });
}

export async function searchUsers(
  query: string,
): Promise<UserSearchResult[]> {
  const trimmed = query.trim();

  if (trimmed.length < 2) return [];

  const res = await apiClient.get("/api/users/search", {
    params: { q: trimmed },
  });

  return res.data?.users ?? [];
}

export async function getActivityStatusPreference(): Promise<boolean> {
  const res = await apiClient.get("/api/users/me/activity-status");

  return Boolean(res.data?.showActivityStatus ?? true);
}

export async function updateActivityStatusPreference(
  showActivityStatus: boolean,
): Promise<boolean> {
  const res = await apiClient.patch("/api/users/me/activity-status", {
    showActivityStatus,
  });

  return Boolean(res.data?.showActivityStatus ?? showActivityStatus);
}

type FavoriteTeamsResponse = {
  favoriteTeamIds?: unknown;
};

export async function getFavoriteTeams(): Promise<FavoriteTeamKey[]> {
  const res = await apiClient.get<FavoriteTeamsResponse>(
    "/api/users/me/favorites",
  );

  return normalizeFavoriteTeamKeys(res.data?.favoriteTeamIds);
}

export async function updateFavoriteTeams(
  favoriteTeams: readonly FavoriteTeamKey[],
): Promise<FavoriteTeamKey[]> {
  const normalizedFavoriteTeams = normalizeFavoriteTeamKeys(favoriteTeams);
  const res = await apiClient.patch<FavoriteTeamsResponse>(
    "/api/users/me/favorites",
    { favoriteTeams: normalizedFavoriteTeams },
  );

  return normalizeFavoriteTeamKeys(res.data?.favoriteTeamIds);
}

type FavoriteSportsResponse = {
  favoriteSports?: unknown;
};

function normalizeFavoriteSportsResponse(value: unknown): FavoriteSportId[] {
  if (!Array.isArray(value)) return [];

  return Array.from(new Set(value.filter(isFavoriteSportId)));
}

export async function getFavoriteSports(): Promise<FavoriteSportId[]> {
  const res = await apiClient.get<FavoriteSportsResponse>(
    "/api/users/me/favorite-sports",
  );

  return normalizeFavoriteSportsResponse(res.data?.favoriteSports);
}

export async function updateFavoriteSports(
  favoriteSports: FavoriteSportId[],
): Promise<FavoriteSportId[]> {
  const normalizedFavoriteSports = Array.from(new Set(favoriteSports));
  const res = await apiClient.put<FavoriteSportsResponse>(
    "/api/users/me/favorite-sports",
    { favoriteSports: normalizedFavoriteSports },
  );

  return normalizeFavoriteSportsResponse(res.data?.favoriteSports);
}
