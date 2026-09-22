import { newsListStyles } from "@/styles/NewsStyles/newsListStyles";
import { globalStyles } from "constants/styles";
import { NewsArticle } from "hooks/NewsHooks/useLeaguesNews";
import React, { useRef } from "react";
import { FlatList, Text, View } from "react-native";
import NewsCardSkeleton from "../Skeletons/NewsCardSkeleton";
import NewsCard from "./NewsCard";

interface NewsHighlightsListProps {
  items: NewsArticle[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  onRefresh: (mode?: "loadMore") => void;
  error: string | null;
  isDark: boolean;
}

export default function NewsList({
  items,
  loading,
  refreshing,
  loadingMore,
  onRefresh,
  error,
  isDark,
}: NewsHighlightsListProps) {
  const styles = newsListStyles(isDark);
  const global = globalStyles(isDark);
  const userHasScrolled = useRef(false);

  if (loading) {
    return (
      <View style={[styles.list, styles.container]}>
        <NewsCardSkeleton />
        <NewsCardSkeleton />
        <NewsCardSkeleton />
      </View>
    );
  }
  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Failed to load news</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={items}
      keyExtractor={(item) => item.keyId ?? item.id.toString()}
      refreshing={refreshing}
      onRefresh={() => onRefresh()}
      onScrollBeginDrag={() => {
        userHasScrolled.current = true;
      }}
      onEndReached={() => {
        if (!userHasScrolled.current) return;

        userHasScrolled.current = false;
        onRefresh("loadMore");
      }}
      onEndReachedThreshold={0.4}
      alwaysBounceVertical
      contentContainerStyle={styles.container}
      renderItem={({ item }) => <NewsCard content={item} isDark={isDark} />}
      ListFooterComponent={loadingMore ? <NewsCardSkeleton /> : null}
    />
  );
}
