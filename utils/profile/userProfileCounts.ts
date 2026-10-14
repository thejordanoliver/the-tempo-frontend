import type { UserFollowCounts } from "types/user";

type RouteParam = string | string[] | undefined;

export function parseProfileCountParam(param: RouteParam): number | undefined {
  const value = Array.isArray(param) ? param[0] : param;
  if (!value?.trim()) return undefined;
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : undefined;
}

export function getUserProfileCountParams(user: UserFollowCounts) {
  return {
    ...(typeof user.followers_count === "number" &&
    Number.isSafeInteger(user.followers_count) && user.followers_count >= 0
      ? { followers: String(user.followers_count) }
      : {}),
    ...(typeof user.following_count === "number" &&
    Number.isSafeInteger(user.following_count) && user.following_count >= 0
      ? { following: String(user.following_count) }
      : {}),
  };
}
