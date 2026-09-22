import { Ionicons } from "@expo/vector-icons";
import { activeOpacity, Colors } from "constants/styles";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { customHeaderStyles } from "../../styles/CustomHeaderStyles";

type NotificationsHeaderMenuProps = {
  visible: boolean;
  isDark: boolean;
  isEditing: boolean;
  selectionDisabled: boolean;
  markAllDisabled: boolean;
  onMarkAllRead: () => void;
  onToggleEditing: () => void;
};

export function NotificationsHeaderMenu({
  visible,
  isDark,
  isEditing,
  selectionDisabled,
  markAllDisabled,
  onMarkAllRead,
  onToggleEditing,
}: NotificationsHeaderMenuProps) {
  const [progress] = useState(() => new Animated.Value(0));
  const [shouldRender, setShouldRender] = useState(visible);

  const { width } = useWindowDimensions();
  const styles = customHeaderStyles(isDark, width);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (visible) {
        setShouldRender(true);

        Animated.spring(progress, {
          toValue: 1,
          damping: 16,
          stiffness: 230,
          mass: 0.8,
          useNativeDriver: true,
        }).start();

        return;
      }

      Animated.timing(progress, {
        toValue: 0,
        duration: 130,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setShouldRender(false);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [progress, visible]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.profileSubmenu,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-6, 0],
              }),
            },
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={activeOpacity}
        disabled={markAllDisabled}
        style={[
          styles.profileSubmenuItem,
          markAllDisabled && { opacity: 0.45 },
        ]}
        onPress={onMarkAllRead}
        accessibilityRole="button"
        accessibilityLabel="Mark all notifications as read"
        accessibilityState={{ disabled: markAllDisabled }}
      >
        <View style={styles.profileSubmenuIconWrap}>
          <Ionicons
            name="mail-open-outline"
            size={24}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>

        <Text style={styles.profileSubmenuText}>Mark all as read</Text>
      </TouchableOpacity>

      <View style={styles.profileSubmenuSeparator} />

      <TouchableOpacity
        activeOpacity={activeOpacity}
        disabled={selectionDisabled}
        style={[
          styles.profileSubmenuItem,
          selectionDisabled && { opacity: 0.45 },
        ]}
        onPress={onToggleEditing}
        accessibilityRole="button"
        accessibilityLabel={
          isEditing ? "Finish selecting notifications" : "Select notifications"
        }
        accessibilityState={{ disabled: selectionDisabled }}
      >
        <Animated.View style={styles.profileSubmenuIconWrap}>
          <Ionicons
            name={
              isEditing ? "checkmark-circle-outline" : "checkmark-done-outline"
            }
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
