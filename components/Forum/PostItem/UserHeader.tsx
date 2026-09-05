// components/Forum/UserHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, activeOpacity } from "constants/styles";
import { useRouter } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PostItemStyles } from "styles/ForumStyles/PostItemStyles";
import type { ForumActionSubmenuProps, ForumPost } from "types/forum";

type UserHeaderProps = {
  item: ForumPost;
  isDark: boolean;
  currentUserId: number | null;
  onEdit: () => void;
  onDelete: () => void;
};

/* -------------------------------------------------------------------------- */
/*                              Post Action Menu                              */
/* -------------------------------------------------------------------------- */

const PostSubmenu = ({
  visible,
  isDark,
  onEdit,
  onDelete,
}: ForumActionSubmenuProps) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);

  const styles = PostItemStyles(isDark);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);

      Animated.spring(progress, {
        toValue: 1,
        damping: 16,
        stiffness: 230,
        mass: 0.8,
        useNativeDriver: true,
      }).start();

      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 130,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShouldRender(false);
      }
    });
  }, [progress, visible]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.submenu,
        {
          opacity: progress,
          backgroundColor: isDark
            ? Colors.dark.itemBackground
            : Colors.light.itemBackground,
          borderColor: isDark ? Colors.darkGray : Colors.lightGray,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-6, 0],
              }),
            },
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
          ],
        },
      ]}
    >
      {/* Edit */}
      <TouchableOpacity
        activeOpacity={activeOpacity}
        style={styles.submenuItem}
        onPress={onEdit}
      >
        <View
          style={[
            styles.submenuIconWrap,
            {
              backgroundColor: isDark ? Colors.black : Colors.white,
            },
          ]}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>

        <Text style={styles.submenuText}>Edit</Text>
      </TouchableOpacity>

      <View style={styles.submenuSeparator} />

      {/* Delete */}
      <TouchableOpacity
        activeOpacity={activeOpacity}
        style={styles.submenuItem}
        onPress={onDelete}
      >
        <View style={styles.submenuIconWrap}>
          <Ionicons
            name="trash-outline"
            size={16}
            color={isDark ? Colors.dark.lightRed : Colors.light.red}
          />
        </View>

        <Text
          style={[
            styles.submenuText,
            {
              color: isDark ? Colors.dark.lightRed : Colors.light.red,
            },
          ]}
        >
          Delete
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 UserHeader                                 */
/* -------------------------------------------------------------------------- */

export const UserHeader = memo(function UserHeader({
  item,
  isDark,
  currentUserId,
  onEdit,
  onDelete,
}: UserHeaderProps) {
  const [submenuVisible, setSubmenuVisible] = useState(false);

  const router = useRouter();
  const styles = PostItemStyles(isDark);

  const profileImageUri = item.profile_image;

  const isAuthor =
    currentUserId != null && currentUserId === item.user_id;

  /* -------------------------------------------------------------------------- */
  /*                                Navigation                                  */
  /* -------------------------------------------------------------------------- */

  const handleOpenUser = () => {
    router.push({
      pathname: "/user/[id]",
      params: {
        id: String(item.user_id),
      },
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                  Actions                                   */
  /* -------------------------------------------------------------------------- */

  const handleEdit = () => {
    setSubmenuVisible(false);
    onEdit();
  };

  const handleDelete = () => {
    setSubmenuVisible(false);
    onDelete();
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <View style={styles.userRow}>
      {/* User */}
      <View style={styles.leftSide}>
        <TouchableOpacity
          onPress={handleOpenUser}
          activeOpacity={0.7}
        >
          {profileImageUri ? (
            <Image
              source={{
                uri: profileImageUri,
              }}
              style={styles.profileImage}
            />
          ) : (
            <View
              style={[
                styles.profileImage,
                styles.profilePlaceholder,
              ]}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontFamily: Fonts.BOLD,
                }}
              >
                {(item.username?.[0] ?? "T").toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOpenUser}
          activeOpacity={0.7}
          style={styles.userRow}
        >
          <Text
            style={styles.username}
            numberOfLines={1}
          >
            {item.username}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Author Menu */}
      {isAuthor ? (
        <View style={styles.menuAnchor}>
          <PostSubmenu
            visible={submenuVisible}
            isDark={isDark}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={() =>
              setSubmenuVisible((current) => !current)
            }
            style={[
              styles.menuButton,
              submenuVisible && {
                borderColor: isDark
                  ? Colors.darkGray
                  : Colors.lightGray,
                backgroundColor: isDark
                  ? Colors.darkGray
                  : Colors.lightGray,
              },
            ]}
            hitSlop={8}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.menuPlaceholder} />
      )}
    </View>
  );
});