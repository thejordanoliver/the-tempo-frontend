import { CustomHeader } from "@/components/CustomHeader";
import LatestGame from "@/components/Sports/Basketball/Player/LatestGame";
import PlayerAwardList from "@/components/Sports/Basketball/Player/PlayerAwardList";
import PlayerHeader from "@/components/Sports/Basketball/Player/PlayerHeader";
import PlayerStatTable from "@/components/Sports/Basketball/Player/PlayerStatTable";
import SeasonStatCard from "@/components/Sports/Basketball/Player/SeasonStatCard";
import {
  getNBATeam,
  getNBATeamLogo,
  getTeamByESPNId,
} from "@/constants/teams";
import {
  getWCBBTeam,
  getWCBBTeamByESPNId,
  getWCBBTeamLogo,
} from "@/constants/teamsWCBB";
import {
  getWNBATeam,
  getWNBATeamByESPNId,
  getWNBATeamLogo,
} from "@/constants/teamsWNBA";
import {
  BasketballLeague,
  usePlayerSeasons,
} from "@/hooks/BasketballHooks/usePlayerSeasons";
import { useTeamLatestGame } from "@/hooks/BasketballHooks/useTeamLatestGame";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import {
  getCBBTeam,
  getCBBTeamByESPNId,
  getCBBTeamLogo,
} from "constants/teamsCBB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect, useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

const BASKETBALL_LEAGUES = new Set<BasketballLeague>([
  "nba",
  "wnba",
  "cbb",
  "wcbb",
]);

function normalizeBasketballLeague(league: unknown): BasketballLeague {
  const normalized = String(league ?? "").trim().toLowerCase();
  return BASKETBALL_LEAGUES.has(normalized as BasketballLeague)
    ? (normalized as BasketballLeague)
    : "nba";
}

export default function PlayerDetailScreen() {
  const {
    id,
    teamId: routeTeamId,
    league,
  } = useLocalSearchParams<{
    id?: string;
    teamId?: string;
    league?: string;
  }>();
  const styles = playerScreenStyles;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const navigation = useNavigation();
  const requestedPlayerId = Number(id);
  const requestedLeague = normalizeBasketballLeague(league);

  const {
    player: statsPlayer,
    seasons,
    collegeSeasons,
    resolvedLeague,
    canonicalProfile,
    seasonsLoading,
    seasonsError,
  } = usePlayerSeasons(requestedPlayerId, requestedLeague);

  const canonicalPlayerId = useMemo(() => {
    const resolvedId =
      canonicalProfile?.playerId ??
      (requestedLeague !== "cbb" ? requestedPlayerId : undefined);

    if (resolvedId === undefined) return undefined;

    const parsed = Number(resolvedId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }, [canonicalProfile?.playerId, requestedLeague, requestedPlayerId]);

  const canonicalLeague = canonicalProfile?.league ?? resolvedLeague;
  const isNBA = canonicalLeague === "nba";
  const isWNBA = canonicalLeague === "wnba";
  const isCBB = canonicalLeague === "cbb";
  const isWCBB = canonicalLeague === "wcbb";

  const { player, loading, error } = usePlayerById(
    canonicalPlayerId,
    canonicalLeague,
    requestedLeague !== "cbb" || Boolean(canonicalProfile),
  );

  const currentTeamId = useMemo(() => {
    const profileTeamId = player?.team_id;

    if (profileTeamId !== null && profileTeamId !== undefined) {
      return String(profileTeamId);
    }

    const statsTeamId = statsPlayer?.team_id;

    if (statsTeamId !== null && statsTeamId !== undefined) {
      return String(statsTeamId);
    }

    return routeTeamId ? String(routeTeamId) : "";
  }, [player?.team_id, routeTeamId, statsPlayer?.team_id]);

  const team = useMemo(() => {
    if (!currentTeamId) return null;

    if (isNBA) {
      return getNBATeam(currentTeamId) ?? getTeamByESPNId(currentTeamId);
    }

    if (isWNBA) {
      return (
        getWNBATeam(currentTeamId) ?? getWNBATeamByESPNId(currentTeamId)
      );
    }

    if (isWCBB) {
      return (
        getWCBBTeam(currentTeamId) ?? getWCBBTeamByESPNId(currentTeamId)
      );
    }

    return getCBBTeam(currentTeamId) ?? getCBBTeamByESPNId(currentTeamId);
  }, [currentTeamId, isNBA, isWCBB, isWNBA]);

  const teamLogo = useMemo(() => {
    const logoTeamId = team?.id ?? currentTeamId;

    if (!logoTeamId) return undefined;

    if (isNBA) return getNBATeamLogo(logoTeamId, isDark);
    if (isWNBA) return getWNBATeamLogo(logoTeamId, isDark);
    if (isWCBB) return getWCBBTeamLogo(logoTeamId, isDark);
    return getCBBTeamLogo(logoTeamId, isDark);
  }, [currentTeamId, isDark, isNBA, isWCBB, isWNBA, team?.id]);

  const teamColor = team?.color ?? Colors.midTone;
  const isActive = player?.active === true;
  const resolvedTeamId = team?.id != null ? String(team.id) : currentTeamId;

  const {
    game,
    loading: gameLoading,
    error: gameError,
  } = useTeamLatestGame(canonicalLeague, resolvedTeamId);

  /* ---------------- Header ---------------- */
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          logo={teamLogo}
          teamColor={teamColor}
          onBack={() => navigation.goBack()}
          isTeamScreen
          isPlayerScreen
        />
      ),
    });
  }, [navigation, teamLogo, teamColor]);

  if (seasonsLoading || loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (seasonsError || error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>
          {seasonsError || error || "Failed to load player"}
        </Text>
      </View>
    );

  if (!player)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Player not found</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <PlayerHeader
        player={player}
        isDark={isDark}
        league={canonicalLeague}
      />

      <SeasonStatCard
        seasons={seasons}
        loading={seasonsLoading}
        error={seasonsError}
        league={canonicalLeague}
      />

      {isActive && resolvedTeamId ? (
        <LatestGame
          game={game}
          loading={gameLoading}
          error={gameError}
          isDark={isDark}
          league={canonicalLeague}
          isCBB={isCBB}
          isWCBB={isWCBB}
          isWNBA={isWNBA}
        />
      ) : null}

      <PlayerStatTable
        seasons={seasons}
        collegeSeasons={collegeSeasons}
        loading={seasonsLoading}
        error={seasonsError}
        league={canonicalLeague}
      />

      <PlayerAwardList player={player} />
    </ScrollView>
  );
}
