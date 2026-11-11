import Button from "components/Buttons/Button";
import { globalStyles } from "constants/styles";
import type { ErrorBoundaryProps } from "expo-router";
import { useEffect } from "react";
import { Text, View, useColorScheme } from "react-native";
import { reportCrash } from "utils/observability/crashReporting";

export function RootErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const isDark = useColorScheme() === "dark";
  const styles = globalStyles(isDark);
  useEffect(() => {
    reportCrash(error);
  }, [error]);

  return (
    <View style={styles.emptyContainer} accessibilityRole="alert">
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptySubText}>
        Please try loading this screen again.
      </Text>
      <Button isDark={isDark} onPress={retry}>
        Try again
      </Button>
    </View>
  );
}
