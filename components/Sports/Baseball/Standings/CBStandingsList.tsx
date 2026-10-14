import { getStandingsTeamLogo } from "utils/teams/standingsTeamLogo";
import Dropdown from "@/components/Dropdown";
import { StandingsSkeleton } from "@/components/Skeletons/StandingsSkeleton";
import { StandingsStyles } from "@/styles/LeagueStyles/StandingsStyles";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import {
  type CBRankPoll,
  type CBTeamRank,
  useCBRankings,
} from "hooks/BaseballHooks/useCBRankings";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

type Props = {
  league: "cb" | "sb";
};

export const standingLabels = ["W-L", "Points", "1st Votes"];

export const CBStandingsList = ({ league }: Props) => {
  const { rankingsByKey, loading, refreshing, error, refresh } =
    useCBRankings(league);
  const [pollMode, setPollMode] = useState("d1BaseballPoll");
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const router = useScopedRouter();
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = StandingsStyles(isDark);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

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
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (!pollOptions.some((option) => option.value === pollMode)) {
        setPollMode(pollOptions[0]?.value ?? "d1BaseballPoll");
      }
    });

    return () => {
      cancelled = true;
    };
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
    return <StandingsSkeleton variant="rankings" />;
  }

  if (error) {
    return (
      <ScrollView
        alwaysBounceVertical
        contentContainerStyle={navigationContentStyle(global.emptyContainer)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <Text style={global.errorText}>Couldn’t load standings</Text>
      </ScrollView>
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
      const team = item.team;
      const teamId = apiTeamId;
      const teamLogo = getStandingsTeamLogo(team, isDark);
      const teamCode =
        team?.code || item.team?.name || "N/A";
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
                router.push({
                  pathname: league === "sb" ? "/team/sb/[teamId]" : "/team/cb/[teamId]",
                  params: { teamId: String(teamId), league },
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
            const team = item.team;
            const teamName = team?.shortName || team?.name || "N/A";
            return (
              <Text
                key={item.team?.id || `dropped-${item.previous}-${item.date}`}
                style={{
                  color: isDark ? Colors.white : Colors.black,
                  fontFamily: Fonts.LIGHT,
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

  if (activeRanks.length === 0)
    return (
      <ScrollView
        alwaysBounceVertical
        contentContainerStyle={navigationContentStyle(global.emptyContainer)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <Text style={global.emptyText}>
          {activePoll
            ? "No rankings are available for this poll"
            : "Rankings are not available for the selected poll."}
        </Text>
      </ScrollView>
    );

  return (
    <ScrollView
      alwaysBounceVertical
      contentContainerStyle={navigationContentStyle(styles.contentContainer)}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
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

      {Section({ title: activePollTitle, data: activeRanks })}

      {renderDroppedOut()}
    </ScrollView>
  );
};
