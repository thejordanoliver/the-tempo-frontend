// hooks/UserHooks/useFollowers.ts

import { apiClient } from "@/utils/apiClient";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * User shape returned by the followers / following endpoints.
 * Images are expected to be remote URLs, usually Cloudinary or normalized server URLs.
 */
export type User = {
  id: number | string;
  username: string;
  profile_image: string;
  full_name: string;
  banner_image: string;
  bio?: string | null;
  favorites?: string[];
  followers_count?: number;
  isFollowing: boolean;
  followsYou?: boolean;
};

type FollowListType = "followers" | "following";

type ToggleFollowResponse = {
  isFollowing: boolean;
};

const followersCache = new Map<string, User[]>();

const getCacheKey = (
  currentUserId: string,
  targetUserId: string,
  type: FollowListType,
) => `${currentUserId || "guest"}:${targetUserId}:${type}`;

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "error" in error.response.data &&
    typeof error.response.data.error === "string"
  ) {
    return error.response.data.error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Error fetching users";
};

const isCanceledRequest = (error: unknown) => {
  if (typeof error !== "object" || error === null) return false;

  return (
    ("code" in error && error.code === "ERR_CANCELED") ||
    ("name" in error && error.name === "CanceledError")
  );
};

const updateUserFollowState = (
  users: User[],
  followeeId: string,
  isFollowing: boolean,
) =>
  users.map((user) =>
    user.id.toString() === followeeId.toString()
      ? { ...user, isFollowing }
      : user,
  );

const updateFollowStateInCache = (
  followeeId: string,
  isFollowing: boolean,
) => {
  followersCache.forEach((cachedUsers, cacheKey) => {
    const updatedUsers = updateUserFollowState(
      cachedUsers,
      followeeId,
      isFollowing,
    );

    followersCache.set(cacheKey, updatedUsers);
  });
};

/**
 * Hook to fetch and manage followers / following users for a profile.
 *
 * @param currentUserId - Logged-in user's ID.
 * @param targetUserId - Profile user ID whose followers/following are being viewed.
 * @param type - Whether to fetch "followers" or "following".
 */
export function useFollowers(
  currentUserId: string,
  targetUserId: string,
  type: FollowListType,
) {
  const cacheKey = useMemo(
    () => getCacheKey(currentUserId, targetUserId, type),
    [currentUserId, targetUserId, type],
  );

  const [users, setUsers] = useState<User[]>(() => {
    return followersCache.get(cacheKey) ?? [];
  });

  const [loading, setLoading] = useState(() => {
    return Boolean(targetUserId) && !followersCache.has(cacheKey);
  });

  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch followers/following when:
   * - currentUserId changes
   * - targetUserId changes
   * - type changes
   *
   * Uses cache first, then refreshes in the background.
   */
  useEffect(() => {
    if (!targetUserId) {
      setUsers([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    const cachedUsers = followersCache.get(cacheKey);

    if (cachedUsers) {
      setUsers(cachedUsers);
      setLoading(false);
    } else {
      setLoading(true);
    }

    setError(null);

    apiClient
      .get<User[]>(`/api/follows/${Number(targetUserId)}/${type}`, {
        params: { currentUserId },
        signal: controller.signal,
      })
      .then((res) => {
        if (!isActive) return;

        const nextUsers = Array.isArray(res.data) ? res.data : [];

        followersCache.set(cacheKey, nextUsers);
        setUsers(nextUsers);
      })
      .catch((err) => {
        if (!isActive || isCanceledRequest(err)) return;

        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!isActive) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [cacheKey, currentUserId, targetUserId, type]);

  /**
   * Toggle follow/unfollow for a specific user.
   *
   * @param followeeId - ID of the user to follow or unfollow.
   */
  const toggleFollow = useCallback(
    async (followeeId: string) => {
      if (
        !currentUserId ||
        !followeeId ||
        followeeId.toString() === currentUserId.toString()
      ) {
        return;
      }

      try {
        const res = await apiClient.post<ToggleFollowResponse>(
          "/api/follows/toggle",
          {
            followerId: currentUserId,
            followeeId: Number(followeeId),
          },
        );

        const nextIsFollowing = Boolean(res.data.isFollowing);

        updateFollowStateInCache(followeeId, nextIsFollowing);

        setUsers((prevUsers) => {
          const updatedUsers = updateUserFollowState(
            prevUsers,
            followeeId,
            nextIsFollowing,
          );

          followersCache.set(cacheKey, updatedUsers);

          return updatedUsers;
        });
      } catch (error) {
        throw error;
      }
    },
    [cacheKey, currentUserId],
  );

  return {
    users,
    loading,
    error,
    toggleFollow,
  };
}