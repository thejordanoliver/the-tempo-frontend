import CBBGameCard from "components/CBB/Games/CBBGameCard";
import PlayerHeader from "components/CBB/Player/PlayerHeader";
import PlayerStatTable from "components/CBB/Player/PlayerStatTable";
import SeasonStatCard from "components/CBB/Player/SeasonStatCard";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import HeadingTwo from "components/Headings/HeadingTwo";
import { players } from "constants/cbbPlayers"; // ✅ your player data
import { Colors } from "constants/Colors";
import { teams } from "constants/teamsCBB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLastTeamGame } from "hooks/CBBHooks/useLastTeamGame";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { CBBGame, CBBPlayer } from "types/types";

type TeamWithRecord = (typeof teams)[number] & { record?: string };

export default function PlayerDetailScreen() {
  const params = useLocalSearchParams();
  const playerIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const teamIdParam = Array.isArray(params.teamId)
    ? params.teamId[0]
    : params.teamId;
  const season = "2025";

  const parsedPlayerId = String(playerIdParam ?? "").trim();
  const sanitizedTeamId = String(teamIdParam ?? "")
    .replace(/"/g, "")
    .trim();

  const teamObj = teams.find((t) => String(t.id) === sanitizedTeamId);
  const isDark = useColorScheme() === "dark";
  const navigation = useNavigation();

  const [player, setPlayer] = useState<CBBPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const goBack = () => navigation.goBack();

  const avatarUrl = player?.imageUrl;
  const teamNumericId = parseInt(sanitizedTeamId, 10);
  console.log(teamNumericId);
  // Use the updated hook - it returns a `Game | null`
  const { lastGame: teamLastGame, loading: teamGameLoading } =
    useLastTeamGame(teamNumericId);

  // Find away team with extended type
  const awayTeamObj = teams.find(
    (t) => t.id === teamLastGame?.teams.away.id
  ) as TeamWithRecord | undefined;

  const enrichedLastGame: CBBGame | null = teamLastGame
    ? {
        ...teamLastGame,
        teams: {
          home: {
            ...teamLastGame.teams.home,
            logo: teamObj?.logo || "",
          },
          away: {
            ...teamLastGame.teams.away,
            logo: awayTeamObj?.logo || "",
          },
        },
      }
    : null;

  // ✅ Find player from constants
  useEffect(() => {
    const foundPlayer = players.find((p) => p.id === parsedPlayerId);
    if (foundPlayer) {
      setPlayer(foundPlayer);
    } else {
      setError("Player not found.");
    }
  }, [parsedPlayerId]);

  // ✅ Header setup
  useLayoutEffect(() => {
    const isTeamAvailable = !!teamObj;

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={
            isTeamAvailable
              ? teamObj?.logo
              : require("assets/College_Logos/NCAA.png")
          }
          logoLight={teamObj?.logoLight}
          teamColor={isTeamAvailable ? teamObj?.color : "#1D428A"}
          onBack={goBack}
          isTeamScreen={!!teamObj}
          teamCode={teamObj?.code}
          isPlayerScreen={true}
          league="CBB"
        />
      ),
    });
  }, [navigation, teamObj, isDark]);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        errorText: {
          color: "red",
          textAlign: "center",
          marginTop: 50,
        },
      }),
    [isDark]
  );

  console.log(teamLastGame);

  if (error) {
    return (
      <ScrollView>
        <Text style={dynamicStyles.errorText}>{error}</Text>
      </ScrollView>
    );
  }

  if (!player) {
    return (
      <ScrollView>
        <Text
          style={{
            color: isDark ? Colors.white : Colors.black,
            textAlign: "center",
            marginTop: 50,
          }}
        >
          Loading player details...
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <PlayerHeader
        player={player}
        avatarUrl={avatarUrl}
        isDark={isDark}
        teamColor={teamObj?.color}
        teamSecondaryColor={teamObj?.secondaryColor}
        team_name={teamObj?.name}
      />

      <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
        <SeasonStatCard playerId={Number(player.id)} season={season} />
      </View>

      {enrichedLastGame && (
        <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
          <HeadingTwo>Last Game</HeadingTwo>
          <CBBGameCard
            game={enrichedLastGame}
            isDark={isDark}
            lighter={false}
          />
        </View>
      )}

      <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
        <PlayerStatTable playerId={Number(player.id)} />
      </View>
    </ScrollView>
  );
}
