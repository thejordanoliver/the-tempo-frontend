// components/Explore/EmptyState.tsx
import { useFavoriteWidgets } from "hooks/useFavoritesWidgets";
import { useColorScheme, View } from "react-native";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import WidgetSlider from "./Widgets/WidgetSlider";

export default function EmptyState() {
  const {
    nbaWidgets,
    leadersMap,
  } = useFavoriteWidgets();

  const isDark = useColorScheme() === "dark";
  const styles = exploreStyles(isDark);

  const allWidgets = [
    ...Object.values(nbaWidgets)
      .flat()
      .map((w: any) => ({ type: "NBA" as const, data: w })),
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
