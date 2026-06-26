import LatestGame from "@/components/Sports/NBA/Player/LatestGame";
import { usePlayerSeasons } from "@/hooks/BaseballHooks/usePlayerSeasons";
import { useTeamLatestGame } from "@/hooks/BaseballHooks/useTeamLatestGame";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerHeader from "components/Sports/Baseball/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/Baseball/Player/PlayerStatTable";
import { Colors, globalStyles } from "constants/styles";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const { id, teamId, league } = useLocalSearchParams<{
    id: string;
    teamId: string;
    league: any;
  }>();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerScreenStyles;
  const global = globalStyles(isDark);
  const playerId = Number(id);
  const team = getMLBTeam(teamId);
  const teamLogo = getMLBTeamLogo(teamId, true);
  const teamColor = team?.color ?? Colors.midTone;

  const {
    player,
    loading: playerLoading,
    error: playerError,
  } = usePlayerById(playerId, league);

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

  if (playerLoading || !player || gameLoading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (playerError || !player)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{playerError}</Text>
      </View>
    );
  /* -------------------------
     Render
  ------------------------- */
  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <PlayerHeader player={player} isDark={isDark} />

      <LatestGame
        game={game}
        loading={gameLoading}
        error={gameError}
        isDark={isDark}
        league={league}
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
