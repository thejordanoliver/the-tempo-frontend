import PlayerStatTable from "@/components/Sports/Basketball/Player/PlayerStatTable";
import SeasonStatCard from "@/components/Sports/Basketball/Player/SeasonStatCard";
import LatestGame from "@/components/Sports/NBA/Player/LatestGame";
import PlayerHeader from "@/components/Sports/NBA/Player/PlayerHeader";
import { useLastTeamGame } from "@/hooks/BasketballHooks/useLastTeamGame";
import { usePlayerSeasons } from "@/hooks/BasketballHooks/usePlayerSeasons";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { Colors, globalStyles } from "constants/styles";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const { id, teamId, league } = useLocalSearchParams<{
    id?: string;
    teamId: string;
    league: any;
  }>();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const playerId = Number(id);
  const styles = playerScreenStyles;
  const team = getWNBATeam(teamId);
  const teamLogo = getWNBATeamLogo(teamId, true);
  const teamColor = team?.color ?? Colors.midTone;
  const { player, loading, error } = usePlayerById(playerId, league);

  const {
    game,
    loading: gameLoading,
    error: gameError,
  } = useLastTeamGame({
    teamId: Number(teamId),
    isWNBA: true,
  });
  const {
    seasonStats,
    seasonStatsFlattened,
    careerStatsFlattened,
    loading: seasonsLoading,
    error: seasonsError,
  } = usePlayerSeasons(Number(playerId), false, true);

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
      <PlayerHeader player={player} isDark={isDark} />

      <SeasonStatCard
        seasonStats={seasonStats}
        loading={loading}
        error={error}
      />

      <LatestGame
        game={game}
        error={gameError}
        loading={gameLoading}
        league={league}
        isDark={isDark}
        isWNBA={true}
      />

      <PlayerStatTable
        seasonStatsFlattened={seasonStatsFlattened}
        careerStatsFlattened={careerStatsFlattened}
        loading={seasonsLoading}
        error={seasonsError}
        isDark={isDark}
        isWNBA={true}
      />
    </ScrollView>
  );
}
