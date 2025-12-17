// components/Roster.tsx
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerCard from "components/Player/PlayerCard";
import { players as cfbPlayers } from "constants/cfbPlayers";
import { players as nflPlayers } from "constants/nflPlayers";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
interface RosterProps {
  teamId: string;
  teamName: string;
  refreshing?: boolean;
  /** New: determines if we’re showing NFL or CFB roster */
  league?: "NFL" | "CFB";
}

// Custom position order
const POSITION_ORDER = [
  // Offense
  "QB",
  "RB",
  "WR",
  "TE",
  "G",
  "C",
  "T",
  // Defense
  "DT",
  "DE",
  "LB",
  "CB",
  "S",
  // Special Teams
  "K",
  "P",
  "LS",
];

const NFLRoster = forwardRef(
  ({ teamId, teamName, league = "NFL" }: RosterProps, ref) => {
    // Pick correct player dataset
    const allPlayers = league === "CFB" ? cfbPlayers : nflPlayers;

    // Filter players by team
    const teamPlayers = useMemo(
      () => allPlayers.filter((p) => p.teamId === Number(teamId)),
      [teamId, allPlayers]
    );

    // expose dummy refresh (no API here)
    useImperativeHandle(ref, () => ({
      refresh: () => {},
    }));

    // group players by position
    const sections = useMemo(() => {
      if (!teamPlayers || teamPlayers.length === 0) return [];

      const grouped: Record<string, typeof teamPlayers> = {};

      teamPlayers.forEach((p) => {
        const pos = p.position || "Other";
        if (!grouped[pos]) grouped[pos] = [];
        grouped[pos].push(p);
      });

      // Sort sections by POSITION_ORDER, fallback alphabetical
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

    if (!teamPlayers || teamPlayers.length === 0)
      return <Text style={styles.message}>No players found.</Text>;

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />} // 👈 Added 12px spacing
        renderItem={({ item }) => (
          <PlayerCard
            id={item.id}
            name={item.name}
            position={item.position ?? ""}
            avatarUrl={item.image}
            number={item.number} // ✅ FIX
            team={teamName}
            league={league} // 👈 Pass the league prop
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <HeadingTwo>{title}</HeadingTwo>
        )}
        renderSectionFooter={() => <View style={{ height: 12 }} />} // 👈 spacing after each section
        stickySectionHeadersEnabled={false}
      />
    );
  }
);

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 12,
  },

  message: {
    textAlign: "center",
    marginTop: 20,
  },
});

export default NFLRoster;
