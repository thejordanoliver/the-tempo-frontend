import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors } from "constants/Colors";
import { useRouter } from "expo-router";
import { AwardCategory, League, useAwardSeasons } from "hooks/useAwardSeasons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  useColorScheme,
} from "react-native";
import { awardTableStyles } from "styles/LeagueStyles/AwardTableSyles";
import AwardSeasonTableSkeleton from "./AwardSeasonTableSkeleton";

const COLUMN_WIDTH = 70;
const NAME_COLUMN_WIDTH = "100%";
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

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type Props = {
  league: League;
  category: AwardCategory;
  title: string;
  lighter?: boolean;
  refreshSignal?: number;
};

export function AwardSeasonsTable({
  league,
  category,
  title,
  refreshSignal,
  lighter = false,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = awardTableStyles(isDark, lighter);

  const router = useRouter();
  const isSummaryAward = league === "CFB" || league === "NFL";
  const isCOY = category === "coy";

  const { data, loading, error, refetch } = useAwardSeasons({
    league,
    category,
  });

  useEffect(() => {
    if (refreshSignal !== undefined) {
      refetch();
    }
  }, [refreshSignal, refetch]);

  const headers = useMemo(() => {
    if (isSummaryAward) return ["Summary"];
    if (isCOY) return COY_HEADERS;
    return STAT_HEADERS;
  }, [isSummaryAward, isCOY]);

  const columnWidth = isSummaryAward ? 320 : isCOY ? 90 : COLUMN_WIDTH;

  const [expanded, setExpanded] = useState(false);

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
        ? isDark
          ? Colors.dark.itemBackground
          : Colors.light.itemBackground
        : "transparent",
    [isDark]
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

  if (loading) {
    return (
      <View style={{ marginVertical: 12 }}>
        <AwardSeasonTableSkeleton teams={1} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ marginVertical: 12 }}>
        <Text style={styles.errorText}>Failed to load.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 12 }}>
      <View style={styles.table}>
        <View style={{ flexDirection: "row" }}>
          {/* Name column */}
          <View style={{ width: NAME_COLUMN_WIDTH }}>
            <View style={styles.headerRow}>
              <Text style={styles.headerName}>{title}</Text>
            </View>

            {visibleRows.map((row, index) => (
              <View
                key={row.id}
                style={[
                  styles.nameRow,
                  { backgroundColor: getRowBackground(index) },
                ]}
              >
                <View style={[styles.nameWrapper]}>
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
              </View>
            ))}
          </View>
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
