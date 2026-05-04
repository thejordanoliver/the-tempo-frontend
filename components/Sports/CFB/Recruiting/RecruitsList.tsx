import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "components/Dropdown";
import SearchBar from "components/SearchBars/AnimatedSearchBar";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCFBTeamRecruits } from "hooks/FootballHooks/useCFBTeamRecruits";
import {
  FootballRecruit,
  useFootballRecruits,
} from "hooks/FootballHooks/useFootballRecruits";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RecruitCardSkeleton from "../../../Skeletons/RecruitCardSkeleton";
import TeamRankCardSkeleton from "../../../Skeletons/TeamRankCardSkeleton";
import TeamRankCard from "../TeamRankCard";
import RecruitCard from "./RecruitCard";
type Props = {
  year: string;
  team: string;
  view: "players" | "teams";
  onYearChange: (y: string) => void;
  onTeamChange: (t: string) => void;
  onViewChange: (v: "players" | "teams") => void;
};

export default function RecruitsList({
  year,
  team,
  view,
  onYearChange,
  onTeamChange,
  onViewChange,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getStyles(isDark);

  const listRef = useRef<FlatList>(null);

  /** Reset scroll */
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [year, team, view]);

  /** YEAR OPTIONS */
  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 19 }, (_, i) => {
      const y = now + 2 - i;
      return { label: String(y), value: String(y) };
    });
  }, []);

  const viewOptions = [
    { label: "Players", value: "players" },
    { label: "Teams", value: "teams" },
  ];

  /** FETCH DATA */
  const {
    data: playerData,
    loading: loadingPlayers,
    error: errorPlayers,
  } = useFootballRecruits(Number(year));

  const {
    data: teamData,
    loading: loadingTeams,
    error: errorTeams,
  } = useCFBTeamRecruits(Number(year));

  const loading = view === "players" ? loadingPlayers : loadingTeams;
  const error = view === "players" ? errorPlayers : errorTeams;
  const listData = view === "players" ? playerData : teamData;
  const CHUNK_SIZE = 20; // how many picks load per "page"
  // How many picks are currently visible
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);

  /** TEAM DROPDOWN OPTIONS (COMMITTED TEAMS ONLY) */
  const teamOptions = useMemo(() => {
    if (!playerData) return [{ label: "All Teams", value: "all" }];

    const uniqueTeams = Array.from(
      new Set(
        playerData
          .map((r: any) => r.projected_school)
          .filter((t): t is string => Boolean(t)),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { label: "All Teams", value: "all" },
      ...uniqueTeams.map((t) => ({ label: t, value: t })),
    ];
  }, [playerData]);

  // 🔍 SEARCH TERM
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
  };

  /** FILTER PLAYERS BY COMMITTED TEAM */
  const filteredPlayers = useMemo(() => {
    if (!playerData) return [];

    let list = playerData;

    // TEAM FILTER
    if (team !== "all") {
      list = list.filter((r: FootballRecruit) => r.projected_school === team);
    }

    // SEARCH FILTER
    if (search.trim().length > 0) {
      const s = search.toLowerCase();

      list = list.filter((p: FootballRecruit) => {
        return (
          p.name?.toLowerCase().includes(s) ||
          p.position?.toLowerCase().includes(s) ||
          p.projected_school?.toLowerCase().includes(s)
        );
      });
    }

    return list;
  }, [playerData, team, search]);

  const loadMore = () => {
    if (visibleCount < filteredPlayers.length) {
      setVisibleCount((prev) => prev + CHUNK_SIZE);
    }
  };

  const visiblePicks = useMemo(
    () => filteredPlayers.slice(0, visibleCount),
    [filteredPlayers, visibleCount],
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
          <TouchableOpacity onPress={toggleSearch}>
            <Ionicons
              name={searchOpen ? "close" : "search"}
              size={22}
              color={isDark ? Colors.lightGray : Colors.darkGray}
            />
          </TouchableOpacity>

          {/* FILTERS */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Dropdown
              options={yearOptions}
              selectedValue={year}
              onSelect={onYearChange}
              isDark={isDark}
              width={120}
            />

            {view === "players" && (
              <Dropdown
                options={teamOptions}
                selectedValue={team}
                onSelect={onTeamChange}
                isDark={isDark}
                width={150}
              />
            )}

            <Dropdown
              options={viewOptions}
              selectedValue={view}
              onSelect={(v) => onViewChange(v as "players" | "teams")}
              isDark={isDark}
              width={130}
            />
          </View>
        </View>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          visible={searchOpen}
          placeholder="Search players..."
        />
      </View>
      {/* CONTENT */}
      {loading ? (
        <FlatList
          ref={listRef}
          data={Array.from({ length: 10 })}
          keyExtractor={(_, i) => `skel-${i}`}
          renderItem={() =>
            view === "players" ? (
              <RecruitCardSkeleton />
            ) : (
              <TeamRankCardSkeleton />
            )
          }
        />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Error: {String(error)}</Text>
        </View>
      ) : !listData || listData.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No rankings found for {year}</Text>
        </View>
      ) : view === "players" ? (
        <FlatList
          ref={listRef}
          data={visiblePicks}
          keyExtractor={(item) => item.profile_url}
          renderItem={({ item, index }) => (
            <RecruitCard recruit={item} index={index} />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          ListFooterComponent={
            visibleCount < filteredPlayers.length ? (
              <View style={{ paddingVertical: 20 }}>
                <Text style={{ textAlign: "center", color: Colors.lightGray }}>
                  Loading more…
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          ref={listRef}
          data={teamData}
          keyExtractor={(item) => item.team}
          renderItem={({ item, index }) => (
            <TeamRankCard item={item} index={index} />
          )}
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
      paddingHorizontal: 14,
      marginBottom: 12,
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
