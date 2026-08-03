import React, { memo, useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { tournamentBracketStyles } from "./tournamentBracket.styles";

type TournamentBracketEmptyStateProps = {
  title: string;
  message: string;
  isDark: boolean;
  retryLabel?: string;
  onRetry?: () => void;
};

function TournamentBracketEmptyStateComponent({
  title,
  message,
  isDark,
  retryLabel = "Retry",
  onRetry,
}: TournamentBracketEmptyStateProps) {
  const styles = useMemo(() => tournamentBracketStyles(isDark), [isDark]);

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle} selectable>
        {title}
      </Text>
      <Text style={styles.emptyBody} selectable>
        {message}
      </Text>
      {onRetry ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>{retryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export const TournamentBracketEmptyState = memo(
  TournamentBracketEmptyStateComponent,
);
