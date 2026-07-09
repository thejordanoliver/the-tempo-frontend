import { activeOpacity, Colors, Fonts } from "constants/styles";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type HomeAwayTabValue = "away" | "home";

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
}

type TeamTab = {
  value: HomeAwayTabValue;
  label: "HOME" | "AWAY";
  team: HomeAwayTeam;
};

function HomeAwayTabBar({
  homeTeam,
  awayTeam,
  selected,
  onTabPress,
  isDark,
  showTeamName = true,
  showHomeAwayLabel = false,
}: HomeAwayTabBarProps) {
  const styles = homeAwayTabBarStyles(isDark);

  const underlineX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const tabs: readonly TeamTab[] = [
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

  const tabWidth = containerWidth / tabs.length;

  useEffect(() => {
    if (tabWidth <= 0) {
      return;
    }

    const selectedIndex = selected === "home" ? 1 : 0;

    Animated.timing(underlineX, {
      toValue: selectedIndex * tabWidth,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selected, tabWidth, underlineX]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;

    setContainerWidth((currentWidth) =>
      currentWidth === nextWidth ? currentWidth : nextWidth,
    );
  }, []);

  const handleAwayPress = useCallback(() => {
    onTabPress("away");
  }, [onTabPress]);

  const handleHomePress = useCallback(() => {
    onTabPress("home");
  }, [onTabPress]);

  return (
    <View onLayout={handleLayout} style={styles.tabContainer}>
      <View style={styles.tabs}>
        {tabs.map(({ value, label, team }) => {
          const isSelected = selected === value;
          const logoSource = team.logo;

          return (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityLabel={`${label}: ${team.name}`}
              accessibilityState={{
                selected: isSelected,
              }}
              onPress={value === "away" ? handleAwayPress : handleHomePress}
              style={({ pressed }) => [
                styles.tabPressable,
                {
                  width: tabWidth || undefined,
                  opacity: pressed ? activeOpacity : 1,
                },
              ]}
            >
              <View style={styles.tabContent}>
                <Image
                  source={logoSource}
                  resizeMode="contain"
                  style={[styles.logo, !isSelected && styles.unselectedLogo]}
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
                        {team.name}
                      </Text>
                    )}
                  </View>
                )}
              </View>
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
      paddingHorizontal: 10,
    },

    tabContent: {
      maxWidth: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },

    logo: {
      width: 36,
      height: 36,
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
      fontSize: 15,
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
