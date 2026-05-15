// components/CBStandingsList.tsx
import { Ionicons } from "@expo/vector-icons";
import { StandingsSkeleton } from "components/Skeletons/StandingsSkeleton";
import { Colors, Fonts } from "constants/styles";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import { CBTeamRank, useCBRankings } from "hooks/CBHooks/useCBRankings";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ROW_HEIGHT = 60;
const RANK_WIDTH = 40;
const TEAM_COL_WIDTH = 100;
const STAT_COL_WIDTH = 90;

type Props = {
  league: "cb" | "sb";
};

export const standingLabels = ["W-L", "Points", "1st Votes"];

export const CBStandingsList = ({ league }: Props) => {
  const { rankings, loading, error, refresh } = useCBRankings(league);
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const router = useRouter();
  const styles = standingsStyles(isDark);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const { allRanks, droppedOutTeams } = useMemo(() => {
    const allRanks: CBTeamRank[] = [];
    const droppedOutTeams: CBTeamRank[] = [];

    for (const poll of rankings || []) {
      allRanks.push(...(poll.ranks || []));
      droppedOutTeams.push(...(poll.droppedOut || []));
    }

    return { allRanks, droppedOutTeams };
  }, [rankings]);

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <StandingsSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  /* ================= LEFT HEADER ================= */
  const renderLeftHeader = () => (
    <View style={styles.statsHeaderRow}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#</Text>
      </View>
      <View>
        <Text style={styles.teamHeaderText}>Team</Text>
      </View>
    </View>
  );

  /* ================= RIGHT HEADER ================= */
  const renderRightHeader = () => (
    <View style={styles.statsHeaderRow}>
      {standingLabels.map((label) => (
        <View key={label} style={styles.statCell}>
          <Text style={styles.statText}>{label}</Text>
        </View>
      ))}
    </View>
  );

  /* ================= LEFT ROW ================= */
  const renderLeftItem = ({
    item,
    index,
  }: {
    item: CBTeamRank;
    index: number;
  }) => {
    const isLastRow = index === allRanks.length - 1;
    const team =
      league === "sb"
        ? getSBTeam(item.team?.id ?? "")
        : getCBTeam(item.team?.id ?? "");
    const teamId = team?.id ?? 0;
    const teamLogo =
      league === "sb"
        ? getSBTeamLogo(teamId, isDark)
        : getCBTeamLogo(teamId, isDark);

    const trendNum = Number(item.trend);
    const isUp = trendNum > 0;

    return (
      <View
        style={[
          styles.row,
          !isLastRow && {
            borderBottomWidth: 1,
            borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
          },
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{item.current}</Text>
        </View>

        <View style={styles.teamInfo}>
          <TouchableOpacity
            style={styles.teamInfoWrapper}
            onPress={() => {
              if (!teamId) return;
              router.push({
                pathname: "/team/cfb/[teamId]",
                params: { teamId },
              });
            }}
          >
            {teamLogo && <Image source={teamLogo} style={styles.logo} />}
            <Text style={styles.teamName}>{team?.code || "N/A"}</Text>
          </TouchableOpacity>

          {trendNum !== 0 && !isNaN(trendNum) && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name={isUp ? "arrow-up" : "arrow-down"}
                size={10}
                color={
                  isUp
                    ? isDark
                      ? Colors.dark.leafGreen
                      : Colors.light.green // correct branch
                    : isDark
                      ? Colors.dark.lightRed
                      : Colors.light.red
                }
                style={{ marginRight: 2 }}
              />
              <Text style={styles.collegeTeamTrend}>{Math.abs(trendNum)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  /* ================= RIGHT ROW ================= */
  const renderRightItem = ({
    item,
    index,
  }: {
    item: CBTeamRank;
    index: number;
  }) => {
    const isLastRow = index === allRanks.length - 1;
    return (
      <View
        style={[
          styles.row,
          !isLastRow && {
            borderBottomWidth: 1,
            borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
          },
        ]}
      >
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.recordSummary}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.points}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statText}>{item.firstPlaceVotes}</Text>
        </View>
      </View>
    );
  };

  /* ================= SECTION ================= */
  const Section = ({ title, data }: { title: string; data: CBTeamRank[] }) => {
    return (
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.heading}>{title}</Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          {/* LEFT */}
          <FlatList
            data={data}
            keyExtractor={(item, i) => item.team?.id?.toString() || String(i)}
            renderItem={renderLeftItem}
            ListHeaderComponent={renderLeftHeader}
            stickyHeaderIndices={[0]}
            scrollEnabled={false}
          />

          {/* RIGHT */}
          <FlatList
            data={data}
            keyExtractor={(item, i) => item.team?.id?.toString() || String(i)}
            renderItem={renderRightItem}
            ListHeaderComponent={renderRightHeader}
            stickyHeaderIndices={[0]}
            scrollEnabled={false}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Section
        title={
          league === "cb" ? "College Baseball Poll" : "College Softball Poll"
        }
        data={allRanks}
      />
    </ScrollView>
  );
};

export const standingsStyles = (isDark: boolean) =>
  StyleSheet.create({
    contentContainer: {
      paddingBottom: 100,
      paddingHorizontal: 12,
    },
    wrapper: {
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
    },
    center: {
      flex: 1,
    },

    header: {
      flexDirection: "row",
      padding: 12,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    heading: {
      fontSize: 20,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },
    droppedHeading: {
      fontSize: 20,
      paddingBottom: 4,
      marginBottom: 4,
      fontFamily: Fonts.OSMEDIUM,
      color: isDark ? Colors.dark.white : Colors.light.black,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    dropdownRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 12,
    },
    statsHeaderRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      paddingVertical: 10,
      height: ROW_HEIGHT,
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      paddingVertical: 10,
      height: ROW_HEIGHT,
      minHeight: ROW_HEIGHT,
      maxHeight: ROW_HEIGHT,
      alignItems: "center",
    },
    rankContainer: {
      width: RANK_WIDTH,
      justifyContent: "center",
      alignItems: "center",
    },
    rankText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    text: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      marginVertical: 4,
    },
    subText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: 12,
    },
    teamInfo: {
      width: TEAM_COL_WIDTH,
      flexDirection: "row",
      alignItems: "center",
    },
    teamInfoWrapper: {
      flexDirection: "row",
      alignItems: "center",
    },
    logo: {
      width: 28,
      height: 28,
      marginRight: 6,
    },
    teamName: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.white : Colors.black,
      width: 32,
    },
    collegeTeamName: {
      fontSize: 14,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.white : Colors.black,
      width: 40,
    },
    collegeTeamTrend: {
      fontSize: 10,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.white : Colors.black,
      width: 40,
    },
    collegeDivisionHeader: {
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: 16,
      marginTop: 4,
      paddingHorizontal: 12,
    },
    teamHeaderText: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 16,
      color: isDark ? Colors.white : Colors.black,
    },
    statCell: {
      width: STAT_COL_WIDTH,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 5,
    },
    headerText: {
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 12,
      textAlign: "center",
    },
    statText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },
    statusBadge: {
      marginLeft: 2,
      paddingVertical: 2,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 6,
    },
    statusBadgeText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      color: Colors.white,
    },
    statusText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      color: isDark ? Colors.dark.white : Colors.light.black,
      marginLeft: 4,
      flexWrap: "wrap",
    },
    legendContainer: {
      marginTop: 10,
      paddingTop: 10,
    },

    legendItemsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingRight: 10,
    },

    legendItem: {
      width: "40%", // 2-column grid
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    droppedoutNames: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      marginVertical: 2,
      marginRight: 8,
    },
    errorText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
    },
    emptyText: {
      fontFamily: Fonts.OSLIGHT,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
  });
