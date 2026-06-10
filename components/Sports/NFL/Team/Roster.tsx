import { Player } from "@/hooks/LeagueHooks/useRoster";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerCardSkeletonList from "components/Skeletons/PlayerCardListSkeleton";
import { PlayerCard } from "components/Sports/NBA/Player/PlayerCard";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface RosterProps {
  players: Player[];
  league: "NFL" | "CFB";
  loading: boolean;
  error?: string | null;
  refreshing: boolean;
  onRefresh: () => void;
}

/* ------------------------- */
/* Position order            */
/* ------------------------- */
const POSITION_ORDER = [
  "QB",
  "RB",
  "WR",
  "TE",
  "G",
  "C",
  "T",
  "DT",
  "DE",
  "LB",
  "CB",
  "S",
  "K",
  "P",
  "LS",
];

export default function Roster({
  players,
  league,
  loading,
  error,
  refreshing,
  onRefresh,
}: RosterProps) {
  const sections = useMemo(() => {
    if (!players || players.length === 0) return [];

    const grouped: Record<string, typeof players> = {};

    players.forEach((p) => {
      const pos = p.position || "Other";
      if (!grouped[pos]) grouped[pos] = [];
      grouped[pos].push(p);
    });

    return Object.keys(grouped)
      .sort((a, b) => {
        const indexA = POSITION_ORDER.indexOf(a);
        const indexB = POSITION_ORDER.indexOf(b);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      })
      .map((pos) => ({
        title: pos,
        data: grouped[pos],
      }));
  }, [players]);

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = rosterStyles(isDark);
  const global = globalStyles(isDark);
  const tintColor = isDark ? Colors.white : Colors.black;

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <PlayerCardSkeletonList count={75} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );
  }

  if (!players || players.length === 0) {
    return <Text style={global.emptyText}>No players found.</Text>;
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) =>
        item.player_id ? String(item.player_id) : `player-${index}`
      }
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tintColor}
        />
      }
      renderItem={({ item }) => (
        <PlayerCard
          key={item.id}
          id={item.player_id}
          name={item.full_name}
          position={item.position}
          headshot={item.headshot_url}
          number={item.jersey_number}
          teamId={item.team_id}
          league={league}
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <HeadingTwo isDark={isDark}>{title}</HeadingTwo>
      )}
      renderSectionFooter={() => <View style={{ height: 12 }} />}
    />
  );
}

export const rosterStyles = (isDark: boolean) =>
  StyleSheet.create({
    listContent: {
      paddingBottom: 100,
      paddingHorizontal: 12,
    },
    loadingContainer: {
      paddingBottom: 100,
    },
    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
