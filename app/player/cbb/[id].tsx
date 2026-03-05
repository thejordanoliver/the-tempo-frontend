import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import HeadingTwo from "components/Headings/HeadingTwo";
import CBBGameCard from "components/Sports/CBB/Games/CBBGameCard";
import PlayerHeader from "components/Sports/CBB/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/CBB/Player/PlayerStatTable";
import SeasonStatCard from "components/Sports/CBB/Player/SeasonStatCard";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useCBBPlayerSeasons } from "hooks/CBBHooks/useCBBPlayerSeasons";
import { usePlayerDetail } from "hooks/CBBHooks/usePlayerDetail";
import { useLayoutEffect } from "react";
import { ScrollView, useColorScheme, View } from "react-native";
export default function PlayerDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    teamId?: string;
    league?: string;
  }>();

  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";

  // -------------------------
  // Params
  // -------------------------
  const playerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const teamIdParam = Array.isArray(params.teamId)
    ? params.teamId[0]
    : params.teamId;

  const league = params.league?.toLowerCase() === "wcbb" ? "WCBB" : "CBB";
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
  } = useCBBPlayerSeasons(playerId, isWomen);

  const numericTeamId = Number(teamIdParam);
  const team = getCBBTeam(numericTeamId, isWomen);

  // -------------------------
  // Header
  // -------------------------
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={numericTeamId}
          logo={getCBBTeamLogo(numericTeamId, true, isWomen)}
          teamColor={team?.color ?? "#1D428A"}
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
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <PlayerHeader
        player={player}
        avatarUrl={player.headshot_url} // ✅ DB uses avatarUrl not imageUrl
        isDark={isDark}
        isWomen={isWomen}
      />

      {!loading && !error && (
        <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
          <SeasonStatCard seasonStats={seasonStats} isDark={isDark} />
        </View>
      )}
      {enrichedLastGame && (
        <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
          <HeadingTwo>Last Game</HeadingTwo>
          <CBBGameCard game={enrichedLastGame} isWomen={isWomen} />
        </View>
      )}

      <View style={{ marginTop: 24 }}>
        <PlayerStatTable
          seasonStatsFlattened={seasonStatsFlattened}
          careerStatsFlattened={careerStatsFlattened}
          isDark={isDark}
        />
      </View>
    </ScrollView>
  );
}
