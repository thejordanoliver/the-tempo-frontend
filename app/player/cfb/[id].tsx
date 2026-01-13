// app/player/cfb/[id].tsx
import CFBGameCard from "components/CFB/Games/CFBGameCard";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerHeader from "components/NFL/Player/PlayerHeader";
import PlayerStatTable from "components/NFL/Player/PlayerStatTable";
import SeasonStatCard from "components/NFL/Player/SeasonStatCard";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamInfo } from "constants/teamsCFB";
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

export default function CFBPlayerDetailScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  /* ---------------- Route params ---------------- */
  const { id } = useLocalSearchParams<{ id: string }>();
  const playerId = Number(id);

  /* ---------------- Fetch player ---------------- */
  const {
    player,
    loading: playerLoading,
    error: playerError,
  } = usePlayerById(playerId, "CFB");

  const fullName = player?.name ?? "Player";

  /* ---------------- Team info ---------------- */
  const teamObj = player?.team_id ? getTeamInfo(player.team_id) : null;
  const isTeamAvailable = !!teamObj;

  /* ---------------- Last game ---------------- */
  const {
    lastGame,
    loading: lastGameLoading,
    error: lastGameError,
  } = useLastTeamGame(player?.team_id ?? 0, "2");

  /* ---------------- Header ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          playerName={fullName}
          logo={
            isTeamAvailable
              ? teamObj?.logo
              : require("assets/College_Logos/NCAA.png")
          }
          logoLight={
            teamObj?.logoLight
              ? { uri: teamObj.logoLight }
              : require("assets/College_Logos/NCAA.png")
          }
          teamColor={teamObj?.color ?? "#1D428A"}
          onBack={() => router.back()}
          isTeamScreen={!!teamObj}
          teamCode={teamObj?.code}
          isPlayerScreen
          league="CFB"
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

  /* ---------------- Seasons (CFB career) ---------------- */
  const seasons = useMemo(() => {
    if (!player.experience_years) return [];

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - player.experience_years + 1;

    return Array.from({ length: player.experience_years }, (_, i) =>
      (startYear + i).toString()
    );
  }, [player.experience_years]);

  /* ---------------- Render ---------------- */
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Player Header */}
      <PlayerHeader
        player={player}
        avatarUrl={player.headshot_url}
        isDark={isDark}
        teamColor={teamObj?.color}
        team_name={player.team}
        isCollegePlayer
      />

      {/* Season Stats */}
      <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
        <SeasonStatCard
          playerId={player.player_id}
          teamColor={teamObj?.secondaryColor}
          teamColorDark={teamObj?.secondaryColor}
          league="CFB"
        />
      </View>

      {/* Last Game */}
      <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
        <HeadingTwo>Last Game</HeadingTwo>

        {lastGameLoading && <ActivityIndicator style={{ marginTop: 12 }} />}

        {lastGameError && (
          <Text
            style={{
              color: isDark ? Colors.dark.lightRed : Colors.light.red,
              textAlign: "center",
              marginVertical: 20,
              fontFamily: Fonts.OSREGULAR,
            }}
          >
            Error loading last game
          </Text>
        )}

        {lastGame && !lastGameLoading && (
          <CFBGameCard game={lastGame} isDark={isDark} />
        )}
      </View>

      {/* Career Stats */}
      <View style={{ marginTop: 24 }}>
        <PlayerStatTable playerId={player.player_id} seasons={seasons} />
      </View>
    </ScrollView>
  );
}
