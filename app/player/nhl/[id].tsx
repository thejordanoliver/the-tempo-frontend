import PlayerStatTable from "@/components/Sports/Hockey/Player/PlayerStatTable";
import LatestGame from "@/components/Sports/NBA/Player/LatestGame";
import { usePlayerSeasons } from "@/hooks/HockeyHooks/usePlayerSeasons";
import { useTeamLatestGame } from "@/hooks/HockeyHooks/useTeamLatestGame";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerHeader from "components/Sports/Baseball/Player/PlayerHeader";
import { Colors, globalStyles } from "constants/styles";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
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
  const {
    careerStatsFlattened,
    seasonStatsFlattened,
    loading: seasonsLoading,
    error: seasonsError,
  } = usePlayerSeasons(playerId);

  const {
    game,
    loading: gameLoading,
    error: gameError,
  } = useTeamLatestGame(league, teamId);

  const team = getNHLTeam(teamId);
  const teamLogo = getNHLTeamLogo(teamId, true);
  const teamColor = team?.color ?? Colors.midTone;

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

      <LatestGame
        game={game}
        loading={gameLoading}
        error={gameError}
        isDark={isDark}
        league={"NHL"}
      />

      <PlayerStatTable
        seasonStatsFlattened={seasonStatsFlattened}
        careerStatsFlattened={careerStatsFlattened}
        loading={seasonsLoading}
        error={seasonsError}
      />
    </ScrollView>
  );
}
