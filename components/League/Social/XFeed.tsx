import HeadingTwo from "components/Headings/HeadingTwo";
import HeaderSkeleton from "components/Skeletons/HeaderSkeleton";
import XCardSkeleton from "components/Skeletons/XCardSkeleton";
import { usePreferences } from "contexts/PreferencesContext";
import { useRef } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { XCard, XCARD_WIDTH, XCardProps } from "./XCard";

const CARD_GAP = 12;

type XFeedProps = {
  items: XCardProps[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  error?: string | null;
};

export function XFeed({ items, loading }: XFeedProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = xFeedStyles;
  const listRef = useRef<FlatList>(null);
  if (!items.length) return null;
  if (loading)
    return (
      <View style={styles.wrapper}>
        <HeaderSkeleton />
        <FlatList
          ref={listRef}
          horizontal
          data={Array.from({ length: 10 })}
          keyExtractor={(_, i) => "skel-" + i}
          renderItem={() => <XCardSkeleton />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    );

  return (
    <View style={styles.wrapper}>
      <HeadingTwo isDark={isDark}>Trending</HeadingTwo>
      <FlatList
        data={items}
        horizontal
        snapToInterval={250}
        decelerationRate={"fast"}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => <XCard {...item} />}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.container}
        getItemLayout={(_, index) => ({
          length: XCARD_WIDTH + CARD_GAP,
          offset: (XCARD_WIDTH + CARD_GAP) * index,
          index,
        })}
      />
    </View>
  );
}

export const xFeedStyles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    paddingHorizontal: 12,
  },
  container: {
    marginBottom: 12,
  },
  separator: {
    width: CARD_GAP,
  },
});
