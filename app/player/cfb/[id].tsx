// app/player/cfb/[id].tsx
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import LatestGame from "components/Sports/NFL/Player/LatestGame";
import PlayerHeader from "components/Sports/NFL/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/NFL/Player/PlayerStatTable";
import { globalStyles } from "constants/styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useFootballPlayerSeasons } from "hooks/CFBHooks/useFootballPlayerSeasons";
import { useLastTeamGame } from "hooks/NFLHooks/useLastTeamGame";
import { usePlayerById } from "hooks/NFLHooks/usePlayerById";
import { useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";
import { getFootballSeason } from "utils/dateUtils";

export default function PlayerDetailScreen() {
  const styles = playerScreenStyles;
  const navigation = useNavigation();
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const { id } = useLocalSearchParams<{ id: string }>();
  const playerId = Number(id);
  const { player, loading, error } = usePlayerById(playerId, "CFB");
  const fullName = player?.name ?? "Player";
  const team = player?.team_id ? getCFBTeam(player.team_id) : null;
  const teamLogo = getCFBTeamLogo(team?.id ?? 0, true);
  const isTeamAvailable = !!team;
  const {
    lastGame,
    loading: lastGameLoading,
    error: lastGameError,
  } = useLastTeamGame(player?.team_id ?? 0, getFootballSeason());

  const {
    data: seasons,
    loading: seasonsLoading,
    error: seasonsError,
  } = useFootballPlayerSeasons(playerId, "CFB");

  /* ---------------- Header ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => {
        if (loading) return null;

        return (
          <CustomHeaderTitle
            playerName={fullName}
            logo={teamLogo}
            teamColor={team?.color ?? "#1D428A"}
            onBack={() => router.back()}
            isTeamScreen={!!team}
            teamCode={team?.code}
            isPlayerScreen
            league="CFB"
          />
        );
      },
    });
  }, [navigation, fullName, team, isTeamAvailable, isDark, loading]);
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
      <PlayerHeader
        player={player}
        avatarUrl={player.headshot_url}
        isDark={isDark}
        teamColor={team?.color}
        team_name={player.team}
        isCollegePlayer
      />

      <LatestGame
        game={lastGame}
        loading={lastGameLoading}
        isDark={isDark}
        league="CFB"
      />

      <PlayerStatTable
        data={seasons || []}
        loading={seasonsLoading}
        error={seasonsError}
      />
    </ScrollView>
  );
}
