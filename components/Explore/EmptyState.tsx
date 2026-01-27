// components/Explore/EmptyState.tsx
import { useFavoriteWidgets } from "hooks/useFavoritesWidgets";
import { useColorScheme, View } from "react-native";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import WidgetSlider from "./Widgets/WidgetSlider";

export default function EmptyState() {
  const {
    nbaWidgets,
    cbbWidgets,
    wcbbWidgets,
    nflWidgets,
    cfbWidgets,
    leadersMap,
  } = useFavoriteWidgets();

  const isDark = useColorScheme() === "dark";
  const styles = exploreStyles(isDark);

  const allWidgets = [
    ...nbaWidgets.map((w) => ({ type: "NBA" as const, data: w })),
    ...nflWidgets.map((w) => ({ type: "NFL" as const, data: w })),
    ...cfbWidgets.map((w) => ({ type: "CFB" as const, data: w })),
    ...cbbWidgets.map((w) => ({ type: "CBB" as const, data: w })),
    ...wcbbWidgets.map((w) => ({ type: "WCBB" as const, data: w })),
  ];

  if (allWidgets.length === 0) {
    return <View style={styles.centerPrompt} />;
  }

  return (
    <View style={styles.centerPrompt}>
      <WidgetSlider games={allWidgets} leadersMap={leadersMap} />
    </View>
  );
}
