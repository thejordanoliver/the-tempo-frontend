import { activeOpacity, Colors, Fonts } from "constants/styles";
import { useNavigationBarRowHeight } from "contexts/NavigationBarInsetContext";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useMemo, useState, type ComponentProps } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Balls, Compass, Home, User } from "reicon-react-native";

type TabBarRenderer = NonNullable<ComponentProps<typeof Tabs>["tabBar"]>;
type NavigationBarProps = Parameters<TabBarRenderer>[0] & {
  isDark: boolean;
  profileImageUri: string | null;
};

const TAB_ICON_SIZE = 24;

const TAB_DETAILS = {
  "(home)": { label: "Home", Icon: Home },
  "(league)": { label: "Leagues", Icon: Balls },
  "(explore)": { label: "Explore", Icon: Compass },
  "(profile)": { label: "Profile", Icon: User },
} as const;

function ProfileTabIcon({
  uri,
  color,
  focused,
}: {
  uri: string | null;
  color: string;
  focused: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <User
        size={TAB_ICON_SIZE}
        color={color}
        weight={focused ? "Filled" : "Outline"}
      />
    );
  }

  return (
    <Image
      source={{ uri }}
      accessible={false}
      resizeMode="cover"
      onError={() => setFailed(true)}
      style={[
        profileImageStyle,
        focused && { borderWidth: 2, borderColor: color },
      ]}
    />
  );
}

const profileImageStyle = {
  width: TAB_ICON_SIZE,
  height: TAB_ICON_SIZE,
  borderRadius: TAB_ICON_SIZE / 2,
};

export default function NavigationBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
  isDark,
  profileImageUri,
}: NavigationBarProps) {
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
            // The stack listens for presses on its active tab to pop to its root.
            const event = emitter.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              // Focus the existing tab without navigating to its stack's root.
              navigateToTab(route.key);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={handlePress}
              style={styles.tabButton}
              activeOpacity={activeOpacity}
              accessibilityRole="tab"
              aria-selected={focused}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? `Go to ${tab.label} tab`
              }
              testID={options.tabBarButtonTestID}
            >
              {route.name === "(profile)" ? (
                <ProfileTabIcon
                  key={profileImageUri}
                  uri={profileImageUri}
                  color={iconColor}
                  focused={focused}
                />
              ) : (
                <tab.Icon
                  size={TAB_ICON_SIZE}
                  color={iconColor}
                  weight={focused ? "Filled" : "Outline"}
                />
              )}
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
      boxShadow: "0px 5px 12px rgba(0, 0, 0, 0.2)",
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
