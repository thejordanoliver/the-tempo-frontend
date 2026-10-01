import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { PlayerCard } from "@/components/Sports/Basketball/Player/PlayerCard";
import { globalStyles } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
import { SeasonLeaderCategory } from "@/types/stats";
import PlayerCardSkeletonList from "components/Skeletons/PlayerCardListSkeleton";
import { Link, useSegments } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { leadersListStyles } from "styles/LeagueStyles/LeadersListStyles";
import { getTabGroup, scopeHrefToTab } from "utils/tabStackNavigation";

import HeadingTwo from "../Headings/HeadingTwo";

interface SeasonLeadersListProps {
  loading?: boolean;
  error?: string | null;
  categories?: SeasonLeaderCategory[];
  league: string;
  season: number;
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
  season,
  categories = [],
}: SeasonLeadersListProps) {
  const segments = useSegments();
  const tabGroup = getTabGroup(segments as readonly string[]);
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = leadersListStyles(isDark);
  const global = globalStyles(isDark);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={navigationContentStyle(styles.skeletonList)}>
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
      contentContainerStyle={navigationContentStyle(styles.contentContainerStyle)}
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

            <Link
              href={scopeHrefToTab(
                {
                  pathname: "/season-leaders/[league]",
                  params: {
                    league,
                    season: String(season),
                    category: item.shortName || item.categoryName,
                  },
                },
                tabGroup,
              )}
              asChild
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Show more ${item.categoryName} leaders`}
                style={({ pressed }) => [
                  styles.showMoreButton,
                  pressed && styles.showMoreButtonPressed,
                ]}
              >
                <Text style={styles.showMoreText}>Show more</Text>
              </Pressable>
            </Link>
          </View>
        );
      }}
    />
  );
}
