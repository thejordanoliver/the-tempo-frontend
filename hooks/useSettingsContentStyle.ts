import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import type { StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useSettingsContentStyle(style: StyleProp<ViewStyle>) {
  const navigationContentStyle = useNavigationBarContentStyle();
  const { bottom } = useSafeAreaInsets();

  return navigationContentStyle([
    style,
    { paddingBottom: Math.max(32, bottom + 12) },
  ]);
}
