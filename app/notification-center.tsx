import { CustomHeader } from "@/components/CustomHeader";
import { GameNotificationTeamLogos } from "@/components/Notifications/GameNotificationTeamLogos";
import { Colors, PLACEHOLDER_AVATAR } from "@/constants/styles";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePreferences } from "@/contexts/PreferencesContext";
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
import { Href, useNavigation, useRouter } from "expo-router";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  SlideOutLeft,
} from "react-native-reanimated";

const CUSTOM_TAB_BAR_HEIGHT = 80;

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

const NotificationRow = memo(function NotificationRow({
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

          <Text style={styles.notificationHeader} numberOfLines={1}>
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

export default function NotificationsCenter() {
  const { resolvedColorScheme } = usePreferences();

  const {
    centerNotifications,
    markCenterNotificationRead,
    markAllCenterNotificationsRead,
    removeCenterNotification,
    removeAllCenterNotifications,
    refreshNotifications,
    loadMoreNotifications,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
  } = useNotifications();

  const isDark = resolvedColorScheme === "dark";
  const [relativeTimeNow, setRelativeTimeNow] = useState(() => Date.now());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [suppressEmptyState, setSuppressEmptyState] = useState(false);
  const emptyStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const styles = NotificationsCenterStyles(isDark);

  const navigation = useNavigation();
  const router = useRouter();

  const visibleNotifications = useMemo(
    () =>
      centerNotifications.filter(
        (notification) => !hiddenIds.has(notification.id),
      ),
    [centerNotifications, hiddenIds],
  );

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((current) => {
      if (current) {
        setSelectedIds(new Set());
      }
      return !current;
    });
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Notifications"
          onBack={() => router.back()}
          onToggleNotificationEditing={toggleSelectionMode}
          isNotificationEditing={isSelectionMode}
          hasNotifications={visibleNotifications.length > 0}
        />
      ),
    });
  }, [
    isSelectionMode,
    navigation,
    router,
    toggleSelectionMode,
    visibleNotifications.length,
  ]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRelativeTimeNow(Date.now());
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(
    () => () => {
      if (emptyStateTimerRef.current) {
        clearTimeout(emptyStateTimerRef.current);
      }
    },
    [],
  );

  const handleNotificationPress = useCallback(
    (notification: AppNotification) => {
      if (!notification.readAt) {
        markCenterNotificationRead(notification.id);
      }

      const href = getNotificationCenterHref(notification);

      if (!href) {
        return;
      }

      router.push(href as Href);
    },
    [markCenterNotificationRead, router],
  );

  const handleMarkAllRead = useCallback(() => {
    void markAllCenterNotificationsRead();
  }, [markAllCenterNotificationsRead]);

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const allNotificationsSelected =
    visibleNotifications.length > 0 &&
    visibleNotifications.every((notification) =>
      selectedIds.has(notification.id),
    );
  const selectedCount = visibleNotifications.reduce(
    (count, notification) => count + Number(selectedIds.has(notification.id)),
    0,
  );

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds(
      allNotificationsSelected
        ? new Set()
        : new Set(
            visibleNotifications.map((notification) => notification.id),
          ),
    );
  }, [allNotificationsSelected, visibleNotifications]);

  const handleDeleteSelected = useCallback(() => {
    const idsToDelete = visibleNotifications
      .map((notification) => notification.id)
      .filter((id) => selectedIds.has(id));

    if (idsToDelete.length === 0) {
      return;
    }

    const deletingEntireList =
      idsToDelete.length === visibleNotifications.length;

    setHiddenIds((current) => new Set([...current, ...idsToDelete]));
    setSelectedIds(new Set());
    setIsSelectionMode(false);

    if (deletingEntireList) {
      setSuppressEmptyState(true);
      if (emptyStateTimerRef.current) {
        clearTimeout(emptyStateTimerRef.current);
      }
      emptyStateTimerRef.current = setTimeout(() => {
        setSuppressEmptyState(false);
      }, 240);
    }

    void (async () => {
      if (deletingEntireList) {
        await removeAllCenterNotifications();
      } else {
        for (const id of idsToDelete) {
          await removeCenterNotification(id);
        }
      }

      setHiddenIds((current) => {
        const next = new Set(current);
        idsToDelete.forEach((id) => next.delete(id));
        return next;
      });
    })();
  }, [
    removeAllCenterNotifications,
    removeCenterNotification,
    selectedIds,
    visibleNotifications,
  ]);

  const renderNotificationItem = useCallback<ListRenderItem<AppNotification>>(
    ({ item }) => (
      <Animated.View
        exiting={SlideOutLeft.duration(220)}
        layout={LinearTransition.duration(220)}
      >
        <NotificationRow
          notification={item}
          isDark={isDark}
          now={relativeTimeNow}
          onPress={handleNotificationPress}
          isEditing={isSelectionMode}
          isSelected={selectedIds.has(item.id)}
          onToggleSelection={handleToggleSelection}
        />
      </Animated.View>
    ),
    [
      handleNotificationPress,
      handleToggleSelection,
      isDark,
      isSelectionMode,
      relativeTimeNow,
      selectedIds,
    ],
  );

  const hasUnreadNotifications = centerNotifications.some(
    (notification) => !notification.readAt,
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={visibleNotifications}
        extraData={{ relativeTimeNow, isSelectionMode, selectedIds }}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        ListHeaderComponent={
          isSelectionMode ? (
            <View style={styles.selectionHeader}>
              <Text style={styles.selectionCount}>
                {selectedCount} selected
              </Text>

              <Pressable
                onPress={handleToggleSelectAll}
                accessibilityRole="button"
                accessibilityLabel={
                  allNotificationsSelected
                    ? "Deselect all notifications"
                    : "Select all notifications"
                }
                hitSlop={8}
                style={({ pressed }) => [
                  styles.markAllButton,
                  pressed && styles.markAllButtonPressed,
                ]}
              >
                <Text style={styles.selectAllText}>
                  {allNotificationsSelected ? "Deselect All" : "Select All"}
                </Text>
              </Pressable>
            </View>
          ) : hasUnreadNotifications ? (
            <View style={styles.listHeader}>
              <Pressable
                onPress={handleMarkAllRead}
                accessibilityRole="button"
                accessibilityLabel="Mark all notifications as read"
                hitSlop={8}
                style={({ pressed }) => [
                  styles.markAllButton,
                  pressed && styles.markAllButtonPressed,
                ]}
              >
                <Text style={styles.markAllText}>Mark all as read</Text>
              </Pressable>
            </View>
          ) : null
        }
        ListEmptyComponent={
          suppressEmptyState ? null : (
            <View style={styles.emptyState}>
              {loading ? (
                <ActivityIndicator
                  color={isDark ? Colors.white : Colors.black}
                />
              ) : (
                <>
                  <Ionicons
                    name="notifications-outline"
                    size={34}
                    color={isDark ? Colors.lightGray : Colors.darkGray}
                  />

                  <Text style={styles.emptyTitle}>No notifications yet</Text>

                  <Text style={styles.emptyText}>
                    {error
                      ? "Notifications could not be loaded. Pull down to try again."
                      : "New messages, likes, comments, and other activity will appear here."}
                  </Text>
                </>
              )}
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={{ paddingVertical: 16 }}
              color={isDark ? Colors.white : Colors.black}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refreshNotifications()}
            tintColor={isDark ? Colors.white : Colors.black}
          />
        }
        onEndReached={() => {
          if (hasMore && !loadingMore) void loadMoreNotifications();
        }}
        onEndReachedThreshold={0.35}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.container,
          visibleNotifications.length === 0 && styles.emptyContainer,
          isSelectionMode && {
            paddingBottom: CUSTOM_TAB_BAR_HEIGHT + 88,
          },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {isSelectionMode && (
        <Animated.View
          entering={FadeInDown.duration(180)}
          exiting={FadeOutDown.duration(140)}
          style={[
            styles.selectionToolbar,
            { bottom: CUSTOM_TAB_BAR_HEIGHT },
          ]}
        >
          <Pressable
            disabled={selectedCount === 0}
            onPress={handleDeleteSelected}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${selectedCount} selected notifications`}
            accessibilityState={{ disabled: selectedCount === 0 }}
            style={({ pressed }) => [
              styles.deleteButton,
              selectedCount === 0 && styles.deleteButtonDisabled,
              pressed && selectedCount > 0 && styles.deleteButtonPressed,
            ]}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.white} />
            <Text style={styles.deleteButtonText}>
              Delete{selectedCount > 0 ? ` (${selectedCount})` : ""}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
