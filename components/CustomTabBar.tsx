import { Colors, Fonts } from "constants/styles";
import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TABS = [
  {
    name: "Home",
    route: "/",
    icon: require("../assets/icons8/Home.png"),
  },
  {
    name: "Leagues",
    route: "/league",
    icon: require("../assets/icons8/Scoreboard.png"),
  },
  {
    name: "Explore",
    route: "/explore",
    icon: require("../assets/icons8/Compass.png"),
  },
  {
    name: "Profile",
    route: "/profile",
    icon: require("../assets/icons8/User.png"),
  },
];

const TAB_ROUTE_PARENTS: Record<string, string> = {
  "/league/stats": "/league",
  "/league/schedule": "/league",

  "/settings": "/profile",
  "/settings/accountdetails": "/profile",
  "/settings/appearance": "/profile",
  "/settings/preferences": "/profile",

  "/": "/",
  "/league": "/league",
  "/explore": "/explore",
  "/profile": "/profile",
};

const HIDDEN_TAB_ROUTES = ["/login", "/forgot-password", "/create-post"];

const HIDDEN_TAB_PREFIXES = [
  "/messages",
  "/comment-thread",
  "/post",
  "/edit-profile",
];

const DETAIL_SCREEN_PREFIXES = [
  "/team",
  "/game",
  "/messages",
  "/player",
  "/user",
  "/comment-thread",
  "/post",
];

const MAIN_TABS = ["/", "/league", "/explore", "/profile"];

function getActiveTab(pathname: string): string {
  if (TAB_ROUTE_PARENTS[pathname]) return TAB_ROUTE_PARENTS[pathname];

  const keys = Object.keys(TAB_ROUTE_PARENTS).sort(
    (a, b) => b.length - a.length,
  );

  for (const key of keys) {
    if (pathname.startsWith(key)) {
      return TAB_ROUTE_PARENTS[key];
    }
  }

  return "/";
}

function shouldHideTabBar(pathname: string) {
  return (
    HIDDEN_TAB_ROUTES.includes(pathname) ||
    HIDDEN_TAB_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function isDetailScreen(pathname: string) {
  return DETAIL_SCREEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export type TabBarProps = {
  isDark: boolean;
};

export default function CustomTabBar({ isDark }: TabBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [lastActiveTab, setLastActiveTab] = useState<string>("/");

  const currentActiveTab = getActiveTab(pathname);
  const detailScreen = isDetailScreen(pathname);

  useEffect(() => {
    if (!detailScreen) {
      setLastActiveTab(currentActiveTab);
    }
  }, [currentActiveTab, detailScreen]);

  if (shouldHideTabBar(pathname)) return null;

  const activeTabRoute = detailScreen ? lastActiveTab : currentActiveTab;

  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBarContainer}>
        <BlurView
          intensity={100}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? "rgba(0,0,0,0.3)"
                : "rgba(255, 255, 255, 0.5)",
            },
          ]}
        />

        <View style={styles.tabRow}>
          {TABS.map(({ name, route, icon }) => {
            const focused = activeTabRoute === route;

            const handlePress = () => {
              if (route === pathname) return;

              if (detailScreen && MAIN_TABS.includes(route)) {
                router.replace(route as any);
                return;
              }

              router.push(route as any);
            };

            return (
              <TouchableOpacity
                key={name}
                onPress={handlePress}
                style={styles.tabButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={`Go to ${name} tab`}
              >
                <Image
                  source={icon}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: focused
                      ? isDark
                        ? Colors.white
                        : Colors.black
                      : Colors.midTone,
                  }}
                  resizeMode="contain"
                />

                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    fontFamily: Fonts.OSREGULAR,
                    color: focused
                      ? isDark
                        ? Colors.white
                        : Colors.black
                      : Colors.midTone,
                  }}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.1)",
    shadowColor: "rgba(0, 0, 0, 0.8)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },

  tabBarContainer: {
    height: 80,
    overflow: "hidden",
    backgroundColor: "transparent",
  },

  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
    marginBottom: 10,
    paddingVertical: 20,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});