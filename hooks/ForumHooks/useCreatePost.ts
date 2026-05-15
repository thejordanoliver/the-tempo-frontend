import AsyncStorage from "@react-native-async-storage/async-storage";
import { PollData } from "components/Forum/PollEditorModal";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { AlertConfig } from "types/alert";
import { LeagueType } from "types/types";
import { apiClient } from "utils/apiClient";

export type MediaItem = {
  id: string;
  uri: string;
  type: "image" | "video" | "gif";
  thumbnailUri?: string;
  trimStartMs?: number;
  trimEndMs?: number;
};

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MAX_MEDIA_ITEMS = 8;

const createAnim = () => ({ opacity: new Animated.Value(1) });

const createMediaId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getMimeType = (item: MediaItem) => {
  if (item.type === "gif") return "image/gif";

  const filename = item.uri.split("/").pop() || "";
  const ext = /\.(\w+)$/.exec(filename)?.[1]?.toLowerCase();

  if (item.type === "video") {
    if (ext === "mov") return "video/quicktime";
    if (ext) return `video/${ext}`;
    return "video/mp4";
  }

  if (ext === "jpg") return "image/jpeg";
  if (ext) return `image/${ext}`;

  return "image/jpeg";
};

export function useCreatePost(teamId?: string, league?: LeagueType) {
  const [newPostText, setNewPostText] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaAnims, setMediaAnims] = useState<
    Record<string, { opacity: Animated.Value }>
  >({});
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [poll, setPoll] = useState<PollData | null>(null);

  const router = useRouter();
  const removingRef = useRef(new Set<string>());

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
  }, []);

  const closeAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

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
  }, [showAlert]);

  const prependPost = useCallback((post: any) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const addMediaItems = useCallback((items: MediaItem[]) => {
    if (items.length === 0) return;

    setMedia((prev) => [...prev, ...items]);

    setMediaAnims((prev) => {
      const next = { ...prev };

      items.forEach((item) => {
        next[item.id] = createAnim();
      });

      return next;
    });
  }, []);

  const pickMedia = useCallback(async () => {
    if (media.length >= MAX_MEDIA_ITEMS) {
      showAlert({
        title: "Limit reached",
        message: `You can only upload up to ${MAX_MEDIA_ITEMS} items.`,
        confirmText: "OK",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_MEDIA_ITEMS - media.length,
      quality: 0.8,
    });

    if (result.canceled) return;

    const selected: MediaItem[] = await Promise.all(
      result.assets.map(async (asset) => {
        const id = createMediaId();

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
            return {
              id,
              uri: asset.uri,
              type: "video",
            };
          }
        }

        return {
          id,
          uri: asset.uri,
          type: "image",
        };
      }),
    );

    addMediaItems(selected);
  }, [addMediaItems, media.length, showAlert]);

  const addGif = useCallback(
    (gifUrl: string) => {
      if (!gifUrl) return;

      if (media.length >= MAX_MEDIA_ITEMS) {
        showAlert({
          title: "Limit reached",
          message: `You can only add up to ${MAX_MEDIA_ITEMS} media items.`,
          confirmText: "OK",
        });
        return;
      }

      addMediaItems([
        {
          id: createMediaId(),
          uri: gifUrl,
          type: "gif",
        },
      ]);
    },
    [addMediaItems, media.length, showAlert],
  );

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
        confirmText: "OK",
      });
      return null;
    }

    if (!league) {
      showAlert({
        title: "Error",
        message: "League is required to create a post.",
        confirmText: "OK",
      });
      return null;
    }

    const hasText = newPostText.trim().length > 0;
    const hasMedia = media.length > 0;
    const hasPoll = !!poll;

    if (!hasText && !hasMedia && !hasPoll) {
      showAlert({
        title: "Empty post",
        message: "Add text, media, a GIF, or a poll before posting.",
        confirmText: "OK",
      });
      return null;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("text", newPostText.trim());
    formData.append("league", league);

    if (poll) {
      formData.append(
        "poll",
        JSON.stringify({
          question: poll.question,
          options: poll.options.map((o) => o.text),
          allowsMultiple: poll.allowsMultiple,
        }),
      );
    }

    const gifUrls = media
      .filter((item) => item.type === "gif")
      .map((item) => item.uri);

    if (gifUrls.length > 0) {
      formData.append("gif_urls", JSON.stringify(gifUrls));

      gifUrls.forEach((gifUrl) => {
        formData.append("gif_url", gifUrl);
      });
    }

    media.forEach((item, idx) => {
      if (item.type === "gif") return;

      const fallbackExt = item.type === "video" ? "mp4" : "jpg";
      const fallbackName = `${item.type}-${idx}.${fallbackExt}`;
      const filename = item.uri.split("/").pop() || fallbackName;

      formData.append("media", {
        uri: item.uri,
        name: filename,
        type: getMimeType(item),
      } as any);

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
        ? `api/forum/team/${teamId}`
        : `api/forum/league/${league}`;

      const res = await apiClient.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newPost = res.data.post;

      prependPost(newPost);
      setPoll(null);
      setNewPostText("");
      setMedia([]);
      setMediaAnims({});

      showAlert({
        title: "Success",
        message: "Post created!",
        confirmText: "OK",
        onConfirm: () => router.back(),
      });

      return newPost;
    } catch (err: any) {
      let errorMessage = "Please try again later.";

      if (err.response?.status === 413) {
        errorMessage = "Media files are too large. Please reduce file size.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || "Invalid post data.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      showAlert({
        title: "Failed to create post",
        message: errorMessage,
        confirmText: "OK",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [
    media,
    newPostText,
    token,
    teamId,
    league,
    poll,
    prependPost,
    router,
    showAlert,
  ]);

  return {
    newPostText,
    setNewPostText,
    media,
    mediaAnims,
    loading,
    pickMedia,
    addGif,
    removeMedia,
    createPost,
    prependPost,
    alertConfig,
    showAlert,
    closeAlert,
    setMedia,
    setMediaAnims,
    posts,
    poll,
    setPoll,
  };
}