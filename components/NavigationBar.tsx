import { activeOpacity, Colors, Fonts } from "constants/styles";
import { useNavigationBarRowHeight } from "contexts/NavigationBarInsetContext";
import { BlurView } from "expo-blur";
import { Tabs, useRouter } from "expo-router";
import { useMemo, type ComponentProps } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Balls, Compass, Home, User } from "reicon-react-native";

type TabBarRenderer = NonNullable<ComponentProps<typeof Tabs>["tabBar"]>;
type NavigationBarProps = Parameters<TabBarRenderer>[0] & { isDark: boolean };

const TAB_PATHS = {
  "(home)": "/(tabs)/(home)",
  "(league)": "/(tabs)/(league)",
  "(explore)": "/(tabs)/(explore)",
  "(profile)": "/(tabs)/(profile)",
} as const;

const TAB_DETAILS = {
  "(home)": { label: "Home", Icon: Home },
  "(league)": { label: "Leagues", Icon: Balls },
  "(explore)": { label: "Explore", Icon: Compass },
  "(profile)": { label: "Profile", Icon: User },
} as const;

export default function NavigationBar({
  state,
  descriptors,
  insets,
  isDark,
}: NavigationBarProps) {
  const router = useRouter();
  const iconColor = isDark ? Colors.white : Colors.black;
  const rowHeight = useNavigationBarRowHeight();
  const styles = useMemo(
    () => CustomTabBarStyles(isDark, insets.bottom, rowHeight),
    [isDark, insets.bottom, rowHeight],
  );

  return (
    <View style={styles.tabBarWrapper}>
      <BlurView
        intensity={100}
        tint={isDark ? "dark" : "light"}
        pointerEvents="none"
        style={styles.blurBackground}
      />

      <View accessibilityRole="tablist" style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const tab = TAB_DETAILS[route.name as keyof typeof TAB_DETAILS];
          if (!tab) return null;

          const focused = state.index === index;
          const { options } = descriptors[route.key];

          const handlePress = () => {
            if (!focused) {
              router.navigate(TAB_PATHS[route.name as keyof typeof TAB_PATHS]);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={handlePress}
              style={styles.tabButton}
              activeOpacity={activeOpacity}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? `Go to ${tab.label} tab`
              }
              testID={options.tabBarButtonTestID}
            >
              <tab.Icon
                size={24}
                color={iconColor}
                weight={focused ? "Filled" : "Outline"}
              />
              <Text style={[styles.tabLabel, focused && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const CustomTabBarStyles = (
  isDark: boolean,
  bottomInset: number,
  rowHeight: number,
) =>
  StyleSheet.create({
    tabBarWrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      overflow: "hidden",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: "transparent",
      paddingBottom: bottomInset,
      shadowColor: "rgba(0, 0, 0, 0.8)",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 12,
    },
    blurBackground: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    tabRow: {
      height: rowHeight,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingTop: 8,
      paddingBottom: 10,
    },
    tabButton: {
      flex: 1,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    tabLabel: {
      color: isDark ? Colors.dark.secondaryText : Colors.light.secondaryText,
      marginTop: 4,
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
    },
    activeTabLabel: {
      color: isDark ? Colors.white : Colors.black,
    },
  });
