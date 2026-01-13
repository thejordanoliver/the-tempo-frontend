import CBBGameCard from "components/CBB/Games/CBBGameCard";
import PlayerHeader from "components/CBB/Player/PlayerHeader";
import PlayerStatTable from "components/CBB/Player/PlayerStatTable";
import SeasonStatCard from "components/CBB/Player/SeasonStatCard";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import HeadingTwo from "components/Headings/HeadingTwo";
import { players as cbbPlayers } from "constants/cbbPlayers";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { teams } from "constants/teamsCBB";
import { players as wcbbPlayers } from "constants/wcbbPlayers";
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
  const params = useLocalSearchParams<{
    id?: string;
    teamId?: string;
    league?: string;
  }>();

  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";

  // -------------------------
  // Params / League
  // -------------------------
  const parsedPlayerId = String(params.id ?? "").trim();
  const sanitizedTeamId = String(params.teamId ?? "")
    .replace(/"/g, "")
    .trim();

  const league =
    params.league === "WCBB" || params.league === "wcbb" ? "WCBB" : "CBB";

  const isWomen = league === "WCBB";
  const localPlayers = isWomen ? wcbbPlayers : cbbPlayers;

  const season = "2025";

  // -------------------------
  // Team lookup (header team)
  // -------------------------
  const teamObj = teams.find((t) =>
    isWomen
      ? String((t as any).wid) === sanitizedTeamId
      : String(t.id) === sanitizedTeamId
  );

  const teamNumericId = Number(sanitizedTeamId);

  // -------------------------
  // Player
  // -------------------------
  const [player, setPlayer] = useState<CBBPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avatarUrl = player?.imageUrl;

  // -------------------------
  // Last Game
  // -------------------------
  const { lastGame: teamLastGame } = useLastTeamGame({
    teamId: teamNumericId,
    season: "2025-2026",
    isWomen,
  });

  /**
   * Resolve API team → local team (CBB vs WCBB safe)
   */
  const resolveLocalTeam = (apiTeamId?: number): TeamWithRecord | undefined => {
    if (!apiTeamId) return undefined;

    return isWomen
      ? teams.find((t) => String((t as any).wid) === String(apiTeamId))
      : teams.find((t) => String(t.id) === String(apiTeamId));
  };

  /**
   * Resolve correct logo source
   */
  const resolveTeamLogo = (apiTeamId?: number) => {
    const localTeam = resolveLocalTeam(apiTeamId);

    return (
      (isDark ? localTeam?.logo : localTeam?.logoLight) ??
      require("assets/College_Logos/NCAA.png")
    );
  };

  const enrichedLastGame: CBBGame | null = teamLastGame
    ? {
        ...teamLastGame,
        teams: {
          home: {
            ...teamLastGame.teams.home,
            logo: resolveTeamLogo(Number(teamLastGame.teams.home.id)),
          },
          away: {
            ...teamLastGame.teams.away,
            logo: resolveTeamLogo(Number(teamLastGame.teams.away.id)),
          },
        },
      }
    : null;

  // -------------------------
  // Player lookup
  // -------------------------
  useEffect(() => {
    const found = localPlayers.find((p) => String(p.id) === parsedPlayerId);

    if (found) {
      setPlayer(found);
      setError(null);
    } else {
      setError("Player not found.");
    }
  }, [parsedPlayerId, localPlayers]);

  // -------------------------
  // Header
  // -------------------------
  useLayoutEffect(() => {
    const isTeamAvailable = !!teamObj;

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={
            isTeamAvailable
              ? isDark
                ? teamObj?.logo
                : teamObj?.logoLight
              : require("assets/College_Logos/NCAA.png")
          }
          logoLight={teamObj?.logoLight}
          teamColor={isTeamAvailable ? teamObj?.color : "#1D428A"}
          onBack={() => navigation.goBack()}
          isTeamScreen={isTeamAvailable}
          teamCode={teamObj?.code}
          isPlayerScreen
          league={league}
        />
      ),
    });
  }, [navigation, teamObj, isDark, league]);

  // -------------------------
  // Styles
  // -------------------------
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        errorText: {
          fontFamily: Fonts.OSREGULAR,
          fontSize: 16,
          textAlign: "center",
          marginTop: 20,
          color: isDark ? Colors.dark.lightRed : Colors.light.red,
        },
      }),
    [isDark]
  );

  // -------------------------
  // States
  // -------------------------
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

  // -------------------------
  // Render
  // -------------------------
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <PlayerHeader
        player={player}
        avatarUrl={avatarUrl}
        isDark={isDark}
        teamColor={teamObj?.color}
        teamSecondaryColor={teamObj?.secondaryColor}
        team_name={teamObj?.name}
        isWomen={isWomen}
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
            isWomen={isWomen}
          />
        </View>
      )}

      <View style={{ marginTop: 24 }}>
        <PlayerStatTable playerId={Number(player.id)} />
      </View>
    </ScrollView>
  );
}
