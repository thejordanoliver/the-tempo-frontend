import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";

export function useTickerTheme() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  return {
    isDark,
    colors: Colors[isDark ? "dark" : "light"],
    text: globalStyles(isDark),
  };
}
