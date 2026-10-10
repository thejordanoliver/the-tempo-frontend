import { formatDate } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import PredictionCard from "components/FanPrediction/PredictionCard";
import { Colors, Fonts } from "constants/styles";
import { getNBATeamLogo } from "constants/teams";
import { getCBTeamLogo } from "constants/teamsCB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getGLeagueTeamLogo } from "constants/teamsGLeague";
import { getMCBBTeamLogo } from "constants/teamsMCBB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getSBTeamLogo } from "constants/teamsSB";
import { getSOCCTeamLogo } from "constants/teamsSOCC";
import { getUFLTeamLogo } from "constants/teamsUFL";
import { getWCBBTeamLogo } from "constants/teamsWCBB";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { useFeedPrediction } from "hooks/useFeedPrediction";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { FeedPrediction } from "types/fanPredictions";
import { formatPercentage, isSameTeamId } from "utils/fanPredictionVotes";

const teamLogoHelpers: Record<string, typeof getNBATeamLogo> = {
  nba: getNBATeamLogo,
  wnba: getWNBATeamLogo,
  gleague: getGLeagueTeamLogo,
  mcbb: getMCBBTeamLogo,
  wcbb: getWCBBTeamLogo,
  nfl: getNFLTeamLogo,
  cfb: getCFBTeamLogo,
  ufl: getUFLTeamLogo,
  mlb: getMLBTeamLogo,
  cb: getCBTeamLogo,
  sb: getSBTeamLogo,
  nhl: getNHLTeamLogo,
};

export default function PredictionFeedCard({
  game,
  isDark,
}: {
  game: FeedPrediction;
  isDark: boolean;
}) {
  const router = useScopedRouter();
  const styles = useMemo(() => cardStyles(isDark), [isDark]);
  const prediction = useFeedPrediction(game);
  const open = prediction.open;
  const disabled =
    !prediction.canVote ||
    prediction.userVote != null ||
    prediction.submittingTeamId != null ||
    prediction.phase !== "ready";
  const openGame = () =>
    router.push({
      pathname: "/game/[sport]/[game]",
      params: {
        sport: game.sport,
        game: String(game.gameId),
        league: game.league,
        leagueId: game.league,
        data: encodeURIComponent(
          JSON.stringify({
            id: game.gameId,
            league: { code: game.league },
            date: game.startsAt,
            home: game.home,
            away: game.away,
            status: { state: game.state },
          }),
        ),
      },
    });
  const picked = isSameTeamId(prediction.userVote, game.home.id)
    ? game.home.name
    : game.away.name;
  const date = formatDate(game.startsAt, false, true);
  const getTeamLogo =
    game.sport === "soccer"
      ? getSOCCTeamLogo
      : teamLogoHelpers[game.league.toLowerCase()];
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.eyebrow}>
          <Ionicons name="stats-chart" size={13} /> FAN PREDICTION ·{" "}
          {game.league.toUpperCase()}
        </Text>
        <Text style={styles.points}>
          {game.scoring.pointsValue}{" "}
          {game.scoring.pointsValue === 1 ? "point" : "points"}
        </Text>
      </View>
      <Text style={styles.title}>Who wins?</Text>
      <Text style={styles.meta}>
        {game.away.name} at {game.home.name}
      </Text>
      <Text style={styles.meta}>{date}</Text>
      <View style={styles.teams}>
        {[game.away, game.home].map((team, index) => {
          const percent =
            index === 0 ? prediction.rawPctAway : prediction.rawPctHome;
          return (
            <PredictionCard
              key={team.id}
              code={team.code}
              logo={
                getTeamLogo
                  ? getTeamLogo(team.id, isDark)
                  : team.logo
                    ? { uri: team.logo }
                    : undefined
              }
              color={team.color}
              fillPercentage={prediction.resultsRevealed ? percent : 0}
              percentText={formatPercentage(percent)}
              onPress={
                index === 0
                  ? prediction.handleAwayVote
                  : prediction.handleHomeVote
              }
              disabled={disabled}
              isSelected={isSameTeamId(prediction.userVote, team.id)}
              showPercent={prediction.resultsRevealed}
              isDark={isDark}
              style={styles.team}
            />
          );
        })}
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.meta}>
        {prediction.submittingTeamId != null
          ? "Saving your pick…"
          : prediction.userVote != null
            ? `Your pick: ${picked}`
            : open
              ? "Pick a winner before kickoff. Picks are final."
              : "Predictions closed at kickoff."}
      </Text>
      {prediction.resultsRevealed && (
        <Text style={styles.meta}>
          {prediction.totalVotes} fan{" "}
          {prediction.totalVotes === 1 ? "pick" : "picks"}
        </Text>
      )}
      {prediction.errorMessage && (
        <Text accessibilityRole="alert" style={styles.error}>
          {prediction.errorMessage}
        </Text>
      )}
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={openGame}
          hitSlop={8}
        >
          <Text style={styles.link}>Game details →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.push("/fan-prediction-rankings")}
          hitSlop={8}
        >
          <Text style={styles.link}>View your predictions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const cardStyles = (isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  return StyleSheet.create({
    container: {
      marginHorizontal: 12,
      padding: 16,
      gap: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.gray,
      backgroundColor: theme.background,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    },
    eyebrow: {
      fontFamily: Fonts.BOLD,
      fontSize: 11,
      color: theme.text,
      letterSpacing: 0.5,
    },
    points: { fontFamily: Fonts.BOLD, fontSize: 12, color: theme.green },
    title: { fontFamily: Fonts.BOLD, fontSize: 26, color: theme.text },
    meta: { fontFamily: Fonts.REGULAR, fontSize: 14, color: theme.text },
    teams: { flexDirection: "row", gap: 8, minHeight: 120, marginVertical: 4 },
    team: { flex: 1 },
    link: {
      fontFamily: Fonts.BOLD,
      fontSize: 13,
      color: theme.text,
      paddingVertical: 8,
    },
    error: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
};
