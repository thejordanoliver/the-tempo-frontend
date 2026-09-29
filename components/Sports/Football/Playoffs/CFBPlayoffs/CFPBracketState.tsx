import Button from "@/components/Buttons/Button";
import { globalStyles } from "@/constants/styles";
import { Text, View } from "react-native";

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
  const global = globalStyles(isDark);

  return (
    <View style={global.emptyContainer}>
      <Text style={error ? global.errorText : global.emptyTitle}>
        {message}
      </Text>

      {error && onRetry ? (
        <Button
          isDark={isDark}
          onPress={onRetry}
          variant="outline"
          style={styles.retryButton}
        >
          Try Again
        </Button>
      ) : null}
    </View>
  );
}
