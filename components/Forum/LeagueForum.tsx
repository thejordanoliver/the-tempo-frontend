import { Ionicons } from "@expo/vector-icons";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useFocusEffect, useRouter } from "expo-router";
import { useLeagueForum } from "hooks/ForumHooks/useLeagueForum";
import { useCallback, useEffect } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LeagueType } from "types/types";
import { BASE_URL } from "utils/apiClient";
import { useImagePreviewStore } from "../../store/imagePreviewStore";
import { PostItem } from "./PostItem";
import PostItemSkeleton from "./PostItemSkeleton";
import { forumStyles } from "./TeamForum";

type LeagueForumProps = {
  league?: LeagueType;
};

export default function LeagueForum({ league = "NBA" }: LeagueForumProps) {
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
  } = useLeagueForum(league);

  const setGlobalImage = useImagePreviewStore((s) => s.setImages);
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = forumStyles(isDark);
  const global = globalStyles(isDark);

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
        renderItem={({ item }) => (
          <PostItem
            item={item}
            isDark={isDark}
            currentUserId={currentUserId}
            deletePost={deletePost}
            editPost={editPost}
            BASE_URL={BASE_URL}
            onImagePress={(imgUri) => {
              setGlobalImage([], 0);
              setGlobalImage([imgUri], 0);
            }}
          />
        )}
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
            <Text style={global.emptyText}>It's Quiet Here</Text>
            <Text style={global.emptySubText}>
              No posts yet. Be the first to start the conversation.
            </Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() =>
          router.push({
            pathname: "/create-post",
            params: { league },
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
    </>
  );
}
