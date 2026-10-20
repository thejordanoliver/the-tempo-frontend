import { CustomHeader } from "@/components/CustomHeader";
import LatestGame from "@/components/Player/LatestGame";
import PlayerAwardList from "@/components/Player/PlayerAwardList";
import PlayerHeader from "components/Player/PlayerHeader";
import PlayerStatTable from "@/components/Sports/Basketball/Player/PlayerStatTable";
import SeasonStatCard from "@/components/Sports/Basketball/Player/SeasonStatCard";
import { getNBATeam, getNBATeamLogo } from "@/constants/teams";
import { getWCBBTeam, getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { getWNBATeam, getWNBATeamLogo } from "@/constants/teamsWNBA";
import {
  BasketballLeague,
  usePlayerSeasons,
} from "@/hooks/BasketballHooks/usePlayerSeasons";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import PlayerDetailsPager from "components/Player/PlayerDetailsPager";
import PlayerGameLog from "components/Player/PlayerGameLog";
import { Colors, globalStyles } from "constants/styles";
import { getMCBBTeam, getMCBBTeamLogo } from "constants/teamsMCBB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePlayerClosestGame } from "hooks/LeagueHooks/usePlayerClosestGame";
import { usePlayerGameLog } from "hooks/LeagueHooks/usePlayerGameLog";
import { useLayoutEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import type { BasketballGame } from "types/basketball/basketball";

const BASKETBALL_LEAGUES = new Set<BasketballLeague>([
  "nba",
  "wnba",
  "mcbb",
  "wcbb",
]);

function normalizeBasketballLeague(league: unknown): BasketballLeague {
  const normalized = String(league ?? "")
    .trim()
    .toLowerCase();
  return BASKETBALL_LEAGUES.has(normalized as BasketballLeague)
    ? (normalized as BasketballLeague)
    : "nba";
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
  const requestedPlayerId = Number(id);
  const requestedLeague = normalizeBasketballLeague(league);

  const {
    player: statsPlayer,
    seasons,
    collegeSeasons,
    seasonsLoading,
    seasonsError,
    currentSeasonRankings,
  } = usePlayerSeasons(requestedPlayerId, requestedLeague);

  const { player, loading, error, resolvedPlayerId: playerId, resolvedLeague: profileLeague } =
    usePlayerById(requestedPlayerId, requestedLeague);
  const playerLeague = normalizeBasketballLeague(profileLeague);
  const isNBA = playerLeague === "nba";
  const isWNBA = playerLeague === "wnba";
  const isMCBB = playerLeague === "mcbb";
  const isWCBB = playerLeague === "wcbb";
  const hasPlayerGameLog = isNBA || isMCBB || isWCBB;

  const currentTeamId = useMemo(() => {
    const profileTeamId = player?.team_id;

    if (profileTeamId !== null && profileTeamId !== undefined) {
      return String(profileTeamId);
    }

    const statsTeamId = statsPlayer?.team_id;

    if (statsTeamId !== null && statsTeamId !== undefined) {
      return String(statsTeamId);
    }

    return routeTeamId ? String(routeTeamId) : "";
  }, [player?.team_id, routeTeamId, statsPlayer?.team_id]);

  const team = useMemo(() => {
    if (!currentTeamId) return null;

    if (isNBA) {
      return getNBATeam(currentTeamId);
    }

    if (isWNBA) {
      return getWNBATeam(currentTeamId);
    }

    if (isWCBB) {
      return getWCBBTeam(currentTeamId) ?? getWCBBTeam(currentTeamId);
    }

    return getMCBBTeam(currentTeamId) ?? getMCBBTeam(currentTeamId);
  }, [currentTeamId, isNBA, isWCBB, isWNBA]);

  const teamLogo = useMemo(() => {
    const logoTeamId = team?.id ?? currentTeamId;

    if (!logoTeamId) return undefined;

    if (isNBA) return getNBATeamLogo(logoTeamId, isDark);
    if (isWNBA) return getWNBATeamLogo(logoTeamId, isDark);
    if (isWCBB) return getWCBBTeamLogo(logoTeamId, isDark);
    return getMCBBTeamLogo(logoTeamId, isDark);
  }, [currentTeamId, isDark, isNBA, isWCBB, isWNBA, team?.id]);

  const teamColor = team?.primaryColor ?? Colors.midTone;
  const isActive = player?.active === true;
  const resolvedTeamId = team?.id != null ? String(team.id) : currentTeamId;

  const gameLogPlayerId = hasPlayerGameLog ? (playerId ?? "") : "";
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
    game: playerGame,
    loading: playerGameLoading,
    error: playerGameError,
  } = usePlayerClosestGame<BasketballGame>(
    "basketball",
    playerLeague,
    resolvedTeamId,
  );

  const game = playerGame;
  const gameLoading = playerGameLoading;
  const gameError = playerGameError;

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

  if (screenLoading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>
          {error || "Couldn’t load player"}
        </Text>
      </View>
    );

  if (!player)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Player not found</Text>
      </View>
    );

  const pages = [
    {
      label: "Career Stats",
      content: (
        <PlayerStatTable
          seasons={seasons}
          collegeSeasons={collegeSeasons}
          loading={seasonsLoading}
          error={seasonsError}
          league={playerLeague}
        />
      ),
    },
    ...(hasPlayerGameLog && playerId
      ? [
          {
            label: "Game Log",
            content: (
              <PlayerGameLog
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
        ]
      : []),
    ...(!isMCBB && !isWCBB
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
      key={`${playerLeague}:${playerId}`}
      pages={pages}
      isDark={isDark}
      overview={
        <>
          <PlayerHeader
            sport="basketball"
            player={player}
            isDark={isDark}
            league={playerLeague}
          />
          <SeasonStatCard
            seasons={seasons}
            loading={seasonsLoading}
            error={seasonsError}
            league={playerLeague}
            isActive={isActive}
            rankings={currentSeasonRankings}
            teamColor={teamColor}
          />
          {(hasPlayerGameLog && playerId) ||
          (isActive && resolvedTeamId) ? (
            <LatestGame
              game={game}
              loading={gameLoading}
              error={gameError}
              isDark={isDark}
              league={playerLeague}
              isNBA={isNBA}
              isMCBB={isMCBB}
              isWCBB={isWCBB}
              isWNBA={isWNBA}
            />
          ) : null}
        </>
      }
    />
  );
}
