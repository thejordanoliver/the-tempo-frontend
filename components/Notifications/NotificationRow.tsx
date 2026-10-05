import { GameNotificationTeamLogos } from "@/components/Notifications/GameNotificationTeamLogos";
import { Colors, PLACEHOLDER_AVATAR } from "@/constants/styles";
import { NotificationsCenterStyles } from "@/styles/NotificationCenterStyles";
import type { AppNotification, NotificationType } from "@/types/notifications";
import { parseImageUrl } from "@/utils/imageUtils";
import { getNotificationGameTeams } from "@/utils/notification-team-presentation";
import {
  getNotificationActorProfileImage,
  getNotificationCenterHref,
  getNotificationLeagueLabel,
  shouldShowNotificationActorProfileImage,
} from "@/utils/notificationCenter";
import { Ionicons } from "@expo/vector-icons";
import { formatDistance } from "date-fns/formatDistance";
import { Image } from "expo-image";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

const getNotificationIcon = (
  type: NotificationType,
): React.ComponentProps<typeof Ionicons>["name"] => {
  switch (type) {
    case "game_starting":
    case "game_touchdown":
    case "game_quarter_end":
    case "game_halftime":
    case "game_close":
    case "game_final":
      return "alert";

    case "post_like":
      return "heart-outline";

    case "post_comment":
    case "comment_reply":
      return "chatbubble-ellipses-outline";

    case "message":
      return "chatbubbles-outline";

    case "badge":
      return "ribbon-outline";

    case "new_follower":
      return "people-outline";

    default:
      return "notifications-outline";
  }
};

type NotificationRowProps = {
  notification: AppNotification;
  isDark: boolean;
  now: number;
  onPress: (notification: AppNotification) => void;
  isEditing: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
};

export const NotificationRow = memo(function NotificationRow({
  notification,
  isDark,
  now,
  onPress,
  isEditing,
  isSelected,
  onToggleSelection,
}: NotificationRowProps) {
  const styles = NotificationsCenterStyles(isDark);

  const { title, body, type, readAt } = notification;

  if (!title && !body) {
    return null;
  }

  const iconName = getNotificationIcon(type);
  const href = getNotificationCenterHref(notification);
  const leagueLabel = getNotificationLeagueLabel(notification);
  const gameTeams = getNotificationGameTeams(notification, isDark);
  const actorProfileImage = shouldShowNotificationActorProfileImage(
    notification,
  )
    ? (parseImageUrl(getNotificationActorProfileImage(notification)) ??
      PLACEHOLDER_AVATAR)
    : null;
  const isPressable = href !== null;
  const isUnread = !readAt;
  const createdAt = new Date(notification.createdAt);
  const timeAgo = Number.isNaN(createdAt.getTime())
    ? null
    : formatDistance(createdAt, now, { addSuffix: true }).replace(
        /^about /,
        "",
      );
  const accessibilityLabel = [
    leagueLabel,
    title,
    gameTeams?.matchup,
    body,
    timeAgo,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <Pressable
      disabled={!isEditing && !isPressable}
      onPress={() =>
        isEditing ? onToggleSelection(notification.id) : onPress(notification)
      }
      accessibilityRole={isEditing || isPressable ? "button" : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={isEditing ? { selected: isSelected } : undefined}
      accessibilityHint={
        isEditing
          ? isSelected
            ? "Double tap to deselect this notification."
            : "Double tap to select this notification for deletion."
          : isPressable
            ? "Opens the related notification."
            : undefined
      }
      style={({ pressed }) => [
        styles.notificationRow,
        isUnread && styles.notificationRowUnread,
        pressed && (isEditing || isPressable) && styles.notificationRowPressed,
      ]}
    >
      {isEditing && (
        <View
          style={[
            styles.selectionCircle,
            isSelected && styles.selectionCircleSelected,
          ]}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={15} color={Colors.white} />
          )}
        </View>
      )}

      <View
        style={[styles.iconWrapper, gameTeams && styles.gameTeamLogoWrapper]}
      >
        {gameTeams ? (
          <GameNotificationTeamLogos teams={gameTeams} isDark={isDark} />
        ) : actorProfileImage ? (
          <Image
            source={{ uri: actorProfileImage }}
            style={styles.profileImage}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <Ionicons
            name={iconName}
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        )}

        {isUnread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          {leagueLabel && <Text style={styles.leagueLabel}>{leagueLabel}</Text>}

          <Text style={styles.notificationHeader} numberOfLines={2}>
            {title}
          </Text>
        </View>

        {gameTeams?.matchup && (
          <Text style={styles.teamNames} numberOfLines={1}>
            {gameTeams.matchup}
          </Text>
        )}

        <Text style={styles.notificationText} numberOfLines={gameTeams ? 2 : 3}>
          {body}
        </Text>

        {timeAgo && <Text style={styles.notificationTime}>{timeAgo}</Text>}
      </View>

      {isPressable && !isEditing && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isDark ? Colors.lightGray : Colors.darkGray}
          style={styles.chevron}
        />
      )}
    </Pressable>
  );
});

