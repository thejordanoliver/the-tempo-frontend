import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import HeadingTwo from "components/Headings/HeadingTwo";
import CBBGameCard from "components/Sports/CBB/Games/CBBGameCard";
import PlayerHeader from "components/Sports/CBB/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/CBB/Player/PlayerStatTable";
import SeasonStatCard from "components/Sports/CBB/Player/SeasonStatCard";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useBasketballPlayerSeasons } from "hooks/CBBHooks/useBasketballPlayerSeasons";
import { usePlayerDetail } from "hooks/CBBHooks/usePlayerDetail";
import { useLayoutEffect } from "react";
import { ScrollView, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    teamId?: string;
    league?: string;
  }>();

  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  // -------------------------
  // Params
  // -------------------------
  const playerId = params.id;
  const teamIdParam = params.teamId;
  // console.log(params);

  const league = params.league === "WCBB" ? "WCBB" : "CBB";
  const isWomen = league === "WCBB";

  // -------------------------
  // Hook
  // -------------------------
  const { player, loading, error, enrichedLastGame } = usePlayerDetail(
    playerId,
    teamIdParam,
    isWomen,
  );
  const {
    seasonStats,
    seasonStatsFlattened,
    careerStatsFlattened,
    loading: statsLoading,
    error: statsError,
  } = useBasketballPlayerSeasons(Number(playerId), isWomen);
  const styles = playerScreenStyles;
  const numericTeamId = Number(teamIdParam);
  const team = getCBBTeam(numericTeamId, isWomen);
  const teamLogo = getCBBTeamLogo(numericTeamId, true, isWomen);

  // -------------------------
  // Header
  // -------------------------
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={numericTeamId}
          logo={teamLogo}
          teamColor={team?.color}
          onBack={() => navigation.goBack()}
          teamCode={team?.code}
          isTeamScreen
          isPlayerScreen
          league={league}
        />
      ),
    });
  }, [navigation, numericTeamId, team, league, isWomen]);

  if (loading || error || !player) return null;

  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <PlayerHeader
        player={player}
        avatarUrl={player.headshot_url}
        isDark={isDark}
        isWomen={isWomen}
      />

      <SeasonStatCard
        seasonStats={seasonStats}
        loading={loading}
        error={error}
      />

      {enrichedLastGame && (
        <View>
          <HeadingTwo isDark={isDark}>Last Game</HeadingTwo>
          <CBBGameCard game={enrichedLastGame} isWomen={isWomen} />
        </View>
      )}

      <PlayerStatTable
        seasonStatsFlattened={seasonStatsFlattened}
        careerStatsFlattened={careerStatsFlattened}
        isDark={isDark}
      />
    </ScrollView>
  );
}
