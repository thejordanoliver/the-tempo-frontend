import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import LatestGame from "components/Sports/NFL/Player/LatestGame";
import PlayerHeader from "components/Sports/NFL/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/NFL/Player/PlayerStatTable";
import SeasonStatCard from "components/Sports/NFL/Player/SeasonStatCard";
import { globalStyles } from "constants/Styles";
import { getNFLTeam } from "constants/teamsNFL";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLastTeamGame } from "hooks/NFLHooks/useLastTeamGame";
import { usePlayerById } from "hooks/NFLHooks/usePlayerById";
import { useLayoutEffect } from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";
import { getFootballSeasonYear } from "utils/dateUtils";

export default function NFLPlayerDetailScreen() {
  const styles = playerScreenStyles;
  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const global = globalStyles(isDark);
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
  const teamObj = player?.team_id ? getNFLTeam(player.team_id) : null;
  const isTeamAvailable = !!teamObj;
  const fullName = player?.name ?? "Player";

  /* ---------------- Last game ---------------- */
  const {
    lastGame,
    loading: lastGameLoading,
    error: lastGameError,
  } = useLastTeamGame(player?.team_id ?? 0, getFootballSeasonYear());

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
          logo={
            isTeamAvailable
              ? teamObj?.logo
              : require("assets/Football/NFL_Logos/NFL.png")
          }
          logoLight={
            teamObj?.logoLight
              ? { uri: teamObj.logoLight }
              : require("assets/Football/NFL_Logos/NFL.png")
          }
          teamColor={teamObj?.color ?? "#1D428A"}
          onBack={() => router.back()}
          isTeamScreen={!!teamObj}
          teamCode={teamObj?.code}
          isPlayerScreen
          league="NFL"
        />
      ),
    });
  }, [navigation, fullName, teamObj, isTeamAvailable, isDark]);

  if (playerLoading || !player)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator isDark={isDark} />
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
        teamColor={teamObj?.color}
        team_name={teamObj?.code}
        age={player.age}
        isCollegePlayer={false}
      />

      <SeasonStatCard
        playerId={player.player_id}
        teamColor={teamObj?.secondaryColor}
        teamColorDark={teamObj?.secondaryColor}
        league="NFL"
      />

      <LatestGame
        game={lastGame}
        loading={lastGameLoading}
        isDark={isDark}
        league="NFL"
      />

      <PlayerStatTable playerId={player.player_id} />
    </ScrollView>
  );
}
