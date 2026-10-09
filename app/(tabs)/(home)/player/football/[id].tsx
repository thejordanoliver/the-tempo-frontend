import { CustomHeader } from "@/components/CustomHeader";
import LatestGame from "@/components/Player/LatestGame";
import PlayerAwardList from "@/components/Sports/Basketball/Player/PlayerAwardList";
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
import PlayerHeader from "components/Sports/Football/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/Football/Player/PlayerStatTable";
import { Colors, globalStyles } from "constants/styles";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePlayerLatestGame } from "hooks/FootballHooks/usePlayerLatestGame";
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

  /**
   * =========================================
   * REQUESTED PLAYER
   * =========================================
   *
   * This is the league/id that came from the URL.
   *
   * Example:
   *
   * /player/football/4430841?league=cfb
   *
   * may later resolve to NFL.
   */

  const requestedLeague = normalizeFootballLeague(league);

  const requestedPlayerId = Number(id);

  /**
   * =========================================
   * PLAYER STATS + CANONICAL RESOLUTION
   * =========================================
   *
   * This request happens first because the backend
   * can tell us whether a CFB player should actually
   * resolve to an NFL profile.
   */

  const {
    data,
    collegeData,
    player: statsPlayer,
    resolvedLeague,
    canonicalProfile,
    loading: seasonsLoading,
    error: seasonsError,
    currentSeasonRankings,
  } = usePlayerSeasons(requestedPlayerId, requestedLeague);

  /**
   * =========================================
   * CANONICAL PLAYER ID
   * =========================================
   *
   * Example:
   *
   * requested:
   * CFB Carson Beck
   *
   * resolved:
   * NFL Carson Beck
   */

  const canonicalPlayerId = useMemo(() => {
    const resolvedId =
      canonicalProfile?.playerId ??
      (requestedLeague === "nfl" ? requestedPlayerId : undefined);

    if (resolvedId === undefined) {
      return undefined;
    }

    const parsed = Number(resolvedId);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }, [canonicalProfile?.playerId, requestedLeague, requestedPlayerId]);

  /**
   * =========================================
   * CANONICAL LEAGUE
   * =========================================
   */

  const canonicalLeague: FootballRouteLeague = canonicalProfile
    ? canonicalProfile.league
    : resolvedLeague;

  const isNFL = canonicalLeague === "nfl";

  const isCFB = canonicalLeague === "cfb";

  /**
   * =========================================
   * CANONICAL PLAYER PROFILE
   * =========================================
   *
   * IMPORTANT:
   *
   * We fetch the player AFTER canonical resolution.
   *
   * That means a player who has become an NFL player
   * will use nfl_players rather than cfb_players.
   */

  const { player, loading, error } = usePlayerById(
    canonicalPlayerId,
    canonicalLeague,
    requestedLeague === "nfl" || Boolean(canonicalProfile),
  );

  /**
   * =========================================
   * CURRENT TEAM
   * =========================================
   *
   * Prefer the canonical pro player's current team.
   *
   * Fall back to:
   *
   * 1. stats response team
   * 2. route team ID
   */

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
  }, [player?.team_id, routeTeamId, statsPlayer?.teamId]);

  /**
   * =========================================
   * TEAM
   * =========================================
   */

  const team = useMemo(() => {
    if (!currentTeamId) {
      return null;
    }

    return isNFL ? getNFLTeam(currentTeamId) : getCFBTeam(currentTeamId);
  }, [currentTeamId, isNFL]);

  const teamColor = team?.color ?? Colors.midTone;
  const teamId = team?.id != null ? String(team.id) : currentTeamId;

  const teamLogo = useMemo(() => {
    return isNFL ? getNFLTeamLogo(teamId, true) : getCFBTeamLogo(teamId, true);
  }, [teamId, isNFL]);

  const gameLogPlayerId = canonicalPlayerId ?? "";
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
    game,
    loading: latestGameLoading,
    error: latestGameError,
  } = usePlayerLatestGame(latestGameLog.data, canonicalLeague);
  const gameLoading = latestGameLog.loading || latestGameLoading;
  const gameError = latestGameLog.error || latestGameError;

  /**
   * =========================================
   * LATEST CURRENT-LEAGUE SEASON
   * =========================================
   *
   * IMPORTANT:
   *
   * Use `data`, NOT `rawSeasons`.
   *
   * data = FootballPlayerSeason[]
   * rawSeasons = ApiSeason[]
   */

  const latestSeason = useMemo(() => {
    return getLatestPlayerSeason(data);
  }, [data]);

  /**
   * =========================================
   * ACTIVE STATUS
   * =========================================
   */

  const isActive = player?.active === true;

  /**
   * =========================================
   * HEADER
   * =========================================
   */

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

  /**
   * =========================================
   * LOADING
   * =========================================
   *
   * Wait for canonical resolution before rendering
   * the profile.
   *
   * This avoids briefly showing the CFB profile
   * before switching to NFL.
   */

  if (seasonsLoading || loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  /**
   * =========================================
   * ERROR
   * =========================================
   */

  if (seasonsError || error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>
          {seasonsError || error || "Failed to load player"}
        </Text>
      </View>
    );
  }

  /**
   * =========================================
   * PLAYER NOT FOUND
   * =========================================
   */

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
          league={canonicalLeague}
        />
      ),
    },
    {
      label: "Game Log",
      content: (
        <PlayerGameLog
          sport="football"
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
          <PlayerHeader player={player} isDark={isDark} isCFB={isCFB} />
          <SeasonStatCard
            season={latestSeason}
            loading={seasonsLoading}
            error={seasonsError}
            player={player}
            isActive={isActive}
            rankings={currentSeasonRankings}
            teamColor={teamColor}
          />
          {canonicalPlayerId ? (
            <LatestGame
              game={game}
              loading={gameLoading}
              error={gameError}
              isDark={isDark}
              league={canonicalLeague}
              isNFL={isNFL}
              isCFB={isCFB}
            />
          ) : null}
        </>
      }
    />
  );
}
