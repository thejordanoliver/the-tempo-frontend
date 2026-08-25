import React from "react";
import { Animated, StyleSheet } from "react-native";
import TabBar from "../TabBars/TabBar";
import type { HomeHeaderTab } from "./types";

const HOME_HEADER_TABS = ["scores", "news"] as const;

type HomeHeaderProps = {
  isDark: boolean;
  selectedTab: HomeHeaderTab;
  onTabPress: (tab: HomeHeaderTab) => void;
  scrollProgress?: Animated.Value;
};

export function HomeHeader({
  isDark,
  selectedTab,
  onTabPress,
  scrollProgress,
}: HomeHeaderProps) {
  return (
    <TabBar
      tabs={HOME_HEADER_TABS}
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
