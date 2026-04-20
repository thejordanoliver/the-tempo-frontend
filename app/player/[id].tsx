import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import LatestGame from "components/Sports/NBA/Player/LatestGame";
import PlayerAwardList from "components/Sports/NBA/Player/PlayerAwardList";
import PlayerHeader from "components/Sports/NBA/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/NBA/Player/PlayerStatTable";
import SeasonStatCard from "components/Sports/NBA/Player/SeasonStatCard";
import { globalStyles } from "constants/styles";
import { getTeamLogo } from "constants/teams";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { usePlayerById } from "hooks/NBAHooks/usePlayerById";
import { useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const styles = playerScreenStyles;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const { id, teamId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const { player, loading, error, team, lastGame, teamGameLoading } =
    usePlayerById(
      Array.isArray(id) ? id[0] : id,
      Array.isArray(teamId) ? teamId[0] : teamId,
    );
  const teamLogo = getTeamLogo(player?.team_id, true);
  const teamColor = team?.color;
  const teamSecondaryColor = team?.secondaryColor;
  const teamName = team?.name;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={teamLogo}
          teamColor={team?.color}
          teamCode={team?.code}
          isTeamScreen={!!team}
          isPlayerScreen
          onBack={() => router.back()}
        />
      ),
    });
  }, [navigation, isDark, teamLogo]);

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
      <PlayerHeader
        player={player}
        avatarUrl={player.headshot_url}
        isDark={isDark}
        team_name={teamName}
      />

      {player.active && <SeasonStatCard playerId={player.player_id} />}

      <LatestGame game={lastGame} loading={teamGameLoading} isDark={isDark} />

      <PlayerStatTable playerId={player.player_id} />

      <PlayerAwardList player={player} />
    </ScrollView>
  );
}
