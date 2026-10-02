import { View } from "react-native";
import { getMLBBracketLayoutStyles, MLBPlayoffBracketStyles } from "styles/PlayoffStyles/MLBPlayoffBracketStyles";
import type { Matchup } from "./mlbBracketUtils";

type Props = {
  league: "american" | "national";
  matchups: Matchup[];
  isDark: boolean;
};

export function BracketConnectors({ league, matchups, isDark }: Props) {
  const styles = MLBPlayoffBracketStyles(isDark);
  const layout = getMLBBracketLayoutStyles(league);
  return (
    <View pointerEvents="none" style={styles.connectorLayer}>
      {matchups.map((matchup, index) => {
        const opening = getMLBBracketLayoutStyles(league, index);
        return (
          <View key={`bye-connector-${matchup.id}`} style={styles.connectorLayer}>
            <View style={[styles.connectorVertical, opening.byeBranch]} />
            <View style={[styles.connectorVertical, opening.wildCardBranch]} />
            <View style={[styles.connectorHorizontal, opening.byeLeg]} />
            <View style={[styles.connectorHorizontal, opening.wildCardLeg]} />
            <View style={[styles.connectorHorizontal, opening.openingOutput]} />
          </View>
        );
      })}
      <View style={[styles.connectorHorizontal, layout.divisionTopLeg]} />
      <View style={[styles.connectorHorizontal, layout.divisionBottomLeg]} />
      <View style={[styles.connectorVertical, layout.divisionBranch]} />
      <View style={[styles.connectorHorizontal, layout.championshipLeg]} />
      <View style={[styles.connectorHorizontal, layout.worldSeriesLeg]} />
    </View>
  );
}
