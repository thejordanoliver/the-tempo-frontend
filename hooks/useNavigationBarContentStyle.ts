import { NavigationBarInsetContext } from "contexts/NavigationBarInsetContext";
import { useCallback, useContext } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

export function useNavigationBarContentStyle() {
  const bottomInset = useContext(NavigationBarInsetContext);

  return useCallback((style?: StyleProp<ViewStyle>): StyleProp<ViewStyle> => {
    if (!bottomInset) return style;
    const existingPadding = StyleSheet.flatten(style)?.paddingBottom;
    return [style, {
      paddingBottom: Math.max(
        typeof existingPadding === "number" ? existingPadding : 0,
        bottomInset + 12,
      ),
    }];
  }, [bottomInset]);
}
