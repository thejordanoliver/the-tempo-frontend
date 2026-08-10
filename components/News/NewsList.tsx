import { newsListStyles } from "@/styles/NewsStyles/newsListStyles";
import { globalStyles } from "constants/styles";
import { NewsArticle } from "hooks/NewsHooks/useLeaguesNews";
import React from "react";
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";
import NewsCardSkeleton from "../Skeletons/NewsCardSkeleton";
import NewsCard from "./NewsCard";

interface NewsHighlightsListProps {
  items: NewsArticle[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  error: string | null;
  isDark: boolean;
}

// ✅ FIXED FUNCTION
export default function NewsList({
  items,
  loading,
  refreshing,
  onRefresh,
  error,
  isDark,
}: NewsHighlightsListProps) {
  const styles = newsListStyles(isDark);
  const global = globalStyles(isDark);

  if (error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Failed to load news</Text>
      </View>
    );

  if (loading) {
    return (
      <View style={styles.container}>
        <NewsCardSkeleton />
        <NewsCardSkeleton />
        <NewsCardSkeleton />
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.keyId ?? item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        scrollEnabled={false}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => <NewsCard content={item} isDark={isDark} />}
        ListEmptyComponent={
          <View style={global.emptyContainer}>
            <Text style={global.emptyText}>No news or highlights found.</Text>
          </View>
        }
      />
    </ScrollView>
  );
}
