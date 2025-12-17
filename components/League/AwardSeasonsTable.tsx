import BoxScoreSkeleton from "components/GameDetails/BoxScoreSkeleton";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { useRouter } from "expo-router";
import { AwardCategory, League, useAwardSeasons } from "hooks/useAwardSeasons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  useColorScheme,
} from "react-native";

const COLUMN_WIDTH = 70;
const NAME_COLUMN_WIDTH = 200;
const ROW_HEIGHT = 50;
const COLLAPSED_ROWS = 5;

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
  "WS",
  "WS/48",
];

const COY_HEADERS = ["G", "W", "L", "Win %"];

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type Props = {
  league: League; // 👈 ADD THIS
  category: AwardCategory;
  title: string;
  lighter?: boolean;
    refreshSignal?: number; // 👈 NEW

};

export function AwardSeasonsTable({
  league,
  category,
  title,
  refreshSignal,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = useMemo(() => tableStyles(isDark, lighter), [isDark, lighter]);
  const router = useRouter();

  const { data, loading, error, refetch } = useAwardSeasons({
    league,
    category,
  });

  useEffect(() => {
  if (refreshSignal !== undefined) {
    refetch();
  }
}, [refreshSignal]);
  const isSummaryAward = league === "CFB";

  const isCOY = category === "coy";

  const headers = useMemo(() => {
    if (isSummaryAward) return ["Summary"];
    if (isCOY) return COY_HEADERS;
    return STAT_HEADERS;
  }, [isSummaryAward, isCOY]);

  const columnWidth = isSummaryAward ? 320 : isCOY ? 90 : COLUMN_WIDTH;

  const [expanded, setExpanded] = useState(false);

  // Animate expand / collapse
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [expanded]);

  const visibleRows = useMemo(
    () => (expanded ? data : data.slice(0, COLLAPSED_ROWS)),
    [expanded, data]
  );

  const getRowBackground = useCallback(
    (index: number) =>
      index % 2 === 1
        ? lighter
          ? Colors.darkGray
          : isDark
          ? Colors.dark.itemBackground
          : Colors.light.itemBackground
        : "transparent",
    [lighter, isDark]
  );

  const handlePlayerPress = useCallback(
    (playerId: number, teamId?: number) => {
      router.push({
        pathname: "/player/[id]",
        params: { id: String(playerId), teamId },
      });
    },
    [router]
  );

  /* ------------------------------------------------------------------ */
  /* LOADING / ERROR EARLY RETURNS                                       */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <View style={{ marginVertical: 12 }}>
        <HeadingTwo lighter={lighter}>{title}</HeadingTwo>
        <BoxScoreSkeleton teams={1} showTeamHeader={false} lighter={lighter} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ marginVertical: 12 }}>
        <HeadingTwo lighter={lighter}>{title}</HeadingTwo>
        <Text style={styles.error}>Failed to load.</Text>
      </View>
    );
  }

  /* ------------------------------------------------------------------ */
  /* MAIN RENDER                                                         */
  /* ------------------------------------------------------------------ */

  return (
    <View style={{ marginVertical: 12 }}>
      <HeadingTwo lighter={lighter}>{title}</HeadingTwo>

      <View style={styles.table}>
        <View style={{ flexDirection: "row" }}>
          {/* Player / Coach column */}
          <View style={{ width: NAME_COLUMN_WIDTH }}>
            <View style={styles.headerRow}>
              <Text style={styles.headerName}>
                {isCOY ? "Coach" : "Player"}
              </Text>
            </View>

            {visibleRows.map((row, index) => (
              <View
                key={row.id}
                style={[
                  styles.nameRow,
                  { backgroundColor: getRowBackground(index) },
                ]}
              >
                {!isCOY && row.player_id ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      handlePlayerPress(
                        Number(row.player_id),
                        Number(row.current_team?.id)
                      )
                    }
                  >
                    <Text style={styles.playerName}>{row.player_name}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.playerName}>{row.player_name}</Text>
                )}

                <Text style={styles.seasonText}>
                  {row.season} ·{" "}
                  {row.award_team?.code ?? row.team_abbr ?? row.school}
                </Text>
              </View>
            ))}
          </View>

          {/* Stats */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.headerRow}>
                {headers.map((label) => (
                  <Text
                    key={label}
                    style={[styles.headerCell, { width: columnWidth }]}
                  >
                    {label}
                  </Text>
                ))}
              </View>

              {visibleRows.map((row, index) => {
                const stats = isSummaryAward
                  ? [row.summary]
                  : isCOY
                  ? [
                      row.stats?.games,
                      row.stats?.wins,
                      row.stats?.losses,
                      row.stats?.win_loss_pct,
                    ]
                  : [
                      row.stats?.games,
                      row.stats?.points,
                      row.stats?.rebounds,
                      row.stats?.assists,
                      row.stats?.steals,
                      row.stats?.blocks,
                      row.stats?.fg_pct,
                      row.stats?.three_pct,
                      row.stats?.ft_pct,
                      row.stats?.win_shares,
                      row.stats?.ws_per_48,
                    ];

                return (
                  <View
                    key={row.id}
                    style={[
                      styles.row,
                      { backgroundColor: getRowBackground(index) },
                    ]}
                  >
                    {stats.map((val, i) => {
                      const key =
                        (isCOY ? COY_HEADERS : STAT_HEADERS)[i] ?? `stat-${i}`;

                      return (
                        <View
                          key={`${row.id}-${key}`}
                          style={[styles.cell, { width: columnWidth }]}
                        >
                          <Text
                            style={[
                              styles.cellText,
                              isSummaryAward && {
                                textAlign: "left",
                                paddingHorizontal: 10,
                              },
                            ]}
                            numberOfLines={expanded ? 0 : 2}
                          >
                            {val}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {data.length > COLLAPSED_ROWS && (
          <TouchableOpacity
            onPress={() => setExpanded((p) => !p)}
            style={{ paddingVertical: 14, alignItems: "center" }}
          >
            <Text style={styles.showMoreLess}>
              {expanded ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const tableStyles = (isDark: boolean, lighter: boolean) =>
  StyleSheet.create({
    table: {
      borderWidth: 1,
      borderRadius: 8,
      overflow: "hidden",
      borderColor: lighter
        ? Colors.white
        : isDark
        ? Colors.white
        : Colors.black,
    },

    error: {
      padding: 16,
      textAlign: "center",
      fontFamily: Fonts.OSREGULAR,
      color: Colors.dark.lightRed,
    },

    headerRow: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.lightGray
        : Colors.darkGray,
      backgroundColor: lighter ? "transparent" : Colors.darkGray + "20",
    },

    headerName: {
      width: NAME_COLUMN_WIDTH,
      paddingHorizontal: 10,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },

    headerCell: {
      textAlign: "center",
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 13,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },

    row: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.lightGray
        : Colors.darkGray,
    },

    nameRow: {
      height: ROW_HEIGHT,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: lighter
        ? Colors.lightGray
        : isDark
        ? Colors.lightGray
        : Colors.darkGray,
      paddingHorizontal: 10,
      justifyContent: "center",
    },

    playerName: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },

    seasonText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      opacity: 0.75,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },

    cell: {
      justifyContent: "center",
      alignItems: "center",
    },

    cellText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 13,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    showMoreLess: {
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 14,
      color: lighter ? Colors.white : isDark ? Colors.white : Colors.black,
    },
  });
