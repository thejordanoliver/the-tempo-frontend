import {
  isFavoriteSportId,
  type FavoriteSportId,
} from "constants/leagues";
import { apiClient } from "utils/apiClient";

export type UserSearchResult = {
  id: number | string;
  username: string;
  fullName?: string | null;
  profileImageUrl?: string | null;
  isVerified?: boolean;
};

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

type FavoriteSportsResponse = {
  favorites?: unknown;
};

function normalizeFavoriteSportsResponse(value: unknown): FavoriteSportId[] {
  if (!Array.isArray(value)) return [];

  return Array.from(new Set(value.filter(isFavoriteSportId)));
}

export async function getFavoriteSports(): Promise<FavoriteSportId[]> {
  const res = await apiClient.get<FavoriteSportsResponse>(
    "/api/users/me/favorite-sports",
  );

  return normalizeFavoriteSportsResponse(res.data?.favorites);
}

export async function updateFavoriteSports(
  favorites: FavoriteSportId[],
): Promise<FavoriteSportId[]> {
  const normalizedFavorites = Array.from(new Set(favorites));
  const res = await apiClient.put<FavoriteSportsResponse>(
    "/api/users/me/favorite-sports",
    { favorites: normalizedFavorites },
  );

  return normalizeFavoriteSportsResponse(res.data?.favorites);
}
