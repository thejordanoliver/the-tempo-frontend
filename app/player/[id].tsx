import PlayerStatTable from "@/components/Sports/Basketball/Player/PlayerStatTable";
import PlayerHeader from "@/components/Sports/NBA/Player/PlayerHeader";
import { usePlayerSeasons } from "@/hooks/BasketballHooks/usePlayerSeasons";
import { useTeamLatestGame } from "@/hooks/BasketballHooks/useTeamLatestGame";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import LatestGame from "components/Sports/NBA/Player/LatestGame";
import PlayerAwardList from "components/Sports/NBA/Player/PlayerAwardList";
import SeasonStatCard from "components/Sports/NBA/Player/SeasonStatCard";
import { Colors, globalStyles } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
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
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerScreenStyles;
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const playerId = Number(id);
  const { player, loading, error } = usePlayerById(playerId, league);
  const isActive = player?.active;
  const team = teamId ? getNBATeam(teamId) : null;
  const teamLogo = getTeamLogo(teamId, true);
  const teamColor = team?.color ?? Colors.midTone;
  const { seasons, seasonsLoading, seasonsError } = usePlayerSeasons(
    playerId,
    league,
  );

  const {
    game,
    loading: gameLoading,
    error: gameError,
  } = useTeamLatestGame("nba", teamId);

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
      <PlayerHeader player={player} isDark={isDark} />

      {isActive && (
        <SeasonStatCard
          season={seasons}
          loading={seasonsLoading}
          error={seasonsError}
        />
      )}

      <LatestGame
        game={game}
        loading={gameLoading}
        error={gameError}
        isDark={isDark}
        league={league}
      />

      <PlayerStatTable
        seasons={seasons}
        loading={seasonsLoading}
        error={seasonsError}
        league={league}
      />

      <PlayerAwardList player={player} />
    </ScrollView>
  );
}
