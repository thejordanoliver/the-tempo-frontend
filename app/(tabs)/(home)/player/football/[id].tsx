import { CustomHeader } from "@/components/CustomHeader";
import LatestGame from "@/components/Player/LatestGame";
import PlayerAwardList from "@/components/Player/PlayerAwardList";
import SeasonStatCard from "@/components/Sports/Football/Player/SeasonStatCard";
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
import {
  FootballPlayerSeason,
  usePlayerSeasons,
} from "@/hooks/FootballHooks/usePlayerSeasons";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import PlayerDetailsPager from "components/Player/PlayerDetailsPager";
import PlayerGameLog from "components/Player/PlayerGameLog";
import PlayerHeader from "components/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/Football/Player/PlayerStatTable";
import { Colors, globalStyles } from "constants/styles";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePlayerClosestGame } from "hooks/LeagueHooks/usePlayerClosestGame";
import type { FootballGame } from "types/football/football";
import { usePlayerGameLog } from "hooks/LeagueHooks/usePlayerGameLog";
import { useLayoutEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

type FootballRouteLeague = "nfl" | "cfb";

function getSeasonNumber(season: FootballPlayerSeason) {
  const rawSeason = season.season ?? season.year ?? season.displaySeason;
  const parsed = Number(rawSeason);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const match = String(rawSeason ?? "").match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function getLatestPlayerSeason(seasons: FootballPlayerSeason[]) {
  if (!seasons.length) {
    return null;
  }

  const regularSeasonRows = seasons.filter(
    (season) => season.seasonType !== "postseason",
  );

  const rowsToUse = regularSeasonRows.length > 0 ? regularSeasonRows : seasons;

  return [...rowsToUse].sort((a, b) => {
    const seasonCompare = getSeasonNumber(b) - getSeasonNumber(a);
    if (seasonCompare !== 0) {
      return seasonCompare;
    }

    return String(a.teamId).localeCompare(String(b.teamId));
  })[0];
}

function normalizeFootballLeague(league: unknown): FootballRouteLeague {
  return String(league).toLowerCase() === "nfl" ? "nfl" : "cfb";
}

export default function PlayerDetailScreen() {
  const {
    id,
    teamId: routeTeamId,
    league,
  } = useLocalSearchParams<{
    id?: string;
    teamId?: string;
    league?: string;
  }>();

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const navigation = useNavigation();
  const requestedLeague = normalizeFootballLeague(league);
  const requestedPlayerId = Number(id);
  const {
    data,
    collegeData,
    player: statsPlayer,
    loading: seasonsLoading,
    error: seasonsError,
    currentSeasonRankings,
  } = usePlayerSeasons(requestedPlayerId, requestedLeague);

  const { player, loading, error, resolvedPlayerId: playerId, resolvedLeague: profileLeague } =
    usePlayerById(requestedPlayerId, requestedLeague);
  const playerLeague: FootballRouteLeague = normalizeFootballLeague(profileLeague);
  const isNFL = playerLeague === "nfl";
  const isCFB = playerLeague === "cfb";
  const currentTeamId = useMemo(() => {
    const profileTeamId = player?.team_id;

    if (profileTeamId !== null && profileTeamId !== undefined) {
      return String(profileTeamId);
    }

    if (statsPlayer?.teamId !== null && statsPlayer?.teamId !== undefined) {
      return String(statsPlayer.teamId);
    }

    if (routeTeamId) {
      return String(routeTeamId);
    }

    return "";
  }, [player?.team_id, routeTeamId, statsPlayer]);

  const team = useMemo(() => {
    if (!currentTeamId) {
      return null;
    }

    return isNFL ? getNFLTeam(currentTeamId) : getCFBTeam(currentTeamId);
  }, [currentTeamId, isNFL]);

  const teamColor = team?.primaryColor ?? Colors.midTone;
  const teamId = team?.id != null ? String(team.id) : currentTeamId;
  const teamLogo = useMemo(() => {
    return isNFL ? getNFLTeamLogo(teamId, true) : getCFBTeamLogo(teamId, true);
  }, [teamId, isNFL]);

  const gameLogPlayerId = playerId ?? "";
  const gameLogPlayerKey = `${playerLeague}:${gameLogPlayerId}`;
  const [gameLogSelection, setGameLogSelection] = useState<{
    playerKey: string;
    season: string;
  } | null>(null);
  const selectedGameLogSeason =
    gameLogSelection?.playerKey === gameLogPlayerKey
      ? gameLogSelection.season
      : null;
  const latestGameLog = usePlayerGameLog(gameLogPlayerId, playerLeague);
  const needsSeasonLog =
    selectedGameLogSeason !== null &&
    selectedGameLogSeason !== String(latestGameLog.data?.season);
  const seasonGameLog = usePlayerGameLog(
    needsSeasonLog ? gameLogPlayerId : "",
    playerLeague,
    selectedGameLogSeason,
  );
  const tableGameLog = needsSeasonLog ? seasonGameLog : latestGameLog;
  const {
    game,
    loading: latestGameLoading,
    error: latestGameError,
  } = usePlayerClosestGame<FootballGame>("football", playerLeague, teamId);
  const gameLoading = latestGameLoading;
  const gameError = latestGameError;
  const latestSeason = useMemo(() => {
    return getLatestPlayerSeason(data);
  }, [data]);

  const isActive = player?.active === true;

  const screenLoading = loading || seasonsLoading || latestGameLog.loading;

  useLayoutEffect(() => {
    if (screenLoading) {
      navigation.setOptions({ header: () => null });
      return;
    }

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
  }, [navigation, teamLogo, teamColor, screenLoading]);

  if (screenLoading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>
          {error || "Couldn’t load player"}
        </Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Player not found</Text>
      </View>
    );
  }

  const pages = [
    {
      label: "Career Stats",
      content: (
        <PlayerStatTable
          data={data}
          collegeData={collegeData}
          loading={seasonsLoading}
          error={seasonsError}
          position={player.position}
          league={playerLeague}
        />
      ),
    },
    {
      label: "Game Log",
      content: (
        <PlayerGameLog
          sport="football"
          league={playerLeague}
          data={tableGameLog.data}
          filterData={latestGameLog.data}
          selectedSeason={selectedGameLogSeason}
          loading={tableGameLog.loading}
          error={tableGameLog.error}
          onSeasonChange={(season) =>
            setGameLogSelection({ playerKey: gameLogPlayerKey, season })
          }
          onRetry={tableGameLog.refetch}
        />
      ),
    },
    ...(isNFL
      ? [
          {
            label: "Awards",
            content: player.awards?.length ? (
              <PlayerAwardList player={player} />
            ) : (
              <View style={global.emptyContainer}>
                <Text style={global.emptyText}>No awards available</Text>
              </View>
            ),
          },
        ]
      : []),
  ];

  return (
    <PlayerDetailsPager
      key={gameLogPlayerKey}
      pages={pages}
      isDark={isDark}
      overview={
        <>
          <PlayerHeader sport="football" player={player} isDark={isDark} league={playerLeague} />
          <SeasonStatCard
            season={latestSeason}
            loading={seasonsLoading}
            error={seasonsError}
            player={player}
            isActive={isActive}
            rankings={currentSeasonRankings}
            teamColor={teamColor}
          />
          {playerId ? (
            <LatestGame
              game={game}
              loading={gameLoading}
              error={gameError}
              isDark={isDark}
              league={playerLeague}
              isNFL={isNFL}
              isCFB={isCFB}
            />
          ) : null}
        </>
      }
    />
  );
}
