import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type {
  PlayoffBracketData,
  PlayoffMatchup,
  PlayoffTeam,
} from "types/playoffs";
import {
  BRACKET_CARD_WIDTH,
  BRACKET_HEADER_HEIGHT,
  getBracketLayout,
} from "utils/playoffs/bracketLayout";
import BracketConnections from "./BracketConnections";
import BracketMatchupCard from "./BracketMatchupCard";

export interface PlayoffBracketProps {
  data: PlayoffBracketData;
  onTeamPress?: (team: PlayoffTeam) => void;
  onMatchupPress?: (matchup: PlayoffMatchup) => void;
}

/** Compose a bracket from normalized data; fetching belongs to the parent. */
export default function PlayoffBracket({
  data,
  onTeamPress,
  onMatchupPress,
}: PlayoffBracketProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const global = globalStyles(isDark);
  const layout = useMemo(() => getBracketLayout(data.rounds), [data.rounds]);

  if (!layout.nodes.length) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.secondaryText}>
          No playoff matchups available for this season.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator
      directionalLockEnabled
      contentContainerStyle={styles.scrollContent}
      accessibilityLabel="Playoff bracket. Scroll horizontally to see later rounds."
    >
      <View style={{ width: layout.width, height: layout.height }}>
        <BracketConnections
          nodes={layout.nodes}
          width={layout.width}
          height={layout.height}
          color={colors.gray}
        />
        {layout.headers.map(({ key, round, x }) => (
          <View
            key={key}
            testID={`bracket-heading-${key}`}
            style={[styles.roundHeading, { left: x }]}
          >
           
            <Text numberOfLines={1} style={[global.subtitle, styles.roundName]}>
              {round.name}
            </Text>
          </View>
        ))}
        {layout.nodes.map((node) => (
          <BracketMatchupCard
            key={node.key}
            node={node}
            isDark={isDark}
            onTeamPress={onTeamPress}
            onMatchupPress={onMatchupPress}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
  roundHeading: {
    position: "absolute",
    top: 0,
    width: BRACKET_CARD_WIDTH,
    height: BRACKET_HEADER_HEIGHT,
    alignItems: "center",
  },
  centeredText: { textAlign: "center" },
  roundName: { fontSize: 15, textAlign: "center" },
});
