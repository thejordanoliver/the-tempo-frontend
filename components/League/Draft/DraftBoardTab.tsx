import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useDraft } from "hooks/LeagueHooks/useLeagueDraft";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DraftProspectBoard from "./DraftProspectBoard";

type Props = {
  safeYear: string;
  league: string;
};

export default function DraftBoardTab({ safeYear, league }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = draftBoardTabStyles(isDark);
  const { draft, loading, error, refreshing, onRefresh } = useDraft(
    league,
    Number(safeYear),
  );

  const current = draft?.current;
  const hasBoardData = Boolean(
    current?.bestAvailable ||
    current?.bestFit ||
    current?.bestAvailablePicks?.length,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        hasBoardData ? styles.content : styles.centeredContent
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? Colors.lightGray : Colors.darkGray}
        />
      }
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isDark ? Colors.lightGray : Colors.darkGray}
        />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : hasBoardData ? (
        <DraftProspectBoard current={current} league={league} />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Draft board unavailable</Text>
          <Text style={styles.emptyText}>
            Current draft board data is not available for this season.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const draftBoardTabStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingVertical: 8,
    },
    centeredContent: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    emptyState: {
      alignItems: "center",
      gap: 6,
    },
    emptyTitle: {
      fontFamily: Fonts.BOLD,
      fontSize: 16,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    emptyText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
    },
    errorText: {
      fontFamily: Fonts.BOLD,
      fontSize: 14,
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      textAlign: "center",
    },
  });
