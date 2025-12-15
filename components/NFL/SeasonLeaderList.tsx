import PlayerCardSkeletonList from "components/Player/PlayerCardListSkeleton";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";

import { teams as nflTeams } from "constants/teamsNFL";
import { teams as cfbTeams } from "constants/teamsCFB";
import { teams as mlbTeams } from "constants/teamsMLB";
import { teams as cbbTeams } from "constants/teamsCBB";

import { FlatList, StyleSheet, Text, useColorScheme, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import HeadingTwo from "../Headings/HeadingTwo";
import PlayerCard from "./Player/PlayerCard";

interface Leader {
  athleteId: string | number;
  teamId?: string | number | null;
  name: string;
  value: number;
  position?: string;
  headshot?: string;
}

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
  league: "NFL" | "CFB" | "MLB" | "CBB";
}

export default function SeasonLeadersList({
  loading,
  error,
  league,
  categories = [],
}: SeasonLeadersListProps) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const leagueTeamsMap = {
    NFL: nflTeams,
    CFB: cfbTeams,
    MLB: mlbTeams,
    CBB: cbbTeams,
  };

  const teamList = leagueTeamsMap[league];

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
      data={categories}
      contentContainerStyle={{ paddingBottom: 100 }}
      keyExtractor={(item) => item.categoryName}
     renderItem={({ item }) => {
  // 🚫 Skip categories with no leaders
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
            (t) => Number(t.espnID) === Number(player.teamId)
          );

          return (
            <PlayerCard
              key={player.athleteId}
              id={Number(player.athleteId)}
              name={player.name}
              position={player.position}
              team={teamObj?.name ?? "Unknown Team"}
              avatarUrl={player.headshot}
              statNumber={player.value}
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

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    categoryContainer: {
      paddingHorizontal: 12,
      paddingTop: 6,
      paddingBottom: 12,
    },
    playersList: { gap: 12 },
    centered: { alignItems: "center", justifyContent: "center", flex: 1 },
    skeletonList: { alignItems: "center", justifyContent: "center", paddingBottom: 100 },
    infoText: {
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
