import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Reserve the loaded header's height without showing header UI during loading.
export function GameHeaderPlaceholder() {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ height: 56 + insets.top }}
    />
  );
}
