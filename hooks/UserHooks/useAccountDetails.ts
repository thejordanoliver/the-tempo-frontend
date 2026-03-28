// hooks/useAccountDetails.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import { BASE_URL } from "utils/apiClient";

function parseImageUrl(url: string | null | undefined): string | null {
  if (!url || url === "null") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function useAccountDetails() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async (userId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/api/users/id/${userId}`);
      const data = res.data;

      setUserData({
        ...data,
        profile_image: parseImageUrl(data.profile_image),
        banner_image: parseImageUrl(data.banner_image),
      });
    } catch (err: any) {
      console.error("Fetch account details error:", err.message);
      setUserData(null);
      setError("Failed to load account details");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedId = await AsyncStorage.getItem("userId");
        if (!storedId) return;

        const idNum = Number(storedId);
        setCurrentUserId(idNum);
        await fetchUserData(idNum);
      } catch {
        setCurrentUserId(null);
        setIsLoading(false);
      }
    })();
  }, [fetchUserData]);

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    if (!userData?.id) throw new Error("User not loaded");

    setIsChangingPassword(true);
    setError(null);

    try {
      await axios.patch(
        `${BASE_URL}/api/users/${userData.id}/password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || "Failed to update password";
      setError(message);
      throw new Error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return {
    isLoading,
    currentUserId,
    userData,
    isChangingPassword,
    error,
    refetch: () =>
      currentUserId ? fetchUserData(currentUserId) : Promise.resolve(),
    changePassword,
  };
}
