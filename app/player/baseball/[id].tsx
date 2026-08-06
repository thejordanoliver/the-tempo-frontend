import { CustomHeader } from "@/components/CustomHeader";
import SeasonStatCard from "@/components/Sports/Baseball/Player/SeasonStatCard";
import LatestGame from "@/components/Sports/Basketball/Player/LatestGame";
import {
  BaseballPlayerSeason,
  useBaseballPlayerSeasons,
} from "@/hooks/BaseballHooks/usePlayerSeasons";
import { useTeamLatestGame } from "@/hooks/BaseballHooks/useTeamLatestGame";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import PlayerHeader from "components/Sports/Baseball/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/Baseball/Player/PlayerStatTable";
import { Colors, globalStyles } from "constants/styles";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

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
  const { id, teamId, league } = useLocalSearchParams<{
    id: string;
    teamId: string;
    league: any;
  }>();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerScreenStyles;
  const global = globalStyles(isDark);
  const playerId = Number(id);
  const team = getMLBTeam(teamId);
  const teamLogo = getMLBTeamLogo(teamId, true);
  const teamColor = team?.color ?? Colors.midTone;

  const {
    player,
    loading: playerLoading,
    error: playerError,
  } = usePlayerById(playerId, league);

  const {
    data: seasons,
    loading: seasonsLoading,
    error: seasonsError,
  } = useBaseballPlayerSeasons(playerId, league);

  const latestSeason = useMemo(() => {
    return getLatestPlayerSeason(seasons);
  }, [seasons]);

  const {
    game,
    loading: gameLoading,
    error: gameError,
  } = useTeamLatestGame(league, teamId);

  // -------------------------
  // Header
  // -------------------------
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

  if (playerLoading || !player || gameLoading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (playerError || !player)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{playerError}</Text>
      </View>
    );
  /* -------------------------
     Render
  ------------------------- */
  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <PlayerHeader player={player} isDark={isDark} />

      <SeasonStatCard
        season={latestSeason}
        loading={seasonsLoading}
        error={seasonsError}
        player={player}
      />

      <LatestGame
        game={game}
        loading={gameLoading}
        error={gameError}
        isDark={isDark}
        league={league}
      />

      <PlayerStatTable
        data={seasons}
        loading={seasonsLoading}
        error={seasonsError}
        position={player.position}
        league={league}
      />
    </ScrollView>
  );
}
