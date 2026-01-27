import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameCardSkeleton from "components/Skeletons/GameCards/GameCardSkeleton";
import NFLGameCard from "components/Sports/NFL/Games/NFLGameCard";
import PlayerHeader from "components/Sports/NFL/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/NFL/Player/PlayerStatTable";
import SeasonStatCard from "components/Sports/NFL/Player/SeasonStatCard";
import { globalStyles } from "constants/Styles";
import { getTeamInfo } from "constants/teamsNFL";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLastTeamGame } from "hooks/NFLHooks/useLastTeamGame";
import { usePlayerById } from "hooks/NFLHooks/usePlayerById";

import { useLayoutEffect, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";

export default function NFLPlayerDetailScreen() {
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
  const teamObj = player?.team_id ? getTeamInfo(player.team_id) : null;
  const isTeamAvailable = !!teamObj;
  const fullName = player?.name ?? "Player";

  /* ---------------- Last game ---------------- */
  const numericTeamId = teamObj?.id ?? 0;
  const {
    lastGame,
    loading: lastGameLoading,
    error: lastGameError,
  } = useLastTeamGame(numericTeamId);

  /* ---------------- Header ---------------- */
  useLayoutEffect(() => {
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

  /* ---------------- Loading / error ---------------- */
  if (playerLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (playerError || !player) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ textAlign: "center" }}>Player not found</Text>
      </View>
    );
  }

  /* ---------------- Seasons for stats ---------------- */
  const seasons = useMemo(() => {
    if (!player.experience || !player.age) return [];

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - player.experience + 1;

    return Array.from({ length: player.experience }, (_, i) =>
      (startYear + i).toString()
    );
  }, [player]);

  /* ---------------- Render ---------------- */
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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

      {/* Season Stats */}
      <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
        <SeasonStatCard
          playerId={player.player_id}
          teamColor={teamObj?.secondaryColor}
          teamColorDark={teamObj?.secondaryColor}
          league="NFL"
        />
      </View>

      {/* Last Game */}
      <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
        <HeadingTwo>Last Game</HeadingTwo>

        {lastGameLoading && <GameCardSkeleton />}

        {lastGameError && (
          <Text style={global.errorText}>Error loading last game</Text>
        )}

        {lastGame && !lastGameLoading && <NFLGameCard game={lastGame} />}
      </View>

      {/* Career Stats */}
      <View style={{ marginTop: 24 }}>
        <PlayerStatTable playerId={player.player_id} />
      </View>
    </ScrollView>
  );
}
