// components/CBStandingsList.tsx
import { Dropdown } from "@/components/Dropdown";
import { Ionicons } from "@expo/vector-icons";
import { StandingsSkeleton } from "components/Skeletons/StandingsSkeleton";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import {
  type CBRankPoll,
  type CBTeamRank,
  useCBRankings,
} from "hooks/BaseballHooks/useCBRankings";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  type ImageSourcePropType,
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
const SOFTBALL_TOURNAMENT_POLL_KEYS = [
  "sbTournamentPoll",
  "softballTournamentPoll",
];

const parseTrend = (trend?: string | number | null) => {
  if (trend === null || trend === undefined || trend === "-") return 0;
  const parsed = Number(String(trend).replace("+", ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatRankValue = (value?: string | number | null, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const isRankPoll = (
  poll: CBRankPoll | CBRankPoll[] | undefined,
): poll is CBRankPoll => Boolean(poll) && !Array.isArray(poll);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getApiTeamLogoSource = (
  team?: CBTeamRank["team"],
): ImageSourcePropType | undefined => {
  if (!team) return undefined;

  const logo = (team as { logo?: unknown }).logo;
  if (typeof logo === "number") return logo;
  if (typeof logo === "string" && logo.length > 0) return { uri: logo };
  if (isRecord(logo)) return logo as ImageSourcePropType;

  const logos = (team as { logos?: unknown }).logos;
  if (!Array.isArray(logos)) return undefined;

  const logoUrl = logos
    .map((item) => (isRecord(item) ? item.href : undefined))
    .find(
      (href): href is string => typeof href === "string" && href.length > 0,
    );

  return logoUrl ? { uri: logoUrl } : undefined;
};

type Props = {
  league: "cb" | "sb";
};

export const standingLabels = ["W-L", "Points", "1st Votes"];

export const CBStandingsList = ({ league }: Props) => {
  const { rankingsByKey, loading, error, refresh } = useCBRankings(league);
  const [pollMode, setPollMode] = useState("d1BaseballPoll");
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const router = useRouter();
  const styles = standingsStyles(isDark);
  const global = globalStyles(isDark);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const primaryPollKey = useMemo(() => {
    if (league === "sb" && isRankPoll(rankingsByKey.d1SoftballPoll)) {
      return "d1SoftballPoll";
    }

    return "d1BaseballPoll";
  }, [league, rankingsByKey]);

  const softballTournamentPollKey = useMemo(() => {
    if (league !== "sb") return undefined;

    return SOFTBALL_TOURNAMENT_POLL_KEYS.find((key) =>
      isRankPoll(rankingsByKey[key]),
    );
  }, [league, rankingsByKey]);

  const tournamentPollKey = useMemo(() => {
    if (league === "cb") return "cbTournamentPoll";

    if (softballTournamentPollKey) return softballTournamentPollKey;

    return isRankPoll(rankingsByKey.cbTournamentPoll)
      ? "cbTournamentPoll"
      : undefined;
  }, [league, rankingsByKey, softballTournamentPollKey]);

  const pollOptions = useMemo(() => {
    const options = [
      {
        label: league === "sb" ? "D1 Softball Poll" : "D1 Baseball Poll",
        value: primaryPollKey,
      },
    ];

    if (tournamentPollKey) {
      options.push({
        label:
          league === "sb"
            ? "Softball Tournament Seedings"
            : "Baseball Tournament Seedings",
        value: tournamentPollKey,
      });
    }

    return options;
  }, [league, primaryPollKey, tournamentPollKey]);

  useEffect(() => {
    if (!pollOptions.some((option) => option.value === pollMode)) {
      setPollMode(pollOptions[0]?.value ?? "d1BaseballPoll");
    }
  }, [pollMode, pollOptions]);

  const activePoll = useMemo(() => {
    const selectedPoll = rankingsByKey?.[pollMode] as CBRankPoll | undefined;
    return isRankPoll(selectedPoll) ? selectedPoll : undefined;
  }, [pollMode, rankingsByKey]);

  const activeRanks = useMemo(() => activePoll?.ranks || [], [activePoll]);

  const droppedOutTeams = useMemo(
    () => activePoll?.droppedOut || [],
    [activePoll],
  );

  const selectedPollLabel = useMemo(
    () => pollOptions.find((option) => option.value === pollMode)?.label,
    [pollMode, pollOptions],
  );

  const activePollTitle = useMemo(
    () =>
      activePoll?.name ||
      activePoll?.shortName ||
      selectedPollLabel ||
      (league === "cb" ? "College Baseball Poll" : "College Softball Poll"),
    [activePoll, league, selectedPollLabel],
  );

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
  function createRenderLeftItem(
    sectionLength: number,
    rankField: "current" | "previous" = "current",
  ) {
    function LeftRankItem({
      item,
      index,
    }: {
      item: CBTeamRank;
      index: number;
    }) {
      const isLastRow = index === sectionLength - 1;
      const apiTeamId =
        item.team?.id !== null && item.team?.id !== undefined
          ? String(item.team.id)
          : undefined;
      const team = apiTeamId
        ? league === "sb"
          ? getSBTeam(apiTeamId)
          : getCBTeam(apiTeamId)
        : undefined;
      const teamId = team?.id ?? apiTeamId;
      const localTeamLogo = team
        ? league === "sb"
          ? getSBTeamLogo(team.id, isDark)
          : getCBTeamLogo(team.id, isDark)
        : undefined;
      const teamLogo = localTeamLogo ?? getApiTeamLogoSource(item.team);
      const teamCode =
        item.team?.abbreviation || team?.code || item.team?.name || "N/A";
      const trendNum = parseTrend(item.trend);
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
            <Text style={styles.rankText}>
              {formatRankValue(item[rankField], "-")}
            </Text>
          </View>

          <View style={styles.teamInfo}>
            <TouchableOpacity
              style={styles.teamInfoWrapper}
              onPress={() => {
                if (!teamId) return;
                // TODO: Replace with the college baseball/softball team route when one exists.
                router.push({
                  pathname: "/team/cfb/[teamId]",
                  params: { teamId: String(teamId) },
                });
              }}
            >
              {teamLogo && <Image source={teamLogo} style={styles.logo} />}
              <Text style={styles.teamName} numberOfLines={1}>
                {teamCode}
              </Text>
            </TouchableOpacity>

            {trendNum !== 0 && (
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
                <Text style={styles.collegeTeamTrend}>
                  {Math.abs(trendNum)}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return LeftRankItem;
  }

  /* ================= RIGHT ROW ================= */
  function createRenderRightItem(sectionLength: number) {
    function RightRankItem({
      item,
      index,
    }: {
      item: CBTeamRank;
      index: number;
    }) {
      const isLastRow = index === sectionLength - 1;

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
            <Text style={styles.statText}>{item.recordSummary || "N/A"}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statText}>
              {formatRankValue(item.points, "0")}
            </Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statText}>
              {formatRankValue(item.firstPlaceVotes, "0")}
            </Text>
          </View>
        </View>
      );
    }

    return RightRankItem;
  }

  const renderDroppedOut = () => {
    if (!droppedOutTeams.length) return null;

    return (
      <View style={{ marginTop: 24 }}>
        <Text style={styles.droppedHeading}>Dropped From Rankings</Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {droppedOutTeams.map((item) => {
            const team =
              league === "sb"
                ? getSBTeam(item.team?.id ?? "")
                : getCBTeam(item.team?.id ?? 0);
            const teamName = team?.shortName || team?.name || "N/A";
            return (
              <Text
                key={item.team?.id || `dropped-${item.previous}-${item.date}`}
                style={{
                  color: isDark ? Colors.white : Colors.black,
                  fontFamily: Fonts.OSLIGHT,
                  fontSize: 16,
                  marginVertical: 2,
                  marginRight: 8,
                }}
              >
                {teamName} ({item.previous})
              </Text>
            );
          })}
        </View>
      </View>
    );
  };

  /* ================= SECTION ================= */
  const Section = ({
    title,
    data,
    rankField = "current",
  }: {
    title: string;
    data: CBTeamRank[];
    rankField?: "current" | "previous";
  }) => {
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
            renderItem={createRenderLeftItem(data.length, rankField)}
            ListHeaderComponent={renderLeftHeader}
            stickyHeaderIndices={[0]}
            scrollEnabled={false}
          />

          {/* RIGHT */}
          <FlatList
            data={data}
            keyExtractor={(item, i) => item.team?.id?.toString() || String(i)}
            renderItem={createRenderRightItem(data.length)}
            ListHeaderComponent={renderRightHeader}
            stickyHeaderIndices={[0]}
            scrollEnabled={false}
          />
        </View>
      </View>
    );
  };

  if (!activeRanks)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>
          {activePoll
            ? "No rankings are available for this poll."
            : "Rankings are not available for the selected poll."}
        </Text>
      </View>
    );

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.dropdownRow}>
        <Dropdown
          options={pollOptions}
          selectedValue={pollMode}
          onSelect={setPollMode}
          isDark={isDark}
        />
      </View>

      <Section title={activePollTitle} data={activeRanks} />

      {renderDroppedOut()}
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
