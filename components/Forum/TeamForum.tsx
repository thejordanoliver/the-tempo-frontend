// components/Forum/TeamForum.tsx
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Colors";
import { globalStyles } from "constants/Styles";
import { useFocusEffect, useRouter } from "expo-router";
import { AlertConfig } from "hooks/ForumHooks/useCreatePost";
import { useTeamForumPosts } from "hooks/useTeamForumPosts";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { LeagueType } from "types/types";
import { useImagePreviewStore } from "../../store/imagePreviewStore";
import AlertModal from "./AlertModal";
import { PostItem } from "./PostItem";
import PostItemSkeleton from "./PostItemSkeleton";

interface TeamForumProps {
  teamId: string;
  league?: LeagueType; // extendable if more leagues later
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export default function TeamForum({ teamId, league }: TeamForumProps) {
  const setGlobalImage = useImagePreviewStore((state) => state.setImages);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = forumStyles(isDark);
  const global = globalStyles(isDark);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const {
    posts,
    loading,
    refreshing,
    error,
    token,
    currentUserId,
    refresh,
    loadMore,
    deletePost,
    editPost,
  } = useTeamForumPosts({ teamId, league });

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
  };

  const closeAlert = () => {
    setAlertConfig(null);
  };

  const renderSkeletons = (count = 5) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostItemSkeleton key={`skeleton-${i}`} showMedia />
      ))}
    </>
  );

  const onRefresh = () => refresh();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      setGlobalImage([], 0);
    };
  }, []);

  if (loading)
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {renderSkeletons()}
      </ScrollView>
    );
  if (error) return <Text style={global.errorText}>{error}</Text>;

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <PostItem
            item={item}
            isDark={isDark}
            token={token}
            currentUserId={currentUserId}
            deletePost={async (id) => {
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
            }}
            editPost={async (id, text) => {
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
            }}
            BASE_URL={BASE_URL}
            onImagePress={(imgUri) => {
              setGlobalImage([], 0);
              setGlobalImage([imgUri], 0);
            }}
          />
        )}
        onEndReached={loadMore}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* ✅ Pass league and teamId to Create Post */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() =>
          router.push({
            pathname: "/create-post",
            params: { teamId, league },
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
      <AlertModal
        visible={!!alertConfig}
        isDark={isDark}
        title={alertConfig?.title}
        message={alertConfig?.message}
        confirmText={alertConfig?.confirmText ?? "OK"}
        cancelText={alertConfig?.cancelText}
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
    container: { paddingBottom: 100 },
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
