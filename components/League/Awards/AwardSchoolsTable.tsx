import AwardSeasonTableSkeleton from "components/Skeletons/AwardSeasonTableSkeleton";
import { Colors, Fonts, globalStyles } from "constants/styles";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  LayoutAnimation,
  ListRenderItem,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { AwardCategory } from "types/types";

const ROW_HEIGHT = 50;
const COLLAPSED_ROWS = 10;

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type LeagueType = "cfb" | "cbb" | "wcbb";

type AwardSchoolRow = {
  team: {
    id: number | string;
    name?: string | null;
    short_name?: string | null;
    code?: string | null;
    abbreviation?: string | null;
    conference?: string | null;
    logo?: string | null;
    color?: string | null;
  };
  total_awards: number;
  unique_players: number;
};

type Props = {
  league?: LeagueType;
  category: AwardCategory;
  title: string;
  refreshSignal?: number;
  data: AwardSchoolRow[];
  loading: boolean;
  error: string | null;
};

export default function AwardSchoolsTable({
  league = "cfb",
  category,
  title,
  loading,
  error,
  data,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const useLightLogo = isDark;

  const styles = useMemo(() => tableStyles(isDark), [isDark]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [expanded]);

  const rows = useMemo(() => {
    const merged = new Map<string, AwardSchoolRow>();

    data.forEach((row) => {
      if (!row?.team?.id) return;

      const key = String(row.team.id);
      const existing = merged.get(key);

      if (!existing) {
        merged.set(key, {
          ...row,
          total_awards: Number(row.total_awards ?? 0),
          unique_players: Number(row.unique_players ?? 0),
        });
        return;
      }

      merged.set(key, {
        ...existing,
        team: {
          ...existing.team,
          ...row.team,
          name: existing.team.name ?? row.team.name,
          short_name: existing.team.short_name ?? row.team.short_name,
        },
        total_awards: Math.max(
          Number(existing.total_awards ?? 0),
          Number(row.total_awards ?? 0),
        ),
        unique_players: Math.max(
          Number(existing.unique_players ?? 0),
          Number(row.unique_players ?? 0),
        ),
      });
    });

    return Array.from(merged.values()).sort((a, b) => {
      const awardDiff =
        Number(b.total_awards ?? 0) - Number(a.total_awards ?? 0);

      if (awardDiff !== 0) return awardDiff;

      const aName = a.team?.name ?? a.team?.short_name ?? "";
      const bName = b.team?.name ?? b.team?.short_name ?? "";

      return aName.localeCompare(bName);
    });
  }, [data]);

  const visibleRows = useMemo(
    () => (expanded ? rows : rows.slice(0, COLLAPSED_ROWS)),
    [expanded, rows],
  );

  const renderItem: ListRenderItem<AwardSchoolRow> = useCallback(
    ({ item, index }) => {
      const isWomen = league === "wcbb";
      const isLastRow = index === visibleRows.length - 1;

      const logo =
        league === "cfb"
          ? getCFBTeamLogo(item.team.id, useLightLogo)
          : getCBBTeamLogo(item.team.id, useLightLogo, isWomen);

      const teamName = item.team.name ?? item.team.short_name ?? "Unknown Team";

      return (
        <View style={[styles.row, isLastRow && styles.lastRow]}>
          <View style={styles.left}>
            <View style={styles.teamRow}>
              {logo && (
                <Image source={logo} style={styles.logo} resizeMode="contain" />
              )}

              <Text style={styles.teamName} numberOfLines={1}>
                {teamName}
              </Text>
            </View>
          </View>

          <View style={styles.right}>
            <Text style={styles.awardCount}>{item.total_awards}x</Text>
            <Text style={styles.subText}>
              {item.unique_players}{" "}
              {item.unique_players === 1 ? "Player" : "Players"}
            </Text>
          </View>
        </View>
      );
    },
    [league, styles, useLightLogo, visibleRows.length],
  );

  const keyExtractor = useCallback(
    (item: AwardSchoolRow, index: number) => {
      const teamId = item?.team?.id ?? "unknown";
      return `${league}-${category}-${teamId}-${index}`;
    },
    [category, league],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <AwardSeasonTableSkeleton teams={1} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={styles.headerName}>{title}</Text>
          </View>

          <Text style={global.errorText}>Failed to load.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={styles.headerName}>{title}</Text>
        </View>

        <FlatList
          data={visibleRows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
          removeClippedSubviews={false}
          ListEmptyComponent={
            <Text style={styles.muted}>No award schools found.</Text>
          }
        />

        {rows.length > COLLAPSED_ROWS && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setExpanded((prev) => !prev)}
            style={styles.showMoreButton}
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

const tableStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginVertical: 12,
    },

    table: {
      borderWidth: 1,
      borderRadius: 8,
      borderColor: Colors.midTone,
      overflow: "hidden",
    },

    headerRow: {
      flexDirection: "row",
      height: ROW_HEIGHT,
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: Colors.midTone,
    },

    headerName: {
      paddingHorizontal: 10,
      fontFamily: Fonts.OSBOLD,
      fontSize: 20,
      color: isDark ? Colors.white : Colors.black,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.lightGray,
      alignItems: "center",
    },

    lastRow: {
      borderBottomWidth: 0,
    },

    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },

    logo: {
      width: 28,
      height: 28,
    },

    left: {
      flex: 1,
      paddingRight: 12,
    },

    right: {
      alignItems: "flex-end",
    },

    teamName: {
      flex: 1,
      fontFamily: Fonts.OSBOLD,
      fontSize: 15,
      color: isDark ? Colors.white : Colors.black,
    },

    awardCount: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
    },

    subText: {
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      opacity: 0.75,
      color: isDark ? Colors.white : Colors.black,
    },

    muted: {
      padding: 12,
      fontFamily: Fonts.OSREGULAR,
      opacity: 0.6,
      color: isDark ? Colors.white : Colors.black,
    },

    showMoreButton: {
      paddingVertical: 14,
      alignItems: "center",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.lightGray,
    },

    showMoreLess: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      color: isDark ? Colors.white : Colors.black,
    },
  });
