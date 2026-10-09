import { Feather } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { ComponentProps } from "react";
import type { LottieViewProps } from "lottie-react-native";
import { View } from "react-native";

// Use the existing icon library on web, without Lottie's optional web player.
export default function WeatherAnimation({ source, style }: LottieViewProps) {
  const { resolvedColorScheme } = usePreferences();
  const name = typeof source === "object" && source !== null && "nm" in source
    ? String(source.nm).toLowerCase()
    : "";
  // RainX is the decorative full-card background; the foreground icon covers rain.
  if (name === "rainx") return null;
  const icon: ComponentProps<typeof Feather>["name"] = name.includes("rain")
    ? "cloud-rain"
    : name.includes("cloud")
      ? "cloud"
      : name.includes("night")
        ? "moon"
        : "sun";
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[style, { alignItems: "center", justifyContent: "center", opacity: 0.2 }]}>
      <Feather name={icon} size={140} color={resolvedColorScheme === "dark" ? Colors.white : Colors.black} />
    </View>
  );
}
