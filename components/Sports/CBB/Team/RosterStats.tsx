import { Dropdown } from "components/Dropdown";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/Styles";
import { useRouter } from "expo-router";
import { useCBBRosterStats } from "hooks/CBBHooks/useCBBRosterStats";
import { useCBBTeamStats } from "hooks/CBBHooks/useCBBTeamStats";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// ✅ rename to avoid conflict
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { players as cbbPlayers } from "constants/cbbPlayers";
import { players as wcbbPlayers } from "constants/wcbbPlayers";

interface Props {
  espnID: number;
  teamID: number;
  league?: "CBB" | "WCBB";
}

const CBBRosterStats: React.FC<Props> = ({ espnID, teamID, league }) => {
  const [viewMode, setViewMode] = useState<"players" | "team">("players");
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
  const router = useRouter();

  /** ==========================
   *   FETCH DATA
   *  ========================== */
  const leagueKey = league === "WCBB" ? "WCBB" : "CBB";

  const {
    data: teamStats,
    loading: loadingTeam,
    error: errorTeam,
  } = useCBBTeamStats(String(espnID), String(teamID), league);

  const {
    data: rosterStats,
    loading: loadingRoster,
    error: errorRoster,
  } = useCBBRosterStats(String(espnID), leagueKey);

  const loading = viewMode === "team" ? loadingTeam : loadingRoster;
  const error = viewMode === "team" ? errorTeam : errorRoster;
  const headshotLeague =
    league === "WCBB" ? "womens-college-basketball" : "mens-college-basketball";
  const localPlayers = league === "WCBB" ? wcbbPlayers : cbbPlayers;

  /** ==========================
   *   MERGE LOCAL + ESPN PLAYERS
   * ========================== */
  const mergedPlayers = useMemo(() => {
    if (!rosterStats?.players) return [];

    return rosterStats.players
      .filter((p: any) => p.espnId && p.firstName !== "Total")
      .map((scraped: any) => {
        const meta = localPlayers.find(
          (x: any) => String(x.id) === String(scraped.espnId)
        );

        const avatar =
          meta?.imageUrl ??
          `https://a.espncdn.com/i/headshots/${headshotLeague}/players/full/${scraped.espnId}.png`;

        return {
          id: scraped.espnId,
          firstName: meta?.firstname ?? scraped.firstName,
          lastName: meta?.lastname ?? scraped.lastName,
          shortName:
            meta?.shortName ?? `${scraped.firstName[0]}. ${scraped.lastName}`,
          jersey: meta?.jersey ?? scraped.jersey,
          position: meta?.position ?? scraped.position,
          height: meta?.height ?? null,
          weight: meta?.weight ?? null,
          experience: meta?.experience ?? null,
          stats: scraped.stats,
          gamesPlayed: scraped.stats["GP"] ?? 0,
          avatar,
        };
      });
  }, [rosterStats]);

  if (loading)
    return (
      <View style={styles.center}>
        <CustomActivityIndicator />
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );

  /** ==========================
   *   LEADER CARDS
   * ========================== */
  const getStatValue = (stat: any) =>
    stat != null && !isNaN(Number(stat)) ? Number(stat).toFixed(1) : "0.0";

  const leaders = [
    {
      label: "Points",
      key: "PTS",
      player: [...mergedPlayers].sort(
        (a, b) => Number(b.stats.PTS ?? 0) - Number(a.stats.PTS ?? 0)
      )[0],
    },
    {
      label: "Rebounds",
      key: "REB",
      player: [...mergedPlayers].sort(
        (a, b) => Number(b.stats.REB ?? 0) - Number(a.stats.REB ?? 0)
      )[0],
    },
    {
      label: "Assists",
      key: "AST",
      player: [...mergedPlayers].sort(
        (a, b) => Number(b.stats.AST ?? 0) - Number(a.stats.AST ?? 0)
      )[0],
    },
    {
      label: "Steals",
      key: "STL",
      player: [...mergedPlayers].sort(
        (a, b) => Number(b.stats.STL ?? 0) - Number(a.stats.STL ?? 0)
      )[0],
    },
    {
      label: "Blocks",
      key: "BLK",
      player: [...mergedPlayers].sort(
        (a, b) => Number(b.stats.BLK ?? 0) - Number(a.stats.BLK ?? 0)
      )[0],
    },
  ].filter((l) => l.player);

  const formatDisplayName = (
    first: string,
    last: string,
    jersey: string | number
  ) => {
    const firstInitial = first ? first[0].toUpperCase() : "";
    const lastName = last || "";

    return (
      <Text style={styles.playerName}>
        {firstInitial}. {lastName} <Text style={styles.number}>#{jersey}</Text>
      </Text>
    );
  };

  const formatCardName = (
    first: string,
    last: string,
    jersey: string | number
  ) => {
    const firstInitial = first ? first[0].toUpperCase() : "";
    const lastName = last || "";
    const jerseyNum = jersey ? `#${jersey}` : "";

    return (
      <Text style={styles.cardName}>
        {firstInitial}. {lastName}
        <Text style={styles.number}>{jerseyNum}</Text>
      </Text>
    );
  };

  const LeaderCard = ({ item, index, total }: any) => (
    <View style={styles.cardWrapper}>
      <View style={styles.cardContainer}>
        <Text style={styles.cardLabel}>{item.label}</Text>

        <TouchableOpacity
          onPress={() =>
            router.push(
              `/player/cbb/${item.player.id}?teamId=${teamID}&league=${league}`
            )
          }
        >
          <View style={styles.statCard}>
            <Image source={{ uri: item.player.avatar }} style={styles.avatar} />

            <View style={styles.nameValue}>
              {formatCardName(
                item.player.firstName,
                item.player.lastName,
                item.player.jersey
              )}

              <Text style={styles.cardValue}>
                {getStatValue(item.player.stats[item.key])}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {index < total - 1 && <View style={styles.divider} />}
    </View>
  );

  /** ==========================
   *   TEAM STATS
   * ========================== */
  const renderTeamStats = () => {
    if (!teamStats?.stats) return null;

    return Object.values(teamStats.stats).map((cat: any) => (
      <View key={cat.name} style={{ marginBottom: 20 }}>
        <Text style={styles.categoryTitle}>{cat.name}</Text>

        <View style={styles.table}>
          {cat.stats.map((s: any, idx: number) => (
            <View
              key={idx}
              style={[
                styles.teamTableRow,
                idx % 2 === 1 && {
                  backgroundColor: isDark
                    ? Colors.dark.itemBackground
                    : Colors.light.itemBackground,
                },
                idx === cat.stats.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={[styles.tableCell, styles.headerText]}>
                {s.displayName}
              </Text>
              <Text style={[styles.tableCell, styles.statValue]}>
                {s.displayValue ?? s.value ?? "-"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    ));
  };

  /** ==========================
   *   PLAYER TABLE
   * ========================== */
  const STAT_HEADERS = [
    "GP",
    "PTS",
    "REB",
    "AST",
    "STL",
    "BLK",
    "FG%",
    "3P%",
    "FT%",
    "TO",
  ];

  return (
    <View style={styles.container}>
      <HeadingTwo>
        {viewMode === "team" ? "Team Stats" : "Player Stats"}
      </HeadingTwo>

      <Dropdown
        options={[
          { label: "Player Stats", value: "players" },
          { label: "Team Stats", value: "team" },
        ]}
        selectedValue={viewMode}
        onSelect={(v) => setViewMode(v as "team" | "players")}
        isDark={isDark}
        style={{ paddingBottom: 12 }}
        absolute
      />

      <ScrollView style={styles.scrollContainer}>
        {viewMode === "players" ? (
          <>
            {/* Leader Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
              snapToInterval={276}
              decelerationRate="fast"
            >
              {leaders.map((item, i) => (
                <LeaderCard
                  key={item.key}
                  item={item}
                  index={i}
                  total={leaders.length}
                />
              ))}
            </ScrollView>

            {/* Player Table */}
            <View style={styles.tableWrapper}>
              {/* Fixed Name Column */}
              <View style={styles.fixedColumnContainer}>
                <View
                  style={[
                    styles.tableRow,
                    {
                      backgroundColor: isDark
                        ? Colors.dark.itemBackground
                        : Colors.light.itemBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      styles.nameHeaderText,
                      { width: 140 },
                    ]}
                  >
                    Player
                  </Text>
                </View>

                {mergedPlayers.map((p: any, idx: number) => (
                  <View
                    key={p.id}
                    style={[
                      styles.tableRow,
                      idx % 2 === 1 && {
                        backgroundColor: isDark
                          ? Colors.dark.itemBackground
                          : Colors.light.itemBackground,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        router.push(
                          `/player/cbb/${p.id}?teamId=${teamID}&league=${league}`
                        )
                      }
                    >
                      <Text
                        numberOfLines={1}
                        style={[styles.tableCell, { width: 140 }]}
                      >
                        {formatDisplayName(p.firstName, p.lastName, p.jersey)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Scrollable Stat Columns */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* Header Row */}
                  <View
                    style={[
                      styles.tableRow,
                      {
                        backgroundColor: isDark
                          ? Colors.dark.itemBackground
                          : Colors.light.itemBackground,
                      },
                    ]}
                  >
                    {STAT_HEADERS.map((h) => (
                      <Text
                        key={h}
                        style={[
                          styles.tableCell,
                          styles.headerText,
                          { width: 80 },
                        ]}
                      >
                        {h}
                      </Text>
                    ))}
                  </View>

                  {/* Stat Rows */}
                  {mergedPlayers.map((p: any, idx: number) => (
                    <View
                      key={p.id}
                      style={[
                        styles.tableRow,
                        idx % 2 === 1 && {
                          backgroundColor: isDark
                            ? Colors.dark.itemBackground
                            : Colors.light.itemBackground,
                        },
                      ]}
                    >
                      {STAT_HEADERS.map((h) => {
                        let val = p.stats[h] ?? "-";

                        if (["FG%", "3P%", "FT%"].includes(h) && val !== "-")
                          val = `${val}%`;

                        return (
                          <Text
                            key={h}
                            style={[
                              styles.tableCell,
                              styles.statValue,
                              { width: 80 },
                            ]}
                          >
                            {val}
                          </Text>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        ) : (
          renderTeamStats()
        )}
      </ScrollView>
    </View>
  );
};

/* -------------------------------------------- */
/*                   STYLES                     */
/* -------------------------------------------- */

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, paddingTop: 20, paddingHorizontal: 12 },
    scrollContainer: { flexGrow: 1, borderRadius: 4, overflow: "hidden" },
    fixedColumnContainer: {
      zIndex: 2,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    table: {
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderRadius: 8,
    },
    tableWrapper: {
      flexDirection: "row",
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      justifyContent: "flex-start",
      alignItems: "center",
      minHeight: 40,
    },
    teamTableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: 40,
      paddingHorizontal: 8,
    },
    tableCell: { paddingVertical: 8, paddingLeft: 4, fontSize: 14 },
    playerName: {
      fontSize: 14,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.white : Colors.black,
    },
    statValue: {
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    cardWrapper: { flexDirection: "row", alignItems: "flex-end" },
    cardContainer: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
    },
    statCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      width: 260,
      borderRadius: 10,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    cardLabel: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 20,
      marginBottom: 4,
      color: isDark ? Colors.white : Colors.black,
    },
    cardName: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 14,
      marginTop: 4,
      color: isDark ? Colors.white : Colors.black,
    },
    cardValue: {
      fontSize: 24,
      fontFamily: Fonts.OSBOLD,
      color: Colors.midTone,
    },
    nameValue: { marginLeft: 12, flexDirection: "column" },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      paddingTop: 8,
      marginVertical: 4,
      borderWidth: 1,
      borderColor: Colors.midTone,
    },
    divider: {
      width: 1,
      height: "72%",
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
      marginHorizontal: 16,
    },
    number: {
      fontSize: 10,
      color: Colors.midTone,
      lineHeight: 14,
      transform: [{ translateY: 3 }],
    },
    headerText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    nameHeaderText: {
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.white : Colors.black,
    },
    categoryTitle: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 20,
      marginBottom: 4,
      color: isDark ? Colors.white : Colors.black,
      marginLeft: 4,
    },
    center: { marginTop: 20, alignItems: "center" },

    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
  });
export default CBBRosterStats;
