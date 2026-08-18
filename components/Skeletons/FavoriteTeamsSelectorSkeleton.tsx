import { Colors } from "@/constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useMemo } from "react";
import { Animated, FlatList, StyleSheet } from "react-native";
import SearchBar from "../SearchBars/SearchBar";
import { SkeletonBlock, SkeletonCircle } from "./primitives";

type Props = {
  isGridView: boolean;
  itemWidth: number;
  count?: number;
  fadeAnim: Animated.Value;
};

const CARD_HEIGHT = 130;

export default function FavoriteTeamsSelectorSkeleton({
  isGridView,
  itemWidth,
  fadeAnim,
  count = 30,
}: Props) {
  const skeletons = Array.from({ length: count });
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(
    () => favoriteTeamsSelectorSkeletonStyles(isDark, isGridView, itemWidth),
    [isDark, isGridView, itemWidth],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      return (
        <SkeletonBlock
          style={[
            styles.skeletonCard,
            {
              width: isGridView ? itemWidth : "100%",
              height: isGridView ? CARD_HEIGHT : 60,
              marginBottom: 12,
            },
          ]}
        >
          <SkeletonCircle size={40} style={styles.logoSkeleton} />
          <SkeletonBlock style={styles.nameSkeleton} />
        </SkeletonBlock>
      );
    },
    [styles, isGridView, itemWidth],
  );

  const getItemLayout = useCallback(
    (_: any | null | undefined, index: number) => {
      const itemHeight = 76;
      const separatorHeight = 12;

      return {
        length: itemHeight + separatorHeight,
        offset: (itemHeight + separatorHeight) * index,
        index,
      };
    },
    [],
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SearchBar
        placeholder="Search teams or leagues..."
        value={""}
        onChangeText={() => {}}
      />
      <FlatList
        key={isGridView ? "grid" : "list"}
        data={skeletons}
        renderItem={renderItem}
        numColumns={isGridView ? 3 : 1}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={isGridView ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        getItemLayout={isGridView ? undefined : getItemLayout}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </Animated.View>
  );
}

const favoriteTeamsSelectorSkeletonStyles = (
  isDark: boolean,
  isGridView: boolean,
  itemWidth: number,
) => {
  const skeletonColor = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    container: {
      flex: 1,
      gap: 12,
    },
    contentContainer: {
      flexGrow: 1,
      alignItems: isGridView ? "center" : "stretch",
      paddingBottom: 20,
    },
    columnWrapper: {
      width: itemWidth * 3 + 24,
      justifyContent: "flex-start",
      gap: 12,
    },
    skeletonCard: {
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 8,
      padding: 12,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },

    logoSkeleton: {
      width: 40,
      height: 40,
      borderRadius: 100,
      backgroundColor: skeletonColor,
    },
    nameSkeleton: {
      width: 60, // ✅ closer to real teamName width feel
      height: 12,
      borderRadius: 4,
      backgroundColor: skeletonColor,
      marginTop: 6, // ✅ match spacing from logo → name
    },
  });
};
