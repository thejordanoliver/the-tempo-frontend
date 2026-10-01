import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useDraft } from "hooks/LeagueHooks/useLeagueDraft";
import React from "react";
import {
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
  const navigationContentStyle = useNavigationBarContentStyle();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = DraftBoardStyles(isDark);
  const global = globalStyles(isDark);
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

  if (loading)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (error)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>Error: {error}</Text>
      </View>
    );

  if (!hasBoardData)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyTitle}>Draft board unavailable</Text>
        <Text style={global.emptyText}>
          Current draft board data is not available for this season.
        </Text>
      </View>
    );

  return (
    <ScrollView
      contentContainerStyle={navigationContentStyle(styles.container)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? Colors.lightGray : Colors.darkGray}
        />
      }
    >
      <DraftProspectBoard current={current} league={league} />
    </ScrollView>
  );
}

export const DraftBoardStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 8,
    },
  });
