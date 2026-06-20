import AwardSeasonTableSkeleton from "components/Skeletons/AwardSeasonTableSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { awardTableStyles } from "styles/LeagueStyles/AwardTableSyles";
import { AwardCategory } from "types/types";

const NAME_COLUMN_WIDTH = "100%";
const COLLAPSED_ROWS = 5;

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type Props = {
  category: AwardCategory;
  title: string;
  refreshSignal?: number;
  data: any[];
  loading: boolean;
  error: string | null;
};

export function AwardSeasonsTable({ title, loading, error, data }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = awardTableStyles(isDark);
  const global = globalStyles(isDark);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [expanded]);

  const visibleRows = useMemo(
    () => (expanded ? data : data?.slice(0, COLLAPSED_ROWS)),
    [expanded, data],
  );

  const getRowBackground = useCallback(
    (index: number) =>
      index % 2 === 1
        ? isDark
          ? Colors.dark.itemBackground
          : Colors.light.itemBackground
        : "transparent",
    [isDark],
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
        <Text style={global.errorText}>Failed to load.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.table}>
        <View style={{ width: NAME_COLUMN_WIDTH }}>
          <View style={styles.headerRow}>
            <Text style={styles.headerName}>{title}</Text>
          </View>

          {visibleRows?.map((row, index) => (
            <View
              key={`${row.award_type ?? "type"}-${row.season ?? "season"}-${row.player_name ?? "player"}-${row.team_code ?? "team"}-${index}`}
              style={[
                styles.nameRow,
                { backgroundColor: getRowBackground(index) },
              ]}
            >
              <Text style={styles.playerName}>{row.player_name}</Text>
              <Text style={styles.seasonText}>{row.season}</Text>
            </View>
          ))}
        </View>
        {data?.length > COLLAPSED_ROWS && (
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
