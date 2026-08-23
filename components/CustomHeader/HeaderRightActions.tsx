import { Ionicons } from "@expo/vector-icons";
import { Colors, activeOpacity } from "constants/styles";
import { Pressable, TouchableOpacity, View } from "react-native";
import { customHeaderStyles } from "../../styles/CustomHeaderStyles";
import { ProfileHeaderMenu } from "./ProfileHeaderMenu";

type HeaderRightActionsProps = {
  isTeamScreen: boolean;
  isPlayerScreen?: boolean;
  onToggleFavorite?: () => void;
  onToggleNotifications?: () => void;
  onOpenInfo?: () => void;
  isFavorite?: boolean;
  isNotified?: boolean;
  tabName?: string;
  isDark: boolean;
  profileMenuVisible: boolean;
  onToggleProfileMenu: () => void;
  onProfileSettings: () => void;
  onProfileLogout: () => void;
  onSearchToggle?: () => void;
  onNotificationsCenter?: () => void;
  onOpenThemesSettings?: () => void;
  isMessagesListScreen: boolean;
  onCreateMessage?: () => void;
  onToggleLayout?: () => void;
  isGrid?: boolean;
};

export function HeaderRightActions({
  isTeamScreen,
  isPlayerScreen,
  onToggleFavorite,
  onToggleNotifications,
  onOpenInfo,
  isFavorite,
  isNotified,
  tabName,
  isDark,
  profileMenuVisible,
  onToggleProfileMenu,
  onProfileSettings,
  onProfileLogout,
  onSearchToggle,
  onNotificationsCenter,
  onOpenThemesSettings,
  isMessagesListScreen,
  onCreateMessage,
  onToggleLayout,
  isGrid,
}: HeaderRightActionsProps) {
  const styles = customHeaderStyles;

  if (isTeamScreen) {
    return (
      <View style={styles.teamHeaderActions}>
        {onToggleFavorite ? (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={onToggleFavorite}
            style={styles.teamHeaderActionButton}
          >
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={24}
              color={Colors.white}
            />
          </TouchableOpacity>
        ) : null}

        {onToggleNotifications ? (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={onToggleNotifications}
            style={styles.teamHeaderActionButton}
          >
            <Ionicons
              name={isNotified ? "notifications" : "notifications-outline"}
              size={24}
              color={Colors.white}
            />
          </TouchableOpacity>
        ) : null}

        {!isPlayerScreen && onOpenInfo ? (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={onOpenInfo}
            style={styles.teamHeaderActionButton}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={Colors.white}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (tabName === "Profile") {
    return (
      <View style={styles.profileMenuAnchor}>
        <ProfileHeaderMenu
          visible={profileMenuVisible}
          isDark={isDark}
          onSettings={onProfileSettings}
          onLogout={onProfileLogout}
        />

        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={onToggleProfileMenu}
          style={[
            styles.profileHeaderActionButton,
            {
              borderColor: profileMenuVisible
                ? Colors.lightGray
                : isDark
                  ? Colors.darkGray
                  : Colors.lightGray,
              backgroundColor: profileMenuVisible
                ? isDark
                  ? Colors.black
                  : Colors.white
                : "transparent",
            },
          ]}
          hitSlop={8}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={isDark ? Colors.white : Colors.black}
          />
        </TouchableOpacity>
      </View>
    );
  }

  if (tabName === "Explore" && onSearchToggle) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onSearchToggle}
        hitSlop={8}
      >
        <Ionicons
          name="search"
          size={24}
          color={isDark ? Colors.white : Colors.black}
        />
      </TouchableOpacity>
    );
  }

  if (tabName === "Home" && onNotificationsCenter) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onNotificationsCenter}
        hitSlop={8}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color={isDark ? Colors.white : Colors.black}
        />
      </TouchableOpacity>
    );
  }

  if (tabName === "Message" && onOpenThemesSettings) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onOpenThemesSettings}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Open message theme settings"
      >
        <Ionicons
          name="color-palette-outline"
          size={24}
          color={isDark ? Colors.white : Colors.black}
        />
      </TouchableOpacity>
    );
  }

  if (isMessagesListScreen && onCreateMessage) {
    return (
      <Pressable
        onPress={onCreateMessage}
        accessibilityRole="button"
        accessibilityLabel="Create message"
        hitSlop={14}
        style={({ pressed }) => [
          styles.headerActionButton,
          pressed && styles.headerActionButtonPressed,
        ]}
      >
        <Ionicons
          name="create-outline"
          size={24}
          color={isDark ? Colors.white : Colors.black}
        />
      </Pressable>
    );
  }

  if (onToggleLayout) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onToggleLayout}
        hitSlop={8}
      >
        <Ionicons
          name={isGrid ? "list" : "grid"}
          size={24}
          color={isDark ? Colors.white : Colors.black}
        />
      </TouchableOpacity>
    );
  }

  return <View style={styles.headerSidePlaceholder} />;
}
