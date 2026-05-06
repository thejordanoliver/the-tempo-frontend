import axios from "axios";
import { useCallback, useEffect, useState } from "react";

/**
 * User shape returned by the followers / following endpoints
 * Images are expected to be remote URLs (Cloudinary or normalized server URLs)
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
  followsYou?: boolean; // 👈 add this
};

/**
 * Hook to fetch and manage followers / following users for a profile
 *
 * @param currentUserId - Logged-in user's ID (used for follow toggling)
 * @param targetUserId - Profile user ID whose followers/following are being viewed
 * @param type - Whether to fetch "followers" or "following"
 */
export function useFollowers(
  currentUserId: string,
  targetUserId: string,
  type: "followers" | "following"
) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch followers or following users whenever:
   * - the target user changes
   * - the type (followers / following) changes
   */
  useEffect(() => {
    if (!targetUserId) return;

    setLoading(true);
    setError(null);

    axios
      .get<User[]>(
        `${process.env.EXPO_PUBLIC_API_URL}/api/follows/${Number(
          targetUserId
        )}/${type}`,
        {
          params: { currentUserId },
        }
      )
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.error || err.message || "Error fetching users"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUserId, targetUserId, type]);

  /**
   * Toggle follow/unfollow for a specific user
   *
   * @param followeeId - ID of the user to follow or unfollow
   */
  const toggleFollow = useCallback(async (followeeId: string) => {
    // Prevent attempting to follow yourself
    if (followeeId === currentUserId) return;

    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/follows/toggle`,
        {
          followerId: currentUserId,
          followeeId: Number(followeeId),
        }
      );

      // Update follow state for the affected user only
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id.toString() === followeeId.toString()
            ? { ...user, isFollowing: res.data.isFollowing }
            : user
        )
      );
    } catch (error) {
      // Let callers roll back optimistic UI for the affected row.
      throw error;
    }
  }, [currentUserId]);

  return {
    users,
    loading,
    error,
    toggleFollow,
  };
}
