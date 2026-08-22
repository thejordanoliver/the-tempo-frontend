import { Ionicons } from "@expo/vector-icons";
import { Colors, activeOpacity } from "constants/styles";
import { TouchableOpacity, View } from "react-native";
import { customHeaderStyles } from "./styles";

type HeaderLeftActionsProps = {
  tabName?: string;
  showBackButton: boolean;
  onBack?: () => void;
  onAddWidget?: () => void;
  onProfileMessages?: () => void;
  isDark: boolean;
  headerIconColor: string;
};

export function HeaderLeftActions({
  tabName,
  showBackButton,
  onBack,
  onAddWidget,
  onProfileMessages,
  isDark,
  headerIconColor,
}: HeaderLeftActionsProps) {
  const styles = customHeaderStyles;

  if (tabName === "Profile") {
    return onProfileMessages ? (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onProfileMessages}
        style={styles.profileHeaderActionButton}
        hitSlop={8}
      >
        <Ionicons
          name="chatbubbles-outline"
          size={24}
          color={isDark ? Colors.white : Colors.black}
        />
      </TouchableOpacity>
    ) : (
      <View style={styles.profileHeaderPlaceholder} />
    );
  }

  if (showBackButton && onBack) {
    return (
      <TouchableOpacity activeOpacity={activeOpacity} onPress={onBack} hitSlop={8}>
        <Ionicons name="arrow-back" size={24} color={headerIconColor} />
      </TouchableOpacity>
    );
  }

  if (tabName === "Explore" && onAddWidget) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onAddWidget}
        hitSlop={8}
      >
        <Ionicons
          name="add"
          size={24}
          color={isDark ? Colors.white : Colors.black}
        />
      </TouchableOpacity>
    );
  }

  return <View style={styles.headerSidePlaceholder} />;
}
