import LatestGame from "@/components/Sports/NBA/Player/LatestGame";
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
import { useTeamLatestGame } from "@/hooks/FootballHooks/useTeamLatestGame";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerHeader from "components/Sports/Football/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/Football/Player/PlayerStatTable";
import { Colors, globalStyles } from "constants/styles";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
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
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const isNFL = league === "NFL";
  const isCFB = league === "CFB";
  const styles = playerScreenStyles;
  const playerId = Number(id);
  const { player, loading, error } = usePlayerById(playerId, league);
  const team = isNFL ? getNFLTeam(teamId) : getCFBTeam(teamId);
  const teamColor = team?.color ?? Colors.midTone;
  const teamLogo = isNFL
    ? getNFLTeamLogo(teamId, true)
    : getCFBTeamLogo(teamId, true);
    

  /* ---------------- Last game ---------------- */
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

  /* ---------------- Header ---------------- */
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

  if (loading || !player)
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
      <PlayerHeader player={player} isDark={isDark} isCFB={isCFB} />

      <LatestGame
        game={game}
        loading={gameLoading}
        error={gameError}
        isDark={isDark}
        league={league}
        isNFL={isNFL}
        isCFB={isCFB}
      />

      <PlayerStatTable
        data={seasons}
        loading={seasonsLoading}
        error={seasonsError}
        position={player.position}
        league={league}
      />
    </ScrollView>
  );
}
