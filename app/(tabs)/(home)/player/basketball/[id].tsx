import { CustomHeader } from "@/components/CustomHeader";
import LatestGame from "@/components/Player/LatestGame";
import PlayerAwardList from "@/components/Sports/Basketball/Player/PlayerAwardList";
import PlayerHeader from "@/components/Sports/Basketball/Player/PlayerHeader";
import PlayerStatTable from "@/components/Sports/Basketball/Player/PlayerStatTable";
import SeasonStatCard from "@/components/Sports/Basketball/Player/SeasonStatCard";
import { getNBATeam, getNBATeamLogo, getTeamByESPNId } from "@/constants/teams";
import {
  getWCBBTeam,
  getWCBBTeamByESPNId,
  getWCBBTeamLogo,
} from "@/constants/teamsWCBB";
import {
  getWNBATeam,
  getWNBATeamByESPNId,
  getWNBATeamLogo,
} from "@/constants/teamsWNBA";
import {
  BasketballLeague,
  usePlayerSeasons,
} from "@/hooks/BasketballHooks/usePlayerSeasons";
import { useTeamLatestGame } from "@/hooks/BasketballHooks/useTeamLatestGame";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import PlayerDetailsPager from "components/Player/PlayerDetailsPager";
import PlayerGameLog from "components/Player/PlayerGameLog";
import { Colors, globalStyles } from "constants/styles";
import {
  getMCBBTeam,
  getMCBBTeamByESPNId,
  getMCBBTeamLogo,
} from "constants/teamsMCBB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePlayerLatestGame } from "hooks/BasketballHooks/usePlayerLatestGame";
import { usePlayerGameLog } from "hooks/LeagueHooks/usePlayerGameLog";
import { useLayoutEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

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
    resolvedLeague,
    canonicalProfile,
    seasonsLoading,
    seasonsError,
    currentSeasonRankings,
  } = usePlayerSeasons(requestedPlayerId, requestedLeague);

  const canonicalPlayerId = useMemo(() => {
    const isCollegeRequest =
      requestedLeague === "mcbb" || requestedLeague === "wcbb";
    const resolvedId =
      canonicalProfile?.playerId ??
      (!isCollegeRequest ? requestedPlayerId : undefined);

    if (resolvedId === undefined) return undefined;

    const parsed = Number(resolvedId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }, [canonicalProfile?.playerId, requestedLeague, requestedPlayerId]);

  const canonicalLeague = canonicalProfile?.league ?? resolvedLeague;
  const isNBA = canonicalLeague === "nba";
  const isWNBA = canonicalLeague === "wnba";
  const isMCBB = canonicalLeague === "mcbb";
  const isWCBB = canonicalLeague === "wcbb";
  const hasPlayerGameLog = isNBA || isMCBB || isWCBB;

  const { player, loading, error } = usePlayerById(
    canonicalPlayerId,
    canonicalLeague,
    (requestedLeague !== "mcbb" && requestedLeague !== "wcbb") ||
      Boolean(canonicalProfile),
  );

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
      return getNBATeam(currentTeamId) ?? getTeamByESPNId(currentTeamId);
    }

    if (isWNBA) {
      return getWNBATeam(currentTeamId) ?? getWNBATeamByESPNId(currentTeamId);
    }

    if (isWCBB) {
      return getWCBBTeam(currentTeamId) ?? getWCBBTeamByESPNId(currentTeamId);
    }

    return getMCBBTeam(currentTeamId) ?? getMCBBTeamByESPNId(currentTeamId);
  }, [currentTeamId, isNBA, isWCBB, isWNBA]);

  const teamLogo = useMemo(() => {
    const logoTeamId = team?.id ?? currentTeamId;

    if (!logoTeamId) return undefined;

    if (isNBA) return getNBATeamLogo(logoTeamId, isDark);
    if (isWNBA) return getWNBATeamLogo(logoTeamId, isDark);
    if (isWCBB) return getWCBBTeamLogo(logoTeamId, isDark);
    return getMCBBTeamLogo(logoTeamId, isDark);
  }, [currentTeamId, isDark, isNBA, isWCBB, isWNBA, team?.id]);

  const teamColor = team?.color ?? Colors.midTone;
  const isActive = player?.active === true;
  const resolvedTeamId = team?.id != null ? String(team.id) : currentTeamId;

  const {
    game: teamGame,
    loading: teamGameLoading,
    error: teamGameError,
  } = useTeamLatestGame(
    canonicalLeague,
    hasPlayerGameLog ? null : resolvedTeamId,
  );

  const gameLogPlayerId = hasPlayerGameLog ? (canonicalPlayerId ?? "") : "";
  const gameLogPlayerKey = `${canonicalLeague}:${gameLogPlayerId}`;
  const [gameLogSelection, setGameLogSelection] = useState<{
    playerKey: string;
    season: string;
  } | null>(null);
  const selectedGameLogSeason =
    gameLogSelection?.playerKey === gameLogPlayerKey
      ? gameLogSelection.season
      : null;
  const latestGameLog = usePlayerGameLog(gameLogPlayerId, canonicalLeague);
  // Share the initial log; request another season only when the dropdown changes.
  const needsSeasonLog =
    selectedGameLogSeason !== null &&
    selectedGameLogSeason !== String(latestGameLog.data?.season);
  const seasonGameLog = usePlayerGameLog(
    needsSeasonLog ? gameLogPlayerId : "",
    canonicalLeague,
    selectedGameLogSeason,
  );
  const tableGameLog = needsSeasonLog ? seasonGameLog : latestGameLog;

  const {
    game: playerGame,
    loading: playerGameLoading,
    error: playerGameError,
  } = usePlayerLatestGame(latestGameLog.data, canonicalLeague);

  const game = hasPlayerGameLog ? playerGame : teamGame;
  const gameLoading = hasPlayerGameLog
    ? latestGameLog.loading || playerGameLoading
    : teamGameLoading;
  const gameError = hasPlayerGameLog
    ? latestGameLog.error || playerGameError
    : teamGameError;

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

  if (seasonsLoading || loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (seasonsError || error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>
          {seasonsError || error || "Failed to load player"}
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
          league={canonicalLeague}
        />
      ),
    },
    ...(hasPlayerGameLog && canonicalPlayerId
      ? [
          {
            label: "Game Log",
            content: (
              <PlayerGameLog
                league={canonicalLeague}
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
      key={`${canonicalLeague}:${canonicalPlayerId}`}
      pages={pages}
      isDark={isDark}
      overview={
        <>
          <PlayerHeader
            player={player}
            isDark={isDark}
            league={canonicalLeague}
          />
          <SeasonStatCard
            seasons={seasons}
            loading={seasonsLoading}
            error={seasonsError}
            league={canonicalLeague}
            isActive={isActive}
            rankings={currentSeasonRankings}
            teamColor={teamColor}
          />
          {(hasPlayerGameLog && canonicalPlayerId) ||
          (isActive && resolvedTeamId) ? (
            <LatestGame
              game={game}
              loading={gameLoading}
              error={gameError}
              isDark={isDark}
              league={canonicalLeague}
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
