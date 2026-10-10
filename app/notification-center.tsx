import CustomActivityIndicator from "@/components/CustomActivityIndicator";
import { CustomHeader } from "@/components/CustomHeader";
import { NotificationRow } from "@/components/Notifications/NotificationRow";
import { Colors, globalStyles } from "@/constants/styles";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { NotificationsCenterStyles } from "@/styles/NotificationCenterStyles";
import type { AppNotification } from "@/types/notifications";
import { getNotificationCenterHref } from "@/utils/notificationCenter";
import { Ionicons } from "@expo/vector-icons";
import { NavigationBarInsetContext } from "contexts/NavigationBarInsetContext";
import { Href, useNavigation } from "expo-router";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useNotificationSelection } from "hooks/useNotificationSelection";
import { useScopedRouter } from "hooks/useScopedRouter";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsCenter() {
  const navigationContentStyle = useNavigationBarContentStyle();
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

  const {
    visibleNotifications,
    isSelectionMode,
    isAllSelected,
    selectedIds,
    selectedCount,
    suppressEmptyState,
    toggleSelectionMode,
    handleToggleSelection,
    handleToggleSelectAll,
    handleDeleteSelected,
  } = useNotificationSelection({
    centerNotifications,
    removeCenterNotification,
    removeAllCenterNotifications,
  });

  const styles = NotificationsCenterStyles(isDark);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const insets = useSafeAreaInsets();
  const navigationBarInset = useContext(NavigationBarInsetContext);
  const bottomInset = navigationBarInset > 0 ? 0 : insets.bottom;
  const navigation = useNavigation();
  const router = useScopedRouter();

  const hasUnreadNotifications = visibleNotifications.some(
    (notification) => !notification.readAt,
  );

  const handleMarkAllRead = useCallback(() => {
    void markAllCenterNotificationsRead();
  }, [markAllCenterNotificationsRead]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Notifications"
          onBack={() => router.back()}
          onMarkAllNotificationsRead={handleMarkAllRead}
          onToggleNotificationEditing={toggleSelectionMode}
          isNotificationEditing={isSelectionMode}
          hasNotifications={visibleNotifications.length > 0}
          hasUnreadNotifications={hasUnreadNotifications}
        />
      ),
    });
  }, [
    handleMarkAllRead,
    hasUnreadNotifications,
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
          isSelected={isAllSelected || selectedIds.has(item.id)}
          onToggleSelection={handleToggleSelection}
        />
      </Animated.View>
    ),
    [
      handleNotificationPress,
      handleToggleSelection,
      isDark,
      isAllSelected,
      isSelectionMode,
      relativeTimeNow,
      selectedIds,
    ],
  );

  if (loading)
    return (
      <View style={styles.screen}>
        <View style={global.emptyContainer}>
          <CustomActivityIndicator />
        </View>
      </View>
    );

  return (
    <View style={styles.screen}>
      <FlatList
        style={styles.list}
        data={visibleNotifications}
        extraData={{ relativeTimeNow, isSelectionMode, isAllSelected, selectedIds }}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        ListHeaderComponent={
          isSelectionMode ? (
            <View style={styles.selectionHeader}>
              <Text style={styles.selectionCount}>
                {isAllSelected
                  ? "All notifications selected"
                  : `${selectedCount} selected`}
              </Text>

              <Pressable
                onPress={handleToggleSelectAll}
                accessibilityRole="button"
                accessibilityLabel={
                  isAllSelected
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
                  {isAllSelected ? "Deselect All" : "Select All"}
                </Text>
              </Pressable>
            </View>
          ) : null
        }
        ListEmptyComponent={
          suppressEmptyState ? null : (
            <View style={styles.emptyState}>
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
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={global.emptyContainer}>
              <CustomActivityIndicator />
            </View>
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
        contentContainerStyle={
          isSelectionMode
            ? [
                styles.container,
                visibleNotifications.length === 0 && styles.emptyContainer,
              ]
            : navigationContentStyle([
                styles.container,
                visibleNotifications.length === 0 && styles.emptyContainer,
                { paddingBottom: 20 + bottomInset },
              ])
        }
        showsVerticalScrollIndicator={false}
      />

      {isSelectionMode && (
        <Animated.View
          entering={FadeInDown.duration(180)}
          exiting={FadeOutDown.duration(140)}
          style={[
            styles.selectionToolbar,
            {
              paddingBottom: 12 + bottomInset,
              marginBottom: navigationBarInset,
            },
          ]}
        >
          <Pressable
            disabled={selectedCount === 0}
            onPress={handleDeleteSelected}
            accessibilityRole="button"
            accessibilityLabel={
              isAllSelected
                ? "Delete all notifications"
                : `Delete ${selectedCount} selected notifications`
            }
            accessibilityState={{ disabled: selectedCount === 0 }}
            style={({ pressed }) => [
              styles.deleteButton,
              selectedCount === 0 && styles.deleteButtonDisabled,
              pressed && selectedCount > 0 && styles.deleteButtonPressed,
            ]}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.white} />
            <Text style={styles.deleteButtonText}>
              {isAllSelected
                ? "Delete All"
                : `Delete${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
