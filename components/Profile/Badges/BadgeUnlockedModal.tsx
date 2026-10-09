import Button from "@/components/Buttons/Button";
import { BADGE_TIER_COLORS } from "@/constants/badges";
import { Colors, Fonts } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
import { markBadgeNotificationsRead } from "@/services/badgeApi";
import { useBadgeNotificationStore } from "@/store/badgeNotificationStore";
import type {
  BadgeNotification,
  BadgeProgress,
  BadgeTier,
} from "@/types/badges";
import { capitalizeBadgeTier } from "@/utils/badgeUtils";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BadgeEmblem from "./BadgeEmblem";

const FALLBACK_TIER: BadgeTier = "bronze";

const buildUnlockedBadge = (notification: BadgeNotification): BadgeProgress => {
  const { badge } = notification;

  return {
    id: badge.badgeId,
    name: badge.name || "New badge",
    description: badge.description || "You unlocked a new badge.",
    category: badge.category || "community",
    metric: badge.metric || "totalEngagement",
    tier: badge.tier ?? FALLBACK_TIER,
    threshold: badge.threshold || 1,
    symbol: badge.symbol || "🏆",
    sortOrder: 0,
    currentValue: badge.threshold || 1,
    progressPercent: 100,
    remaining: 0,
    isEarned: true,
    earnedAt: badge.earnedAt,
  };
};

