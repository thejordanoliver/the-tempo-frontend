import { Dropdown } from "components/Dropdown";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { teams } from "constants/teamsNFL";
import { useNFLDraftPlayers } from "hooks/NFLHooks/useNFLDraftPlayers";
import React, { useEffect, useMemo, useRef } from "react";
import { FlatList, StyleSheet, Text, useColorScheme, View } from "react-native";
import RecruitCardSkeleton from "../CFB/RecruitCardSkeleton";
import DraftCard from "./DraftCard";

type Props = {
  year: string;
  team: string;
  round: string;
  view?: "players" | "teams";
  onYearChange: (y: string) => void;
  onTeamChange: (t: string) => void;
  onRoundChange: (r: string) => void;
  onViewChange?: (v: "players" | "teams") => void;
};

export default function DraftList({
  year,
  team,
  round,
  view,
  onYearChange,
  onTeamChange,
  onRoundChange,
  onViewChange,
}: Props) {
  const selectedYear = year;
  const selectedTeam = team;
  const selectedView = view;
  const selectedRound = round;

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

  /** FETCH DATA */
  const {
    data: playerData,
    loading: loadingPlayers,
    error: errorPlayers,
  } = useNFLDraftPlayers(Number(selectedYear));

  const loading = loadingPlayers;
  const error = errorPlayers;
  const listData = playerData;

  /** ROUND DROPDOWN OPTIONS */
  const roundOptions = useMemo(() => {
    if (!playerData) return [{ label: "All Rounds", value: "all" }];

    const uniqueRounds = Array.from(
      new Set(
        playerData.map((p: any) => p.round).filter((r) => typeof r === "number")
      )
    ).sort((a, b) => a - b);

    return [
      { label: "All Rounds", value: "all" },
      ...uniqueRounds.map((r) => ({ label: `Round ${r}`, value: String(r) })),
    ];
  }, [playerData]);

  /** TEAM DROPDOWN OPTIONS — ALWAYS SHOW ALL NFL TEAMS */
  const teamOptions = useMemo(() => {
    const formatted = teams
      .map((team: any) => ({
        label: team.name,
        value: team.espnID,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: "All Teams", value: "all" }, ...formatted];
  }, []);

  const filteredPlayers = useMemo(() => {
    if (!playerData) return [];

    let list = playerData;

    // Filter by round
    if (selectedRound !== "all") {
      list = list.filter((p: any) => String(p.round) === selectedRound);
    }

    // Filter by ESPN team ID
    if (selectedTeam !== "all") {
      list = list.filter(
        (p: any) => String(p.nflTeamId) === String(selectedTeam)
      );
    }

    return list;
  }, [playerData, selectedRound, selectedTeam]);

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

        <Dropdown
          options={roundOptions}
          selectedValue={selectedRound}
          onSelect={onRoundChange}
          isDark={isDark}
          width={130}
        />

        <Dropdown
          options={teamOptions}
          selectedValue={selectedTeam}
          onSelect={onTeamChange}
          isDark={isDark}
          width={150}
        />
      </View>

      {/* LIST BELOW */}
      {loading ? (
        <FlatList
          ref={listRef}
          key={"loading"}
          data={Array.from({ length: 10 })}
          keyExtractor={(_, i) => "skel-" + i}
          renderItem={() => <RecruitCardSkeleton />}
        />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Error: {String(error)}</Text>
        </View>
      ) : !listData || listData.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No Draft found for {selectedYear}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          key={"players"} // <— Forces full rerender
          data={filteredPlayers}
          keyExtractor={(item, index) => `${item.overall ?? index}`}
          renderItem={({ item, index }) => (
            <DraftCard player={item} index={index} />
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
      paddingBottom: 80
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
