import { Text, View } from "react-native";
import type { TournamentGame } from "hooks/BasketballHooks/useTournamentBracket";
import { MCBBTournamentBracketStyles } from "styles/PlayoffStyles/MCBBTournamentBracketStyles";
import { getTournamentGameState } from "utils/brackets/tournamentGameStatus";
import { formatDate, formatTime } from "utils/common/dateUtils";
import { formatPeriod } from "utils/games/games";

export function GameStatus({
  game,
  isDark,
  league,
}: {
  game: TournamentGame;
  isDark: boolean;
  league: string;
}) {
  const styles = MCBBTournamentBracketStyles(isDark);
  const state = getTournamentGameState(game);
  const { status } = game;
  const statusText =
    status.shortDetail || status.detail || status.description || "";
  const date = game.date ? new Date(game.date) : null;
  const validDate = date && !Number.isNaN(date.getTime()) ? date : null;
  const period = formatPeriod({
    period: status.period && status.period > 0 ? status.period : null,
    isMCBB: (game.league?.code || league).toLowerCase() === "mcbb",
  });
  const clock = status.displayClock ?? status.clock;
  let primary = statusText || "TBD";
  let secondary: string | number | null = null;

  if (state === "scheduled") {
    primary = validDate ? formatDate(validDate) : "TBD";
    secondary = validDate
      ? /\bTBD\b/i.test(statusText)
        ? "TBD"
        : formatTime(validDate)
      : null;
  } else if (state === "live") {
    primary = period || (clock != null ? String(clock) : statusText || "LIVE");
    secondary = period ? clock : null;
  } else if (state === "final") {
    primary = statusText || "Final";
    secondary = validDate ? formatDate(validDate) : null;
  } else if (state === "halftime") {
    primary = "Halftime";
  } else if (state === "endOfPeriod") {
    primary = period ? `End of ${period}` : statusText;
  } else if (state === "interrupted") {
    primary = status.description || statusText;
  }

  const textStyle = state === "scheduled" ? styles.date : styles.status;
  return (
    <View style={styles.statusWrapper}>
      <Text style={textStyle}>{primary}</Text>
      {secondary !== null && secondary !== "" && (
        <>
          <View
            style={
              state === "scheduled"
                ? styles.statusDivider
                : styles.finalStatusDivider
            }
          />
          <Text style={textStyle}>{secondary}</Text>
        </>
      )}
    </View>
  );
}
