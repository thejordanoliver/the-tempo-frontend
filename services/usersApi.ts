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
