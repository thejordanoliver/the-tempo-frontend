import { Ionicons } from "@expo/vector-icons";
import SearchBar from "components/SearchBars/AnimatedSearchBar";
import { Dropdown } from "components/Dropdown";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { teams } from "constants/teams";
import { teams as nflteams } from "constants/teamsNFL";
import { useDraft } from "hooks/useLeagueDraft";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import DraftCardSkeleton from "./DraftCardSkeleton";
import DraftCard, { DraftPick } from "./DraftCard";
type Props = {
  year: string;
  team: string;
  round: string;
  view?: "players" | "teams";
  onYearChange: (y: string) => void;
  onTeamChange: (t: string) => void;
  onRoundChange: (r: string) => void;
  onViewChange?: (v: "players" | "teams") => void;
  league: "nba" | "nfl";
};

const POSITION_MAP: Record<string, string> = {
  "1": "Point Guard",
  "2": "Shooting Guard",
  "3": "Guard",
  "5": "Small Forward",
  "6": "Power Forward",
  "7": "Forward",
  "9": "Center",
};
const NFL_POSITION_MAP: Record<string, string> = {
  "8": "Quarterback",
  "9": "Running Back",
  "1": "Wide Receiver",
  "7": "Tight End",
  "10": "Fullback",
  "46": "Offensive Tackle",
  "47": "Offensive Guard",
  "91": "Center",
  "32": "Defensive Tackle",
  "30": "Linebacker",
  "264": "EDGE",
  "29": "Cornerback",
  "36": "Safety",
  "96": "Long Snapper",
  "80": "Place Kicker",
  "94": "Punter",
};

export default function DraftList({
  year,
  team,
  round,
  view,
  league,
  onYearChange,
  onTeamChange,
  onRoundChange,
  onViewChange,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const listRef = useRef<FlatList>(null);

  // 🔍 SEARCH TERM
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
  };

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [year, round, team, search]);

  const selectedYear = year;
  const selectedTeam = team;
  const selectedRound = round;

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selectedYear, selectedRound, selectedTeam]);

  // ---------------------------
  // YEAR OPTIONS
  // ---------------------------
  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    const arr = [];
    for (let y = now + 0; y >= now - 24; y--) {
      arr.push({ label: String(y), value: String(y) });
    }
    return arr;
  }, []);

  // ---------------------------
  // FETCH NBA DRAFT
  // ---------------------------
  const { draft, loading, error } = useDraft(league, Number(selectedYear));

  const picks = draft?.picks ?? [];

  // ---------------------------
  // ROUND OPTIONS
  // ---------------------------
  const roundOptions = useMemo(() => {
    if (!picks.length) return [{ label: "All Rounds", value: "all" }];

    const uniqueRounds = Array.from(
      new Set<number>(picks.map((p: DraftPick) => p.round))
    ).sort((a, b) => a - b);

    return [
      { label: "All Rounds", value: "all" },
      ...uniqueRounds.map((r) => ({
        label: `Round ${r}`,
        value: String(r),
      })),
    ];
  }, [picks]);

  // Choose correct team list based on league
  const TEAM_LIST = league === "nba" ? teams : nflteams;

  // -------------------------------------------
  // TEAM OPTIONS — league-dependent
  // -------------------------------------------
  const teamOptions = useMemo(() => {
    const formatted = TEAM_LIST.map((t) => ({
      label: t.name,
      value: String(t.espnID),
    })).sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: "All Teams", value: "all" }, ...formatted];
  }, [league]);

  // -------------------------------------------
  // TEAM NAME LOOKUP MAP — league-dependent
  // -------------------------------------------
  const teamNameMap = useMemo(() => {
    const map: Record<string, string> = {};

    TEAM_LIST.forEach((t) => {
      map[String(t.espnID)] = t.name.toLowerCase();
    });

    return map;
  }, [league]);

  const CHUNK_SIZE = 20; // how many picks load per "page"

  // How many picks are currently visible
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);

  // Reset pagination whenever year/team/round/search changes
  useEffect(() => {
    setVisibleCount(CHUNK_SIZE);
  }, [selectedYear, selectedTeam, selectedRound, search, league]);

  // ---------------------------
  // FILTERED PLAYERS
  // ---------------------------
  const filteredPicks = useMemo(() => {
    if (!picks.length) return [];

    let list = picks;

    if (selectedRound !== "all") {
      list = list.filter((p: DraftPick) => String(p.round) === selectedRound);
    }

    if (selectedTeam !== "all") {
      list = list.filter((p: DraftPick) => String(p.teamId) === selectedTeam);
    }

    if (search.trim().length > 0) {
      const s = search.toLowerCase();

      const POSITION_LOOKUP =
        league === "nba" ? POSITION_MAP : NFL_POSITION_MAP;

      list = list.filter((p: DraftPick) => {
        const nameMatch = p.athlete?.name?.toLowerCase().includes(s);

        const positionId = p.athlete?.positionId;
        const pos = positionId ? POSITION_LOOKUP[String(positionId)] ?? "" : "";
        const posMatch = pos.toLowerCase().includes(s);

        const teamName = teamNameMap[String(p.teamId)];
        const teamMatch = teamName?.includes(s);

        return nameMatch || posMatch || teamMatch;
      });
    }

    return list;
  }, [picks, selectedRound, selectedTeam, search, league]);

  const visiblePicks = useMemo(
    () => filteredPicks.slice(0, visibleCount),
    [filteredPicks, visibleCount]
  );

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
        {/* ROW 1 — Icon + Dropdowns */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          {/* LEFT: Search icon */}
          <TouchableOpacity onPress={toggleSearch}>
            <Ionicons
              name={searchOpen ? "close" : "search"}
              size={22}
              color={isDark ? Colors.lightGray : Colors.darkGray}
            />
          </TouchableOpacity>

          {/* RIGHT: Dropdowns */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Dropdown
              options={yearOptions}
              selectedValue={year}
              onSelect={onYearChange}
              isDark={isDark}
              width={120}
            />

            <Dropdown
              options={roundOptions}
              selectedValue={round}
              onSelect={onRoundChange}
              isDark={isDark}
              width={120}
            />

            <Dropdown
              options={teamOptions}
              selectedValue={team}
              onSelect={onTeamChange}
              isDark={isDark}
              width={150}
            />
          </View>
        </View>

        {/* ROW 2 — SearchBar (full-width & collapsible) */}
        <SearchBar
          value={search}
          onChangeText={setSearch}
          visible={searchOpen}
          placeholder="Search players..."
        />
      </View>

      {loading ? (
        <FlatList
          ref={listRef}
          data={Array.from({ length: 10 })}
          keyExtractor={(_, i) => "skel-" + i}
          renderItem={() => <DraftCardSkeleton />}
        />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Error: {String(error)}</Text>
        </View>
      ) : filteredPicks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={visiblePicks}
          keyExtractor={(item) => `${item.overall}`}
          renderItem={({ item, index }) => (
            <DraftCard player={item} index={index} league={league} />
          )}
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            if (visibleCount < filteredPicks.length) {
              setVisibleCount((prev) => prev + CHUNK_SIZE);
            }
          }}
          ListFooterComponent={
            visibleCount < filteredPicks.length ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text
                  style={{ color: isDark ? Colors.lightGray : Colors.darkGray }}
                >
                  Loading more…
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 14,
      paddingBottom: 80,
    },
    dropdownRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 40,
    },
    errorText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    emptyText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      marginTop: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
