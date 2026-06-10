import { Colors } from "constants/styles";
import { getNBATeam } from "constants/teams";

import { Text, View } from "react-native";
import { nbaPlayoffBracketStyles } from "styles/NBAPlayoffBraketStyles";
import { BracketMatchup } from "types/nba";
import { formatQuarter } from "utils/games";
import { TeamRow } from "./TeamRow";

type CardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const bottomTeamId = (matchup: BracketMatchup) =>
  matchup.bottomTeam?.id?.toString() ?? "";
const topTeamId = (matchup: BracketMatchup) =>
  matchup.topTeam?.id?.toString() ?? "";

const getSeriesRecord = (matchup: BracketMatchup) => {
  const topWins = matchup.wins[topTeamId(matchup)] ?? 0;
  const bottomWins = matchup.wins[bottomTeamId(matchup)] ?? 0;
  return { topWins, bottomWins };
};
const getSeriesLeader = (matchup: BracketMatchup) => {
  const leader = matchup.leader;
  return { leader };
};

const isGameLive = (game: BracketMatchup["games"][number]) => {
  if (game.status.short === 2) return true;

  const normalizedStatus = game.status.long.trim().toLowerCase();
  return !["scheduled", "finished"].includes(normalizedStatus);
};

const getLiveGame = (matchup: BracketMatchup) =>
  matchup.games.find((game) => isGameLive(game));

const getTeamGamePoints = (
  game: BracketMatchup["games"][number],
  teamId?: number,
) => {
  if (!teamId) return 0;
  if (game.teams.home.id === teamId) return game.scores.home.points ?? 0;
  if (game.teams.visitors.id === teamId)
    return game.scores.visitors.points ?? 0;
  return 0;
};

const getLiveGameStatus = (
  game: BracketMatchup["games"][number],
  isDark: boolean,
) => {
  const styles = nbaPlayoffBracketStyles(isDark);
  const status = game.periods.current || 0;
  const halftime = game.status.halftime;
  const clock = game.status.clock?.trim();
  const isEndOfPeriod = game.periods.endOfPeriod;
  const period = formatQuarter(status);

  if (isEndOfPeriod === true) {
    return (
      <View style={styles.statusWrapper}>
        <Text style={styles.clock}>{`End of ${period}`}</Text>
      </View>
    );
  }
  if (halftime === true) {
    return (
      <View style={styles.statusWrapper}>
        <Text style={styles.clock}>Halftime</Text>
      </View>
    );
  }
  if (!clock || clock === "0.0") {
    return status;
  }

  return (
    <View style={styles.statusWrapper}>
      <Text style={styles.period}>{period}</Text>
      <View style={styles.statusDivder} />
      <Text style={styles.clock}>{clock}</Text>
    </View>
  );
};

const getFooterLabel = (matchup: BracketMatchup) => {
  const { topWins, bottomWins } = getSeriesRecord(matchup);
  const { leader } = getSeriesLeader(matchup);
  const teamName = getNBATeam(leader ?? 0)?.code;

  if (topWins === bottomWins && topWins != 0 && bottomWins != 0) {
    return `Series Tied`;
  }
  if (bottomWins === 4) {
    return `${teamName} won series ${bottomWins}-${topWins}`;
  }
  if (topWins === 4) {
    return `${teamName} won series ${topWins}-${bottomWins}`;
  }
  if (topWins > bottomWins) {
    return `${teamName} leads ${topWins}-${bottomWins}`;
  }
  if (topWins < bottomWins) {
    return `${teamName} leads ${bottomWins}-${topWins}`;
  }

  return "Best of 7";
};

export const MatchupCard = ({
  matchup,
  layout,
  isDark,
  finals = false,
}: {
  matchup: BracketMatchup;
  layout: CardLayout;
  isDark: boolean;
  finals?: boolean;
}) => {
  const styles = nbaPlayoffBracketStyles(isDark);
  const { topWins, bottomWins } = getSeriesRecord(matchup);
  const liveGame = getLiveGame(matchup);
  const liveTopPoints = liveGame
    ? getTeamGamePoints(liveGame, matchup.topTeam?.id)
    : null;
  const liveBottomPoints = liveGame
    ? getTeamGamePoints(liveGame, matchup.bottomTeam?.id)
    : null;

  const topTeam = getNBATeam(matchup?.topTeam?.id ?? 0);
  const bottomTeam = getNBATeam(matchup?.bottomTeam?.id ?? 0);

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
          borderColor:
            finals && isDark
              ? Colors.dark.gold
              : finals
                ? Colors.light.gold
                : isDark
                  ? Colors.darkGray
                  : Colors.lightGray,
          backgroundColor: isDark
            ? Colors.dark.itemBackground
            : Colors.light.itemBackground,
        },
      ]}
    >
      <TeamRow
        team={matchup.topTeam}
        wins={topWins}
        oponnentWins={bottomWins}
        score={liveTopPoints}
        isDark={isDark}
      />
      <View style={styles.divider} />

      <TeamRow
        team={matchup.bottomTeam}
        wins={bottomWins}
        oponnentWins={topWins}
        score={liveBottomPoints}
        isDark={isDark}
      />
      {liveGame && (
        <View style={styles.statusContainer}>
          <Text style={styles.clock}>
            {getLiveGameStatus(liveGame, isDark)}
          </Text>
        </View>
      )}
      {!liveGame && (
        <View style={styles.statusContainer}>
          <Text style={styles.footerText}>{getFooterLabel(matchup)}</Text>
        </View>
      )}
    </View>
  );
};
