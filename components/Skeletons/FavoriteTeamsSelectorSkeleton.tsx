import { Colors } from "@/constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SkeletonBlock, SkeletonCircle } from "./primitives";

type Props = {
  itemWidth: number;
  count?: number;
};

const CARD_HEIGHT = 130;

export default function FavoritesSelectorSkeleton({
  itemWidth,
  count = 30,
}: Props) {
  const skeletons = Array.from({ length: count });
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(
    () => FavoritesSelectorSkeletonStyles(isDark, itemWidth),
    [isDark, itemWidth],
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      return (
        <SkeletonBlock
          style={[
            styles.skeletonCard,
            {
              width: itemWidth,
              height: CARD_HEIGHT,
              marginBottom: 12,
            },
          ]}
        >
          <SkeletonCircle size={40} style={styles.logoSkeleton} />
          <SkeletonBlock style={styles.nameSkeleton} />
        </SkeletonBlock>
      );
    },
    [styles, itemWidth],
  );

  return (
    <View style={styles.container}>
      <FlatList
        key={"grid"}
        data={skeletons}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}

const FavoritesSelectorSkeletonStyles = (
  isDark: boolean,
  itemWidth: number,
) => {
  const skeletonColor = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      flexGrow: 1,
      alignItems: "center",
      paddingBottom: 20,
    },
    columnWrapper: {
      justifyContent: "flex-start",
      gap: 12,
      width: itemWidth * 3 + 24,
    },
    skeletonCard: {
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
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
