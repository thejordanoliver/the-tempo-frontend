import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameCard from "components/Sports/NBA/Games/GameCard";
import PlayerAwardList from "components/Sports/NBA/Player/PlayerAwardList";
import PlayerHeader from "components/Sports/NBA/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/NBA/Player/PlayerStatTable";
import SeasonStatCard from "components/Sports/NBA/Player/SeasonStatCard";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { usePlayerDetail } from "hooks/usePlayerDetail";
import { useLayoutEffect } from "react";
import { ScrollView, useColorScheme, View } from "react-native";

export default function PlayerDetailScreen() {
  const isDark = useColorScheme() === "dark";
  const { id, teamId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const {
    player,
    loading,
    error,
    team,
    teamObj,
    enrichedLastGame,
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
          logo={team?.logo}
          logoLight={team?.logoLight}
          teamColor={team?.color}
          teamCode={team?.code}
          isTeamScreen={!!teamObj}
          isPlayerScreen
          onBack={() => router.back()}
        />
      ),
    });
  }, [navigation, teamObj, isDark]);

  if (loading) return null;
  if (error || !player) return null;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <PlayerHeader
        player={player}
        avatarUrl={player.headshot_url}
        isDark={isDark}
        teamColor={teamObj?.color}
        teamSecondaryColor={teamObj?.secondaryColor}
        team_name={teamObj?.name}
        calculateAge={calculateAge}
        calculateExperience={calculateExperience}
      />

      {player.active && (
        <View style={{ marginTop: 24 }}>
          <SeasonStatCard
            playerId={player.player_id}
            teamColor={teamObj?.secondaryColor}
            teamColorDark={teamObj?.secondaryColor}
          />
        </View>
      )}

      {enrichedLastGame && player.active && (
        <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
          <HeadingTwo>Last Game</HeadingTwo>
          <GameCard game={enrichedLastGame} />
        </View>
      )}

      <View style={{ marginTop: 24 }}>
        <PlayerStatTable playerId={player.player_id} />
      </View>

      <View style={{ marginTop: 24 }}>
        <PlayerAwardList player={player} />
      </View>
    </ScrollView>
  );
}
