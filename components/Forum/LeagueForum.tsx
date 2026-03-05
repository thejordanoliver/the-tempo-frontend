import { Ionicons } from "@expo/vector-icons";
import { Colors, globalStyles } from "constants/Styles";
import { useFocusEffect, useRouter } from "expo-router";
import { useLeagueForum } from "hooks/useLeagueForum";
import { useCallback, useEffect } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { LeagueType } from "types/types";
import { useImagePreviewStore } from "../../store/imagePreviewStore";
import { PostItem } from "./PostItem";
import PostItemSkeleton from "./PostItemSkeleton";
import { forumStyles } from "./TeamForum";
type LeagueForumProps = {
  league?: LeagueType;
};
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export default function LeagueForum({ league = "NBA" }: LeagueForumProps) {
  const {
    posts,
    loading,
    refreshing,
    error,
    token,
    currentUserId,
    fetchPosts,
    refresh,
    loadMore,
    deletePost,
    editPost,
  } = useLeagueForum(league);

  const setGlobalImage = useImagePreviewStore((s) => s.setImages);
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
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
  }, []);

  const renderSkeletons = useCallback(
    (count = 5) => (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <PostItemSkeleton key={`skeleton-${i}`} showMedia />
        ))}
      </>
    ),
    [],
  );

  const onRefresh = useCallback(() => refresh(), [refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setGlobalImage([], 0);
    };
  }, [setGlobalImage]);

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
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <PostItem
            item={item}
            isDark={isDark}
            token={token}
            currentUserId={currentUserId}
            deletePost={deletePost}
            editPost={editPost}
            BASE_URL={BASE_URL || "http://localhost:4000"}
            onImagePress={(imgUri) => {
              setGlobalImage([], 0);
              setGlobalImage([imgUri], 0);
            }}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() =>
          loading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <PostItemSkeleton key={i} showMedia />
              ))}
            </>
          ) : (
            <Text style={global.emptyText}>No posts yet.</Text>
          )
        }
      />

      {/* Floating create button */}
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
