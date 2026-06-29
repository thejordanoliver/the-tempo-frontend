// hooks/UserHooks/useEditProfile.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import { User } from "types/user";
import { apiClient, BASE_URL } from "utils/apiClient";
import { removeCachedUserProfile } from "utils/userProfileCache";

const getProfileSaveErrorMessage = (err: any) => {
  const status = err?.response?.status;
  const serverMessage =
    err?.response?.data?.error || err?.response?.data?.message || err?.message;

  if (serverMessage && serverMessage !== "Network Error") {
    return serverMessage;
  }

  if (status === 400) {
    return "Invalid profile data. Please check your changes and try again.";
  }

  if (status === 401 || status === 403) {
    return "You are not authorized. Please sign in again.";
  }

  if (status === 413) {
    return "Image is too large. Please choose a smaller image.";
  }

  if (serverMessage === "Network Error") {
    return "Network error. Check your API URL, server status, image size, and upload endpoint.";
  }

  return "Failed to save profile.";
};

export function useEditProfile() {
  const [saving, setSaving] = useState(false);

  const saveProfile = useCallback(
    async (userId: string | number, formData: FormData): Promise<User> => {
      if (!userId) {
        throw new Error("User ID missing.");
      }

      setSaving(true);

      try {
        if (__DEV__) {
          console.log("Saving profile to:", `${BASE_URL}/api/${userId}`);
        }

        const { data } = await apiClient.patch<{ user: User }>(
          `/api/${userId}`,
          formData,
          {
            headers: {
              Accept: "application/json",
            },

            // Important for React Native FormData.
            // Prevent axios from trying to serialize the FormData object.
            transformRequest: (body) => body,

            // Optional, but helps slow Render/Cloudinary uploads.
            timeout: 60000,
          },
        );

        const updatedUser = data.user;

        if (!updatedUser) {
          throw new Error("Server did not return updated profile data.");
        }

        const storageUpdates: [string, string][] = [
          ["fullName", updatedUser.full_name ?? ""],
          ["bio", updatedUser.bio ?? ""],
        ];

        if (updatedUser.profile_image) {
          storageUpdates.push(["profileImage", updatedUser.profile_image]);
        }

        if (updatedUser.banner_image) {
          storageUpdates.push(["bannerImage", updatedUser.banner_image]);
        }

        await AsyncStorage.multiSet(storageUpdates);
        await removeCachedUserProfile(String(userId));

        return updatedUser;
      } catch (err: any) {
        if (__DEV__) {
          console.warn("Save profile raw error:", {
            message: err?.message,
            status: err?.response?.status,
            data: err?.response?.data,
            baseURL: BASE_URL,
            url: err?.config?.url,
          });
        }

        const message = getProfileSaveErrorMessage(err);
        console.warn("Save profile failed:", message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return {
    saving,
    saveProfile,
  };
}
