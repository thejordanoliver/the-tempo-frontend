import { Ionicons } from "@expo/vector-icons";
import { PostItem } from "components/Forum/PostItem/PostItem";
import PostItemSkeleton from "components/Forum/PostItemSkeleton";
import NewsCard from "components/News/NewsCard";
import NewsCardSkeleton from "components/Skeletons/NewsCardSkeleton";
import { Colors, Fonts, globalStyles } from "constants/styles";
import type { ForYouArticle } from "hooks/useForYouFeed";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { FeedPrediction } from "types/fanPredictions";
import type { ForumPost } from "types/forum";
import { interleavePredictions } from "utils/forYouFeed";
import PredictionFeedCard from "./PredictionFeedCard";

type ForYouFeedProps = {
  articles: ForYouArticle[];
  predictions: FeedPrediction[];
  posts: ForumPost[];
  favoriteLeagues: string[];
  currentUserId: number | null;
  loading: boolean;
  error: string | null;
  isDark: boolean;
};

type FeedItem =
  | { kind: "prediction"; prediction: FeedPrediction }
  | { kind: "article"; date: string; article: ForYouArticle }
  | { kind: "post"; date: string; post: ForumPost };

const ignorePostMutation = async () => undefined;

const getTimestamp = (date: string) => {
  const timestamp = new Date(date).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export default function ForYouFeed({
  articles,
  predictions,
  posts,
  favoriteLeagues,
  currentUserId,
  loading,
  error,
  isDark,
}: ForYouFeedProps) {
  const styles = useMemo(() => forYouFeedStyles(isDark), [isDark]);
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const feed = useMemo<FeedItem[]>(() => {
    const articleItems = articles.map((article) => ({
      kind: "article" as const,
      date: article.published,
      article,
    }));
    const postItems = posts.map((post) => ({
      kind: "post" as const,
      date: post.created_at,
      post,
    }));
    const items: FeedItem[] =
      favoriteLeagues.length === 0
        ? Array.from(
            { length: Math.max(articleItems.length, postItems.length) },
            (_, index) =>
              [articleItems[index], postItems[index]].filter(
                (item): item is NonNullable<typeof item> => Boolean(item),
              ),
          ).flat()
        : [...articleItems, ...postItems].sort(
            (first, second) =>
              getTimestamp(second.date) - getTimestamp(first.date),
          );
    return interleavePredictions<FeedItem>(
      items,
      predictions.map((prediction) => ({ kind: "prediction", prediction })),
    );
  }, [articles, posts, predictions, favoriteLeagues.length]);

  if (loading && feed.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <NewsCardSkeleton />
        <PostItemSkeleton showMedia />
        <NewsCardSkeleton />
      </View>
    );
  }

  if (error && feed.length === 0) {
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

        <Text style={global.emptyText}>
          {hasFavoriteLeagues
            ? "Follow people to see their posts here. New stories from your favorite leagues will appear as they publish."
            : "New sports stories and community posts will appear here as they publish."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {feed.map((item) => {
        if (item.kind === "prediction") {
          return (
            <PredictionFeedCard
              key={`prediction-${item.prediction.sport}-${item.prediction.league}-${item.prediction.gameId}`}
              game={item.prediction}
              isDark={isDark}
            />
          );
        }
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
              <Text style={styles.contextText}>
                {favoriteLeagues.length === 0 && !item.post.isFollowing
                  ? "FROM THE COMMUNITY"
                  : "FROM SOMEONE YOU FOLLOW"}
              </Text>
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
      paddingBottom: 12,
      gap: 8,
    },
    loadingContainer: {
      paddingHorizontal: 12,
      paddingBottom: 12,
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
