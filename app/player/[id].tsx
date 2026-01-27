import axios from "axios";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import HeadingTwo from "components/Headings/HeadingTwo";
import GameCard from "components/Sports/NBA/Games/GameCard";
import PlayerAwardList from "components/Sports/NBA/Player/PlayerAwardList";
import PlayerHeader from "components/Sports/NBA/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/NBA/Player/PlayerStatTable";
import SeasonStatCard from "components/Sports/NBA/Player/SeasonStatCard";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLastTeamGame } from "hooks/useLastTeamGame";
import { useEffect, useLayoutEffect, useState } from "react";
import { Platform, ScrollView, useColorScheme, View } from "react-native";
import { getTeamInfo, teams } from "../../constants/teams";
import type { Game } from "../../types/types";
import { DBPlayer } from "../../types/types";

type TeamWithRecord = (typeof teams)[number] & { record?: string };

const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function PlayerDetailScreen() {
  const isDark = useColorScheme() === "dark";
  const params = useLocalSearchParams();
  const playerIdParam = Array.isArray(params.id) ? params.id[0] : params.id; // read `id` param here
  const teamIdParam = Array.isArray(params.teamId)
    ? params.teamId[0]
    : params.teamId;

  const parsedPlayerId = parseInt(playerIdParam ?? "", 10);
  const sanitizedTeamId = String(teamIdParam ?? "")
    .replace(/"/g, "")
    .trim();

  const team = getTeamInfo(teamIdParam);
  const teamLogo = team?.logo;
  const teamLogoLight = team?.logoLight;
  const teamColor = team?.color;
  const teamCode = team?.code;

  // Cast teamObj as TeamWithRecord so .record is allowed
  const teamObj = teams.find((t) => String(t.id) === sanitizedTeamId) as
    | TeamWithRecord
    | undefined;
  const teamNumericId = parseInt(sanitizedTeamId, 10);

  // Use the updated hook - it returns a `Game | null`
  const { lastGame: teamLastGame, loading: teamGameLoading } =
    useLastTeamGame(teamNumericId);

  const router = useRouter();
  const navigation = useNavigation();
  const [player, setPlayer] = useState<DBPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goBack = () => router.back();

  function getApiBaseUrl() {
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

    if (Platform.OS === "android") {
      // Android emulator localhost workaround
      return "http://localhost:4000";
    }

    // iOS simulator or web fallback
    return BASE_API_URL;
  }

  const API_URL = getApiBaseUrl();

  useEffect(() => {
    if (isNaN(parsedPlayerId)) {
      setError("Invalid player ID");
      setLoading(false);
      return;
    }

    const fetchPlayer = async () => {
      setLoading(true);
      try {
        const resp = await axios.get<{ player: DBPlayer }>(
          `${API_URL}/api/players/player-id/${parsedPlayerId}`
        );
        setPlayer(resp.data.player);
      } catch (err: any) {
        setError(err.message || "Failed to load player data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [parsedPlayerId]);

  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate years in the league from draft year
  const calculateExperience = (draftYear?: number | string) => {
    if (!draftYear) return null;

    const draftYearNum =
      typeof draftYear === "string" ? parseInt(draftYear, 10) : draftYear;
    if (isNaN(draftYearNum)) return null;

    const today = new Date();
    return today.getFullYear() - draftYearNum;
  };


  const avatarUrl = player?.headshot_url;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={teamLogo}
          logoLight={teamLogoLight}
          teamColor={teamColor} // NBA blue
          onBack={goBack}
          isTeamScreen={!!teamObj}
          teamCode={teamCode} // 👈 add this
          isPlayerScreen={true} // 👈 Add this
        />
      ),
    });
  }, [navigation,  isDark]);

  // Find away team with extended type
  const awayTeamObj = teams.find((t) => t.id === teamLastGame?.away.id) as
    | TeamWithRecord
    | undefined;

  const enrichedLastGame: Game | null = teamLastGame
    ? {
        ...teamLastGame,
        home: {
          ...teamLastGame.home,
          logo: teamObj?.logo || "", // or find in teams by ID
          record: teamObj?.record || "",
        },
        away: {
          ...teamLastGame.away,
          logo: awayTeamObj?.logo || "",
          record: awayTeamObj?.record || "",
        },
      }
    : null;

  // console.log(JSON.stringify(player, null, 2))

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      {player && (
        <PlayerHeader
          player={player}
          avatarUrl={avatarUrl}
          isDark={isDark}
          teamColor={teamObj?.color} // primary team color
          teamSecondaryColor={teamObj?.secondaryColor} // secondary team color
          team_name={teamObj?.name} // team name string
          calculateAge={calculateAge}
          calculateExperience={calculateExperience}
        />
      )}

      {!loading && !error && player && player.active && (
        <View style={{ marginTop: 24 }}>
          <SeasonStatCard
            playerId={parsedPlayerId}
            teamColor={teamObj?.secondaryColor}
            teamColorDark={teamObj?.secondaryColor}
          />
        </View>
      )}
      {!teamGameLoading && enrichedLastGame && player?.active && (
        <>
          <View style={{ paddingHorizontal: 12, marginTop: 24 }}>
            <HeadingTwo>Last Game</HeadingTwo>
            <GameCard game={enrichedLastGame} />
          </View>
        </>
      )}
      <View style={{ marginTop: 24 }}>
        <PlayerStatTable playerId={parsedPlayerId} />
      </View>
      <View style={{ marginTop: 24 }}>
        <PlayerAwardList player={player} />
      </View>
    </ScrollView>
  );
}
