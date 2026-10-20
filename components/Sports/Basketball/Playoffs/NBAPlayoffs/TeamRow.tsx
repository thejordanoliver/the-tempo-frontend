import { NBAPlayoffBracketStyles } from "@/styles/PlayoffStyles/NBAPlayoffBraketStyles";
import type { NBAPlayoffTeam } from "@/types/basketball/basketball";
import { Colors } from "constants/styles";
import { getNBATeam, getNBATeamLogo } from "constants/teams";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { Image, Text, View } from "react-native";

type TeamRowProps = {
  team?: NBAPlayoffTeam;
  wins: number;
  opponentWins: number;
  score: number | null;
  isDark: boolean;
  league?: "nba" | "wnba";
  bestOf?: number;
};

export const TeamRow = ({
  team,
  wins,
  score,
  opponentWins,
  isDark,
  league = "nba",
  bestOf = 7,
}: TeamRowProps) => {
  const styles = NBAPlayoffBracketStyles(isDark);
  const teamId = team?.id;
  const getTeam = league === "wnba" ? getWNBATeam : getNBATeam;
  const getLogo = league === "wnba" ? getWNBATeamLogo : getNBATeamLogo;
  const teamLogo = getLogo(teamId, isDark);
  const teamData = teamId != null ? getTeam(teamId) : undefined;
  const teamName = teamData?.code || team?.code || "TBD";
  const winsNeeded = Math.ceil(bestOf / 2);
  const hasWonSeries = wins === winsNeeded;
  const hasLostSeries = opponentWins === winsNeeded;
  const seed = team?.playoffSeed ?? team?.seed;
  const textColor = isDark ? Colors.white : Colors.black;
  const seedColor = team ? textColor : Colors.midTone;
  const teamCodeColor =
    !team || (hasLostSeries && !hasWonSeries) ? Colors.midTone : textColor;
  const winsBadgeColor = hasWonSeries
    ? Colors.light.gold
    : isDark
      ? Colors.transparentDarkGray
      : Colors.transparentLightGray;
  const winsTextColor = hasWonSeries ? Colors.black : textColor;

  return (
    <View style={styles.teamRow}>
      <Text style={[styles.seedText, { color: seedColor }]}>
        {seed ?? "-"}
      </Text>
      <Image source={teamLogo} style={styles.teamLogo} resizeMode="contain" />
      <Text
        numberOfLines={1}
        style={[styles.teamCode, { color: teamCodeColor }]}
      >
        {teamName}
      </Text>
      {score != null && (
        <View style={styles.winsBadge}>
          <Text numberOfLines={1} style={styles.score}>
            {score}
          </Text>
        </View>
      )}
      {score == null && (
        <View
          style={[
            styles.winsBadge,
            { backgroundColor: winsBadgeColor },
          ]}
        >
          <Text style={[styles.winsText, { color: winsTextColor }]}>
            {team ? wins : "-"}
          </Text>
        </View>
      )}
    </View>
  );
};
