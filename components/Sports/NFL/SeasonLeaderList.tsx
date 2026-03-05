import PlayerCardSkeletonList from "components/Sports/NBA/Player/PlayerCardListSkeleton";
import PlayerCard from "components/Sports/NBA/Player/PlayerCard";
import { teams as cbbTeams } from "constants/teamsCBB";
import { teams as cfbTeams } from "constants/teamsCFB";
import { teams as mlbTeams } from "constants/teamsMLB";
import { teams as nflTeams } from "constants/teamsNFL";
import { useEffect, useRef } from "react";
import { FlatList, Text, useColorScheme, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { leadersListStyles } from "styles/LeagueStyles/LeadersListStyles";
import HeadingTwo from "../../Headings/HeadingTwo";
import { Leader } from "hooks/NFLHooks/useSeasonLeaders";

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
  league: "NFL" | "CFB" | "MLB" | "CBB" | "WCBB";
}

export default function SeasonLeadersList({
  loading,
  error,
  league,
  categories = [],
}: SeasonLeadersListProps) {
  const isDark = useColorScheme() === "dark";
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
            <HeadingTwo style={{ marginBottom: 12 }}>
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
