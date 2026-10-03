import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Ionicons } from "@expo/vector-icons";
import { activeOpacity, Colors, globalStyles } from "constants/styles";
import { Text, TouchableOpacity, View } from "react-native";
import type { ConversationScreenStyles } from "styles/MessageStyles/ConversationScreenStyles";

type Props = {
  styles: ReturnType<typeof ConversationScreenStyles>;
  isDark: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export default function ConversationEmptyState({
  styles,
  isDark,
  isLoading,
  error,
  refresh,
}: Props) {
  const global = globalStyles(isDark);
  if (isLoading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="alert-circle-outline"
          size={34}
          color={isDark ? Colors.white : Colors.black}
        />

        <Text style={styles.emptyTitle}>Conversation unavailable</Text>

        <Text style={styles.emptyText}>{error}</Text>

        <TouchableOpacity
          activeOpacity={activeOpacity}
          style={styles.retryButton}
          onPress={refresh}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={34}
        color={isDark ? Colors.white : Colors.black}
      />

      <Text style={styles.emptyTitle}>Start the conversation</Text>

      <Text style={styles.emptyText}>Send a message to begin this chat.</Text>
    </View>
  );
}
