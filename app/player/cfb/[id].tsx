// app/player/cfb/[id].tsx
import { useTeamLatestGame } from "@/hooks/FootballHooks/useTeamLatestGame";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import LatestGame from "components/Sports/NBA/Player/LatestGame";
import PlayerHeader from "components/Sports/Football/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/Football/Player/PlayerStatTable";
import { Colors, globalStyles } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useFootballPlayerSeasons } from "hooks/FootballHooks/useFootballPlayerSeasons";
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
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const playerId = Number(id);
  const { player, loading, error } = usePlayerById(playerId, league);
  const team = getCFBTeam(teamId);
  const teamLogo = getCFBTeamLogo(teamId, true);
  const teamColor = team?.color ?? Colors.midTone;

  const {
    game,
    loading: gameLoading,
    error: gameError,
  } = useTeamLatestGame(league, teamId);

  const {
    data: seasons,
    loading: seasonsLoading,
    error: seasonsError,
  } = useFootballPlayerSeasons(playerId, league);

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

  /* ---------------- Render ---------------- */
  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      {/* Player Header */}
      <PlayerHeader player={player} isDark={isDark} isCollegePlayer />

      <LatestGame
        game={game}
        loading={gameLoading}
        error={gameError}
        isDark={isDark}
        league={league}
        isCFB={true}
      />

      <PlayerStatTable
        data={seasons || []}
        loading={seasonsLoading}
        error={seasonsError}
        position={player.position}
      />
    </ScrollView>
  );
}
