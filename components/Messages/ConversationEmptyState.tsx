import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Ionicons } from "@expo/vector-icons";
import { activeOpacity, Colors, globalStyles } from "constants/styles";
import {
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { ConversationScreenStyles } from "styles/MessageStyles/ConversationScreenStyles";

type Props = {
  styles: ReturnType<typeof ConversationScreenStyles>;
  isDark: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function ConversationEmptyState({
  styles,
  isDark,
  isLoading,
  error,
  refresh,
  style,
}: Props) {
  const global = globalStyles(isDark);
  if (isLoading) {
    return (
      <View style={[global.emptyContainer, style]}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.emptyState, style]}>
        <Ionicons
          name="alert-circle-outline"
          size={34}
          color={isDark ? Colors.white : Colors.black}
        />

        <Text style={styles.emptyTitle}>Couldn’t load messages</Text>

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
    <View style={[styles.emptyState, style]}>
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={34}
        color={isDark ? Colors.white : Colors.black}
      />

      <Text style={styles.emptyTitle}>Start the conversation</Text>

      <Text style={styles.emptyText}>Say hello.</Text>
    </View>
  );
}
