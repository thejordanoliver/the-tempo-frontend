import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import LatestGame from "components/Sports/NBA/Player/LatestGame";
import PlayerAwardList from "components/Sports/NBA/Player/PlayerAwardList";
import PlayerHeader from "components/Sports/NBA/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/NBA/Player/PlayerStatTable";
import SeasonStatCard from "components/Sports/NBA/Player/SeasonStatCard";
import { globalStyles } from "constants/styles";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { usePlayerDetail } from "hooks/NBAHooks/usePlayerDetail";
import { useLayoutEffect } from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const styles = playerScreenStyles;
  const isDark = useColorScheme() === "dark";
  const global = globalStyles(isDark);
  const { id, teamId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const {
    player,
    loading,
    error,
    team,
    teamObj,
    lastGame,
    teamGameLoading,
    calculateAge,
    calculateExperience,
  } = usePlayerDetail(
    Array.isArray(id) ? id[0] : id,
    Array.isArray(teamId) ? teamId[0] : teamId,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={team?.logoLight || team?.logo}
          teamColor={team?.color}
          teamCode={team?.code}
          isTeamScreen={!!teamObj}
          isPlayerScreen
          onBack={() => router.back()}
        />
      ),
    });
  }, [navigation, teamObj, isDark]);

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

  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <PlayerHeader
        player={player}
        avatarUrl={player.headshot_url}
        isDark={isDark}
        teamColor={teamObj?.color}
        teamSecondaryColor={teamObj?.secondaryColor}
        team_name={teamObj?.name}
      />

      {player.active && (
        <SeasonStatCard
          playerId={player.player_id}
          teamColor={teamObj?.secondaryColor}
          teamColorDark={teamObj?.secondaryColor}
        />
      )}

      <LatestGame game={lastGame} loading={teamGameLoading} isDark={isDark} />

      <PlayerStatTable playerId={player.player_id} />

      <PlayerAwardList player={player} />
    </ScrollView>
  );
}
