import { usePreferences } from "contexts/PreferencesContext";
import { useEffect, useState } from "react";
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
  loading?: boolean;
  onToggle: () => void;
  compact?: boolean;
};

export default function FollowButton({
  isFollowing,
  loading = false,
  onToggle,
  compact = false,
}: FollowButtonProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const [opacityAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: compact ? 0.3 : 0,
        duration: compact ? 150 : 0,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: compact ? 150 : 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [compact, isFollowing, opacityAnim]);

  const styles = profileStyles(isDark, isFollowing);

  const handlePress = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!loading) {
      opacityAnim.setValue(0);
      onToggle();
    }
  };

  return (
    <Animated.View
      style={[
        styles.followButtonContainer,
        compact && {
          width: 80,
          marginVertical: 4,
        },
        { opacity: opacityAnim },
      ]}
    >
      <Pressable
        onPress={handlePress}
        disabled={loading}
        style={[
          styles.followButton,
          compact && {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
          },
        ]}
      >
        <Text
          style={[
            styles.followText,
            compact && {
              fontSize: 12,
            },
          ]}
        >
          {isFollowing ? "Following" : "Follow"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
