import { activeOpacity, Colors, Fonts, PLACEHOLDER_AVATAR } from "constants/styles";
import { useNavigationBarRowHeight } from "contexts/NavigationBarInsetContext";
import { BlurView } from "expo-blur";
import { Tabs, usePathname } from "expo-router";
import { useProfile } from "hooks/UserHooks/useProfile";
import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Balls, Compass, Home, User } from "reicon-react-native";

type TabBarRenderer = NonNullable<ComponentProps<typeof Tabs>["tabBar"]>;
type NavigationBarProps = Parameters<TabBarRenderer>[0] & { isDark: boolean };

const TAB_DETAILS = {
  "(home)": { label: "Home", Icon: Home },
  "(league)": { label: "Leagues", Icon: Balls },
  "(explore)": { label: "Explore", Icon: Compass },
  "(profile)": { label: "Profile", Icon: User },
} as const;

export default function NavigationBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
  isDark,
}: NavigationBarProps) {
  const iconColor = isDark ? Colors.white : Colors.black;
  const pathname = usePathname();
  const { profileImage, loadProfile } = useProfile();
  const hasLoadedAvatar = useRef(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  // Hydrate the avatar on mount and after returning to the Profile screen,
  // including when the user has just edited their profile image.
  useEffect(() => {
    if (!hasLoadedAvatar.current || pathname === "/profile") {
      hasLoadedAvatar.current = true;
      void loadProfile();
    }
  }, [loadProfile, pathname]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [profileImage]);

  const avatarUri =
    !avatarFailed && profileImage ? profileImage : PLACEHOLDER_AVATAR;
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
              accessibilityState={{ selected: focused }}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? `Go to ${tab.label} tab`
              }
              testID={options.tabBarButtonTestID}
            >
              {route.name === "(profile)" ? (
                <View
                  style={[
                    styles.avatarContainer,
                    focused && styles.avatarContainerFocused,
                  ]}
                >
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                    onError={() => setAvatarFailed(true)}
                    accessibilityIgnoresInvertColors
                  />
                </View>
              ) : (
                <tab.Icon
                  size={24}
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
    avatarContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.gray : Colors.light.gray,
      backgroundColor: isDark ? Colors.dark.gray : Colors.light.gray,
    },
    avatarContainerFocused: {
      borderWidth: 2,
      borderColor: isDark ? Colors.white : Colors.black,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
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
