// hooks/UserHooks/useEditProfile.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { apiClient } from "utils/apiClient";

interface UpdatedUser {
  id: number;
  username: string;
  full_name: string;
  bio: string | null;
  profile_image: string | null;
  banner_image: string | null;
  email: string | null;
  favorites: string[];
}

export function useEditProfile() {
  const [saving, setSaving] = useState(false);

  const saveProfile = async (
    userId: string,
    formData: FormData,
  ): Promise<UpdatedUser> => {
    setSaving(true);
    try {
      const { data } = await apiClient.patch<{ user: UpdatedUser }>(
        `/api/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const u = data.user;

      // Keep AsyncStorage in sync with what the server returned.
      // Only overwrite image keys if the server sent back a non-null URL —
      // otherwise we'd wipe a previously saved image when the user doesn't
      // upload a new one.
      await AsyncStorage.multiSet([
        ["fullName", u.full_name ?? ""],
        ["bio", u.bio ?? ""],
        ...(u.profile_image
          ? [["profileImage", u.profile_image] as [string, string]]
          : []),
        ...(u.banner_image
          ? [["bannerImage", u.banner_image] as [string, string]]
          : []),
      ]);

      return u;
    } catch (err: any) {
      const message =
        err.response?.data?.error ?? err.message ?? "Failed to save profile.";
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  return { saving, saveProfile };
}