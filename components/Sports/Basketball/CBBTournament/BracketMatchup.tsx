import { Colors, activeOpacity } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { router } from "expo-router";
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
  getRenderableBracketTeam,
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
  const displayTeam = getRenderableBracketTeam(team);

  if (!displayTeam) {
    return gameById
      ? getBracketPositionLabel(game, position, gameById)
      : `${position === "top" ? "Top" : "Bottom"} team to be determined`;
  }

  const seed =
    displayTeam.seed !== null && displayTeam.seed !== undefined
      ? `${displayTeam.seed} seed `
      : "";
  const hasValidScore =
    displayTeam.score === null ||
    displayTeam.score === undefined ||
    displayTeam.score === ""
      ? false
      : Number.isFinite(Number(displayTeam.score));
  const score = hasValidScore ? ` ${displayTeam.score}` : "";

  return `${seed}${getBracketTeamDisplayName(displayTeam)}${score}`;
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
  const displayTeam = getRenderableBracketTeam(team);
  const displayWinner = getRenderableBracketTeam(winner);

  if (!displayTeam || !displayWinner) return false;

  const teamIds = [displayTeam.id, displayTeam.espnId]
    .filter((value) => value !== null && value !== undefined)
    .map(String);
  const winnerIds = [displayWinner.id, displayWinner.espnId]
    .filter((value) => value !== null && value !== undefined)
    .map(String);

  return teamIds.some((teamId) => winnerIds.includes(teamId));
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
  const handlePress = () => {
    if (onPress) {
      onPress(game);
      return;
    }

    router.push({
      pathname: "/game/basketball/[game]",
      params: {
        game: String(game.id),
        leagueId: String(competition),
        data: encodeURIComponent(JSON.stringify(game)),
      },
    });
  };

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => tournamentBracketStyles(isDark), [isDark]);
  const isFinal = isFinalBracketGame(game);
  const isLive = isLiveBracketGame(game);
  const winner = getWinningTeam(game);
  const topTeam = getRenderableBracketTeam(game.topTeam);
  const bottomTeam = getRenderableBracketTeam(game.bottomTeam);
  const topWins = teamMatches(topTeam, winner);
  const bottomWins = teamMatches(bottomTeam, winner);
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
      onPress={handlePress}
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
        team={topTeam}
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
        team={bottomTeam}
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
