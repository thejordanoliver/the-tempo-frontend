import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ListRenderItem } from "react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SearchBar from "components/SearchBars/SearchBar";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useDebounce } from "hooks/useDebounce";
import { searchUsers, type UserSearchResult } from "services/usersApi";

type Props = {
  visible: boolean;
  isCreating?: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  onSelectUser: (user: UserSearchResult) => void | Promise<void>;
};

const FALLBACK_AVATAR =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393743/ProfilePlaceholder_nmzv2o.png";

const getNewMessageTheme = (isDark: boolean) => ({
  background: isDark ? Colors.black : Colors.white,
  card: isDark ? Colors.dark.itemBackground : Colors.light.itemBackground,
  cardAlt: isDark ? Colors.black : Colors.white,
  text: isDark ? Colors.white : Colors.black,
  mutedText: isDark ? Colors.lightGray : Colors.darkGray,
  border: isDark ? Colors.darkGray : Colors.lightGray,
  icon: isDark ? Colors.lightGray : Colors.darkGray,
  primary: Colors.light.blue,
});

type NewMessageTheme = ReturnType<typeof getNewMessageTheme>;
type NewMessageStyles = ReturnType<typeof newMessageModalStyles>;

type HeaderProps = {
  query: string;
  isCreating: boolean;
  styles: NewMessageStyles;
  theme: NewMessageTheme;
  onSearchChange: (value: string) => void;
  onRequestClose: () => void;
};

const NewMessageHeader = memo(function NewMessageHeader({
  query,
  isCreating,
  styles,
  theme,
  onSearchChange,
  onRequestClose,
}: HeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>New Message</Text>
          <Text style={styles.subtitle}>Search for someone to start a DM.</Text>
        </View>

        <Pressable
          hitSlop={10}
          style={styles.closeButton}
          onPress={onRequestClose}
          disabled={isCreating}
        >
          <Ionicons name="close" size={20} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.searchBarWrap}>
        <SearchBar
          placeholder="Search users"
          value={query}
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );
});

export default function NewMessageModal({
  visible,
  isCreating = false,
  onClose,
  onDismiss,
  onSelectUser,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const theme = useMemo(() => getNewMessageTheme(isDark), [isDark]);
  const styles = useMemo(() => newMessageModalStyles(isDark), [isDark]);

  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 250);
  const trimmedQuery = query.trim();

  const snapPoints = useMemo(() => ["68%", "92%"], []);

  const keyExtractor = useCallback(
    (item: UserSearchResult) => String(item.id),
    [],
  );

  const resetState = useCallback(() => {
    setQuery("");
    setUsers([]);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      if (isCreating) return;
      setQuery(value);
    },
    [isCreating],
  );

  const handleRequestClose = useCallback(() => {
    if (isCreating) return;
    sheetRef.current?.dismiss();
  }, [isCreating]);

  const handleDismiss = useCallback(() => {
    resetState();
    onDismiss?.();
  }, [onDismiss, resetState]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
        pressBehavior={isCreating ? "none" : "close"}
      />
    ),
    [isCreating],
  );

  const handleSelectUser = useCallback(
    async (user: UserSearchResult) => {
      if (isCreating) return;
      await onSelectUser(user);
    },
    [isCreating, onSelectUser],
  );

  const renderUser: ListRenderItem<UserSearchResult> = useCallback(
    ({ item }) => {
      const avatarUri = item.profileImageUrl?.trim() || FALLBACK_AVATAR;
      const fullName = item.fullName?.trim();
      const displayName = fullName || item.username;

      return (
        <Pressable
          style={({ pressed }) => [
            styles.userRow,
            pressed && styles.userRowPressed,
            isCreating && styles.disabledRow,
          ]}
          disabled={isCreating}
          onPress={() => handleSelectUser(item)}
        >
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatar}
            contentFit="cover"
          />

          <View style={styles.userTextWrap}>
            <View style={styles.usernameRow}>
              <Text style={styles.username} numberOfLines={1}>
                {displayName}
              </Text>

              {item.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color={theme.primary}
                  style={styles.verifiedIcon}
                />
              )}
            </View>

            <Text style={styles.fullName} numberOfLines={1}>
              @{item.username}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={theme.icon} />
        </Pressable>
      );
    },
    [
      handleSelectUser,
      isCreating,
      styles.userRow,
      styles.userRowPressed,
      styles.disabledRow,
      styles.avatar,
      styles.userTextWrap,
      styles.usernameRow,
      styles.username,
      styles.verifiedIcon,
      styles.fullName,
      theme.primary,
      theme.icon,
    ],
  );

  const renderEmptyState = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="small" color={theme.text} />
          <Text style={styles.emptyTitle}>Searching users</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={30} color={theme.icon} />

          <Text style={styles.emptyTitle}>Search unavailable</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      );
    }

    if (trimmedQuery.length < 2) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="person-add-outline" size={30} color={theme.icon} />

          <Text style={styles.emptyTitle}>Search by name or username</Text>
          <Text style={styles.emptyText}>
            Enter at least 2 characters to find someone.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="search-outline" size={30} color={theme.icon} />

        <Text style={styles.emptyTitle}>No users found</Text>
        <Text style={styles.emptyText}>Try another name or username.</Text>
      </View>
    );
  }, [
    error,
    isLoading,
    styles.emptyState,
    styles.emptyText,
    styles.emptyTitle,
    theme.icon,
    theme.text,
    trimmedQuery.length,
  ]);

  const listHeader = useMemo(
    () => (
      <NewMessageHeader
        query={query}
        isCreating={isCreating}
        styles={styles}
        theme={theme}
        onSearchChange={handleSearchChange}
        onRequestClose={handleRequestClose}
      />
    ),
    [handleRequestClose, handleSearchChange, isCreating, query, styles, theme],
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (visible) {
        sheetRef.current?.present();
      } else {
        sheetRef.current?.dismiss();
      }
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const normalizedQuery = debouncedQuery.trim();

    if (normalizedQuery.length < 2) {
      setUsers([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextUsers = await searchUsers(normalizedQuery);

        if (!isActive) return;

        setUsers(nextUsers);
      } catch (err: any) {
        if (!isActive) return;

        setUsers([]);
        setError(
          err?.response?.data?.error ??
            err?.message ??
            "Could not search users.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isActive = false;
    };
  }, [debouncedQuery, visible]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      enablePanDownToClose={!isCreating}
      enableContentPanningGesture
      enableHandlePanningGesture
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetFlatList
        data={users}
        keyExtractor={keyExtractor}
        renderItem={renderUser}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={renderEmptyState}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 18) },
        ]}
      />
    </BottomSheetModal>
  );
}

