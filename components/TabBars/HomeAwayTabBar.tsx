import { activeOpacity, Colors, Fonts } from "constants/styles";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
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
  logo: ImageSourcePropType;
};

export type HomeAwayTabBarProps = {
  homeTeam: HomeAwayTeam;
  awayTeam: HomeAwayTeam;
  selected: HomeAwayTabValue;
  onTabPress: (tab: HomeAwayTabValue) => void;
  isDark: boolean;
  showTeamName?: boolean;
  showHomeAwayLabel?: boolean;
  showAllTab?: boolean;
};

type TeamTab = {
  value: HomeAwayTabValue;
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
  const styles = useMemo(() => homeAwayTabBarStyles(isDark), [isDark]);

  const underlineX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const tabs = useMemo<TeamTab[]>(() => {
    const teamTabs: TeamTab[] = [
      {
        value: "away",
        team: awayTeam,
      },
      {
        value: "home",
        team: homeTeam,
      },
    ];

    return showAllTab ? [{ value: "all" }, ...teamTabs] : teamTabs;
  }, [awayTeam, homeTeam, showAllTab]);

  const tabWidth = containerWidth / tabs.length;

  useEffect(() => {
    if (tabWidth <= 0) {
      return;
    }

    const selectedIndex = tabs.findIndex(({ value }) => value === selected);

    if (selectedIndex < 0) {
      return;
    }

    const animation = Animated.timing(underlineX, {
      toValue: selectedIndex * tabWidth,
      duration: 200,
      useNativeDriver: true,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [selected, tabWidth, tabs, underlineX]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;

    setContainerWidth((currentWidth) =>
      currentWidth === width ? currentWidth : width,
    );
  }, []);

  return (
    <View onLayout={handleLayout} style={styles.tabContainer}>
      <View accessibilityRole="tablist" style={styles.tabs}>
        {tabs.map(({ value, team }) => {
          const isSelected = selected === value;
          const isAllTab = value === "all";
          const tabLabel = value.toUpperCase();

          return (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityLabel={
                isAllTab ? "All teams" : `${tabLabel}: ${team?.name ?? "Team"}`
              }
              accessibilityState={{
                selected: isSelected,
              }}
              onPress={() => onTabPress(value)}
              style={({ pressed }) => [
                styles.tabPressable,
                {
                  opacity: pressed ? activeOpacity : 1,
                },
              ]}
            >
              {isAllTab ? (
                <Text
                  style={[styles.allTabText, isSelected && styles.selectedText]}
                >
                  ALL
                </Text>
              ) : (
                <View style={styles.tabContent}>
                  {team?.logo ? (
                    <Image
                      source={team.logo}
                      resizeMode="contain"
                      style={[
                        styles.logo,
                        !isSelected && styles.unselectedLogo,
                      ]}
                    />
                  ) : null}

                  {showTeamName ? (
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.teamName,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {team?.name}
                    </Text>
                  ) : null}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {tabWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.underline,
            {
              width: tabWidth,
              transform: [{ translateX: underlineX }],
            },
          ]}
        />
      ) : null}
    </View>
  );
}

export const homeAwayTabBarStyles = (isDark: boolean) => {
  const selectedColor = isDark ? Colors.white : Colors.black;

  return StyleSheet.create({
    tabContainer: {
      position: "relative",
      width: "100%",
    },
    tabs: {
      flexDirection: "row",
      width: "100%",
    },
    tabPressable: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 60,
      paddingHorizontal: 8,
    },
    tabContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      maxWidth: "100%",
    },
    logo: {
      width: 32,
      height: 32,
    },
    unselectedLogo: {
      opacity: 0.45,
    },
    allTabText: {
      opacity: 0.5,
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: Colors.midTone,
    },
    teamName: {
      opacity: 0.5,
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      color: Colors.midTone,
    },
    selectedText: {
      opacity: 1,
      color: selectedColor,
    },
    underline: {
      position: "absolute",
      bottom: 0,
      left: 0,
      height: 2,
      borderRadius: 1,
      backgroundColor: selectedColor,
    },
  });
};

export default memo(HomeAwayTabBar);
