import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NAVIGATION_BAR_ROW_HEIGHT, NavigationBarInsetContext } from "contexts/NavigationBarInsetContext";
import NavigationBar from "../../components/NavigationBar";
import { usePreferences } from "../../contexts/PreferencesContext";

export default function TabLayout() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <NavigationBarInsetContext.Provider value={NAVIGATION_BAR_ROW_HEIGHT + insets.bottom}>
      <Tabs
        tabBar={(props) => <NavigationBar {...props} isDark={isDark} />}
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
