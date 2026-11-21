import FollowButton from "components/Buttons/FollowButton";
import { Ionicons } from "@expo/vector-icons";
import TabBar from "components/TabBars/TabBar";
import Subheading from "components/Headings/Subheading";
import Button from "components/Buttons/Button";
import { FavoritesSectionStyles } from "styles/FavoritesSectionStyles";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useReducedMotion } from "hooks/useReducedMotion";
import { Colors } from "constants/styles";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
  Text,
  useWindowDimensions,
} from "react-native";
import { profileStyles } from "styles/ProfileStyles/ProfileScreenStyles";

export const SkeletonProfileScreen = ({
  isDark,
  isCurrentUser = true,
  showBookmarks = true,
  fullName = "Your Full Name",
  username = "username",
  bio = "Profile biography",
}: {
  isDark: boolean;
  isCurrentUser?: boolean;
  showBookmarks?: boolean;
  fullName?: string | null;
  username?: string | null;
  bio?: string | null;
}) => {
  const reduceMotion = useReducedMotion();

  const styles = profileStyles(isDark);
  const navigationContentStyle = useNavigationBarContentStyle();
  const { width } = useWindowDimensions();
  const favoritesStyles = FavoritesSectionStyles(isDark, (width - 24 - 16) / 3);
  const tabs = showBookmarks
    ? ["favorites", "badges", "predictions", "posts", "bookmarks"]
    : ["favorites", "badges", "predictions", "posts"];

  // Smooth breathing pulse animation
  const [pulseAnim] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    if (reduceMotion) {
      pulseAnim.setValue(0.7);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1, resetBeforeIteration: false },
    );

    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim, reduceMotion]);

  // Base + overlay colors
  const baseColor = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const overlayColor = isDark
    ? "rgba(136,136,136,0.5)"
    : "rgba(136,136,136,0.25)";

  // Each block background + overlay pulse
  const skeletonBlock = {
    backgroundColor: baseColor,
    borderRadius: 8,
    overflow: "hidden" as const,
  };

  // Reusable skeleton wrapper
  const ShimmerBlock = (props: ViewProps) => (
    <View
      {...props}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[skeletonBlock, props.style]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: overlayColor,
            opacity: pulseAnim,
          },
        ]}
      />
    </View>
  );

  // Invisible real content reserves native font and control measurements.
  const placeholder = (
    content: React.ReactNode,
    testID: string,
    radius = 8,
    textHeight?: number,
  ) => (
    <View
      testID={testID}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={{ opacity: 0 }}>{content}</View>
      {ShimmerBlock({
        style: [
          textHeight === undefined
            ? StyleSheet.absoluteFill
            : {
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: textHeight,
                marginTop: -textHeight / 2,
              },
          { borderRadius: radius },
        ],
      })}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={navigationContentStyle(styles.container)}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      testID="skeleton-profile-screen"
    >
      <View style={styles.bannerContainer}>
        {ShimmerBlock({
          style: [styles.banner, { borderRadius: 0 }],
          testID: "skeleton-banner",
        })}
        <View style={styles.profilePicWrapper}>
          {ShimmerBlock({
            style: [styles.profilePic, { borderRadius: 0 }],
            testID: "skeleton-profile-pic",
          })}
        </View>
      </View>

      <View style={styles.followContainer}>
        {["Followers", "Following"].map((label, index) => (
          <View key={label} style={styles.followItem}>
            {placeholder(
              <Text style={styles.followCount}>000</Text>,
              `skeleton-follow-title-${index}`,
              4,
              styles.followCount.fontSize,
            )}
            {placeholder(
              <Text style={styles.followLabel}>{label}</Text>,
              `skeleton-follow-subtitle-${index}`,
              4,
              styles.followLabel.fontSize,
            )}
          </View>
        ))}
      </View>

      <View style={styles.wrapper}>
        <View style={styles.nameContainer}>
          {placeholder(
            <Text style={styles.fullNameText}>{fullName}</Text>,
            "skeleton-name-line1",
            4,
            styles.fullNameText.fontSize,
          )}
          {placeholder(
            <Text style={styles.usernameText}>
              {"@" + (username || "Your Username")}
            </Text>,
            "skeleton-name-line2",
            4,
            styles.usernameText.fontSize,
          )}
        </View>
        {placeholder(
          isCurrentUser ? (
            <View style={styles.editProfileBtn}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
              <Ionicons
                name="create"
                size={18}
                color={isDark ? Colors.black : Colors.white}
              />
            </View>
          ) : (
            <FollowButton
              isFollowing={false}
              loading={false}
              onToggle={() => {}}
            />
          ),
          "skeleton-edit-profile-btn",
          styles.editProfileBtn.borderRadius,
        )}
      </View>

      <View style={styles.bioContainer}>
        <View style={{ marginVertical: styles.bioText.marginVertical }}>
          {placeholder(
            <Text style={[styles.bioText, { marginVertical: 0 }]}>
              {bio || ""}
            </Text>,
            "skeleton-bio",
            4,
            undefined,
          )}
        </View>
      </View>

      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TabBar
            tabs={tabs}
            selected="favorites"
            onTabPress={() => {}}
            isDark={isDark}
          />
        </ScrollView>
      </View>

      <View style={styles.contentContainer}>
        {["Sports", "Teams"].map((section) => (
          <View key={section}>
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Subheading collapsible>{`Favorite ${section}`}</Subheading>
            </View>
            <View style={favoritesStyles.grid}>
              {[0, 1, 2].map((index) => (
                <View key={index} style={favoritesStyles.gridItem}>
                  {ShimmerBlock({
                    style: StyleSheet.absoluteFill,
                    testID: `skeleton-favorite-${section.toLowerCase()}-${index}`,
                  })}
                </View>
              ))}
            </View>
          </View>
        ))}
        {isCurrentUser && (
          <View style={favoritesStyles.buttonContainer}>
            {placeholder(
              <Button isDark={isDark} onPress={() => {}}>
                Edit Favorites
              </Button>,
              "skeleton-edit-teams-button",
              12,
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};
