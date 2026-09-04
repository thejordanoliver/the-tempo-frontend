import React from "react";
import { Animated, StyleSheet } from "react-native";
import TabBar from "../TabBars/TabBar";
import type { EditFavoritesHeaderTab } from "./types";

const EDIT_FAVORITES_HEADER_TABS = ["teams", "sports"] as const;

type HomeHeaderProps = {
  isDark: boolean;
  selectedTab: EditFavoritesHeaderTab;
  onTabPress: (tab: EditFavoritesHeaderTab) => void;
  scrollProgress?: Animated.Value;
};

export function EditFavoritesHeader({
  isDark,
  selectedTab,
  onTabPress,
  scrollProgress,
}: HomeHeaderProps) {
  return (
    <TabBar
      tabs={EDIT_FAVORITES_HEADER_TABS}
      selected={selectedTab}
      onTabPress={onTabPress}
      isDark={isDark}
      scrollProgress={scrollProgress}
      style={styles.tabs}
    />
  );
}

const styles = StyleSheet.create({
  tabs: {
    marginBottom: 0,
  },
});
