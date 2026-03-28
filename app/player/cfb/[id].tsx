// app/player/cfb/[id].tsx
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerStatTable from "components/Sports/CFB/Player/PlayerStatTable";
import LatestGame from "components/Sports/NFL/Player/LatestGame";
import PlayerHeader from "components/Sports/NFL/Player/PlayerHeader";
import SeasonStatCard from "components/Sports/NFL/Player/SeasonStatCard";
import { globalStyles } from "constants/Styles";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useFootballPlayerStats } from "hooks/CFBHooks/useFootballPlayerStats";
import { useLastTeamGame } from "hooks/NFLHooks/useLastTeamGame";
import { usePlayerById } from "hooks/NFLHooks/usePlayerById";
import { useLayoutEffect } from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";
import { getFootballSeasonYear } from "utils/dateUtils";

export default function CFBPlayerDetailScreen() {
  const styles = playerScreenStyles;
  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const global = globalStyles(isDark);
  const { id } = useLocalSearchParams<{ id: string }>();
  const playerId = Number(id);

  /* ---------------- Fetch player ---------------- */
  const { player, loading, error } = usePlayerById(playerId, "CFB");

  const fullName = player?.name ?? "Player";

  /* ---------------- Team info ---------------- */
  const teamObj = player?.team_id ? getCFBTeam(player.team_id) : null;
  const teamLogo = getCFBTeamLogo(teamObj?.id ?? 0, true);
  const isTeamAvailable = !!teamObj;

  /* ---------------- Last game ---------------- */
  const {
    lastGame,
    loading: lastGameLoading,
    error: lastGameError,
  } = useLastTeamGame(player?.team_id ?? 0, getFootballSeasonYear());

  const {
    data: seasons,
    loading: seasonsLoading,
    error: seasonsError,
  } = useFootballPlayerStats(playerId);

  /* ---------------- Header ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => {
        if (loading) return null;

        return (
          <CustomHeaderTitle
            playerName={fullName}
            logo={teamLogo}
            teamColor={teamObj?.color ?? "#1D428A"}
            onBack={() => router.back()}
            isTeamScreen={!!teamObj}
            teamCode={teamObj?.code}
            isPlayerScreen
            league="CFB"
          />
        );
      },
    });
  }, [navigation, fullName, teamObj, isTeamAvailable, isDark, loading]);
  if (loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator isDark={isDark} />
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
        teamColor={teamObj?.color}
        team_name={player.team}
        isCollegePlayer
      />

      <SeasonStatCard
        playerId={player.player_id}
        teamColor={teamObj?.secondaryColor}
        teamColorDark={teamObj?.secondaryColor}
        league="CFB"
      />

      <LatestGame
        game={lastGame}
        loading={lastGameLoading}
        isDark={isDark}
        league="CFB"
      />

      <PlayerStatTable playerId={playerId} />
    </ScrollView>
  );
}
