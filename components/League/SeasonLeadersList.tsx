import PlayerCard from "components/Sports/NBA/Player/PlayerCard";
import PlayerCardSkeletonList from "components/Sports/NBA/Player/PlayerCardListSkeleton";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { teams } from "constants/teams"; // import your teams list
import { useRouter } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { PlayerLeader } from "types/stats";
import HeadingTwo from "../Headings/HeadingTwo";
interface SeasonLeadersListProps {
  leadersByStat: Partial<{
    points: PlayerLeader[];
    assists: PlayerLeader[];
    rebounds: PlayerLeader[];
    steals: PlayerLeader[];
    blocks: PlayerLeader[];
    tpm: PlayerLeader[];
    ftm: PlayerLeader[];
  }>;
  loading?: boolean;
  error?: string | null;
}

const STAT_DISPLAY_NAMES: Record<string, string> = {
  points: "Points",
  assists: "Assists",
  rebounds: "Rebounds",
  steals: "Steals",
  blocks: "Blocks",
  tpm: "Three Point",
  ftm: "Free Throw",
};

export default function SeasonLeadersList({
  leadersByStat,
  loading,
  error,
}: SeasonLeadersListProps) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const router = useRouter();

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
      data={Object.entries(leadersByStat).filter(
        ([_, players]) => Array.isArray(players) && players.length > 0
      )}
      contentContainerStyle={{ paddingBottom: 100 }}
      keyExtractor={([stat]) => stat}
      renderItem={({ item: [stat, players] }) => (
        <View style={styles.categoryContainer}>
          <HeadingTwo style={{ marginBottom: 12 }}>
            {STAT_DISPLAY_NAMES[stat] || stat} Leaders
          </HeadingTwo>

          <View style={styles.playersList}>
            {players!.map((player) => {
              const statKey = `avg_${stat}` as keyof PlayerLeader;
              const statValue = player[statKey] ?? "0";

              const fullName =
                player.full_name ?? `${player.first_name} ${player.last_name}`;
              const headshotUrl =
                player.headshot_url || "https://via.placeholder.com/40";

              const teamObj = teams.find(
                (t) => t.id.toString() === player.team_id?.toString()
              );
              const cleanTeam = teamObj?.fullName?.replace(/"/g, "") || "";

              return (
                <TouchableOpacity
                  key={player.player_id}
                  onPress={() => {
                    if (!teamObj) return;
                    router.push({
                      pathname: "/player/[id]",
                      params: {
                        id: player.player_id.toString(),
                        teamId: teamObj.id.toString(),
                      },
                    });
                  }}
                >
                  <PlayerCard
                    id={player.player_id}
                    name={fullName}
                    team={cleanTeam}
                    avatarUrl={headshotUrl}
                    statNumber={statValue} // ✅ NEW — shows as stat number
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
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

    playersList: {
      gap: 12,
    },

    centered: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    skeletonList: {
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 100,
    },
    infoText: {
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
