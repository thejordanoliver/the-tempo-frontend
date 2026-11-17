import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import {
  Colors,
  Fonts,
  MIN_TOUCH_TARGET,
  globalStyles,
} from "constants/styles";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text } from "react-native";
import type { PlayoffMatchup, PlayoffTeam } from "types/playoffs";
import {
  getBracketTeamAccessibilityLabel,
  getBracketTeamLabel,
  getBracketTeamScore,
  isBracketWinner,
} from "utils/playoffs/bracketPresentation";

type Props = {
  team: PlayoffTeam | null;
  matchup?: PlayoffMatchup;
  isDark: boolean;
  onTeamPress?: (team: PlayoffTeam) => void;
};

function TeamLogo({ team, isDark }: Pick<Props, "team" | "isDark">) {
  const uri = isDark ? (team?.logoDark ?? team?.logo) : team?.logo;
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showRemoteLogo = Boolean(uri && failedUri !== uri);

  return (
    <Image
      source={uri && failedUri !== uri ? { uri } : PlaceholderLogo}
      style={styles.logo}
      resizeMode="contain"
      onError={showRemoteLogo ? () => setFailedUri(uri ?? null) : undefined}
      accessible={false}
    />
  );
}

export default function BracketTeamRow({
  team,
  matchup,
  isDark,
  onTeamPress,
}: Props) {
  const colors = isDark ? Colors.dark : Colors.light;
  const global = globalStyles(isDark);
  const score = getBracketTeamScore(team, matchup);
  const winner = isBracketWinner(team, matchup);
  const canOpenTeam = Boolean(onTeamPress && team?.id != null);

  return (
    <Pressable
      disabled={!canOpenTeam}
      accessibilityRole={canOpenTeam ? "button" : undefined}
      accessibilityLabel={getBracketTeamAccessibilityLabel(team, matchup)}
      onPress={() => team && onTeamPress?.(team)}
      style={({ pressed }) => [
        styles.row,
        winner ? styles.winnerRow : null,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[global.caption, styles.seed]}>{team?.seed ?? ""}</Text>
      <TeamLogo team={team} isDark={isDark} />
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          {
            color: team ? colors.text : colors.secondaryText,
            fontFamily: winner ? Fonts.SEMIBOLD : Fonts.REGULAR,
          },
        ]}
      >
        {getBracketTeamLabel(team)}
      </Text>
      {score !== null ? (
        <Text style={[styles.score, winner ? styles.winner : null]}>
          {score}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH_TARGET,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  winnerRow: {
    backgroundColor: Colors.transparentGold,
  },
  pressed: { opacity: 0.65 },
  seed: { width: 13, textAlign: "center", fontSize: 14 },
  logo: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { flex: 1, fontSize: 14, lineHeight: 20 },
  score: {
    minWidth: 26,
    fontSize: 18,
    textAlign: "right",
    fontFamily: Fonts.MEDIUM,
  },
  winner: {
    fontFamily: Fonts.BOLD,
  },
});
