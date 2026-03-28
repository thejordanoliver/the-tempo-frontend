import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useCallback, useEffect, useRef, useState } from "react";
import { BASE_URL } from "utils/apiClient";

import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

export type MediaItem = {
  id: string;
  uri: string;
  type: "image" | "video";
  thumbnailUri?: string;
  trimStartMs?: number;
  trimEndMs?: number;
};

export interface AlertConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const createAnim = () => ({ opacity: new Animated.Value(1) });

export function useCreatePost(teamId?: string, league?: "NBA" | "NFL") {
  const [newPostText, setNewPostText] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaAnims, setMediaAnims] = useState<
    Record<string, { opacity: Animated.Value }>
  >({});
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [posts, setPosts] = useState<any[]>([]); // Optional: local list of posts
  const router = useRouter();
  const removingRef = useRef(new Set<string>());

  const showAlert = (config: AlertConfig) => setAlertConfig(config);
  const closeAlert = () => setAlertConfig(null);

  // Load token
  useEffect(() => {
    AsyncStorage.getItem("accessToken").then((t) => {
      setToken(t);
      if (!t) {
        showAlert({
          title: "Not Logged In",
          message: "You must be logged in to create a post.",
          confirmText: "OK",
        });
      }
    });
  }, []);

  const prependPost = useCallback((post: any) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const pickMedia = useCallback(async () => {
    if (media.length >= 8) {
      showAlert({
        title: "Limit reached",
        message: "You can only upload up to 8 items.",
        confirmText: "OK",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      selectionLimit: 8 - media.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selected: MediaItem[] = await Promise.all(
        result.assets.map(async (asset) => {
          const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          if (asset.type === "video") {
            try {
              const { uri: thumbnailUri } =
                await VideoThumbnails.getThumbnailAsync(asset.uri, {
                  time: 0,
                  quality: 0.8,
                });
              return {
                id,
                uri: asset.uri,
                type: "video",
                thumbnailUri,
                trimStartMs: 0,
              };
            } catch {
              return { id, uri: asset.uri, type: "video" };
            }
          }
          return { id, uri: asset.uri, type: "image" };
        }),
      );

      setMedia((prev) => [...prev, ...selected]);
      setMediaAnims((prev) => {
        const next = { ...prev };
        selected.forEach((item) => (next[item.id] = createAnim()));
        return next;
      });
    }
  }, [media]);

  const removeMedia = useCallback(
    (id: string) => {
      if (removingRef.current.has(id)) return;
      const anim = mediaAnims[id];
      if (!anim) return;

      const itemExists = media.find((m) => m.id === id);
      if (!itemExists) return;

      removingRef.current.add(id);

      Animated.timing(anim.opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        LayoutAnimation.configureNext({
          duration: 350,
          create: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
            springDamping: 0.7,
          },
          delete: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
        });

        setMedia((prev) => prev.filter((item) => item.id !== id));
        setMediaAnims((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });

        removingRef.current.delete(id);
      });
    },
    [media, mediaAnims],
  );
  const createPost = useCallback(async () => {
    if (!token) {
      showAlert({
        title: "Not Logged In",
        message: "You must be logged in to create a post.",
        confirmText: "Cancel",
      });
      return null;
    }
    if (!league) {
      showAlert({
        title: "Error",
        message: "League is required to create a post.",
        cancelText: "Cancel",
      });
      return null;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("text", newPostText);
    formData.append("league", league);

    media.forEach((item, idx) => {
      const filename = item.uri.split("/").pop()!;
      const ext = /\.(\w+)$/.exec(filename)?.[1];
      const type = item.type === "video" ? `video/${ext}` : `image/${ext}`;
      formData.append("media", { uri: item.uri, name: filename, type } as any);

      if (item.type === "video") {
        if (item.thumbnailUri) {
          const thumbName =
            item.thumbnailUri.split("/").pop() || `thumb-${idx}.jpg`;
          formData.append("thumbnails", {
            uri: item.thumbnailUri,
            name: thumbName,
            type: "image/jpeg",
          } as any);
        }
        formData.append(
          "trimMeta",
          JSON.stringify({
            idx,
            startMs: item.trimStartMs ?? 0,
            endMs: item.trimEndMs ?? null,
          }),
        );
      }
    });

    try {
      const endpoint = teamId
        ? `${BASE_URL}/api/forum/team/${teamId}`
        : `${BASE_URL}/api/forum/league/${league}`;
      const res = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newPost = res.data.post; // ✅ Return the newly created post
      prependPost(newPost); // update local list immediately

      showAlert({
        title: "Success",
        message: "Post created!",
        confirmText: "OK",
        onConfirm: () => router.back(),
      });

      return newPost; // ✅ Return post so screen can also use it
    } catch (err: any) {
      let errorMessage = "Please try again later.";
      if (err.response?.status === 413)
        errorMessage = "Media files are too large. Please reduce file size.";
      else if (err.response?.status === 400)
        errorMessage = err.response.data?.error || "Invalid post data.";
      else if (err.response?.data?.error)
        errorMessage = err.response.data.error;
      else if (err.message) errorMessage = err.message;

      showAlert({
        title: "Failed to create post",
        message: errorMessage,
        confirmText: "OK",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [media, newPostText, token, teamId, league, prependPost]);

  return {
    newPostText,
    setNewPostText,
    media,
    mediaAnims,
    loading,
    pickMedia,
    removeMedia,
    createPost,
    prependPost, // ✅ added here
    alertConfig,
    showAlert,
    closeAlert,
    setMedia,
    setMediaAnims,
    posts, // optional: local post list
  };
}
