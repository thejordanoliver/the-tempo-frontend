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
