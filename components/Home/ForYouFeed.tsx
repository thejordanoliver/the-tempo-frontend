import { Ionicons } from "@expo/vector-icons";
import NewsCard from "components/News/NewsCard";
import NewsCardSkeleton from "components/Skeletons/NewsCardSkeleton";
import PostItemSkeleton from "components/Forum/PostItemSkeleton";
import { PostItem } from "components/Forum/PostItem/PostItem";
import { Colors, Fonts, globalStyles } from "constants/styles";
import type { ForYouArticle } from "hooks/useForYouFeed";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ForumPost } from "types/forum";

type ForYouFeedProps = {
  articles: ForYouArticle[];
  posts: ForumPost[];
  favoriteLeagues: string[];
  currentUserId: number | null;
  loading: boolean;
  error: string | null;
  isDark: boolean;
};

type FeedItem =
  | { kind: "article"; date: string; article: ForYouArticle }
  | { kind: "post"; date: string; post: ForumPost };

const ignorePostMutation = async () => undefined;

const getTimestamp = (date: string) => {
  const timestamp = new Date(date).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export default function ForYouFeed({
  articles,
  posts,
  favoriteLeagues,
  currentUserId,
  loading,
  error,
  isDark,
}: ForYouFeedProps) {
  const styles = useMemo(() => forYouFeedStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const feed = useMemo<FeedItem[]>(
    () =>
      [
        ...articles.map((article) => ({
          kind: "article" as const,
          date: article.published,
          article,
        })),
        ...posts.map((post) => ({
          kind: "post" as const,
          date: post.created_at,
          post,
        })),
      ].sort(
        (first, second) =>
          getTimestamp(second.date) - getTimestamp(first.date),
      ),
    [articles, posts],
  );

  if (loading || feed.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <NewsCardSkeleton />
        <PostItemSkeleton showMedia />
        <NewsCardSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={38}
          color={isDark ? Colors.dark.lightRed : Colors.light.red}
        />
        <Text style={global.errorText}>Failed to load your For You feed.</Text>
      </View>
    );
  }

  if (feed.length === 0) {
    const hasFavoriteLeagues = favoriteLeagues.length > 0;

    return (
      <View style={global.emptyContainer}>
        <View style={global.emptyIconContainer}>
          <Ionicons
            name="sparkles-outline"
            size={30}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>
        <Text style={global.emptyTitle}>Make it yours</Text>
        <Text style={global.emptyText}>
          {hasFavoriteLeagues
            ? "Follow people to see their posts here. New stories from your favorite leagues will appear as they publish."
            : "Choose favorite leagues and follow people to build your personalized feed."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {feed.map((item) => {
        if (item.kind === "article") {
          return (
            <View key={`article-${item.article.keyId}`} style={styles.feedItem}>
              <View style={styles.contextRow}>
                <Ionicons
                  name="newspaper-outline"
                  size={14}
                  color={styles.contextText.color}
                />
                <Text style={styles.contextText}>
                  {(item.article.sport ?? "NEWS").toUpperCase()} NEWS
                </Text>
              </View>
              <NewsCard content={item.article} isDark={isDark} />
            </View>
          );
        }

        return (
          <View key={`post-${item.post.id}`} style={styles.postItem}>
            <View style={styles.contextRow}>
              <Ionicons
                name="people-outline"
                size={14}
                color={styles.contextText.color}
              />
              <Text style={styles.contextText}>FROM SOMEONE YOU FOLLOW</Text>
            </View>
            <PostItem
              item={item.post}
              isDark={isDark}
              currentUserId={currentUserId}
              deletePost={ignorePostMutation}
              editPost={ignorePostMutation}
            />
          </View>
        );
      })}
    </View>
  );
}

const forYouFeedStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingBottom: 110,
      gap: 8,
    },
    loadingContainer: {
      paddingHorizontal: 12,
      paddingBottom: 110,
      gap: 12,
    },
    feedItem: {
      paddingHorizontal: 12,
      gap: 7,
    },
    postItem: {
      gap: 2,
    },
    contextRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingTop: 8,
    },
    contextText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.BOLD,
      fontSize: 11,
      letterSpacing: 0.5,
    },
  });
