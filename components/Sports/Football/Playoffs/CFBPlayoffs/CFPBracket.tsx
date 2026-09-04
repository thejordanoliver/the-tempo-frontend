import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { globalStyles } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useMemo } from "react";
import { Text, View } from "react-native";
import type { CFPBracketProps } from "types/football/cfpBracketTypes";
import {
  buildCFPBracketData,
  buildRoundDates,
} from "utils/cfpBracketUtils";
import { CFPBracketCanvas } from "./CFPBracketCanvas";
import { CFPBracketState } from "./CFPBracketState";

export function CFPBracket({
  games,
  loading = false,
  refreshing = false,
  error = null,
  onRetry,
  onGamePress,
  onTeamPress,
}: CFPBracketProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = globalStyles(isDark);
  const data = useMemo(() => buildCFPBracketData(games), [games]);
  const roundDates = useMemo(() => buildRoundDates(games), [games]);

  if (loading && !data) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error && !data) {
    return (
      <CFPBracketState
        isDark={isDark}
        message={error}
        error
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>
          No College Football Playoff games available
        </Text>
      </View>
    );
  }

  return (
    <CFPBracketCanvas
      data={data}
      roundDates={roundDates}
      refreshing={refreshing}
      onGamePress={onGamePress}
      onTeamPress={onTeamPress}
      isDark={isDark}
    />
  );
}
