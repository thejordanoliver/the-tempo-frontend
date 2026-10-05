import { Ionicons } from "@expo/vector-icons";
import { SkeletonBlock } from "components/Skeletons/primitives";
import { activeOpacity, Colors, globalStyles } from "constants/styles";
import { useCurrentUserPicks } from "hooks/ExploreHooks/useCurrentUserPicks";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useMemo, type ComponentProps } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ExploreWidgetSize } from "types/widgets";
import { WidgetEditControls } from "./WidgetSlider";
import { formatDate } from "@/utils/dateUtils";

type Props = ComponentProps<typeof WidgetEditControls> & {
  isEditing: boolean;
  size: ExploreWidgetSize;
  width: number;
  height: number;
};

export default function MyPicksWidget({
  isDark,
  isEditing,
  size,
  width,
  height,
  ...editProps
}: Props) {
  const { data, loading, error, refresh } = useCurrentUserPicks();
  const router = useScopedRouter();
  const styles = useMemo(() => myPicksStyles(isDark), [isDark]);
  const colors = isDark ? Colors.dark : Colors.light;
  const record = data?.record;
  const compact = size === "small";
  const count = compact ? 1 : size === "medium" ? 2 : 5;
  const openRankings = () => router.push("/fan-prediction-rankings");

  return (
    <View
      style={[
        styles.container,
        { width, height, paddingBottom: isEditing ? 60 : 12 },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Picks</Text>
        <TouchableOpacity
          onPress={() => {
            void refresh();
          }}
          disabled={loading || isEditing}
          accessibilityRole="button"
          accessibilityLabel="Refresh your picks"
          activeOpacity={activeOpacity}
        >
          <Ionicons name="refresh" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
      {loading && !data ? (
        <View style={styles.body}>
          <SkeletonBlock width="70%" height={28} />
          <SkeletonBlock height={40} />
        </View>
      ) : error && !data ? (
        <TouchableOpacity
          onPress={() => {
            void refresh();
          }}
          disabled={isEditing}
          style={styles.body}
          accessibilityRole="button"
          accessibilityLabel="Retry loading your picks"
        >
          <Text style={styles.note}>{error} Tap to retry.</Text>
        </TouchableOpacity>
      ) : !data?.picks.length ? (
        <View style={styles.body}>
          <Text style={styles.note}>
            Pick a winner before a game starts to track your predictions here.
          </Text>
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
                {(record?.correct ?? 0).toLocaleString()}/
                {(record?.graded ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.label}>Record</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.value}>
                {record?.accuracy == null ? "—" : `${record.accuracy}%`}
              </Text>
              <Text style={styles.label}>Accuracy</Text>
            </View>
            {!compact && (
              <View style={styles.stat}>
                <Text style={styles.value}>{record?.pending ?? 0}</Text>
                <Text style={styles.label}>Pending</Text>
              </View>
            )}
          </View>
          {!(isEditing && size !== "large") &&
            data.picks.slice(0, count).map((pick) => {
              const date = formatDate(pick.startsAt)
              return (
                <TouchableOpacity
                  key={`${pick.sport}:${pick.league}:${pick.gameId}`}
                  disabled={isEditing}
                  activeOpacity={activeOpacity}
                  onPress={() =>
                    pick.sport === "mma"
                      ? openRankings()
                      : router.push({
                          pathname: "/(tabs)/(explore)/game/[sport]/[game]",
                          params: {
                            sport: pick.sport,
                            game: pick.gameId,
                            league: pick.league,
                            date: pick.startsAt,
                          },
                        })
                  }
                  style={[styles.pick, compact && styles.compactPick]}
                  accessibilityRole="button"
                  accessibilityLabel={`${pick.matchup}, you picked ${pick.pickedName}, ${pick.outcome === "void" ? "not scored" : pick.outcome}`}
                >
                  <View
                    style={[
                      styles.pickCopy,
                      compact && { flex: 0, width: "100%" },
                    ]}
                  >
                    <Text style={styles.pickName} numberOfLines={1}>
                      You picked {pick.pickedName}
                    </Text>
                    {size === "large" && (
                      <Text style={styles.label} numberOfLines={1}>
                        {pick.league.toUpperCase()} · {date} · {pick.matchup}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.outcome,
                      {
                        color:
                          pick.outcome === "correct"
                            ? colors.green
                            : pick.outcome === "incorrect"
                              ? isDark
                                ? Colors.dark.lightRed
                                : Colors.light.red
                              : colors.icon,
                      },
                    ]}
                  >
                    {pick.outcome === "void"
                      ? "Not scored"
                      : pick.outcome.charAt(0).toUpperCase() +
                        pick.outcome.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          {error ? (
            <Text style={styles.label}>
              Showing saved picks. Refresh to try again.
            </Text>
          ) : null}
        </View>
      )}
      {!isEditing && (
        <TouchableOpacity
          onPress={openRankings}
          activeOpacity={activeOpacity}
          accessibilityRole="button"
          style={styles.header}
        >
          <Text style={styles.link}>View analysis & rankings</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.text} />
        </TouchableOpacity>
      )}
      {isEditing && (
        <WidgetEditControls {...editProps} isDark={isDark} compact={compact} />
      )}
    </View>
  );
}

const myPicksStyles = (isDark: boolean) => {
  const global = globalStyles(isDark);
  const colors = isDark ? Colors.dark : Colors.light;
  return StyleSheet.create({
    container: {
      padding: 12,
      gap: 8,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.midTone,
      overflow: "hidden",
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    title: { ...global.subtitle },
    body: { flex: 1, gap: 6 },
    stats: { flexDirection: "row", gap: 8 },
    stat: { flex: 1, minWidth: 0 },
    value: { ...global.title, fontVariant: ["tabular-nums"] },
    label: { ...global.caption, fontSize: 10, lineHeight: 14 },
    note: { ...global.secondaryText },
    pick: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 5,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: Colors.midTone,
    },
    pickCopy: { flex: 1, minWidth: 0 },
    compactPick: { flexDirection: "column", alignItems: "flex-start", gap: 2 },
    pickName: { ...global.secondaryText, color: colors.text },
    outcome: { ...global.caption, fontSize: 11 },
    link: { ...global.caption, color: colors.text },
  });
};
