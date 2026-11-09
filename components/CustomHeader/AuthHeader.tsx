import type { AuthHeaderTab } from "@/utils/customheader/types";
import React from "react";
import { StyleSheet, type Animated } from "react-native";
import TabBar from "../TabBars/TabBar";

const AUTH_HEADER_TABS = ["sign in", "sign up"] as const;

type AuthHeaderProps = {
  isDark: boolean;
  scrollProgress?: Animated.Value;
  selectedTab: AuthHeaderTab;
  onTabPress: (tab: AuthHeaderTab) => void;
};

export function AuthHeader({
  isDark,
  selectedTab,
  onTabPress,
  scrollProgress,
}: AuthHeaderProps) {
  return (
    <TabBar
      tabs={AUTH_HEADER_TABS}
      selected={selectedTab}
      onTabPress={onTabPress}
      isDark={isDark}
      style={styles.tabs}
      scrollProgress={scrollProgress}
    />
  );
}

const styles = StyleSheet.create({
  tabs: {
    marginBottom: 0,
  },
});
