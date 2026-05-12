import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { MessageItem } from "types/messages";

type Props = {
  conversations: MessageItem[];
  onSelect: (item: MessageItem) => void;
  onRemovePinned: (item: MessageItem) => void;
};

type SubmenuProps = {
  visible: boolean;
  isDark: boolean;
  onRemovePinned: (event: GestureResponderEvent) => void;
};

const FALLBACK_AVATAR =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393743/ProfilePlaceholder_nmzv2o.png";

function PinnedSubmenu({ visible, isDark, onRemovePinned }: SubmenuProps) {
  const styles = useMemo(() => pinnedConversationsStyles(isDark), [isDark]);
  const progress = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);

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

  if (!shouldRender) return null;

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.submenu,
        {
          opacity: progress,
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
      <Pressable style={styles.submenuItem} onPress={onRemovePinned}>
        <View style={styles.submenuIconWrap}>
          <Ionicons
            name="pin-outline"
            size={15}
            color={isDark ? Colors.white : Colors.black}
          />
        </View>

        <Text style={styles.submenuText} numberOfLines={1}>
          Remove pinned
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function PinnedConversations({
  conversations,
  onSelect,
  onRemovePinned,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = useMemo(() => pinnedConversationsStyles(isDark), [isDark]);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleSelect = useCallback(
    (conversation: MessageItem) => {
      setActiveMenuId(null);
      onSelect(conversation);
    },
    [onSelect],
  );

  const handleToggleMenu = useCallback(
    (event: GestureResponderEvent, conversationId: string) => {
      event.stopPropagation();

      setActiveMenuId((currentId) =>
        currentId === conversationId ? null : conversationId,
      );
    },
    [],
  );

  const handleRemovePinned = useCallback(
    (event: GestureResponderEvent, conversation: MessageItem) => {
      event.stopPropagation();

      setActiveMenuId(null);
      onRemovePinned(conversation);
    },
    [onRemovePinned],
  );

  if (conversations.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {conversations.map((conversation) => {
          const avatarUri =
            conversation.profileImageUrl?.trim() || FALLBACK_AVATAR;

          const name =
            conversation.username ||
            conversation.fullName ||
            conversation.full_name ||
            "Tempo User";

          const message = conversation.lastMessage || "Open conversation";

          const conversationId = String(conversation.id);
          const isMenuOpen = activeMenuId === conversationId;

          return (
            <Pressable
              key={conversation.id}
              style={[styles.card, isMenuOpen && styles.activeCard]}
              onPress={() => handleSelect(conversation)}
            >
              <Pressable
                hitSlop={10}
                style={[
                  styles.menuButton,
                  isMenuOpen && styles.menuButtonActive,
                ]}
                onPress={(event) => handleToggleMenu(event, conversationId)}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={16}
                  color={isDark ? Colors.white : Colors.black}
                />
              </Pressable>

              <PinnedSubmenu
                visible={isMenuOpen}
                isDark={isDark}
                onRemovePinned={(event) =>
                  handleRemovePinned(event, conversation)
                }
              />

              <View style={styles.avatarOuter}>
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatar}
                  contentFit="cover"
                />

                {conversation.isOnline && <View style={styles.onlineDot} />}
              </View>

              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>

              <View style={styles.messageBubble}>
                <Text style={styles.messageText} numberOfLines={2}>
                  {message}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default memo(PinnedConversations);

const pinnedConversationsStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
      paddingTop: 2,
      paddingBottom: 12,
      borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-evenly",
      rowGap: 14,
      overflow: "visible",
    },

    card: {
      width: "31.5%",
      alignItems: "center",
      position: "relative",
      zIndex: 1,
    },

    activeCard: {
      zIndex: 20,
      elevation: 20,
    },

    menuButton: {
      position: "absolute",
      top: 0,
      right: 6,
      zIndex: 3,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },

    menuButtonActive: {
      borderColor: isDark ? Colors.white : Colors.black,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    submenu: {
      position: "absolute",
      top: 30,
      right: 0,
      zIndex: 10,
      width: 140,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      shadowColor: Colors.black,
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 12,
      overflow: "hidden",
    },

    submenuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 8,
    },

    submenuIconWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    submenuText: {
      flex: 1,
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    avatarOuter: {
      width: 66,
      height: 66,
      borderRadius: 33,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 7,
      borderWidth: 2,
      borderColor: isDark ? Colors.dark.blue : Colors.light.blue,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },

    avatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },

    onlineDot: {
      position: "absolute",
      right: 4,
      bottom: 5,
      width: 13,
      height: 13,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: isDark ? Colors.black : Colors.white,
      backgroundColor: Colors.dark.leafGreen,
    },

    name: {
      width: "100%",
      marginBottom: 7,
      textAlign: "center",
      fontSize: 12,
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },

    messageBubble: {
      width: "100%",
      minHeight: 44,
      borderRadius: 14,
      paddingHorizontal: 9,
      paddingVertical: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.midTone : Colors.lightGray,
    },

    messageText: {
      textAlign: "center",
      fontSize: 11,
      lineHeight: 14,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
      opacity: 0.8,
    },
  });
