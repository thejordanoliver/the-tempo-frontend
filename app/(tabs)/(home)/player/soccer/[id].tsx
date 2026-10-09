import { CustomHeader } from "@/components/CustomHeader";
import PlayerHeader from "@/components/Sports/Soccer/Player/PlayerHeader";
import PlayerStatTable from "@/components/Sports/Soccer/Player/PlayerStatTable";
import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { usePlayerById } from "@/hooks/LeagueHooks/usePlayerById";
import { usePlayerSeasons } from "@/hooks/SoccerHooks/usePlayerSeasons";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useMemo, useLayoutEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

const normalizeParam = (
  value: string | string[] | number | null | undefined,
): string | null => {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  const stringValue = String(normalizedValue ?? "").trim();

  return stringValue ? stringValue : null;
};

export default function PlayerDetailScreen() {
  const navigationContentStyle = useNavigationBarContentStyle();
  const { id, teamId, league } = useLocalSearchParams<{
    id?: string | string[];
    teamId?: string | string[];
    league?: string | string[];
  }>();
  const styles = playerScreenStyles;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const navigation = useNavigation();
  const normalizedPlayerId = normalizeParam(id);
  const playerId =
    normalizedPlayerId && /^\d+$/.test(normalizedPlayerId)
      ? Number(normalizedPlayerId)
      : undefined;
  const routeTeamId = normalizeParam(teamId);
  const normalizedLeague = normalizeParam(league)?.toUpperCase();
  const playerLeague = normalizedLeague === "SOCC" ? "SOCC" : "SOCC";
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(
    null,
  );
  const { player, loading, error } = usePlayerById(playerId, playerLeague);
  const playerTeamId = normalizeParam(player?.team_id);
  const headerTeamId = playerTeamId ?? routeTeamId;
  const team = headerTeamId ? getSOCCTeam(headerTeamId) : undefined;
  const teamLogo = getSOCCTeamLogo(headerTeamId ?? undefined, true);
  const teamColor = team?.color ?? Colors.midTone;

  const {
    seasons,
    teamOptions,
    selectedFilters,
    seasonsLoading,
    seasonsError,
  } = usePlayerSeasons(playerId, {
    teamId: selectedTeamId,
    competition: selectedCompetition,
    enabled: Boolean(playerId),
  });

  const effectiveSelectedTeamId =
    selectedTeamId ?? selectedFilters?.teamId ?? playerTeamId;

  const handleTeamChange = (newTeamId: string) => {
    setSelectedTeamId(newTeamId);
    setSelectedCompetition(null);
  };

  const handleCompetitionChange = (competition: string | null) => {
    setSelectedCompetition(competition);
  };

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

  if (loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>
          {error || "Failed to load player"}
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
    <ScrollView
      contentContainerStyle={navigationContentStyle(
        styles.contentContainerStyle,
      )}
    >
      <PlayerHeader player={player} isDark={isDark} />

      <PlayerStatTable
        seasons={seasons}
        teamOptions={teamOptions.length || !headerTeamId ? teamOptions : [{
          value: headerTeamId,
          label: team?.name ?? headerTeamId,
          teamId: headerTeamId,
          teamName: team?.name ?? null,
          teamSlug: null,
          competitions: [],
        }]}
        selectedTeamId={effectiveSelectedTeamId}
        selectedCompetition={selectedCompetition}
        onTeamChange={handleTeamChange}
        onCompetitionChange={handleCompetitionChange}
        loading={seasonsLoading}
        error={seasonsError}
      />
    </ScrollView>
  );
}
