import PlayerHeader from "components/CBB/Player/PlayerHeader";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { players } from "constants/cbbPlayers"; // ✅ your player data
import { Colors } from "constants/Colors";
import { teams } from "constants/teamsCBB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme } from "react-native";
import { CBBPlayer } from "types/types";


export default function PlayerDetailScreen() {
  const params = useLocalSearchParams();
  const playerIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const teamIdParam = Array.isArray(params.teamId)
    ? params.teamId[0]
    : params.teamId;

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
        scrollView: {
          backgroundColor: isDark ? Colors.black : Colors.white,
        },
        errorText: {
          color: "red",
          textAlign: "center",
          marginTop: 50,
        },
      }),
    [isDark]
  );

  if (error) {
    return (
      <ScrollView style={dynamicStyles.scrollView}>
        <Text style={dynamicStyles.errorText}>{error}</Text>
      </ScrollView>
    );
  }

  if (!player) {
    return (
      <ScrollView style={dynamicStyles.scrollView}>
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
    <ScrollView
      style={dynamicStyles.scrollView}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <PlayerHeader
        player={player}
        avatarUrl={avatarUrl}
        isDark={isDark}
        teamColor={teamObj?.color}
        teamSecondaryColor={teamObj?.secondaryColor}
        team_name={teamObj?.name}
      />
    </ScrollView>
  );
}
