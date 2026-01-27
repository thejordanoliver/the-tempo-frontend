import { Dropdown } from "components/Dropdown";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { useCFBRecruits } from "hooks/CFBHooks/useCFBRecruits";
import { useCFBTeamRecruits } from "hooks/CFBHooks/useCFBTeamRecruits";
import React, { useEffect, useMemo, useRef } from "react";
import { FlatList, StyleSheet, Text, useColorScheme, View } from "react-native";
import RecruitCard from "./RecruitCard";
import RecruitCardSkeleton from "./RecruitCardSkeleton";
import TeamRankCard from "./TeamRankCard";
import TeamRankCardSkeleton from "./TeamRankCardSkeleton";

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
  const selectedYear = year;
  const selectedTeam = team;
  const selectedView = view;

  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  /** Refs */
  const listRef = useRef<FlatList>(null);

  /** Reset scroll to top when view changes */
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selectedView, selectedYear, selectedTeam]);

  /** YEAR OPTIONS */
  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    const arr = [];
    for (let y = now + 2; y >= now - 15; y--) {
      arr.push({ label: String(y), value: String(y) });
    }
    return arr;
  }, []);

  /** VIEW OPTIONS */
  const viewOptions = [
    { label: "Players", value: "players" },
    { label: "Teams", value: "teams" },
  ];

  /** FETCH DATA */
  const {
    data: playerData,
    loading: loadingPlayers,
    error: errorPlayers,
  } = useCFBRecruits(Number(selectedYear));

  const {
    data: teamData,
    loading: loadingTeams,
    error: errorTeams,
  } = useCFBTeamRecruits(Number(selectedYear));

  const loading = selectedView === "players" ? loadingPlayers : loadingPlayers;
  const error = selectedView === "players" ? errorPlayers : errorTeams;
  const listData = selectedView === "players" ? playerData : teamData;

  /** TEAM DROPDOWN OPTIONS */
  const teamOptions = useMemo(() => {
    if (!playerData) return [{ label: "All Teams", value: "all" }];

    const uniqueTeams = Array.from(
      new Set(
        playerData
          .map((r: any) => r.committedTo)
          .filter((t): t is string => Boolean(t?.trim()))
      )
    ).sort((a, b) => a.localeCompare(b));

    return [
      { label: "All Teams", value: "all" },
      ...uniqueTeams.map((t) => ({ label: t, value: t })),
    ];
  }, [playerData]);

  /** FILTER PLAYER RESULTS */
  const filteredPlayers = useMemo(() => {
    if (!playerData) return [];
    if (selectedTeam === "all") return playerData;
    return playerData.filter((r: any) => r.committedTo === selectedTeam);
  }, [playerData, selectedTeam]);

  return (
    <View style={styles.container}>
      {/* FILTERS ALWAYS SHOWN */}
      <View style={styles.dropdownRow}>
        <Dropdown
          options={yearOptions}
          selectedValue={selectedYear}
          onSelect={onYearChange}
          isDark={isDark}
          width={120}
        />

        {selectedView === "players" && (
          <Dropdown
            options={teamOptions}
            selectedValue={selectedTeam}
            onSelect={onTeamChange}
            isDark={isDark}
            width={150}
          />
        )}

        <Dropdown
          options={viewOptions}
          selectedValue={selectedView}
          onSelect={(v) => onViewChange(v as "players" | "teams")}
          isDark={isDark}
          width={130}
        />
      </View>

      {/* LIST BELOW */}
      {loading ? (
        <FlatList
          ref={listRef}
          key={"loading"}
          data={Array.from({ length: 10 })}
          keyExtractor={(_, i) => "skel-" + i}
          renderItem={() =>
            selectedView === "players" ? (
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
          <Text style={styles.emptyText}>
            No rankings found for {selectedYear}
          </Text>
        </View>
      ) : selectedView === "players" ? (
        <FlatList
          ref={listRef}
          key={"players"} // <— Forces full rerender
          data={filteredPlayers}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <RecruitCard recruit={item} index={index} />
          )}
        />
      ) : (
        <FlatList
          ref={listRef}
          key={"teams"} // <— Forces full rerender
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
