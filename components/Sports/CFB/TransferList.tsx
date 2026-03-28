import { Dropdown } from "components/Dropdown";
import { Colors, Fonts } from "constants/Styles";
import { useCFBPortalPlayers } from "hooks/CFBHooks/useCFBPortalPlayers";
import React, { useEffect, useMemo, useRef } from "react";
import { FlatList, StyleSheet, useColorScheme, View } from "react-native";
import RecruitCardSkeleton from "../../Skeletons/RecruitCardSkeleton";
import TransferPlayerCard from "./TransferCard";

type Props = {
  year: string;
  team: string;
  view: "players" | "teams";
  onYearChange: (y: string) => void;
  onTeamChange: (t: string) => void;
  onViewChange: (v: "players" | "teams") => void;
};

const PAGE_SIZE = 20;

export default function TransferList({
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
  const [page, setPage] = React.useState(1);

  const loadMore = () => {
    if (paginatedData.length >= filteredPlayers.length) return;
    setPage((prev) => prev + 1);
  };

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
  } = useCFBPortalPlayers(Number(selectedYear));

  const loading = loadingPlayers;
  const error = errorPlayers;
  const listData = playerData;

  /** TEAM DROPDOWN OPTIONS */
  const teamOptions = useMemo(() => {
    if (!playerData) return [{ label: "All Teams", value: "all" }];

    const uniqueTeams = Array.from(
      new Set(
        playerData
          .map((r: any) => r.committedTo)
          .filter((t): t is string => Boolean(t?.trim())),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { label: "All Teams", value: "all" },
      ...uniqueTeams.map((t) => ({ label: t, value: t })),
    ];
  }, [playerData]);

  /** FILTER PLAYER RESULTS */
  const filteredPlayers = useMemo(() => {
    if (!playerData) return [];

    let arr =
      selectedTeam === "all"
        ? [...playerData]
        : playerData.filter((r: any) => r.committedTo === selectedTeam);

    // Sort highest → lowest
    arr.sort((a: any, b: any) => {
      const rA = a.rating ?? a.stars ?? 0;
      const rB = b.rating ?? b.stars ?? 0;
      return rB - rA;
    });

    return arr;
  }, [playerData, selectedTeam]);

  const paginatedData = useMemo(() => {
    return filteredPlayers.slice(0, page * PAGE_SIZE);
  }, [filteredPlayers, page]);

  useEffect(() => {
    setPage(1);
  }, [selectedYear, selectedTeam, selectedView]);

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

      <FlatList
        ref={listRef}
        key={"players"}
        data={paginatedData}
        keyExtractor={(item, index) =>
          item.id ? String(item.id) : `player-${index}`
        }
        renderItem={({ item, index }) => (
          <TransferPlayerCard recruit={item} index={index} />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          paginatedData.length < filteredPlayers.length ? (
            <View style={{ paddingVertical: 20 }}>
              <RecruitCardSkeleton />
            </View>
          ) : null
        }
      />
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
