import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerHeader from "components/Sports/CBB/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/CBB/Player/PlayerStatTable";
import SeasonStatCard from "components/Sports/CBB/Player/SeasonStatCard";
import { globalStyles } from "constants/styles";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useBasketballPlayerSeasons } from "hooks/CBBHooks/useBasketballPlayerSeasons";
import { usePlayerById } from "hooks/FootballHooks/usePlayerById";
import { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    teamId?: string;
    league?: string;
  }>();

  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);

  // -------------------------
  // Params
  // -------------------------
  const playerId = Number(params.id);
  const teamIdParam = params.teamId;
  const league = "WNBA";
  const styles = playerScreenStyles;
  const numericTeamId = Number(teamIdParam);
  const team = getWNBATeam(numericTeamId);
  const teamLogo = getWNBATeamLogo(numericTeamId, true);
  const { player, loading, error } = usePlayerById(playerId, league);
  const {
    seasonStats,
    seasonStatsFlattened,
    careerStatsFlattened,
    loading: statsLoading,
    error: statsError,
  } = useBasketballPlayerSeasons(Number(playerId), false, true);

  // -------------------------
  // Header
  // -------------------------
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={numericTeamId}
          logo={teamLogo}
          teamColor={team?.color}
          onBack={() => navigation.goBack()}
          teamCode={team?.code}
          isTeamScreen
          isPlayerScreen
          league={league}
        />
      ),
    });
  }, [navigation, numericTeamId, team, league]);

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (!player) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <PlayerHeader
        player={player}
        avatarUrl={player?.headshot_url}
        isDark={isDark}
      />

      <SeasonStatCard
        seasonStats={seasonStats}
        loading={loading}
        error={error}
      />

      <PlayerStatTable
        seasonStatsFlattened={seasonStatsFlattened}
        careerStatsFlattened={careerStatsFlattened}
        isDark={isDark}
        isWNBA={true}
      />
    </ScrollView>
  );
}
