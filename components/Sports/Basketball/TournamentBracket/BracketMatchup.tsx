import { Colors, activeOpacity } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { memo, useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Text, TouchableOpacity, View } from "react-native";

import { BracketTeamRow } from "./BracketTeamRow";
import { tournamentBracketStyles } from "./tournamentBracket.styles";
import type {
  BracketGame,
  BracketTeam,
  TournamentBracketCompetition,
} from "./tournamentBracket.types";
import {
  canNavigateToBracketGame,
  getBracketPositionLabel,
  getBracketTeamDisplayName,
  getWinningTeam,
  isFinalBracketGame,
  isLiveBracketGame,
} from "./tournamentBracket.utils";

export type BracketMatchupProps = {
  game: BracketGame;
  side?: "left" | "right" | "center";
  compact?: boolean;
  competition?: TournamentBracketCompetition;
  style?: StyleProp<ViewStyle>;
  allGamesById?: ReadonlyMap<string, BracketGame>;
  onPress?: (game: BracketGame) => void;
};

const getFormattedDate = (date?: string | null) => {
  if (!date) return "TBD";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "TBD";

  const day = parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const time = parsedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${day} ${time}`;
};

const getStatusLabel = (game: BracketGame) => {
  if (isLiveBracketGame(game)) return game.statusText || "Live";
  if (isFinalBracketGame(game)) return game.statusText || "Final";

  if (game.status === "delayed") return game.statusText || "Delayed";
  if (game.status === "postponed") return game.statusText || "Postponed";
  if (game.status === "canceled") return game.statusText || "Canceled";

  const formattedDate = getFormattedDate(game.date);
  return formattedDate === "TBD" ? game.statusText || "TBD" : formattedDate;
};

const getTeamSummary = (
  game: BracketGame,
  team: BracketTeam | null,
  position: "top" | "bottom",
  gameById?: ReadonlyMap<string, BracketGame>,
) => {
  if (!team) {
    return gameById
      ? getBracketPositionLabel(game, position, gameById)
      : `${position === "top" ? "Top" : "Bottom"} team to be determined`;
  }

  const seed = team.seed ? `${team.seed} seed ` : "";
  const score =
    team.score === null || team.score === undefined || team.score === ""
      ? ""
      : ` ${team.score}`;

  return `${seed}${getBracketTeamDisplayName(team)}${score}`;
};

const getAccessibilityLabel = (
  game: BracketGame,
  gameById?: ReadonlyMap<string, BracketGame>,
) => {
  const status = getStatusLabel(game);
  const top = getTeamSummary(game, game.topTeam, "top", gameById);
  const bottom = getTeamSummary(game, game.bottomTeam, "bottom", gameById);
  const winner = getWinningTeam(game);
  const winnerText = winner
    ? `. ${getBracketTeamDisplayName(winner)} advances.`
    : "";

  return `${status}: ${top}, ${bottom}${winnerText}`;
};

const teamMatches = (team: BracketTeam | null, winner: BracketTeam | null) => {
  if (!team || !winner) return false;

  return (
    String(team.id) === String(winner.id) ||
    String(team.espnId) === String(winner.espnId)
  );
};

function BracketMatchupComponent({
  game,
  side = "left",
  compact = false,
  competition = "CBB",
  style,
  allGamesById,
  onPress,
}: BracketMatchupProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => tournamentBracketStyles(isDark), [isDark]);
  const isFinal = isFinalBracketGame(game);
  const isLive = isLiveBracketGame(game);
  const winner = getWinningTeam(game);
  const topWins = teamMatches(game.topTeam, winner);
  const bottomWins = teamMatches(game.bottomTeam, winner);
  const disabled = !canNavigateToBracketGame(game);
  const statusLabel = getStatusLabel(game);
  const isChampionship = side === "center" && game.round === "CHAMPIONSHIP";
  const borderColor = isLive
    ? isDark
      ? Colors.dark.lightRed
      : Colors.light.red
    : undefined;

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      disabled={disabled}
      accessibilityRole={disabled ? "text" : "button"}
      accessibilityState={{ disabled }}
      accessibilityLabel={getAccessibilityLabel(game, allGamesById)}
      onPress={() => onPress?.(game)}
      style={[
        styles.matchupCard,
        isChampionship ? styles.championshipCard : null,
        disabled ? styles.cardDisabled : null,
        compact ? styles.matchupCardCompact : null,
        borderColor ? { borderColor } : null,
        style,
      ]}
    >
      <BracketTeamRow
        game={game}
        team={game.topTeam}
        position="top"
        isDark={isDark}
        competition={competition}
        allGamesById={allGamesById}
        isWinner={isFinal && topWins}
        isLoser={isFinal && Boolean(winner) && !topWins}
      />

      <View style={styles.divider} />

      <BracketTeamRow
        game={game}
        team={game.bottomTeam}
        position="bottom"
        isDark={isDark}
        competition={competition}
        allGamesById={allGamesById}
        isWinner={isFinal && bottomWins}
        isLoser={isFinal && Boolean(winner) && !bottomWins}
      />

      <View style={styles.cardFooter}>
        <Text
          numberOfLines={1}
          style={[styles.statusText, isLive ? styles.liveText : null]}
          selectable
        >
          {statusLabel}
        </Text>
        {game.broadcast && !compact ? (
          <Text numberOfLines={1} style={styles.broadcastText} selectable>
            {game.broadcast}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export const BracketMatchup = memo(BracketMatchupComponent);
