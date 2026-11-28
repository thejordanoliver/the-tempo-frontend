import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { Colors, Fonts, MIN_TOUCH_TARGET } from "constants/styles";
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

export default function BracketTeamRow({
  team,
  matchup,
  isDark,
  onTeamPress,
}: Props) {
  const colors = isDark ? Colors.dark : Colors.light;
  const winner = isBracketWinner(team, matchup);
  const styles = BracketTeamRowStyles(isDark, winner);
  const score = getBracketTeamScore(team, matchup);
  const fadeScore =
    matchup?.status === "complete" && !winner && typeof score === "number";
  const canOpenTeam = Boolean(onTeamPress && team?.id != null);
  const teamLogo = isDark ? team?.logoDark || team?.logo : team?.logo;

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
      <Text style={[styles.seed]}>{team?.seed ?? ""}</Text>
      <Image
        source={teamLogo ? { uri: teamLogo } : PlaceholderLogo}
        style={styles.logo}
        resizeMode="contain"
        accessible={false}
      />
      <Text style={[styles.name, fadeScore && { color: colors.secondaryText }]}>
        {getBracketTeamLabel(team)}
      </Text>
      {score !== null ? (
        <Text
          style={[styles.score, fadeScore && { color: colors.secondaryText }]}
        >
          {score}
        </Text>
      ) : null}
    </Pressable>
  );
}

const BracketTeamRowStyles = (isDark: boolean, winner: boolean) =>
  StyleSheet.create({
    row: {
      minHeight: MIN_TOUCH_TARGET,
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 8,
    },
    winnerRow: {
      backgroundColor: Colors.transparentGold,
    },
    pressed: { opacity: 0.65 },
    seed: {
      fontFamily: Fonts.MEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      width: 13,
      textAlign: "center",
      fontSize: 13,
    },
    logo: {
      width: 25,
      height: 25,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      flex: 1,
      fontSize: 14,
      fontFamily: winner ? Fonts.BOLD : Fonts.MEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
    score: {
      minWidth: 26,
      fontSize: 18,
      textAlign: "right",
      fontFamily: winner ? Fonts.BOLD : Fonts.MEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
  });
