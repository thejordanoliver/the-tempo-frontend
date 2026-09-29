import { Tabs } from "expo-router";
import NavigationBar from "../../components/NavigationBar";
import { usePreferences } from "../../contexts/PreferencesContext";

export default function TabLayout() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  return (
    <Tabs
      tabBar={(props) => <NavigationBar {...props} isDark={isDark} />}
      screenOptions={{ freezeOnBlur: true }}
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
  );
}
