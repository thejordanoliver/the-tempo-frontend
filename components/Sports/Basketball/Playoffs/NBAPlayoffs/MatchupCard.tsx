import { NBAPlayoffBracketStyles } from "@/styles/PlayoffStyles/NBAPlayoffBraketStyles";
import type { NBABracketMatchup } from "@/types/basketball/basketball";
import { formatPeriod, getBroadcastDisplay } from "@/utils/games/games";
import { Colors } from "constants/styles";
import { getNBATeam } from "constants/teams";
import { getWNBATeam } from "constants/teamsWNBA";
import { Text, View } from "react-native";
import { TeamRow } from "./TeamRow";

type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PlayoffGame = NBABracketMatchup["games"][number];

type MatchupCardProps = {
  matchup: NBABracketMatchup;
  layout: CardLayout;
  isDark: boolean;
  finals?: boolean;
  league?: "nba" | "wnba";
  bestOf?: number;
};

const getSeriesRecord = (matchup: NBABracketMatchup) => {
  const topTeamId = matchup.topTeam?.id?.toString() ?? "";
  const bottomTeamId = matchup.bottomTeam?.id?.toString() ?? "";
  const topWins = matchup.wins[topTeamId] ?? 0;
  const bottomWins = matchup.wins[bottomTeamId] ?? 0;

  return { topWins, bottomWins };
};

const isActiveOrUpcomingGame = (game: PlayoffGame) => {
  const gameState = game?.status?.state;

  if (gameState === "in" || gameState === "pre") {
    return true;
  }

  if (gameState === "post") {
    return false;
  }

  const normalizedStatus = String(game.status?.description ?? "")
    .trim()
    .toLowerCase();

  return !["scheduled", "final"].includes(normalizedStatus);
};

const getTeamGamePoints = (game: PlayoffGame, teamId?: string | number) => {
  if (teamId == null) return null;

  if (String(game?.home?.id) === String(teamId)) {
    return game?.home?.score ?? null;
  }

  if (String(game?.away?.id) === String(teamId)) {
    return game?.away?.score ?? null;
  }

  return null;
};

const getGameStatus = (
  game: PlayoffGame | undefined | null,
  isDark: boolean,
) => {
  const styles = NBAPlayoffBracketStyles(isDark);

  if (!game) {
    return null;
  }

  const safeDate = (date?: string | null) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const gameDate = safeDate(game.date);

  const formattedDate = gameDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formattedTime =
    gameDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  const clock = game.status?.clock;
  const gameStatusDescription = game.status?.description;
  const gameStatusDetail = game.status?.shortDetail;
  const tbd = gameStatusDetail?.includes("TBD") ? "TBD" : null;

  const isFinal = gameStatusDescription === "Final";
  const inProgress = gameStatusDescription === "In Progress";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isHalftime = gameStatusDescription === "Halftime";
  const isEndOfPeriod = gameStatusDescription === "End of Period";

  const period = formatPeriod({ period: game.status?.period || 0 });

  if (inProgress) {
    return (
      <View style={styles.statusWrapper}>
        <Text style={styles.period}>{period}</Text>
        <View style={styles.statusDivider} />
        <Text style={styles.clock}>{clock}</Text>
      </View>
    );
  }

  if (isDelayed || isCanceled || isPostponed || isForfeited || isSuspended) {
    return <Text style={styles.clock}>{gameStatusDescription}</Text>;
  }

  if (isHalftime) {
    return <Text style={styles.clock}>Halftime</Text>;
  }

  if (isEndOfPeriod) {
    return <Text style={styles.clock}>End of {period}</Text>;
  }

  if (isFinal) {
    return (
      <View style={styles.statusWrapper}>
        <Text style={styles.clock}>{gameStatusDetail}</Text>
        <View style={styles.statusDivider} />
        <Text style={styles.clock}>{formattedDate}</Text>
      </View>
    );
  }

  return (
    <View style={styles.statusWrapper}>
      <Text style={styles.date}>{formattedDate}</Text>
      <View style={styles.statusDivider} />
      <Text style={styles.date}>{tbd || formattedTime}</Text>
    </View>
  );
};

const getFooterLabel = (
  matchup: NBABracketMatchup,
  league: "nba" | "wnba",
  bestOf: number,
) => {
  if (matchup.seriesSummary) return matchup.seriesSummary;

  const { topWins, bottomWins } = getSeriesRecord(matchup);
  const getTeam = league === "wnba" ? getWNBATeam : getNBATeam;
  const winsNeeded = Math.ceil(bestOf / 2);

  const leaderTeam =
    topWins === bottomWins
      ? undefined
      : topWins > bottomWins
        ? matchup.topTeam
        : matchup.bottomTeam;

  const teamName =
    leaderTeam?.code || getTeam(leaderTeam?.id ?? 0)?.code || "TBD";

  if (topWins === bottomWins && topWins !== 0 && bottomWins !== 0) {
    return "Series Tied";
  }

  if (bottomWins === winsNeeded) {
    return `${teamName} won series ${bottomWins}-${topWins}`;
  }

  if (topWins === winsNeeded) {
    return `${teamName} won series ${topWins}-${bottomWins}`;
  }

  if (topWins > bottomWins) {
    return `${teamName} leads ${topWins}-${bottomWins}`;
  }

  if (topWins < bottomWins) {
    return `${teamName} leads ${bottomWins}-${topWins}`;
  }

  return `Best of ${bestOf}`;
};

export const MatchupCard = ({
  matchup,
  layout,
  isDark,
  finals = false,
  league = "nba",
  bestOf = 7,
}: MatchupCardProps) => {
  const styles = NBAPlayoffBracketStyles(isDark);
  const { topWins, bottomWins } = getSeriesRecord(matchup);
  const recentGame = matchup.games.find(isActiveOrUpcomingGame);
  const themeColors = isDark ? Colors.dark : Colors.light;
  const borderColor = finals
    ? themeColors.gold
    : isDark
      ? Colors.darkGray
      : Colors.lightGray;

  const liveTopPoints =
    recentGame?.status?.state === "in"
      ? getTeamGamePoints(recentGame, matchup.topTeam?.id)
      : null;

  const liveBottomPoints =
    recentGame?.status?.state === "in"
      ? getTeamGamePoints(recentGame, matchup.bottomTeam?.id)
      : null;

  const broadcast = getBroadcastDisplay(recentGame?.broadcasts);

  return (
    <View
      style={[
        styles.cardShell,
        finals ? styles.finalsShell : null,
        {
          left: layout.x,
          top: layout.y,
          width: layout.width,
          height: layout.height,
          borderColor,
          backgroundColor: themeColors.itemBackground,
        },
      ]}
    >
      <TeamRow
        team={matchup.topTeam}
        wins={topWins}
        opponentWins={bottomWins}
        score={liveTopPoints}
        isDark={isDark}
        league={league}
        bestOf={bestOf}
      />

      <View style={styles.divider} />

      <TeamRow
        team={matchup.bottomTeam}
        wins={bottomWins}
        opponentWins={topWins}
        score={liveBottomPoints}
        isDark={isDark}
        league={league}
        bestOf={bestOf}
      />

      <View style={styles.statusContainer}>
        {broadcast ? <Text style={styles.broadcast}>{broadcast}</Text> : null}
        {getGameStatus(recentGame, isDark)}
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.footerText}>
          {getFooterLabel(matchup, league, bestOf)}
        </Text>
      </View>
    </View>
  );
};
