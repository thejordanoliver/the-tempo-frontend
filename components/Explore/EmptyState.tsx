// components/Explore/EmptyState.tsx
import { useFavoriteWidgets } from "hooks/useFavoritesWidgets";
import { View } from "react-native";
import { exploreStyles } from "styles/ExploreStyles/ExploreStyles";
import WidgetSlider from "./Widgets/WidgetSlider";

type EmptyStateProps = {
  isDark: boolean;
};

export default function EmptyState({ isDark }: EmptyStateProps) {
  const {
    nbaWidgets,
    nflWidgets,
    cfbWidgets,
    cbbWidgets,
    wcbbWidgets,
    wnbaWidgets,
    nhlWidgets,
    leadersMap,
  } = useFavoriteWidgets();

  const styles = exploreStyles(isDark);
  const allWidgets = [
    ...Object.values(nbaWidgets)
      .flat()
      .map((w: any) => ({ type: "NBA" as const, data: w })),

    ...Object.values(nflWidgets)
      .flat()
      .map((w: any) => ({ type: "NFL" as const, data: w })),

    ...Object.values(cfbWidgets)
      .flat()
      .map((w: any) => ({ type: "CFB" as const, data: w })),

    ...Object.values(cbbWidgets)
      .flat()
      .map((w: any) => ({ type: "CBB" as const, data: w })),

    ...Object.values(wcbbWidgets)
      .flat()
      .map((w: any) => ({ type: "WCBB" as const, data: w })),

    ...Object.values(wnbaWidgets)
      .flat()
      .map((w: any) => ({ type: "WNBA" as const, data: w })),

    ...Object.values(nhlWidgets)
      .flat()
      .map((w: any) => ({ type: "NHL" as const, data: w })),
  ];
  if (allWidgets.length === 0) {
    return <View style={styles.centerPrompt} />;
  }

  return (
    <View style={styles.centerPrompt}>
      <WidgetSlider
        games={allWidgets}
        leadersMap={leadersMap}
        isDark={isDark}
      />
    </View>
  );
}