export default function BadgeUnlockedModal() {
  const currentNotification = useBadgeNotificationStore(
    (state) => state.currentNotification,
  );

  const dismissCurrentNotification = useBadgeNotificationStore(
    (state) => state.dismissCurrentNotification,
  );

  const queueNotificationReadRetry = useBadgeNotificationStore(
    (state) => state.queueNotificationReadRetry,
  );

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const insets = useSafeAreaInsets();

  const [cardOpacity] = useState(() => new Animated.Value(0));
  const [cardScale] = useState(() => new Animated.Value(0.9));
  const [cardTranslateY] = useState(() => new Animated.Value(18));
  const [emblemScale] = useState(() => new Animated.Value(0.65));
  const [emblemOpacity] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  const badge = useMemo(
    () =>
      currentNotification ? buildUnlockedBadge(currentNotification) : null,
    [currentNotification],
  );

  const notificationId = currentNotification?.notificationId ?? null;

  const tierColor = badge
    ? (BADGE_TIER_COLORS[badge.tier] ?? Colors.midTone)
    : Colors.midTone;

  const styles = useMemo(
    () => badgeUnlockedModalStyles(isDark, tierColor),
    [isDark, tierColor],
  );

  const acknowledgeRead = useCallback(
    async (dismissedNotificationId: string) => {
      try {
        const acknowledgedIds = await markBadgeNotificationsRead([
          dismissedNotificationId,
        ]);

        if (!acknowledgedIds.includes(dismissedNotificationId)) {
          queueNotificationReadRetry(dismissedNotificationId);
        }
      } catch (error) {
        queueNotificationReadRetry(dismissedNotificationId);

        if (__DEV__) {
          console.warn(
            "[BadgeModal] Failed to mark notification as read",
            error,
          );
        }
      }
    },
    [queueNotificationReadRetry],
  );

  const handleDismiss = useCallback(() => {
    const dismissedNotificationId = notificationId;

    dismissCurrentNotification();

    if (dismissedNotificationId) {
      void acknowledgeRead(dismissedNotificationId);
    }
  }, [acknowledgeRead, dismissCurrentNotification, notificationId]);

  useEffect(() => {
    cardOpacity.setValue(0);
    cardScale.setValue(0.9);
    cardTranslateY.setValue(18);
    emblemScale.setValue(0.65);
    emblemOpacity.setValue(0);
    pulse.setValue(0);

    if (!badge) return;

    const animation = Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),

      Animated.spring(cardScale, {
        toValue: 1,
        damping: 17,
        stiffness: 160,
        mass: 0.85,
        useNativeDriver: true,
      }),

      Animated.spring(cardTranslateY, {
        toValue: 0,
        damping: 18,
        stiffness: 160,
        useNativeDriver: true,
      }),

      Animated.sequence([
        Animated.delay(120),

        Animated.parallel([
          Animated.timing(emblemOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),

          Animated.sequence([
            Animated.spring(emblemScale, {
              toValue: 1.1,
              damping: 9,
              stiffness: 180,
              useNativeDriver: true,
            }),

            Animated.spring(emblemScale, {
              toValue: 1,
              damping: 13,
              stiffness: 200,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
    ]);

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          isInteraction: false,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          isInteraction: false,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start(({ finished }) => {
      if (finished) pulseAnimation.start();
    });

    return () => {
      animation.stop();
      pulseAnimation.stop();
    };
  }, [
    badge,
    notificationId,
    cardOpacity,
    cardScale,
    cardTranslateY,
    emblemScale,
    emblemOpacity,
    pulse,
  ]);

  return (
    <Modal
      visible={Boolean(currentNotification)}
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={handleDismiss}
    >
      <View
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View
            accessible
            accessibilityRole="summary"
            accessibilityLabel={
              badge
                ? `Badge Unlocked. ${badge.name}. ${capitalizeBadgeTier(
                    badge.tier,
                  )}. ${badge.description}`
                : "Badge Unlocked"
            }
            style={[
              styles.card,
              {
                opacity: cardOpacity,
                transform: [
                  { scale: cardScale },
                  { translateY: cardTranslateY },
                ],
              },
            ]}
          >
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={85}
              style={StyleSheet.absoluteFill}
            />

            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, styles.cardSurface]}
            />

            {badge && (
              <>
                <Pressable
                  onPress={handleDismiss}
                  accessibilityRole="button"
                  accessibilityLabel="Close badge notification"
                  hitSlop={12}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>

                <View style={styles.header}>
                  <View style={styles.eyebrowContainer}>
                    <View style={styles.eyebrowLine} />

                    <Text style={styles.eyebrow}>NEW ACHIEVEMENT</Text>

                    <View style={styles.eyebrowLine} />
                  </View>

                  <Text accessibilityRole="header" style={styles.heading}>
                    Badge Unlocked!
                  </Text>

                  <Text style={styles.subtitle}>
                    {" You've reached a new milestone"}
                  </Text>
                </View>

                <Animated.View
                  style={[
                    styles.emblemArea,
                    {
                      opacity: emblemOpacity,
                      transform: [{ scale: emblemScale }],
                    },
                  ]}
                >
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.haloOuter,
                      {
                        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.4] }),
                        transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
                      },
                    ]}
                  />

                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.haloMiddle,
                      {
                        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.55] }),
                        transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
                      },
                    ]}
                  />

                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.haloInner,
                      {
                        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [isDark ? 0.1 : 0.08, isDark ? 0.2 : 0.16] }),
                        transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
                      },
                    ]}
                  />

                  <Animated.View
                    pointerEvents="none"
                    accessible={false}
                    style={[
                      styles.sparkles,
                      {
                        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
                        transform: [{ rotate: pulse.interpolate({ inputRange: [0, 1], outputRange: ["-3deg", "3deg"] }) }],
                      },
                    ]}
                  >
                    <Text style={[styles.sparkle, styles.sparkleTopLeft]}>
                      ✦
                    </Text>

                    <Text style={[styles.sparkle, styles.sparkleTopRight]}>
                      ✧
                    </Text>

                    <Text style={[styles.sparkle, styles.sparkleBottomLeft]}>
                      ✧
                    </Text>

                    <Text style={[styles.sparkle, styles.sparkleBottomRight]}>
                      ✦
                    </Text>
                  </Animated.View>

                  <Animated.View
                    style={[
                      styles.emblemContainer,
                      { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }) }] },
                    ]}
                  >
                    <BadgeEmblem
                      badge={badge}
                      size={116}
                      showLockedState={false}
                    />
                  </Animated.View>
                </Animated.View>

                <View style={styles.badgeDetails}>
                  <Text style={styles.badgeName}>{badge.name}</Text>

                  <View style={styles.tierPill}>
                    <View style={styles.tierDot} />

                    <Text style={styles.tierText}>
                      {capitalizeBadgeTier(badge.tier)} Tier
                    </Text>
                  </View>

                  <Text selectable style={styles.description}>
                    {badge.description}
                  </Text>
                </View>

                <View style={styles.footer}>
                  <View style={styles.divider} />

                  <Text style={styles.footerMessage}>
                    Keep it up. More achievements await!
                  </Text>

                  <Button
                    accessibilityRole="button"
                    accessibilityLabel="Continue after unlocking badge"
                    onPress={handleDismiss}
                    isDark={isDark}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                  </Button>
                </View>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const badgeUnlockedModalStyles = (isDark: boolean, tierColor: string) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.82)" : "rgba(0, 0, 0, 0.6)",
      paddingHorizontal: 20,
    },

    scroll: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 18,
    },

    card: {
      width: "100%",
      maxWidth: 380,
      alignItems: "center",
      borderRadius: 28,
      borderWidth: 1,
      borderColor: Colors.transparentMidTone,
      overflow: "hidden",
      paddingHorizontal: 24,
      paddingTop: 34,
      paddingBottom: 24,
      shadowColor: Colors.black,
      shadowOffset: {
        width: 0,
        height: 16,
      },
      shadowOpacity: isDark ? 0.5 : 0.22,
      shadowRadius: 30,
      elevation: 20,
    },

    cardSurface: {
      backgroundColor: isDark
        ? Colors.dark.transparentBackground
        : Colors.light.transparentBackground,
    },

    topAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: tierColor,
    },

    closeButton: {
      position: "absolute",
      top: 16,
      right: 16,
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",

      zIndex: 2,
    },

    closeText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: 23,
      lineHeight: 27,
      textAlign: "center",
    },

    pressed: {
      opacity: 0.6,
    },

    header: {
      alignItems: "center",
      width: "100%",
    },

    eyebrowContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },

    eyebrowLine: {
      width: 18,
      height: 1,
      backgroundColor: tierColor,
      opacity: 0.65,
    },

    eyebrow: {
      fontFamily: Fonts.BOLD,
      fontSize: 10,
      letterSpacing: 2,
      color: tierColor,
      textAlign: "center",
    },

    heading: {
      fontFamily: Fonts.BOLD,
      fontSize: 27,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
      letterSpacing: -0.6,
    },

    subtitle: {
      fontFamily: Fonts.REGULAR,
      fontSize: 13,
      lineHeight: 19,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
      marginTop: 6,
    },

    emblemArea: {
      width: 220,
      height: 210,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },

    haloOuter: {
      position: "absolute",
      width: 202,
      height: 202,
      borderRadius: 101,
      borderWidth: 1,
      borderColor: tierColor,
      opacity: 0.18,
    },

    haloMiddle: {
      position: "absolute",
      width: 174,
      height: 174,
      borderRadius: 87,
      borderWidth: 1,
      borderColor: tierColor,
      opacity: 0.35,
    },

    haloInner: {
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: tierColor,
      opacity: isDark ? 0.1 : 0.08,
    },

    emblemContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 150,
      height: 150,
      borderRadius: 75,
    },

    sparkles: {
      ...StyleSheet.absoluteFill,
    },

    sparkle: {
      position: "absolute",
      fontSize: 20,
      color: tierColor,
    },

    sparkleTopLeft: {
      top: 20,
      left: 14,
      fontSize: 16,
    },

    sparkleTopRight: {
      top: 24,
      right: 15,
      fontSize: 24,
    },

    sparkleBottomLeft: {
      bottom: 28,
      left: 10,
      fontSize: 22,
    },

    sparkleBottomRight: {
      bottom: 18,
      right: 24,
      fontSize: 14,
    },

    badgeDetails: {
      width: "100%",
      alignItems: "center",
      marginTop: 2,
      gap: 12,
    },

    badgeName: {
      fontFamily: Fonts.BOLD,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.4,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    tierPill: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.05)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
    },

    tierDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: tierColor,
    },

    tierText: {
      fontFamily: Fonts.BOLD,
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: isDark ? Colors.white : Colors.black,
    },

    description: {
      fontFamily: Fonts.REGULAR,
      fontSize: 14,
      lineHeight: 21,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
      maxWidth: 290,
    },

    footer: {
      width: "100%",
      alignItems: "center",
      marginTop: 24,
    },

    divider: {
      width: "100%",
      height: 1,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.08)",
      marginBottom: 16,
    },

    footerMessage: {
      fontFamily: Fonts.REGULAR,
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
      marginBottom: 18,
    },

    button: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
      borderRadius: 14,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },

    buttonText: {
      fontFamily: Fonts.BOLD,
      fontSize: 15,
      color: isDark ? Colors.black : Colors.white,
      letterSpacing: 0.2,
    },
  });
