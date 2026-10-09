import { CustomHeader } from "@/components/CustomHeader";
import LatestGame from "@/components/Player/LatestGame";
import PlayerStatTable from "@/components/Sports/Hockey/Player/PlayerStatTable";
import { usePlayerSeasons } from "@/hooks/HockeyHooks/usePlayerSeasons";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import PlayerDetailsPager from "components/Player/PlayerDetailsPager";
import PlayerGameLog from "components/Player/PlayerGameLog";
import PlayerHeader from "components/Sports/Baseball/Player/PlayerHeader";
import { Colors, globalStyles } from "constants/styles";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePlayerLatestGame } from "hooks/HockeyHooks/usePlayerLatestGame";
import { usePlayerGameLog } from "hooks/LeagueHooks/usePlayerGameLog";
import { useLayoutEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

export default function PlayerDetailScreen() {
  const {
    id,
    teamId,
    league = "nhl",
  } = useLocalSearchParams<{
    id?: string;
    teamId: string;
    league?: "nhl";
  }>();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const navigation = useNavigation();
  const playerId = Number(id);
  const { player, loading, error } = usePlayerById(playerId, league);
  const currentTeamId =
    player?.team_id != null
      ? String(player.team_id)
      : teamId
        ? String(teamId)
        : undefined;

  const { seasons, seasonsLoading, seasonsError } = usePlayerSeasons(
    playerId,
    league,
  );

  const gameLogPlayerKey = `${league}:${playerId}`;
  const [gameLogSelection, setGameLogSelection] = useState<{
    playerKey: string;
    season: string;
  } | null>(null);
  const selectedSeason =
    gameLogSelection?.playerKey === gameLogPlayerKey
      ? gameLogSelection.season
      : null;
  const latestGameLog = usePlayerGameLog(playerId, league);
  const needsSeasonLog =
    selectedSeason !== null &&
    selectedSeason !== String(latestGameLog.data?.season);
  const seasonGameLog = usePlayerGameLog(
    needsSeasonLog ? playerId : "",
    league,
    selectedSeason,
  );
  const tableGameLog = needsSeasonLog ? seasonGameLog : latestGameLog;
  const {
    game,
    loading: latestGameLoading,
    error: latestGameError,
  } = usePlayerLatestGame(latestGameLog.data, league);
  const gameLoading = latestGameLog.loading || latestGameLoading;
  const gameError = latestGameLog.error || latestGameError;

  const team = currentTeamId ? getNHLTeam(currentTeamId) : undefined;
  const teamLogo = getNHLTeamLogo(currentTeamId, true);
  const teamColor = team?.color ?? Colors.midTone;

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

  const pages = [
    {
      label: "Career Stats",
      content: (
        <PlayerStatTable
          seasons={seasons}
          loading={seasonsLoading}
          error={seasonsError}
          league={league}
        />
      ),
    },
    {
      label: "Game Log",
      content: (
        <PlayerGameLog
          sport="hockey"
          league={league}
          data={tableGameLog.data}
          filterData={latestGameLog.data}
          selectedSeason={selectedSeason}
          loading={tableGameLog.loading}
          error={tableGameLog.error}
          onSeasonChange={(season) =>
            setGameLogSelection({ playerKey: gameLogPlayerKey, season })
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
