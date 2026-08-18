import { PlayerCard } from "@/components/Sports/Basketball/Player/PlayerCard";
import { globalStyles } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
import PlayerCardSkeletonList from "components/Skeletons/PlayerCardListSkeleton";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { getWCBBTeamByESPNId } from "constants/teamsWCBB";
import { Leader } from "hooks/FootballHooks/useSeasonLeaders";
import { useTeams as useLeagueTeams } from "hooks/LeagueHooks/useTeams";
import { useEffect, useRef } from "react";
import { FlatList, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { leadersListStyles } from "styles/LeagueStyles/LeadersListStyles";
import type { WCBBTeam } from "types/types";
import HeadingTwo from "../../Headings/HeadingTwo";

interface Category {
  categoryName: string;
  abbreviation: string;
  shortName: string;
  leaders: Leader[];
}

interface SeasonLeadersListProps {
  loading?: boolean;
  error?: string | null;
  categories?: Category[];
  league: string;
}

export default function SeasonLeadersList({
  loading,
  error,
  league,
  categories = [],
}: SeasonLeadersListProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = leadersListStyles(isDark);
  const global = globalStyles(isDark);
  const { teams: wcbbTeams } = useLeagueTeams("WCBB");
  const cacheRef = useRef<
    Partial<Record<SeasonLeadersListProps["league"], Category[]>>
  >({});

  useEffect(() => {
    if (!categories?.length) return;

    cacheRef.current[league] = categories;
  }, [categories, league]);

  const leagueTeamsMap = {
    NFL: nflTeams,
    NHL: nhlTeams,
    CFB: cfbTeams,
    MLB: mlbTeams,
    CBB: cbbTeams,
    WCBB: wcbbTeams as WCBBTeam[],
  };

  const teamList = leagueTeamsMap[league];
  const isMLB = league === "MLB";
  const getTeamId = (player: Leader) => {
    if (league !== "WCBB") {
      const teamObj = teamList.find(
        (t) => Number(t.espnId) === Number(player.teamId),
      );

      return teamObj?.id ?? 0;
    }

    const playerRecord = player as Leader & {
      databaseId?: string | number | null;
      database_id?: string | number | null;
      teamDatabaseId?: string | number | null;
      team_database_id?: string | number | null;
      wcbbTeamId?: string | number | null;
      wcbb_team_id?: string | number | null;
      teamEspnId?: string | number | null;
      team_espn_id?: string | number | null;
      espnTeamId?: string | number | null;
      espn_team_id?: string | number | null;
    };
    const explicitESPNId =
      playerRecord.teamEspnId ??
      playerRecord.team_espn_id ??
      playerRecord.espnTeamId ??
      playerRecord.espn_team_id;
    const teamByESPN = getWCBBTeamByESPNId(explicitESPNId);

    if (teamByESPN) return teamByESPN.id;

    const canonicalTeamId =
      playerRecord.databaseId ??
      playerRecord.database_id ??
      playerRecord.teamDatabaseId ??
      playerRecord.team_database_id ??
      playerRecord.wcbbTeamId ??
      playerRecord.wcbb_team_id ??
      player.teamId;

    return (
      (wcbbTeams as WCBBTeam[]).find(
        (team) => String(team.id) === String(canonicalTeamId),
      )?.id ?? 0
    );
  };

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.skeletonList}>
        <PlayerCardSkeletonList />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={global.errorText}>Failed to load stats: {error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={cacheRef.current[league] ?? categories}
      contentContainerStyle={{ paddingBottom: 100 }}
      keyExtractor={(item) => item.categoryName}
      renderItem={({ item }) => {
        if (!item.leaders || item.leaders.length === 0) {
          return null;
        }

        return (
          <View style={styles.categoryContainer}>
            <HeadingTwo isDark={isDark} style={{ marginBottom: 12 }}>
              {item.categoryName} Leaders
            </HeadingTwo>

            <View style={styles.playersList}>
              {item.leaders.slice(0, 5).map((player) => {
                return (
                  <PlayerCard
                    key={player.playerId ?? player.athleteId}
                    rank={player.rank}
                    id={Number(player.playerId ?? player.athleteId)}
                    name={player.shortName}
                    position={player.position}
                    headshot={player.headshot}
                    statNumber={isMLB ? player.value : player.displayValue}
                    league={league}
                    teamId={getTeamId(player)}
                  />
                );
              })}
            </View>
          </View>
        );
      }}
    />
  );
}
