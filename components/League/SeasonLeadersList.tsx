import PlayerCard from "components/Sports/NBA/Player/PlayerCard";
import PlayerCardSkeletonList from "components/Sports/NBA/Player/PlayerCardListSkeleton";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { getNBATeam } from "constants/teams"; // import your teams list
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
  // Counting Stats
  PTS: "Points",
  AST: "Assists",
  REB: "Total Rebounds",
  OREB: "Offensive Rebounds",
  DREB: "Defensive Rebounds",
  STL: "Steals",
  BLK: "Blocks",
  TOV: "Turnovers",
  FGM: "Field Goals Made",
  FGA: "Field Goals Attempted",
  FG3M: "Three Pointers Made",
  FG3A: "Three Pointers Attempted",
  FTM: "Free Throws Made",
  FTA: "Free Throws Attempted",

  // Calculated Percentages (to be computed manually)
  FG_PCT: "Field Goal %",
  FG3_PCT: "Three Point %",
  FT_PCT: "Free Throw %",

  // Efficiency & Ratios (calculated manually)
  EFF: "Efficiency",
  AST_TOV: "AST/TOV Ratio",
  STL_TOV: "STL/TOV Ratio",
};

export default function SeasonLeadersList({
  leadersByStat,
  loading,
  error,
}: SeasonLeadersListProps) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const router = useRouter();
  const global = globalStyles(isDark);
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
        <Text style={global.errorText}>Failed to load stats</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={Object.entries(leadersByStat).filter(
        ([_, players]) => Array.isArray(players) && players.length > 0,
      )}
      contentContainerStyle={styles.contentContainerStyle}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      keyExtractor={([stat]) => stat}
      renderItem={({ item: [stat, players] }) => (
        <View>
          <HeadingTwo isDark={isDark}>
            {STAT_DISPLAY_NAMES[stat] || stat} Leaders
          </HeadingTwo>

          <View style={styles.playersList}>
            {players!.map((player) => {
              const statValue = player.value ?? "0";
              const name = player.player.short_name;

              const headshotUrl =
                player.player.headshot_url || "https://via.placeholder.com/40";

              const team = getNBATeam(player.player.team_id);
              const teamName = team?.name ?? "";

              return (
                <TouchableOpacity
                  key={player.player.player_id}
                  onPress={() => {
                    if (!team) return;
                    router.push({
                      pathname: "/player/[id]",
                      params: {
                        id: player.player.id.toString(),
                        teamId: team.id.toString(),
                      },
                    });
                  }}
                >
                  <PlayerCard
                    id={player.player.player_id}
                    teamId={player.player.team_id}
                    rank={player.rank}
                    name={name}
                    team={teamName}
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
    contentContainerStyle: {
      paddingBottom: 100,
      gap: 12,
      paddingHorizontal: 12,
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
