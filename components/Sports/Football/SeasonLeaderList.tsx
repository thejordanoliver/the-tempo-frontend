import { PlayerCard } from "@/components/Sports/Basketball/Player/PlayerCard";
import { globalStyles } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
import { SeasonLeaderCategory } from "@/types/stats";
import PlayerCardSkeletonList from "components/Skeletons/PlayerCardListSkeleton";
import { FlatList, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { leadersListStyles } from "styles/LeagueStyles/LeadersListStyles";

import HeadingTwo from "../../Headings/HeadingTwo";

interface SeasonLeadersListProps {
  loading?: boolean;
  error?: string | null;
  categories?: SeasonLeaderCategory[];
  league: string;
}

const normalizeNumericTeamId = (
  value: string | number | null | undefined,
): number => {
  if (value === null || value === undefined || value === "") return 0;

  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const normalizeNumericPlayerId = (
  value: string | number | null | undefined,
): number | null => {
  if (value === null || value === undefined || value === "") return null;

  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

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
      data={categories}
      contentContainerStyle={styles.contentContainerStyle}
      keyExtractor={(item) => item.categoryName}
      renderItem={({ item }) => {
        if (!item.leaders || item.leaders.length === 0) {
          return null;
        }

        return (
          <View style={styles.categoryContainer}>
            <HeadingTwo isDark={isDark}>{item.categoryName} Leaders</HeadingTwo>

            <View style={styles.playersList}>
              {item.leaders.map((player) => {
                const playerId = normalizeNumericPlayerId(player.id);

                if (playerId === null) {
                  return null;
                }

                return (
                  <PlayerCard
                    key={`${player.id}-${player.rank}`}
                    rank={player.rank}
                    id={playerId}
                    name={player.short_name}
                    headshot={player.headshot}
                    statNumber={player.stat_value}
                    league={league}
                    teamId={normalizeNumericTeamId(player.team_id)}
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
