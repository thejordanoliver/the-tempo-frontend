import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient, subscribeAuthSession } from "utils/apiClient";
import {
  getAuthSessionVersion,
  isAuthSessionCurrent,
  withAuthStorageLock,
} from "utils/auth/authSessionLifecycle";

function parseImageUrl(url: string | null | undefined): string | null {
  if (!url || url === "null" || url === "undefined") return null;
  if (!url.startsWith("http")) return null;
  return url;
}

function parseString(value: string | null | undefined): string | null {
  if (!value || value === "null" || value === "undefined") return null;
  return value;
}

type ProfileResponse = {
  id: number;
  username: string;
  fullName?: string;
  full_name?: string;
  bio?: string | null;
  profileImage?: string | null;
  profile_image?: string | null;
  bannerImage?: string | null;
  banner_image?: string | null;
  followersCount?: number;
  followingCount?: number;
};

type ProfileRequest = {
  version: number;
  controller: AbortController;
};

export function useProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const requestRef = useRef<ProfileRequest | null>(null);
  const mounted = useRef(true);

  const resetProfile = useCallback(() => {
    requestRef.current?.controller.abort();
    requestRef.current = null;
    setIsLoading(false);
    setCurrentUserId(null);
    setUsername(null);
    setFullName(null);
    setBio(null);
    setProfileImage(null);
    setBannerImage(null);
    setFollowersCount(0);
    setFollowingCount(0);
  }, []);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = subscribeAuthSession(({ accessToken }) => {
      if (!accessToken) resetProfile();
    });
    return () => {
      mounted.current = false;
      requestRef.current?.controller.abort();
      requestRef.current = null;
      unsubscribe();
    };
  }, [resetProfile]);

  const loadProfile = useCallback(async () => {
    requestRef.current?.controller.abort();
    const request: ProfileRequest = {
      version: getAuthSessionVersion(),
      controller: new AbortController(),
    };
    requestRef.current = request;
    const isCurrent = () =>
      mounted.current &&
      requestRef.current === request &&
      isAuthSessionCurrent(request.version);
    setIsLoading(true);
    let userId: number | null = null;

    try {
      const values = await AsyncStorage.multiGet([
        "userId",
        "username",
        "fullName",
        "bio",
        "profileImage",
        "bannerImage",
      ]);
      if (!isCurrent()) return null;
      const cached = Object.fromEntries(values);
      userId = cached.userId ? Number(cached.userId) : null;
      if (!userId || !Number.isSafeInteger(userId) || userId < 1) {
        resetProfile();
        return null;
      }

      setCurrentUserId(userId);
      setUsername(parseString(cached.username));
      setFullName(parseString(cached.fullName));
      setBio(parseString(cached.bio));
      setProfileImage(parseImageUrl(cached.profileImage));
      setBannerImage(parseImageUrl(cached.bannerImage));

      const { data } = await apiClient.get<ProfileResponse>(
        `/api/users/id/${userId}`,
        { signal: request.controller.signal },
      );
      if (!isCurrent()) return null;
      if (Number(data.id) !== userId)
        throw new Error("Profile identity mismatch");

      const nextUsername = parseString(data.username);
      const nextFullName = parseString(data.fullName ?? data.full_name);
      const nextBio = parseString(data.bio);
      const nextProfileImage = parseImageUrl(
        data.profileImage ?? data.profile_image,
      );
      const nextBannerImage = parseImageUrl(
        data.bannerImage ?? data.banner_image,
      );

      await withAuthStorageLock(async () => {
        if (!isCurrent()) return;
        try {
          // Authentication owns userId. Profile hydration can only update the
          // current account's presentation fields and never replace its identity.
          await AsyncStorage.multiSet([
            ["username", nextUsername ?? ""],
            ["fullName", nextFullName ?? ""],
            ["bio", nextBio ?? ""],
            ["profileImage", nextProfileImage ?? ""],
            ["bannerImage", nextBannerImage ?? ""],
            [
              "authUser",
              JSON.stringify({
                id: userId,
                username: nextUsername ?? "",
                fullName: nextFullName ?? "",
                profileImage: nextProfileImage ?? "",
              }),
            ],
          ]);
        } catch (error) {
          console.warn("[useProfile] Cache save failed:", error);
        }
      });
      if (!isCurrent()) return null;

      setUsername(nextUsername);
      setFullName(nextFullName);
      setBio(nextBio);
      setProfileImage(nextProfileImage);
      setBannerImage(nextBannerImage);
      setFollowersCount(data.followersCount ?? 0);
      setFollowingCount(data.followingCount ?? 0);
      return userId;
    } catch (error) {
      if (!isCurrent()) return null;
      console.warn("[useProfile] Load failed:", error);
      return userId;
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, [resetProfile]);

  return {
    isLoading,
    currentUserId,
    username,
    fullName,
    bio,
    profileImage,
    bannerImage,
    followersCount,
    followingCount,
    loadProfile,
    resetProfile,
  };
}
