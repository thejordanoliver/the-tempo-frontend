import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerCard from "components/Player/PlayerCard";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { useTeamPlayers } from "hooks/NFLHooks/useTeamPlayers";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface RosterProps {
  teamId: string;
  teamName: string;
  league: "NFL" | "CFB";
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

const Roster = forwardRef(({ teamId, teamName, league }: RosterProps, ref) => {
  const {
    players: teamPlayers,
    loading,
    refreshing,
    error,
    refetch,
  } = useTeamPlayers(teamId, league);

  useImperativeHandle(ref, () => ({
    refresh: refetch,
  }));

  const sections = useMemo(() => {
    if (!teamPlayers || teamPlayers.length === 0) return [];

    const grouped: Record<string, typeof teamPlayers> = {};

    teamPlayers.forEach((p) => {
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
  }, [teamPlayers]);

  const isDark = useColorScheme() === "dark";
  const styles = rosterStyles(isDark);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (!teamPlayers || teamPlayers.length === 0) {
    return <Text style={styles.errorText}>No players found.</Text>;
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.player_id.toString()}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refetch}
          tintColor={isDark ? Colors.white : Colors.black}
        />
      }
      renderItem={({ item }) => (
        <PlayerCard
          id={item.player_id}
          name={item.name}
          position={item.position ?? ""}
          avatarUrl={item.avatarUrl ?? undefined}
          number={item.jersey_number ?? undefined}
          team={teamName}
          league={league}
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <HeadingTwo>{title}</HeadingTwo>
      )}
      renderSectionFooter={() => <View style={{ height: 12 }} />}
    />
  );
});

const rosterStyles = (isDark: boolean) =>
  StyleSheet.create({
    listContent: {
      paddingBottom: 100,
      paddingHorizontal: 12,
    },
    center: {
      marginTop: 40,
      alignItems: "center",
    },
    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });

export default Roster;
