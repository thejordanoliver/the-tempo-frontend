import { Colors, MIN_TOUCH_TARGET, globalStyles } from "constants/styles";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PlayoffMatchup, PlayoffTeam } from "types/playoffs";
import {
  BRACKET_CARD_HEIGHT,
  BRACKET_CARD_WIDTH,
  BRACKET_HEADER_HEIGHT,
  type BracketNode,
} from "utils/playoffs/bracketLayout";
import { getBracketMatchupFooter } from "utils/playoffs/bracketPresentation";
import BracketTeamRow from "./BracketTeamRow";

type Props = {
  node: BracketNode;
  isDark: boolean;
  onTeamPress?: (team: PlayoffTeam) => void;
  onMatchupPress?: (matchup: PlayoffMatchup) => void;
};

export default function BracketMatchupCard({
  node,
  isDark,
  onTeamPress,
  onMatchupPress,
}: Props) {
  const colors = isDark ? Colors.dark : Colors.light;
  const global = globalStyles(isDark);
  const matchup = node.matchup;
  const canOpenMatchup = Boolean(matchup && onMatchupPress);
  const teamProps = { isDark, onTeamPress };

  return (
    <View
      testID={`bracket-${node.key}`}
      style={[
        styles.card,
        {
          left: node.x,
          top: node.y + BRACKET_HEADER_HEIGHT,
          backgroundColor: colors.background,
          borderColor: colors.transparentGray,
        },
      ]}
    >
      {matchup ? (
        <>
          <BracketTeamRow
            team={matchup.teams[0] ?? null}
            matchup={matchup}
            {...teamProps}
          />
          <BracketTeamRow
            team={matchup.teams[1] ?? null}
            matchup={matchup}
            {...teamProps}
          />
        </>
      ) : (
        <View style={styles.bye}>
          <BracketTeamRow team={node.bye ?? null} {...teamProps} />
        </View>
      )}
      <Pressable
        disabled={!canOpenMatchup}
        accessibilityRole={canOpenMatchup ? "button" : undefined}
        accessibilityLabel={
          canOpenMatchup ? `View ${matchup?.name} matchup` : undefined
        }
        onPress={() => matchup && onMatchupPress?.(matchup)}
        style={[styles.footer, { borderTopColor: colors.transparentGray }]}
      >
        <Text numberOfLines={1} style={[global.caption, styles.footerText]}>
          {getBracketMatchupFooter(matchup)}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: BRACKET_CARD_WIDTH,
    height: BRACKET_CARD_HEIGHT,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  bye: { height: 76, justifyContent: "center" },
  footer: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 6,
  },
  footerText: { fontSize: 11 },
});
