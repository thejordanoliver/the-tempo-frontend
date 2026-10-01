import { getUserProfileCountParams } from "./userProfileCounts";

type ProfilePreview = {
  username?: unknown;
  fullName?: unknown;
  full_name?: unknown;
  bio?: unknown;
  profileImage?: unknown;
  profile_image?: unknown;
  profileImageUrl?: unknown;
  bannerImage?: unknown;
  banner_image?: unknown;
  isFollowing?: unknown;
  followers_count?: number;
  following_count?: number;
};

export function getUserProfileParams(id: number | string, user: ProfilePreview = {}) {
  const params: Record<string, string> & { id: string } = {
    id: String(id),
    ...getUserProfileCountParams(user),
  };
  const fields = {
    username: user.username,
    fullName: user.fullName ?? user.full_name,
    bio: user.bio,
    profileImage: user.profileImage ?? user.profileImageUrl ?? user.profile_image,
    bannerImage: user.bannerImage ?? user.banner_image,
  };
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "string" && value !== "null" && value !== "undefined") {
      params[key] = value;
    }
  }
  if (typeof user.isFollowing === "boolean") {
    params.isFollowing = String(user.isFollowing);
  }
  return params;
}
