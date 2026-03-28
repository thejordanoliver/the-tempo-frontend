import { Ionicons } from "@expo/vector-icons";
import { Colors, globalStyles } from "constants/Styles";
import { useFocusEffect, useRouter } from "expo-router";
import { useLeagueForum } from "hooks/ForumHooks/useLeagueForum";
import { useCallback, useEffect } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { LeagueType } from "types/types";
import { useImagePreviewStore } from "../../store/imagePreviewStore";
import { PostItem } from "./PostItem";
import PostItemSkeleton from "./PostItemSkeleton";
import { forumStyles } from "./TeamForum";

// FIX #2: removed localhost fallback — won't resolve on a physical device.
//         PostItem should use apiClient directly rather than receiving BASE_URL as a prop.
import { BASE_URL } from "utils/apiClient";

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
  const isDark = useColorScheme() === "dark";
  const styles = forumStyles(isDark);
  const global = globalStyles(isDark);

  useFocusEffect(
    useCallback(() => {
      fetchPosts(1);
    }, [fetchPosts]),
  );

  // FIX #3: was duplicated — one copy had no deps and fired on every render.
  //         Single cleanup effect with correct deps.
  useEffect(() => {
    return () => {
      setGlobalImage([], 0);
    };
  }, [setGlobalImage]);

  if (loading)
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {/* FIX #5: renderSkeletons had no reason to be a memoized callback */}
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
            // FIX #1: token prop removed — PostItem should authenticate via apiClient
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
        // FIX #6: refresh already has a stable reference from useCallback in the hook
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
