import { useForum } from "@/hooks/ForumHooks/useForum";
import ConfirmModal from "components/ConfirmModal";
import { usePreferences } from "contexts/PreferencesContext";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useImagePreviewStore } from "store/imagePreviewStore";
import type { ForumAlertConfig, UseForumOptions } from "types/forum";
import Forum from "./Forum";

type ForumFeedProps = UseForumOptions & {
  scrollEnabled?: boolean;
  showCreateButton?: boolean;
};

export default function ForumFeed({
  teamId,
  league,
  scrollEnabled = true,
  showCreateButton = true,
}: ForumFeedProps) {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const setGlobalImage = useImagePreviewStore((state) => state.setImages);
  const clearGlobalImage = useImagePreviewStore((state) => state.clearImages);
  const [alertConfig, setAlertConfig] = useState<ForumAlertConfig | null>(
    null,
  );

  const {
    posts,
    loading,
    refreshing,
    error,
    currentUserId,
    hasMore,
    fetchPosts,
    refresh,
    loadMore,
    deletePost,
    editPost,
    updatePost,
  } = useForum({ teamId, league });

  useFocusEffect(
    useCallback(() => {
      fetchPosts(1);
    }, [fetchPosts]),
  );

  useEffect(() => {
    return () => clearGlobalImage();
  }, [clearGlobalImage]);

  const closeAlert = useCallback(() => setAlertConfig(null), []);

  const handleDeletePost = useCallback(
    async (postId: string) => {
      try {
        await deletePost(postId);
        setAlertConfig({
          title: "Deleted",
          message: "Post deleted.",
          confirmText: "OK",
        });
      } catch {
        setAlertConfig({
          title: "Error",
          message: "Failed to delete post.",
          confirmText: "OK",
          variant: "danger",
        });
      }
    },
    [deletePost],
  );

  const handleEditPost = useCallback(
    async (postId: string, text: string) => {
      try {
        await editPost(postId, text);
        setAlertConfig({
          title: "Updated",
          message: "Post updated.",
          confirmText: "OK",
        });
      } catch {
        setAlertConfig({
          title: "Error",
          message: "Failed to update post.",
          confirmText: "OK",
          variant: "danger",
        });
      }
    },
    [editPost],
  );

  const handleCreatePost = useCallback(() => {
    router.push({
      pathname: "/create-post",
      params: {
        teamId,
        league,
        currentUserId:
          currentUserId == null ? undefined : String(currentUserId),
      },
    });
  }, [currentUserId, league, router, teamId]);

  const handleImagePress = useCallback(
    (uri: string) => {
      setGlobalImage([uri], 0);
    },
    [setGlobalImage],
  );

  return (
    <>
      <Forum
        posts={posts}
        currentUserId={currentUserId}
        isDark={isDark}
        loading={loading}
        refreshing={refreshing}
        error={error}
        hasMore={hasMore}
        onRefresh={refresh}
        onRetry={() => fetchPosts(1)}
        onLoadMore={loadMore}
        onDeletePost={handleDeletePost}
        onEditPost={handleEditPost}
        onBookmarkChange={updatePost}
        onImagePress={handleImagePress}
        showCreateButton={showCreateButton}
        onCreatePost={handleCreatePost}
        scrollEnabled={scrollEnabled}
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
