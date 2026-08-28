import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, activeOpacity, globalStyles } from "constants/styles";
import { useCallback, useMemo } from "react";
import type { ListRenderItem } from "react-native";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ForumPost, ForumProps } from "types/forum";
import Button from "../Buttons/Button";
import FloatingButton from "../Buttons/FloatingButton";
import { PostItem } from "./PostItem/PostItem";
import PostItemSkeleton from "./PostItemSkeleton";

const DEFAULT_EMPTY_TITLE = "It's Quiet Here";
const DEFAULT_EMPTY_MESSAGE =
  "No posts yet. Be the first to start the conversation.";
const DEFAULT_EMPTY_ICON = "chatbubble-outline";
const DEFAULT_SKELETON_COUNT = 5;

export default function Forum({
  posts,
  currentUserId,
  isDark,
  loading = false,
  refreshing = false,
  error = null,
  hasMore = false,
  onRefresh,
  onRetry,
  onLoadMore,
  onDeletePost,
  onEditPost,
  onBookmarkChange,
  onImagePress,
  showCreateButton = false,
  onCreatePost,
  emptyTitle = DEFAULT_EMPTY_TITLE,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  emptyIcon = DEFAULT_EMPTY_ICON,
  scrollEnabled = true,
  loadMoreMode,
  skeletonCount = DEFAULT_SKELETON_COUNT,
}: ForumProps) {
  const styles = useMemo(() => forumStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const isInitialLoading = loading || (refreshing && posts.length === 0);
  const loadMoreDisabled = loading || refreshing;
  const effectiveLoadMoreMode =
    loadMoreMode ?? (scrollEnabled ? "automatic" : "button");
  const shouldShowCreateButton = showCreateButton && !!onCreatePost;
  const shouldRenderLoadMoreButton =
    hasMore && !!onLoadMore && effectiveLoadMoreMode === "button";

  const renderPostItem = useCallback<ListRenderItem<ForumPost>>(
    ({ item }) => (
      <PostItem
        item={item}
        isDark={isDark}
        currentUserId={currentUserId}
        deletePost={onDeletePost}
        editPost={onEditPost}
        onBookmarkChange={onBookmarkChange}
        onImagePress={onImagePress}
      />
    ),
    [
      currentUserId,
      isDark,
      onBookmarkChange,
      onDeletePost,
      onEditPost,
      onImagePress,
    ],
  );

  const handleEndReached = useCallback(() => {
    if (
      effectiveLoadMoreMode === "automatic" &&
      hasMore &&
      onLoadMore &&
      !loadMoreDisabled
    ) {
      onLoadMore();
    }
  }, [effectiveLoadMoreMode, hasMore, loadMoreDisabled, onLoadMore]);

  const renderSkeletons = () =>
    Array.from({ length: skeletonCount }).map((_, index) => (
      <PostItemSkeleton key={`forum-skeleton-${index}`} showMedia />
    ));

  const renderEmptyState = () => (
    <View style={global.emptyContainer}>
      <View style={global.emptyIconContainer}>
        <Ionicons
          name={emptyIcon as keyof typeof Ionicons.glyphMap}
          size={30}
          color={isDark ? Colors.white : Colors.black}
        />
      </View>
      <Text style={global.emptyTitle}>{emptyTitle}</Text>
      <Text style={global.emptyText}>{emptyMessage}</Text>
    </View>
  );

  const renderLoadMoreButton = () => {
    if (!shouldRenderLoadMoreButton) {
      return null;
    }

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Load more forum posts"
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
    );
  };

  const renderErrorState = () => {
    if (!onRetry) {
      return <Text style={global.errorText}>{error}</Text>;
    }

    const retryDisabled = loading || refreshing;

    return (
      <View style={global.emptyContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={42}
          color={isDark ? Colors.dark.lightRed : Colors.light.red}
        />

        <Text style={global.errorText} selectable>
          {error}
        </Text>

        <Button
          disabled={retryDisabled}
          onPress={onRetry}
          isDark={isDark}
          variant="outline"
        >
          {retryDisabled ? "Retrying..." : "Retry"}
        </Button>
      </View>
    );
  };

  if (isInitialLoading) {
    if (scrollEnabled) {
      return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {renderSkeletons()}
        </ScrollView>
      );
    }

    return <View style={styles.embeddedContainer}>{renderSkeletons()}</View>;
  }

  if (error) {
    return renderErrorState();
  }

  if (!scrollEnabled) {
    return (
      <>
        <View style={styles.embeddedContainer}>
          {posts.length === 0
            ? renderEmptyState()
            : posts.map((post) => (
                <PostItem
                  key={String(post.id)}
                  item={post}
                  isDark={isDark}
                  currentUserId={currentUserId}
                  deletePost={onDeletePost}
                  editPost={onEditPost}
                  onBookmarkChange={onBookmarkChange}
                  onImagePress={onImagePress}
                />
              ))}

          {renderLoadMoreButton()}
        </View>

        {shouldShowCreateButton && (
          <FloatingButton
            isOpen={false}
            onPress={onCreatePost}
            icon={"create"}
          />
        )}
      </>
    );
  }

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.scrollContainer}
        renderItem={renderPostItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadMoreButton}
      />

      {shouldShowCreateButton && (
        <FloatingButton isOpen={false} onPress={onCreatePost} icon={"create"} />
      )}
    </>
  );
}

export function forumStyles(isDark: boolean) {
  return StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 130,
    },
    embeddedContainer: {
      paddingBottom: 0,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center",
      gap: 8,
      minHeight: 40,
      marginTop: 14,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderWidth: 1,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 8,
    },
    loadMoreButton: {
      marginTop: 12,
    },
    disabledButton: {
      opacity: 0.6,
    },
    actionButtonText: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
  });
}
