import { GameNotificationTeamLogos } from "@/components/Notifications/GameNotificationTeamLogos";
import { Colors, Fonts, PLACEHOLDER_AVATAR } from "@/constants/styles";
import {
  useNotificationBanners,
  useNotifications,
} from "@/contexts/NotificationContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { parseImageUrl } from "@/utils/imageUtils";
import { getNotificationGameTeams } from "@/utils/notification-team-presentation";
import {
  getNotificationActorProfileImage,
  getNotificationCenterHref,
  getNotificationLeagueLabel,
  shouldShowNotificationActorProfileImage,
} from "@/utils/notificationCenter";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Image } from "expo-image";
import { Href, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  preview?: boolean;
};

export default function ForegroundNotificationBanner({
  preview = false,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";

  const { notifications, onDismiss } = useNotificationBanners();

  const { markCenterNotificationRead } = useNotifications();

  const banner = notifications.at(-1);

  const [progress] = useState(() => new Animated.Value(0));

  const styles = ForegroundNotificationBannerStyles(isDark);

  const liquid = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  // Preview content
  const previewTitle = "Florida Gators";
  const previewLeagueLabel = "CFB";
  const previewMessage = "Touchdown! Florida takes the lead 21-17.";

  useEffect(() => {
    progress.setValue(0);

    if (!banner && !preview) {
      return;
    }

    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    }).start();
  }, [banner, preview, progress]);

  /*
   * IMPORTANT:
   *
   * We DO NOT put opacity on the parent containing GlassView.
   *
   * Only the banner content is animated.
   */
  const animatedContentStyle = useMemo(
    () => ({
      opacity: progress,

      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [-24, 0],
          }),
        },
      ],
    }),
    [progress],
  );

  if (!banner && !preview) {
    return null;
  }

  const canonical = preview ? null : banner?.notification;

  const leagueLabel = preview
    ? previewLeagueLabel
    : canonical
      ? getNotificationLeagueLabel(canonical)
      : null;

  const gameTeams =
    !preview && canonical ? getNotificationGameTeams(canonical, isDark) : null;

  const actorProfileImage =
    !preview && canonical && shouldShowNotificationActorProfileImage(canonical)
      ? (parseImageUrl(getNotificationActorProfileImage(canonical)) ??
        PLACEHOLDER_AVATAR)
      : null;

  const title = preview ? previewTitle : (canonical?.title ?? "Tempo");

  const message = preview ? previewMessage : (banner?.message ?? "");

  const open = () => {
    if (preview) {
      return;
    }

    if (!banner) {
      return;
    }

    onDismiss(banner.id);

    if (!canonical) {
      return;
    }

    if (!canonical.readAt) {
      void markCenterNotificationRead(canonical.id);
    }

    const href = getNotificationCenterHref(canonical);

    if (href) {
      router.push(href as Href);
    }
  };

  const dismiss = () => {
    if (preview) {
      return;
    }

    if (!banner) {
      return;
    }

    onDismiss(banner.id);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.positioner,
        {
          top: insets.top + 8,
        },
      ]}
    >
      {/* Glass remains at opacity 1 at all times */}
      {liquid ? (
        <GlassView
          glassEffectStyle="regular"
          isInteractive
          style={styles.glassBackground}
        />
      ) : (
        <BlurView intensity={80} style={styles.glassBackground} />
      )}

      {/* Only content animates */}
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
                contentFit="cover"
                transition={150}
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
            onPress={dismiss}
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
    </View>
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
      color: isDark ? Colors.lightGray : Colors.darkGray,

      fontSize: 13,
      lineHeight: 18,

      fontFamily: Fonts.REGULAR,
    },

    teamNames: {
      color: isDark ? Colors.darkGray : Colors.lightGray,

      fontSize: 12,
      lineHeight: 16,

      fontFamily: Fonts.MEDIUM,
    },
  });
