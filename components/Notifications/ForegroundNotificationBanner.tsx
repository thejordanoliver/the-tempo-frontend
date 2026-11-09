import { GameNotificationTeamLogos } from "@/components/Notifications/GameNotificationTeamLogos";
import { Colors, Fonts, PLACEHOLDER_AVATAR } from "@/constants/styles";
import {
  useNotificationBanners,
  type Notification,
  useNotifications,
} from "@/contexts/NotificationContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { getNotificationGameTeams } from "@/utils/notifications/notification-team-presentation";
import {
  getNotificationActorProfileImage,
  getNotificationCenterHref,
  getNotificationLeagueLabel,
  shouldShowNotificationActorProfileImage,
} from "@/utils/notifications/notificationCenter";
import { parseImageUrl } from "@/utils/ui/imageUtils";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { useScopedRouter } from "hooks/useScopedRouter";

import { Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppNotification } from "types/notifications";

type Props = {
  preview?: boolean;
  previewNotification?: AppNotification;
  inline?: boolean;
  onPreviewDismiss?: () => void;
  autoDismissAfterMs?: number;
};

const EXIT_DURATION_MS = 240;

export default function ForegroundNotificationBanner(props: Props) {
  const { notifications, onDismiss } = useNotificationBanners();
  const currentBanner = notifications.at(-1);
  const [retainedBanner, setRetainedBanner] = useState(currentBanner);
  const isPreview = props.preview || !!props.previewNotification;

  // The provider removes expired banners immediately. Retain the last one
  // until its exit animation finishes.
  if (currentBanner && currentBanner !== retainedBanner) {
    setRetainedBanner(currentBanner);
  }

  const banner = currentBanner ?? retainedBanner;
  if (!banner && !isPreview) return null;

  return (
    <AnimatedNotificationBanner
      key={
        isPreview ? (props.previewNotification?.id ?? "preview") : banner?.id
      }
      {...props}
      banner={isPreview ? undefined : banner}
      expired={!isPreview && !currentBanner}
      onDismiss={() => {
        if (!banner) return;
        onDismiss(banner.id);
        setRetainedBanner((current) =>
          current?.id === banner.id ? undefined : current,
        );
      }}
    />
  );
}

