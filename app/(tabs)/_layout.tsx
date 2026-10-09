import { Tabs, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NAVIGATION_BAR_ROW_HEIGHT, NavigationBarInsetContext } from "contexts/NavigationBarInsetContext";
import NavigationBar from "../../components/NavigationBar";
import { usePreferences } from "../../contexts/PreferencesContext";

export default function TabLayout() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const hideNavigationBar = pathname.split("/").filter(Boolean).at(-1) === "edit-favorites" || pathname.endsWith("/settings/deleteaccountsplash");

  return (
    <NavigationBarInsetContext.Provider value={hideNavigationBar ? 0 : NAVIGATION_BAR_ROW_HEIGHT + insets.bottom}>
      <Tabs
        tabBar={(props) => hideNavigationBar ? null : <NavigationBar {...props} isDark={isDark} />}
        screenOptions={{
          freezeOnBlur: true,
          tabBarStyle: { position: "absolute", backgroundColor: "transparent" },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Home",
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="(league)"
          options={{
            title: "Leagues",
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="(explore)"
          options={{
            title: "Explore",
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="(profile)"
          options={{
            title: "Profile",
            headerShown: false,
          }}
        />
      </Tabs>
    </NavigationBarInsetContext.Provider>
  );
}
