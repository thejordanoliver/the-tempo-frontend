// components/NewsHighlightsList.tsx
import { globalStyles } from "constants/styles";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { newsHighlightsListStyles } from "styles/NewsStyles/NewsHighlightsListStyles";
import NewsCardSkeleton from "../Skeletons/NewsCardSkeleton";
import HighlightCard from "./HighlightCard";
import NewsCard from "./NewsCard";
import { usePreferences } from "contexts/PreferencesContext";
type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  thumbnail?: string;
  publishedAt?: string;
};

type HighlightItem = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  channelName?: string;
  duration?: string;
};

type CombinedItem =
  | (NewsItem & { itemType: "news" })
  | (HighlightItem & { itemType: "highlight" });

type NewsHighlightsListProps = {
  items: CombinedItem[];
  loading: boolean;
  error?: string | null; // ✅ allow string for custom messages
  refreshing: boolean;
  onRefresh: () => void;
};

const NewsHighlightsList: React.FC<NewsHighlightsListProps> = ({
  items,
  loading,
  refreshing,
  onRefresh,
  error,
}) => {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = newsHighlightsListStyles(isDark);
  const global = globalStyles(isDark);

  if (error) return <Text style={global.errorText}>Failed to load news</Text>;

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
    <FlatList
      data={items}
      keyExtractor={(item) =>
        item.itemType === "news" ? item.id : item.videoId
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      scrollEnabled={false}
      contentContainerStyle={styles.container}
      renderItem={({ item }) =>
        item.itemType === "news" ? (
          <NewsCard
            id={item.id}
            title={item.title}
            source={item.source}
            url={item.url}
            thumbnail={item.thumbnail}
          />
        ) : (
          <HighlightCard
            videoId={item.videoId}
            title={item.title}
            publishedAt={item.publishedAt}
            thumbnail={item.thumbnail}
            channelName={item.channelName}
            duration={item.duration}
          />
        )
      }
      ListEmptyComponent={
        <Text style={global.emptyText}>No news or highlights found.</Text>
      }
    />
  );
};

export default NewsHighlightsList;
