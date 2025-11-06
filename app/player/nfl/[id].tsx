// app/player/nfl/[id].tsx
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerHeader from "components/NFL/Player/PlayerHeader";
import { players as allPlayers } from "constants/nflPlayers";
import { getTeamInfo } from "constants/teamsNFL";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, useColorScheme, View, ActivityIndicator } from "react-native";
import HeadingTwo from "components/Headings/HeadingTwo";
import NFLGameCard from "components/NFL/Games/NFLGameCard";
import PlayerStatTable from "components/NFL/Player/PlayerStatTable";
import { useLastTeamGame } from "hooks/NFLHooks/useNFLLastTeamGame";
import SeasonStatCard from "components/NFL/Player/SeasonStatCard";
export default function NFLPlayerDetailScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === "dark";
  const params = useLocalSearchParams();
  const playerIdParam = Array.isArray(params.id) ? params.id[0] : params.id; 
  const teamIdParam = Array.isArray(params.teamId) ? params.teamId[0] : params.teamId;

  // Find player
  const player = useMemo(() => allPlayers.find((p) => p.id === Number(id)), [id]);
  const fullName = player?.name ?? "Player";

  // Team info
  const teamObj = player?.teamId ? getTeamInfo(player.teamId) : null;
  const isTeamAvailable = !!teamObj;

  const parsedPlayerId = parseInt(playerIdParam ?? "", 10);
  const sanitizedTeamId = String(teamIdParam ?? "").replace(/"/g, "").trim();

  const goBack = () => router.back();
  const avatarUrl = player?.image;

  const mappedPlayer = player
    ? {
        first_name: player.name.split(" ")[0] || "",
        last_name: player.name.split(" ").slice(1).join(" ") || "",
        college: player.college ?? undefined,
        height: player.height ?? undefined,
        weight: player.weight ?? undefined,
        birth_date: player.birth_date ?? undefined,
        position: player.position ?? undefined,
        jersey_number: player.number?.toString() ?? undefined,
        age: player.age ?? undefined,
      }
    : null;

  // Fetch last game using hook
  const { lastGame, loading: lastGameLoading, error: lastGameError } =
    useLastTeamGame(player?.teamId ?? "");

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
          teamColor={isTeamAvailable ? teamObj?.color : "#1D428A"}
          onBack={goBack}
          isTeamScreen={!!teamObj}
          teamCode={teamObj?.code}
          isPlayerScreen={true}
          league="NFL"
        />
      ),
    });
  }, [navigation, fullName, teamObj, isTeamAvailable, isDark]);

  if (!player) {
    return <View style={{ flex: 1, backgroundColor: isDark ? "#1d1d1d" : "#fff" }} />;
  }

  const seasons = useMemo(() => {
    const currentYear = new Date().getFullYear();
    if (player?.experience) {
      const startYear = currentYear - player.experience + 1;
      return Array.from(
        { length: player.experience },
        (_, i) => (startYear + i).toString()
      );
    }
    const fallbackStart = 2015;
    return Array.from(
      { length: currentYear - fallbackStart + 1 },
      (_, i) => (fallbackStart + i).toString()
    );
  }, [player]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Player header */}
      {mappedPlayer && (
        <PlayerHeader
          player={mappedPlayer}
          avatarUrl={avatarUrl}
          isDark={isDark}
          teamColor={teamObj?.color}
          teamSecondaryColor={teamObj?.secondaryColor}
          team_name={teamObj?.code}
          age={player.age ?? 0}
        />
      )}

      {/* Season stats */}
      {player && (
        <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
          <SeasonStatCard
            playerId={player.id}
            teamColor={teamObj?.secondaryColor}
            teamColorDark={teamObj?.secondaryColor}
          />
        </View>
      )}

      {/* Last Game */}
      <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
        <HeadingTwo>Last Game</HeadingTwo>
        {lastGameLoading && <ActivityIndicator style={{ marginTop: 12 }} />}
        {lastGameError && (
          <View style={{ marginTop: 12 }}>
            <HeadingTwo>Error loading last game</HeadingTwo>
          </View>
        )}
        {lastGame && !lastGameLoading && (
          <NFLGameCard game={lastGame} isDark={isDark} />
        )}
      </View>

      {/* Career Stats */}
      <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
        <HeadingTwo>Career Stats</HeadingTwo>
        <PlayerStatTable playerId={parsedPlayerId} seasons={seasons} />
      </View>
    </ScrollView>
  );
}
