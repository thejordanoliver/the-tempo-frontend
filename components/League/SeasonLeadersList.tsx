import { PlayerCard } from "@/components/Sports/Basketball/Player/PlayerCard";
import PlayerCardSkeletonList from "components/Skeletons/PlayerCardListSkeleton";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { FlatList, StyleSheet, Text, View } from "react-native";
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
  FG_PCT: "Field Goal %",
  FG3_PCT: "Three Point %",
  FT_PCT: "Free Throw %",
  EFF: "Efficiency",
  AST_TOV: "AST/TOV Ratio",
  STL_TOV: "STL/TOV Ratio",
};

export default function SeasonLeadersList({
  leadersByStat,
  loading,
  error,
}: SeasonLeadersListProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = seasonLeadersListStyles(isDark);
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
      renderItem={({ item: [stat, players] }) => {
        const statName = STAT_DISPLAY_NAMES[stat] || stat;
        return (
          <View>
            <HeadingTwo isDark={isDark}>{statName} Leaders</HeadingTwo>

            <View style={styles.playersList}>
              {players!.map((item) => {
                const statValue = item.value ?? "0";
                const name = item.player.short_name;
                const headshot = item.player.headshot_url;
                const playerId = item.player.id;
                const teamId = item.player.team_id;
                const rank = item.rank;

                return (
                  <PlayerCard
                    id={playerId}
                    key={playerId}
                    teamId={teamId}
                    headshot={headshot}
                    rank={rank}
                    name={name}
                    statNumber={statValue}
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

const seasonLeadersListStyles = (isDark: boolean) =>
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
  });
