import { Ionicons } from "@expo/vector-icons";
import { Colors, activeOpacity, globalStyles } from "constants/styles";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { bookmarkedForumListStyles } from "styles/ForumStyles/BookmarkedForumListStyles";
import type { BookmarkedForumListProps, ForumPost } from "types/forum";
import { PostItem } from "./PostItem/PostItem";
import PostItemSkeleton from "./PostItemSkeleton";

export default function BookmarkedForumList({
  posts,
  currentUserId,
  isDark,
  loading,
  refreshing,
  error,
  hasMore,
  onRetry,
  onLoadMore,
  onUpdatePost,
  onRemovePost,
  onDeletePost,
  onEditPost,
  onImagePress,
}: BookmarkedForumListProps) {
  const styles = useMemo(() => bookmarkedForumListStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const isInitialLoading = loading || (refreshing && posts.length === 0);
  const retryDisabled = loading || refreshing;
  const loadMoreDisabled = loading || refreshing;

  const handleBookmarkChange = useCallback(
    (post: ForumPost, bookmarked: boolean) => {
      if (bookmarked) {
        onUpdatePost(post);
        return;
      }

      onRemovePost(post.id);
    },
    [onRemovePost, onUpdatePost],
  );

  if (isInitialLoading) {
    return (
      <View>
        {Array.from({ length: 3 }).map((_, index) => (
          <PostItemSkeleton key={`bookmark-skeleton-${index}`} showMedia />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Ionicons
          name={"alert-circle-outline"}
          size={42}
          color={isDark ? Colors.dark.lightRed : Colors.light.red}
        />

        <Text style={global.errorText} selectable>
          {error}
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Retry loading bookmarked posts"
          accessibilityState={{
            disabled: retryDisabled,
            busy: retryDisabled,
          }}
          activeOpacity={activeOpacity}
          disabled={retryDisabled}
          onPress={onRetry}
          style={[styles.actionButton, retryDisabled && styles.disabledButton]}
        >
          <Text style={styles.actionButtonText}>
            {retryDisabled ? "Retrying..." : "Retry"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={global.emptyContainer}>
        <Ionicons name={"bookmark-outline"} size={48} color={Colors.midTone} />

        <Text style={global.emptyText}>No bookmarks yet</Text>

        <Text style={global.emptySubText}>
          Saved forum posts will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {posts.map((post) => (
        <PostItem
          key={String(post.id)}
          item={post}
          isDark={isDark}
          currentUserId={currentUserId}
          deletePost={onDeletePost}
          editPost={onEditPost}
          onBookmarkChange={handleBookmarkChange}
          onImagePress={onImagePress}
        />
      ))}

      {hasMore && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Load more bookmarked posts"
          accessibilityState={{
            disabled: loadMoreDisabled,
            busy: refreshing,
          }}
          activeOpacity={activeOpacity}
          disabled={loadMoreDisabled}
          onPress={onLoadMore}
          style={[
            styles.actionButton,
            styles.loadMoreButton,
            loadMoreDisabled && styles.disabledButton,
          ]}
        >
          {refreshing && (
            <ActivityIndicator
              size="small"
              color={isDark ? Colors.white : Colors.black}
            />
          )}

          <Text style={styles.actionButtonText}>
            {refreshing ? "Loading..." : "Load more"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
