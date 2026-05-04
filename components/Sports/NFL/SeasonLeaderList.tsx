import PlayerCardSkeletonList from "components/Skeletons/PlayerCardListSkeleton";
import PlayerCard from "components/Sports/NBA/Player/PlayerCard";
import { cbbTeams } from "constants/teamsCBB";
import { cfbTeams } from "constants/teamsCFB";
import { mlbTeams } from "constants/teamsMLB";
import { nflTeams } from "constants/teamsNFL";
import { nhlTeams } from "constants/teamsNHL";
import { Leader } from "hooks/FootballHooks/useSeasonLeaders";
import { useEffect, useRef } from "react";
import { FlatList, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { leadersListStyles } from "styles/LeagueStyles/LeadersListStyles";
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
  league: "NFL" | "NHL" | "CFB" | "MLB" | "CBB" | "WCBB";
  isDark: boolean;
}

export default function SeasonLeadersList({
  loading,
  error,
  league,
  isDark,
  categories = [],
}: SeasonLeadersListProps) {
  const styles = leadersListStyles(isDark);
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
    WCBB: cbbTeams,
  };

  const teamList = leagueTeamsMap[league];
  const isMLB = league === "MLB";
  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.skeletonList}>
        <PlayerCardSkeletonList />
        <PlayerCardSkeletonList />
        <PlayerCardSkeletonList />
        <PlayerCardSkeletonList />
        <PlayerCardSkeletonList />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Failed to load stats: {error}</Text>
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
                const teamObj = teamList.find(
                  (t) => Number(t.espnID) === Number(player.teamId),
                );

                return (
                  <PlayerCard
                    key={player.playerId ?? player.athleteId}
                    rank={player.rank}
                    id={Number(player.playerId ?? player.athleteId)}
                    name={player.shortName}
                    position={player.position}
                    team={teamObj?.name ?? "Unknown Team"}
                    avatarUrl={player.headshot}
                    statNumber={isMLB ? player.value : player.displayValue}
                    league={league}
                    teamId={teamObj?.id}
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
