import { CustomHeader } from "@/components/CustomHeader";
import LatestGame from "@/components/Player/LatestGame";
import SeasonStatCard from "@/components/Sports/Baseball/Player/SeasonStatCard";
import {
  BaseballPlayerSeason,
  useBaseballPlayerSeasons,
} from "@/hooks/BaseballHooks/usePlayerSeasons";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import PlayerDetailsPager from "components/Player/PlayerDetailsPager";
import PlayerGameLog from "components/Player/PlayerGameLog";
import PlayerHeader from "components/Sports/Baseball/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/Baseball/Player/PlayerStatTable";
import { Colors, globalStyles } from "constants/styles";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePlayerLatestGame } from "hooks/BaseballHooks/usePlayerLatestGame";
import { usePlayerGameLog } from "hooks/LeagueHooks/usePlayerGameLog";
import { useLayoutEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

function getSeasonNumber(season: BaseballPlayerSeason) {
  const rawSeason = season.season ?? season.year ?? season.displaySeason;
  const parsed = Number(rawSeason);

  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const match = String(rawSeason ?? "").match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function getLatestPlayerSeason(seasons: BaseballPlayerSeason[]) {
  if (!seasons.length) {
    return null;
  }

  const regularSeasonRows = seasons.filter(
    (season) => season.seasonType !== "postseason",
  );

  const rowsToUse = regularSeasonRows.length ? regularSeasonRows : seasons;

  return [...rowsToUse].sort((a, b) => {
    const seasonCompare = getSeasonNumber(b) - getSeasonNumber(a);

    if (seasonCompare !== 0) {
      return seasonCompare;
    }

    return String(a.teamId).localeCompare(String(b.teamId));
  })[0];
}

export default function PlayerDetailScreen() {
  const {
    id,
    teamId,
    league = "mlb",
  } = useLocalSearchParams<{
    id: string;
    teamId: string;
    league?: "mlb";
  }>();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const playerId = Number(id);

  const { player, loading, error } = usePlayerById(playerId, league);
  const position = String(
    player?.position?.abbreviation ??
      player?.position?.name ??
      player?.position ??
      "",
  )
    .trim()
    .toUpperCase();
  const isActive = player?.active === true;

  const currentTeamId =
    player?.team_id != null
      ? String(player.team_id)
      : teamId
        ? String(teamId)
        : undefined;
  const team = currentTeamId ? getMLBTeam(currentTeamId) : undefined;
  const teamLogo = getMLBTeamLogo(currentTeamId, true);
  const teamColor = team?.color ?? Colors.midTone;

  const {
    data: seasons,
    loading: seasonsLoading,
    error: seasonsError,
    currentSeasonRankings,
  } = useBaseballPlayerSeasons(playerId, league);

  const latestSeason = useMemo(() => {
    return getLatestPlayerSeason(seasons);
  }, [seasons]);

  const gameLogPlayerKey = `${league}:${playerId}`;
  const [gameLogSelection, setGameLogSelection] = useState<{
    playerKey: string;
    season: string | null;
    category: string | null;
  } | null>(null);
  const latestGameLog = usePlayerGameLog(playerId, league);
  const currentSelection =
    gameLogSelection?.playerKey === gameLogPlayerKey ? gameLogSelection : null;
  const selectedSeason = currentSelection?.season ?? null;
  const selectedCategory =
    currentSelection?.category ?? latestGameLog.data?.category ?? null;
  const needsFilteredLog =
    (selectedSeason !== null &&
      selectedSeason !== String(latestGameLog.data?.season)) ||
    selectedCategory !== (latestGameLog.data?.category ?? null);
  const filteredGameLog = usePlayerGameLog(
    needsFilteredLog ? playerId : "",
    league,
    selectedSeason ??
      (latestGameLog.data ? String(latestGameLog.data.season) : null),
    selectedCategory,
  );
  const tableGameLog = needsFilteredLog ? filteredGameLog : latestGameLog;
  const {
    game,
    loading: latestGameLoading,
    error: latestGameError,
  } = usePlayerLatestGame(latestGameLog.data, league);
  const gameLoading = latestGameLog.loading || latestGameLoading;
  const gameError = latestGameLog.error || latestGameError;

  /* ---------------- Header ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          logo={teamLogo}
          teamColor={teamColor}
          onBack={() => navigation.goBack()}
          isTeamScreen
          isPlayerScreen
        />
      ),
    });
  }, [navigation, teamLogo, teamColor]);

  if (loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (error || !player)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );
  /* -------------------------
     Render
  ------------------------- */
  const pages = [
    {
      label: "Career Stats",
      content: (
        <PlayerStatTable
          data={seasons}
          loading={seasonsLoading}
          error={seasonsError}
          position={player.position}
          league={league}
        />
      ),
    },
    {
      label: "Game Log",
      content: (
        <PlayerGameLog
          sport="baseball"
          league={league}
          data={tableGameLog.data}
          filterData={latestGameLog.data}
          selectedSeason={selectedSeason}
          selectedCategory={selectedCategory}
          loading={tableGameLog.loading}
          error={tableGameLog.error}
          onSeasonChange={(season) =>
            setGameLogSelection({
              playerKey: gameLogPlayerKey,
              season,
              category: selectedCategory,
            })
          }
          onCategoryChange={(category) =>
            setGameLogSelection({
              playerKey: gameLogPlayerKey,
              season: selectedSeason,
              category,
            })
          }
          onRetry={tableGameLog.refetch}
        />
      ),
    },
  ];

  return (
    <PlayerDetailsPager
      key={gameLogPlayerKey}
      pages={pages}
      isDark={isDark}
      overview={
        <>
          <PlayerHeader player={player} isDark={isDark} />
          <SeasonStatCard
            season={latestSeason}
            loading={seasonsLoading}
            error={seasonsError}
            position={position}
            isActive={isActive}
            rankings={currentSeasonRankings}
            teamColor={teamColor}
          />
          <LatestGame
            game={game}
            loading={gameLoading}
            error={gameError}
            isDark={isDark}
            league={league}
          />
        </>
      }
    />
  );
}
