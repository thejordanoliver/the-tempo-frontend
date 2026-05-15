// components/Forum/TeamForum.tsx
import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "components/ConfirmModal";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useFocusEffect, useRouter } from "expo-router";
import { useTeamForum } from "hooks/ForumHooks/useTeamForum";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LeagueType } from "types/types";
import { useImagePreviewStore } from "../../store/imagePreviewStore";
import { Post, PostItem } from "./PostItem";
import PostItemSkeleton from "./PostItemSkeleton";

interface TeamForumProps {
  teamId: string;
  league?: LeagueType;
}

interface AlertConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  variant?: "default" | "danger";
  showCancel?: boolean;
  confirmDisabled?: boolean;
}

export default function TeamForum({ teamId, league }: TeamForumProps) {
  const setGlobalImage = useImagePreviewStore((state) => state.setImages);
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = forumStyles(isDark);
  const global = globalStyles(isDark);

  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

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
  } = useTeamForum(teamId, league);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
  }, []);

  const closeAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

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
        });
      }
    },
    [editPost, showAlert],
  );

  useFocusEffect(
    useCallback(() => {
      fetchPosts(1);
    }, [fetchPosts]),
  );

  useEffect(() => {
    return () => {
      setGlobalImage([], 0);
    };
  }, [setGlobalImage]);

  const renderPostItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostItem
        item={item}
        isDark={isDark}
        currentUserId={currentUserId}
        deletePost={handleDeletePost}
        editPost={handleEditPost}
        onImagePress={(imgUri) => {
          setGlobalImage([], 0);
          setGlobalImage([imgUri], 0);
        }}
      />
    ),
    [isDark, currentUserId, handleDeletePost, handleEditPost, setGlobalImage],
  );

  if (loading)
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {Array.from({ length: 5 }).map((_, i) => (
          <PostItemSkeleton key={`skeleton-${i}`} showMedia />
        ))}
      </ScrollView>
    );

  if (error) return <Text style={global.errorText}>{error}</Text>;

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
        ListEmptyComponent={() => (
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
        )}
      />

      {/* Floating Create Post Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() =>
          router.push({
            pathname: "/create-post",
            params: { teamId, league, currentUserId },
          })
        }
        activeOpacity={0.8}
      >
        <Ionicons
          name="create"
          size={20}
          color={isDark ? Colors.black : Colors.white}
        />
      </TouchableOpacity>

      <ConfirmModal
        visible={!!alertConfig}
        title={alertConfig?.title}
        message={alertConfig?.message}
        confirmText={alertConfig?.confirmText ?? "OK"}
        cancelText={alertConfig?.cancelText}
        showCancel={alertConfig?.showCancel ?? !!alertConfig?.cancelText}
        confirmDisabled={alertConfig?.confirmDisabled}
        variant={alertConfig?.variant ?? "default"}
        onCancel={closeAlert}
        onConfirm={() => {
          alertConfig?.onConfirm?.();
          if (!alertConfig?.onConfirm) closeAlert();
        }}
      />
    </>
  );
}

export function forumStyles(isDark: boolean) {
  return StyleSheet.create({
    container: { paddingBottom: 130, flexGrow: 1 },
    floatingButton: {
      position: "absolute",
      bottom: 100,
      right: 20,
      backgroundColor: isDark ? Colors.white : Colors.black,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      elevation: 6,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
  });
}