function AnimatedNotificationBanner({
  preview = false,
  previewNotification,
  inline = false,
  onPreviewDismiss,
  autoDismissAfterMs,
  banner,
  expired,
  onDismiss,
}: Props & {
  banner?: Notification;
  expired: boolean;
  onDismiss: () => void;
}) {
  const router = useScopedRouter();
  const insets = useSafeAreaInsets();

  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";

  const { markCenterNotificationRead } = useNotifications();

  const isPreview = preview || !!previewNotification;
  const previewId = previewNotification?.id;

  const [progress] = useState(() => new Animated.Value(0));
  const [exitProgress] = useState(() => new Animated.Value(0));
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(90);
  const exitingRef = useRef(false);

  const dismiss = useCallback(
    (afterExit?: () => void) => {
      if (exitingRef.current) return;
      exitingRef.current = true;
      setExiting(true);
      Animated.timing(exitProgress, {
        toValue: 1,
        duration: EXIT_DURATION_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        setHidden(true);
        if (isPreview) onPreviewDismiss?.();
        else onDismiss();
        afterExit?.();
      });
    },
    [exitProgress, isPreview, onDismiss, onPreviewDismiss],
  );

  useEffect(() => {
    if (expired) dismiss();
  }, [expired, dismiss]);

  useEffect(() => {
    if (!isPreview || autoDismissAfterMs == null) return;
    const timer = setTimeout(() => dismiss(), autoDismissAfterMs);
    return () => clearTimeout(timer);
  }, [isPreview, autoDismissAfterMs, dismiss]);

  useEffect(
    () => () => {
      progress.stopAnimation();
      exitProgress.stopAnimation();
    },
    [progress, exitProgress],
  );

  const styles = ForegroundNotificationBannerStyles(isDark);

  const liquid = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  // Preview content
  const previewTitle = "Florida Gators";
  const previewLeagueLabel = "CFB";
  const previewMessage = "Touchdown! Florida takes the lead 21-17.";

  useEffect(() => {
    progress.setValue(0);

    if (!banner && !isPreview) {
      return;
    }

    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    }).start();
  }, [banner, isPreview, progress, previewId]);

  /*
   * IMPORTANT:
   *
   * We DO NOT put opacity on the parent containing GlassView.
   *
   * Fade the content separately and dissolve glass through its native effect API.
   */
  const animatedContentStyle = useMemo(
    () => ({
      opacity: Animated.multiply(
        progress,
        exitProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
      ),

      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [-24, 0],
          }),
        },
      ],
    }),
    [progress, exitProgress],
  );

  if (hidden || (!banner && !isPreview)) {
    return null;
  }

  const canonical =
    previewNotification ?? (isPreview ? null : banner?.notification);

  const leagueLabel = canonical
    ? getNotificationLeagueLabel(canonical)
    : isPreview
      ? previewLeagueLabel
      : null;

  const gameTeams = canonical
    ? getNotificationGameTeams(canonical, isDark)
    : null;

  const actorProfileImage =
    canonical && shouldShowNotificationActorProfileImage(canonical)
      ? (parseImageUrl(getNotificationActorProfileImage(canonical)) ??
        PLACEHOLDER_AVATAR)
      : null;

  const title = canonical?.title ?? (isPreview ? previewTitle : "Tempo");

  const message =
    previewNotification?.body ??
    (isPreview ? previewMessage : (banner?.message ?? ""));

  const open = () => {
    if (isPreview) {
      return;
    }

    if (!banner) {
      return;
    }

    dismiss(() => {
      if (!canonical) return;
      if (!canonical.readAt) {
        void markCenterNotificationRead(canonical.id);
      }
      const href = getNotificationCenterHref(canonical);
      if (href) router.push(href as Href);
    });
  };

  return (
    <Animated.View
      pointerEvents={exiting ? "none" : "box-none"}
      onLayout={(event) => setBannerHeight(event.nativeEvent.layout.height)}
      style={[
        styles.positioner,
        {
          transform: [
            {
              translateY: exitProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -(bannerHeight + insets.top + 16)],
              }),
            },
          ],
        },
        inline && isPreview
          ? { position: "relative", left: 0, right: 0 }
          : { top: insets.top + 8 },
      ]}
    >
      {/* Dissolve native glass through its effect API; parent opacity stays at 1. */}
      {liquid ? (
        <GlassView
          colorScheme={resolvedColorScheme}
          glassEffectStyle={
            exiting
              ? {
                  style: "none",
                  animate: true,
                  animationDuration: EXIT_DURATION_MS / 1000,
                }
              : "regular"
          }
          isInteractive
          style={styles.glassBackground}
        />
      ) : (
        <Animated.View
          style={[
            styles.glassBackground,
            {
              opacity: exitProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          <BlurView
            tint={resolvedColorScheme}
            intensity={80}
            style={styles.glassBackground}
          />
        </Animated.View>
      )}

      {/* Fade the copy and controls while the whole banner slides upward. */}
      <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
        <Pressable
          onPress={open}
          accessibilityRole="button"
          accessibilityLabel={`${
            leagueLabel ? `${leagueLabel}. ` : ""
          }${title}. ${
            gameTeams?.matchup ? `${gameTeams.matchup}. ` : ""
          }${message}`}
          style={styles.banner}
        >
          <View style={[styles.icon, gameTeams && styles.gameTeamIcon]}>
            {gameTeams ? (
              <GameNotificationTeamLogos
                teams={gameTeams}
                isDark={isDark}
                size={29}
              />
            ) : actorProfileImage ? (
              <Image
                source={{
                  uri: actorProfileImage,
                }}
                style={styles.profileImage}
                resizeMode="cover"
                fadeDuration={150}
              />
            ) : (
              <Ionicons name="notifications" size={20} color={Colors.white} />
            )}
          </View>

          <View style={styles.copy}>
            <View style={styles.titleRow}>
              {leagueLabel && (
                <Text style={styles.leagueLabel}>{leagueLabel}</Text>
              )}

              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            </View>

            {gameTeams?.matchup && (
              <Text style={styles.teamNames} numberOfLines={1}>
                {gameTeams.matchup}
              </Text>
            )}

            <Text style={styles.body} numberOfLines={gameTeams ? 1 : 2}>
              {message}
            </Text>
          </View>

          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              dismiss();
            }}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            hitSlop={10}
          >
            <Ionicons
              name="close"
              size={18}
              color={isDark ? Colors.lightGray : Colors.darkGray}
            />
          </Pressable>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const ForegroundNotificationBannerStyles = (isDark: boolean) =>
  StyleSheet.create({
    positioner: {
      position: "absolute",

      left: 12,
      right: 12,

      minHeight: 70,

      borderRadius: 16,

      zIndex: 1000,
      elevation: 12,

      // Important for glass + rounded corners
      overflow: "hidden",
    },

    glassBackground: {
      ...StyleSheet.absoluteFill,

      borderRadius: 16,
    },

    contentContainer: {
      borderRadius: 16,
    },

    banner: {
      minHeight: 70,

      borderRadius: 16,

      paddingHorizontal: 14,
      paddingVertical: 12,

      flexDirection: "row",
      alignItems: "center",

      gap: 11,

      borderWidth: StyleSheet.hairlineWidth,

      borderColor: isDark ? Colors.midTone : Colors.midTone,

      backgroundColor: "transparent",
    },

    icon: {
      width: 36,
      height: 36,

      borderRadius: 18,

      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,

      alignItems: "center",
      justifyContent: "center",
    },

    gameTeamIcon: {
      width: 48,

      borderRadius: 0,

      backgroundColor: "transparent",
    },

    profileImage: {
      width: "100%",
      height: "100%",

      borderRadius: 18,
    },

    copy: {
      flex: 1,
      gap: 2,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    leagueLabel: {
      flexShrink: 0,

      overflow: "hidden",

      paddingHorizontal: 6,
      paddingVertical: 2,

      borderRadius: 999,

      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,

      color: Colors.white,

      fontSize: 9,
      lineHeight: 12,

      fontFamily: Fonts.BOLD,

      letterSpacing: 0.4,
    },

    title: {
      flexShrink: 1,

      color: isDark ? Colors.dark.text : Colors.light.text,

      fontSize: 15,

      fontFamily: Fonts.BOLD,
    },

    body: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.REGULAR,
    },

    teamNames: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: Fonts.MEDIUM,
    },
  });
