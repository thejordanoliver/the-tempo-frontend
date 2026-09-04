import { Pressable, Text, View } from "react-native";

import { CFPBracketStyles } from "styles/PlayoffStyles/CFPBracketStyles";

type CFPBracketStateProps = {
  isDark: boolean;
  message: string;
  error?: boolean;
  onRetry?: () => void;
};

export function CFPBracketState({
  isDark,
  message,
  error = false,
  onRetry,
}: CFPBracketStateProps) {
  const styles = CFPBracketStyles(isDark);

  return (
    <View style={styles.stateContainer}>
      <Text style={error ? styles.errorText : styles.stateText}>{message}</Text>

      {error && onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
