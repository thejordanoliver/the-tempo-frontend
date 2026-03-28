import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerHeader from "components/Sports/MLB/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/MLB/Player/PlayerStatTable";
import { mlbTeams } from "constants/teamsMLB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePlayerById } from "hooks/NFLHooks/usePlayerById";
import { useLayoutEffect } from "react";
import { ScrollView, useColorScheme, View } from "react-native";
import { calculateAge } from "utils/dateUtils";

export default function PlayerDetailScreen() {
  /* -------------------------
     Params
  ------------------------- */
  const { id, teamId } = useLocalSearchParams<{
    id?: string;
    teamId?: string;
  }>();

  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";

  const playerId = Number(id);

  /* -------------------------
     Team Lookup
  ------------------------- */
  const sanitizedTeamId = String(teamId ?? "")
    .replace(/"/g, "")
    .trim();

  const teamObj = mlbTeams.find((t) => String(t.id) === sanitizedTeamId);

  /* -------------------------
     Fetch Player
  ------------------------- */
  const {
    player,
    loading: playerLoading,
    error: playerError,
  } = usePlayerById(playerId, "MLB");

  const calculateExperience = (debutDateString?: string) => {
    if (!debutDateString) return null;

    const debutDate = new Date(debutDateString);
    const today = new Date();

    let years = today.getFullYear() - debutDate.getFullYear();
    const monthDiff = today.getMonth() - debutDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < debutDate.getDate())
    ) {
      years--;
    }

    return years >= 0 ? years : 0;
  };

  const avatarUrl = player?.headshot;

  /* -------------------------
     Header
  ------------------------- */
  useLayoutEffect(() => {
    const isTeamAvailable = !!teamObj;
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={
            isTeamAvailable
              ? teamObj?.logoLight || teamObj?.logo
              : require("assets/Baseball/MLB_Logos/MLB.png")
          }
          teamColor={isTeamAvailable ? teamObj?.color : "#1D428A"}
          onBack={() => navigation.goBack()}
          isTeamScreen={isTeamAvailable}
          isPlayerScreen
          league="MLB"
        />
      ),
    });
  }, [navigation, teamObj]);

  /* -------------------------
     Loading / Error States
  ------------------------- */
  if (playerLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator isDark={isDark} />
      </View>
    );
  }

  if (playerError || !player) {
    return null;
  }

  /* -------------------------
     Render
  ------------------------- */
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <PlayerHeader
        player={player}
        avatarUrl={avatarUrl}
        isDark={isDark}
        teamColor={teamObj?.color}
        teamSecondaryColor={teamObj?.secondaryColor}
        team_name={teamObj?.name}
        calculateAge={calculateAge}
        calculateExperience={calculateExperience}
      />

      <View style={{ marginTop: 24 }}>
        <PlayerStatTable playerId={player.id} />
      </View>
    </ScrollView>
  );
}
