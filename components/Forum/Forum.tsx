import { useForum } from "@/hooks/ForumHooks/useForum";
import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "components/ConfirmModal";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useImagePreviewStore } from "../../store/imagePreviewStore";
import FloatingButton from "../Buttons/FloatingButton";
import { Post, PostItem } from "./PostItem";
import PostItemSkeleton from "./PostItemSkeleton";

interface ForumProps {
  teamId?: string;
  league?: string;
}

export default function Forum({ teamId, league }: ForumProps) {
  const router = useRouter();
  const setGlobalImage = useImagePreviewStore((s) => s.setImages);

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => forumStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const [alertConfig, setAlertConfig] = useState<null | {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "danger";
    onConfirm?: () => void | Promise<void>;
  }>(null);

  const {
    posts,
    loading,
    refreshing,
    error,
    currentUserId,
    fetchPosts,
    refresh,
    loadMore,
    deletePost,
    editPost,
    updatePost,
  } = useForum({teamId, league});

  /** Fetch initial posts on screen focus */
  useFocusEffect(
    useCallback(() => {
      fetchPosts(1);
    }, [fetchPosts]),
  );

  /** Clear global image preview on unmount */
  useEffect(() => {
    return () => setGlobalImage([], 0);
  }, [setGlobalImage]);

  /** Alert helpers */
  const showAlert = useCallback((config: typeof alertConfig) => {
    setAlertConfig(config);
  }, []);

  const closeAlert = useCallback(() => setAlertConfig(null), []);

  /** Post actions */
  const handleDeletePost = useCallback(
    async (id: string) => {
      try {
        await deletePost(id);
        showAlert({
          title: "Deleted",
          message: "Post deleted.",
          confirmText: "OK",
        });
      } catch {
        showAlert({
          title: "Error",
          message: "Failed to delete post.",
          confirmText: "OK",
          variant: "danger",
        });
      }
    },
    [deletePost, showAlert],
  );

  const handleEditPost = useCallback(
    async (id: string, text: string) => {
      try {
        await editPost(id, text);
        showAlert({
          title: "Updated",
          message: "Post updated.",
          confirmText: "OK",
        });
      } catch {
        showAlert({
          title: "Error",
          message: "Failed to update post.",
          confirmText: "OK",
          variant: "danger",
        });
      }
    },
    [editPost, showAlert],
  );

  /** Render each post */
  const renderPostItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostItem
        item={item}
        isDark={isDark}
        currentUserId={currentUserId}
        deletePost={handleDeletePost}
        editPost={handleEditPost}
        onBookmarkChange={updatePost}
        onImagePress={(uri) => setGlobalImage([uri], 0)}
      />
    ),
    [
      isDark,
      currentUserId,
      handleDeletePost,
      handleEditPost,
      updatePost,
      setGlobalImage,
    ],
  );

  /** Navigate to create-post */
  const handlePressCreate = useCallback(() => {
    router.push({
      pathname: "/create-post",
      params: { teamId, league, currentUserId },
    });
  }, [router, teamId, league, currentUserId]);

  /** Loading skeleton */
  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {Array.from({ length: 5 }).map((_, i) => (
          <PostItemSkeleton key={i} showMedia />
        ))}
      </ScrollView>
    );
  }

  /** Error state */
  if (error) {
    return <Text style={global.errorText}>{error}</Text>;
  }

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        renderItem={renderPostItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View style={global.emptyContainer}>
            <Ionicons
              name="chatbubble-outline"
              size={48}
              color={Colors.midTone}
            />
            <Text style={global.emptyText}>{"It's Quiet Here"}</Text>
            <Text style={global.emptySubText}>
              No posts yet. Be the first to start the conversation.
            </Text>
          </View>
        }
      />

      <FloatingButton
        isOpen={false}
        onPress={handlePressCreate}
        icon={"create"}
      />

      <ConfirmModal
        visible={!!alertConfig}
        title={alertConfig?.title}
        message={alertConfig?.message}
        confirmText={alertConfig?.confirmText ?? "OK"}
        cancelText={alertConfig?.cancelText}
        variant={alertConfig?.variant ?? "default"}
        onCancel={closeAlert}
        onConfirm={async () => {
          if (alertConfig?.onConfirm) {
            await alertConfig.onConfirm();
          }
          closeAlert();
        }}
      />
    </>
  );
}

export function forumStyles(isDark: boolean) {
  return StyleSheet.create({
    container: { paddingBottom: 130, flexGrow: 1 },
  });
}
