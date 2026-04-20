import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  GestureResponderEvent,
  Pressable,
  Text,
} from "react-native";
import { profileStyles } from "styles/ProfileStyles/ProfileScreenStyles";

type FollowButtonProps = {
  isFollowing: boolean;
  loading: boolean;
  onToggle: () => void;
};

export default function FollowButton({
  isFollowing,
  loading,
  onToggle,
}: FollowButtonProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isFollowing]);

  const styles = profileStyles(isDark, isFollowing);

  const handlePress = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) {
      opacityAnim.setValue(0); // fade out instantly
      onToggle(); // state flips → fade back in
    }
  };

  return (
    <Animated.View
      style={[styles.followButtonContainer, { opacity: opacityAnim }]}
    >
      <Pressable
        onPress={handlePress}
        disabled={loading}
        style={styles.followButton}
      >
        <Text style={styles.followText}>
          {isFollowing ? "Following" : "Follow"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
