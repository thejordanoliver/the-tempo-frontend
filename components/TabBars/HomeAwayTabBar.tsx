import { activeOpacity, Colors, Fonts } from "constants/styles";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type HomeAwayTabValue = "all" | "away" | "home";

export type HomeAwayTeam = {
  id: string | number;
  name: string;
  logo: any;
};

export interface HomeAwayTabBarProps {
  homeTeam: HomeAwayTeam;
  awayTeam: HomeAwayTeam;
  selected: HomeAwayTabValue;
  onTabPress: (tab: HomeAwayTabValue) => void;
  isDark: boolean;
  showTeamName?: boolean;
  showHomeAwayLabel?: boolean;
  showAllTab?: boolean;
}

type TeamTab = {
  value: HomeAwayTabValue;
  label: "ALL" | "HOME" | "AWAY";
  team?: HomeAwayTeam;
};

function HomeAwayTabBar({
  homeTeam,
  awayTeam,
  selected,
  onTabPress,
  isDark,
  showTeamName = true,
  showHomeAwayLabel = false,
  showAllTab = true,
}: HomeAwayTabBarProps) {
  const styles = homeAwayTabBarStyles(isDark);

  const underlineX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const tabs = useMemo<readonly TeamTab[]>(() => {
    const teamTabs: TeamTab[] = [
      {
        value: "away",
        label: "AWAY",
        team: awayTeam,
      },
      {
        value: "home",
        label: "HOME",
        team: homeTeam,
      },
    ];

    if (showAllTab) {
      return [
        {
          value: "all",
          label: "ALL",
        },
        ...teamTabs,
      ];
    }

    return teamTabs;
  }, [awayTeam, homeTeam, showAllTab]);

  const tabWidth = tabs.length > 0 ? containerWidth / tabs.length : 0;

  useEffect(() => {
    if (tabWidth <= 0) {
      return;
    }

    const selectedIndex = tabs.findIndex((tab) => tab.value === selected);

    if (selectedIndex < 0) {
      return;
    }

    Animated.timing(underlineX, {
      toValue: selectedIndex * tabWidth,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selected, tabWidth, tabs, underlineX]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;

    setContainerWidth((currentWidth) =>
      currentWidth === nextWidth ? currentWidth : nextWidth,
    );
  }, []);

  const handleTabPress = useCallback(
    (value: HomeAwayTabValue) => {
      onTabPress(value);
    },
    [onTabPress],
  );

  return (
    <View onLayout={handleLayout} style={styles.tabContainer}>
      <View
        accessibilityRole="tablist"
        style={styles.tabs}
      >
        {tabs.map(({ value, label, team }) => {
          const isSelected = selected === value;
          const isAllTab = value === "all";

          const accessibilityLabel = isAllTab
            ? "All drives"
            : `${label}: ${team?.name ?? ""}`;

          return (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityLabel={accessibilityLabel}
              accessibilityState={{
                selected: isSelected,
              }}
              onPress={() => handleTabPress(value)}
              style={({ pressed }) => [
                styles.tabPressable,
                {
                  width: tabWidth || undefined,
                  opacity: pressed ? activeOpacity : 1,
                },
              ]}
            >
              {isAllTab ? (
                <View style={styles.allTabContent}>
                  <Text
                    style={[
                      styles.allTabText,
                      isSelected && styles.allTabTextSelected,
                    ]}
                  >
                    ALL
                  </Text>
                </View>
              ) : (
                <View style={styles.tabContent}>
                  <Image
                    source={team?.logo}
                    resizeMode="contain"
                    style={[
                      styles.logo,
                      !isSelected && styles.unselectedLogo,
                    ]}
                  />

                  {(showHomeAwayLabel || showTeamName) && (
                    <View style={styles.labelContainer}>
                      {showHomeAwayLabel && (
                        <Text
                          style={[
                            styles.homeAwayLabel,
                            isSelected && styles.homeAwayLabelSelected,
                          ]}
                        >
                          {label}
                        </Text>
                      )}

                      {showTeamName && (
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.teamName,
                            isSelected && styles.teamNameSelected,
                          ]}
                        >
                          {team?.name}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {containerWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.underline,
            {
              width: tabWidth,
              transform: [
                {
                  translateX: underlineX,
                },
              ],
            },
          ]}
        />
      )}
    </View>
  );
}

export const homeAwayTabBarStyles = (isDark: boolean) =>
  StyleSheet.create({
    tabContainer: {
      position: "relative",
      width: "100%",
    },

    tabs: {
      flexDirection: "row",
      width: "100%",
    },

    tabPressable: {
      minHeight: 60,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 8,
    },

    allTabContent: {
      alignItems: "center",
      justifyContent: "center",
    },

    allTabText: {
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: Colors.midTone,
      opacity: 0.5,
    },

    allTabTextSelected: {
      color: isDark ? Colors.white : Colors.black,
      opacity: 1,
    },

    tabContent: {
      maxWidth: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    logo: {
      width: 32,
      height: 32,
    },

    unselectedLogo: {
      opacity: 0.45,
    },

    labelContainer: {
      flexShrink: 1,
      justifyContent: "center",
    },

    homeAwayLabel: {
      fontSize: 10,
      fontFamily: Fonts.OSMEDIUM,
      letterSpacing: 0.7,
      color: Colors.midTone,
    },

    homeAwayLabelSelected: {
      color: isDark ? Colors.white : Colors.black,
    },

    teamName: {
      marginTop: 2,
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: Colors.midTone,
      opacity: 0.5,
    },

    teamNameSelected: {
      color: isDark ? Colors.white : Colors.black,
      opacity: 1,
    },

    underline: {
      position: "absolute",
      bottom: 0,
      left: 0,
      height: 2,
      borderRadius: 50,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
  });

export default memo(HomeAwayTabBar);