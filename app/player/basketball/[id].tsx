import LatestGame from "@/components/Sports/Basketball/Player/LatestGame";
import PlayerHeader from "@/components/Sports/Basketball/Player/PlayerHeader";
import PlayerStatTable from "@/components/Sports/Basketball/Player/PlayerStatTable";
import SeasonStatCard from "@/components/Sports/Basketball/Player/SeasonStatCard";
import { getNBATeam, getTeamLogo } from "@/constants/teams";
import { getWNBATeam, getWNBATeamLogo } from "@/constants/teamsWNBA";
import { usePlayerSeasons } from "@/hooks/BasketballHooks/usePlayerSeasons";
import { useTeamLatestGame } from "@/hooks/BasketballHooks/useTeamLatestGame";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { Colors, globalStyles } from "constants/styles";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const { id, teamId, league } = useLocalSearchParams<{
    id?: string;
    teamId: string;
    league: any;
  }>();
  const styles = playerScreenStyles;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const playerId = Number(id);
  const isWCBB = league === "WCBB";
  const isNBA = league === "NBA";
  const isCBB = league === "CBB";
  const isWNBA = league === "WNBA";
  const { player, loading, error } = usePlayerById(playerId, league);
  const team =
    teamId && isNBA
      ? getNBATeam(teamId)
      : teamId && isWNBA
        ? getWNBATeam(teamId)
        : teamId && isCBB
          ? getCBBTeam(teamId, false)
          : teamId && isWCBB
            ? getCBBTeam(teamId, true)
            : null;
  const teamLogo = isNBA
    ? getTeamLogo(teamId, true)
    : isWNBA
      ? getWNBATeamLogo(teamId, true)
      : getCBBTeamLogo(teamId, true, isWCBB);
  const teamColor = team?.color ?? Colors.midTone;
  const isActive = player?.active;

  const {
    game,
    loading: gameLoading,
    error: gameError,
  } = useTeamLatestGame(league, teamId);

  const { seasons, seasonsLoading, seasonsError } = usePlayerSeasons(
    playerId,
    league,
  );

  // -------------------------
  // Header
  // -------------------------
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
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

  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <PlayerHeader player={player} isDark={isDark} league={league} />

      <SeasonStatCard
        seasons={seasons}
        loading={seasonsLoading}
        error={seasonsError}
        league={league}
      />

      {isActive && (
        <LatestGame
          game={game}
          loading={gameLoading}
          error={gameError}
          isDark={isDark}
          league={league}
          isCBB={isCBB}
          isWCBB={isWCBB}
          isWNBA={isWNBA}
        />
      )}
      <PlayerStatTable
        seasons={seasons}
        loading={seasonsLoading}
        error={seasonsError}
        league={league}
      />
    </ScrollView>
  );
}
