import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import LatestGame from "components/Sports/NFL/Player/LatestGame";
import PlayerHeader from "components/Sports/NFL/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/NFL/Player/PlayerStatTable";
import { globalStyles } from "constants/styles";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useFootballPlayerSeasons } from "hooks/FootballHooks/useFootballPlayerSeasons";
import { useLastTeamGame } from "hooks/FootballHooks/useLastTeamGame";
import { usePlayerById } from "hooks/FootballHooks/usePlayerById";
import { useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";
import { getFootballSeason } from "utils/dateUtils";

export default function NFLPlayerDetailScreen() {
  const styles = playerScreenStyles;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const router = useRouter();
  /* ---------------- Route params ---------------- */
  const { id } = useLocalSearchParams<{ id: string }>();
  const playerId = Number(id);

  /* ---------------- Fetch player ---------------- */
  const {
    player,
    loading: playerLoading,
    error: playerError,
  } = usePlayerById(playerId, "NFL");

  /* ---------------- Team info ---------------- */
  const team = player?.team_id ? getNFLTeam(player.team_id) : null;
  const isTeamAvailable = !!team;
  const fullName = player?.name ?? "Player";

  /* ---------------- Last game ---------------- */
  const {
    lastGame,
    loading: lastGameLoading,
    error: lastGameError,
  } = useLastTeamGame(player?.team_id ?? 0, getFootballSeason());

  const {
    data: seasons,
    loading: seasonsLoading,
    error: seasonsError,
  } = useFootballPlayerSeasons(playerId, "NFL");

  const teamLogo = getNFLTeamLogo(player?.team_id, true);

  /* ---------------- Header ---------------- */
  useLayoutEffect(() => {
    if (!player) {
      navigation.setOptions({
        header: () => null,
      });
      return;
    }

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          playerName={fullName}
          logo={teamLogo}
          teamColor={team?.color ?? "#1D428A"}
          onBack={() => router.back()}
          isTeamScreen={!!team}
          teamCode={team?.code}
          isPlayerScreen
          league="NFL"
        />
      ),
    });
  }, [navigation, fullName, team, isTeamAvailable, isDark]);

  if (playerLoading || !player)
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

  /* ---------------- Render ---------------- */
  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      {/* Player Header */}
      <PlayerHeader
        player={player}
        avatarUrl={player.headshot_url}
        isDark={isDark}
        teamColor={team?.color}
        team_name={team?.code}
        age={player.age}
        isCollegePlayer={false}
      />

      <LatestGame
        game={lastGame}
        loading={lastGameLoading}
        isDark={isDark}
        league="NFL"
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