const newMessageModalStyles = (isDark: boolean) => {
  const background = isDark ? Colors.black : Colors.white;
  const card = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const cardAlt = isDark ? Colors.black : Colors.white;
  const text = isDark ? Colors.white : Colors.black;
  const mutedText = isDark ? Colors.lightGray : Colors.darkGray;
  const border = isDark ? Colors.darkGray : Colors.lightGray;

  return StyleSheet.create({
    sheetBackground: {
      backgroundColor: background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },

    handleIndicator: {
      width: 42,
      height: 4,
      borderRadius: 999,
      backgroundColor: border,
    },

    listContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      backgroundColor: background,
    },

    headerContainer: {
      paddingTop: 8,
      paddingBottom: 14,
      backgroundColor: background,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 14,
      marginBottom: 14,
    },

    headerTextWrap: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      fontSize: 21,
      fontFamily: Fonts.OSBOLD,
      color: text,
    },

    subtitle: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.OSREGULAR,
      color: mutedText,
    },

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
    },

    searchBarWrap: {
      marginBottom: 12,
    },

    userRow: {
      minHeight: 68,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
      borderRadius: 18,
      backgroundColor: cardAlt,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
    },

    userRowPressed: {
      opacity: 0.78,
      transform: [{ scale: 0.995 }],
    },

    disabledRow: {
      opacity: 0.6,
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
      backgroundColor: card,
    },

    userTextWrap: {
      flex: 1,
      minWidth: 0,
    },

    usernameRow: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
    },

    username: {
      maxWidth: "86%",
      fontSize: 15,
      fontFamily: Fonts.OSBOLD,
      color: text,
    },

    verifiedIcon: {
      marginLeft: 5,
    },

    fullName: {
      marginTop: 3,
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
      color: mutedText,
    },

    emptyState: {
      flex: 1,
      minHeight: 285,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingBottom: 36,
    },

    emptyTitle: {
      marginTop: 12,
      fontSize: 17,
      fontFamily: Fonts.OSBOLD,
      color: text,
      textAlign: "center",
    },

    emptyText: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: Fonts.OSREGULAR,
      color: mutedText,
      textAlign: "center",
    },
  });
};
