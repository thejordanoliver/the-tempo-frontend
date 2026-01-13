// utils/getTopLeaders.ts
import {
  COLLAPSED_PLAYER_COUNT,
  EXPANDED_MAX_PLAYERS,
  EXPANDED_PLAYERS_PER_TEAM,
} from "constants/widgetLeaders";
import { Text } from "react-native";
import { gameWidgetStyles } from "styles/Explore/GameWidgetStyles";

type PlayerLeader = {
  team: { id: number };
  leaderStat?: { value: number };
};

type displayeValue = {
  isHome: boolean;
  record: string;
  score: number;
  status: boolean;
  isFinal: boolean;
  winner: boolean;
  height: number;
  width: number;
};

export function getTopLeaders<T extends PlayerLeader>(
  players: T[],
  isExpanded: boolean
): T[] {
  const sorted = [...players].sort(
    (a, b) => (b.leaderStat?.value ?? 0) - (a.leaderStat?.value ?? 0)
  );

  if (!isExpanded) {
    return sorted.slice(0, COLLAPSED_PLAYER_COUNT);
  }

  const byTeam = sorted.reduce<Record<number, T[]>>((acc, player) => {
    (acc[player.team.id] ??= []).push(player);
    return acc;
  }, {});

  return Object.values(byTeam)
    .flatMap((teamPlayers) =>
      teamPlayers
        .sort((a, b) => (b.leaderStat?.value ?? 0) - (a.leaderStat?.value ?? 0))
        .slice(0, EXPANDED_PLAYERS_PER_TEAM)
    )
    .slice(0, EXPANDED_MAX_PLAYERS);
}

export default function displayeValue(
  isHome = true,
  status = true,
  isFinal = true,
  winner = true,
  record = "",
  score = 0,
  isDark = true,
  height = 150,
  width = 150,
) {
  const styles = gameWidgetStyles(isDark, height, width);

  if (isHome === true && status === true) {
    return <Text style={styles.homeRecord}>{record}</Text>;
  }
  if (isHome === false && status === true) {
    return <Text style={styles.awayRecord}>{record}</Text>;
  }
  if (isHome === true && status === false) {
    return (
      <Text
        style={[styles.homeScore, isFinal && { opacity: winner ? 1 : 0.5 }]}
      >
        {score}
      </Text>
    );
  } else if (isHome === false && status === false) {
    return (
      <Text
        style={[styles.awayScore, isFinal && { opacity: winner ? 1 : 0.5 }]}
      >
        {score}
      </Text>
    );
  } else {
    return "-";
  }
}
