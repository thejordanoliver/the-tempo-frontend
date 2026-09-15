import { Ionicons } from "@expo/vector-icons";
import { activeOpacity, Colors } from "constants/styles";
import { Text, TouchableOpacity, useWindowDimensions } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { customHeaderStyles } from "../../styles/CustomHeaderStyles";

type NotificationsHeaderMenuProps = {
  visible: boolean;
  isDark: boolean;
  isEditing: boolean;
  disabled: boolean;
  onToggleEditing: () => void;
};

export function NotificationsHeaderMenu({
  visible,
  isDark,
  isEditing,
  disabled,
  onToggleEditing,
}: NotificationsHeaderMenuProps) {
  const { width } = useWindowDimensions();
  const styles = customHeaderStyles(isDark, width);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(160)}
      exiting={FadeOutUp.duration(120)}
      style={[styles.profileSubmenu, styles.notificationsSubmenu]}
    >
      <TouchableOpacity
        activeOpacity={activeOpacity}
        disabled={disabled}
        style={[styles.profileSubmenuItem, disabled && { opacity: 0.45 }]}
        onPress={onToggleEditing}
        accessibilityRole="button"
        accessibilityLabel={
          isEditing ? "Finish selecting notifications" : "Select notifications"
        }
        accessibilityState={{ disabled }}
      >
        <Animated.View style={styles.profileSubmenuIconWrap}>
          <Ionicons
            name={isEditing ? "checkmark-circle-outline" : "checkmark-done-outline"}
            size={24}
            color={isDark ? Colors.white : Colors.black}
          />
        </Animated.View>

        <Text style={styles.profileSubmenuText}>
          {isEditing ? "Done selecting" : "Select notifications"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
