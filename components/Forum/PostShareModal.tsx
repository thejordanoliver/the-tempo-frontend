import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import ConfirmModal from "components/ConfirmModal";
import MessagingAppIcon from "components/Forum/MessagingAppIcon";
import {
  Colors,
  PLACEHOLDER_AVATAR,
  activeOpacity,
  globalStyles,
} from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { useForumPostShare } from "hooks/ForumHooks/useForumPostShare";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ForumPost } from "types/forum";
import SearchBar from "../SearchBars/SearchBar";

export type PostShareModalRef = { present: () => void };
type Props = {
  post: ForumPost;
  currentUserId: number | null;
  onShared: () => Promise<void>;
};

const PostShareModal = forwardRef<PostShareModalRef, Props>(
  function PostShareModal({ post, currentUserId, onShared }, ref) {
    const sheet = useRef<BottomSheetModal>(null);
    const { resolvedColorScheme } = usePreferences();
    const theme = resolvedColorScheme === "dark" ? Colors.dark : Colors.light;
    const isDark = resolvedColorScheme === "dark";
    const styles = PostShareModalStyles(isDark);
    const global = globalStyles(resolvedColorScheme === "dark");
    const insets = useSafeAreaInsets();
    const share = useForumPostShare(post, currentUserId, onShared);
    const messagingName =
      Platform.OS === "ios"
        ? "Messages"
        : share.messagingApp?.name || "Text message";

    useImperativeHandle(ref, () => ({
      present: () => {
        share.open();
        sheet.current?.present();
      },
    }));
    const backdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior={share.pending ? "none" : "close"}
        />
      ),
      [share.pending],
    );

    return (
      <>
        <BottomSheetModal
          ref={sheet}
          snapPoints={["70%", "92%"]}
          enableDynamicSizing={false}
          enablePanDownToClose={!share.pending}
          onDismiss={share.close}
          backdropComponent={backdrop}
          backgroundStyle={{ backgroundColor: theme.background }}
          handleIndicatorStyle={{ backgroundColor: theme.icon }}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
        >
          <BottomSheetFlatList
            data={share.query.trim() ? share.users : share.recentUsers}
            keyExtractor={(user) => String(user.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding: 20,
              paddingBottom: Math.max(insets.bottom, 20),
            }}
            ListHeaderComponent={
              <View style={styles.header}>
                <View style={styles.row}>
                  <Text style={[global.title, styles.grow]}>Share</Text>
                </View>
                <View
                  style={[
                    styles.preview,
                    { backgroundColor: theme.itemBackground },
                  ]}
                >
                  <Text style={global.textMedium}>@{post.username}</Text>
                  <Text style={global.secondaryText} numberOfLines={2}>
                    {post.text.trim() || "Media post"}
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.externalRail}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Share using ${messagingName}`}
                    disabled={share.pending}
                    style={[
                      styles.externalOption,
                      { opacity: share.pending ? 0.5 : 1 },
                    ]}
                    onPress={async () => {
                      if (await share.sendSms()) sheet.current?.dismiss();
                    }}
                  >
                    <View style={styles.externalCircle}>
                      <MessagingAppIcon app={share.messagingApp} />
                    </View>
                    <Text
                      style={[global.caption, styles.externalName]}
                      numberOfLines={2}
                    >
                      {messagingName}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="More sharing apps"
                    disabled={share.pending}
                    style={[
                      styles.externalOption,
                      { opacity: share.pending ? 0.5 : 1 },
                    ]}
                    onPress={async () => {
                      if (await share.sendExternal()) sheet.current?.dismiss();
                    }}
                  >
                    <View style={styles.externalCircle}>
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={28}
                        color={theme.text}
                      />
                    </View>
                    <Text style={[global.caption, styles.externalName]}>
                      More apps
                    </Text>
                  </Pressable>
                </ScrollView>

                <SearchBar
                  accessibilityLabel="Search Tempo users"
                  placeholder="Find more users"
                  value={share.query}
                  onChangeText={share.setQuery}
                  editable={!share.pending}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {share.pending && <ActivityIndicator color={theme.text} />}
                {share.error && (
                  <Text accessibilityRole="alert" style={global.errorText}>
                    {share.error}
                  </Text>
                )}
                {share.sentTo && (
                  <Text accessibilityRole="alert" style={global.text}>
                    Sent to @{share.sentTo}
                  </Text>
                )}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                {(share.query.trim() ? share.loading : share.recentLoading) ? (
                  <ActivityIndicator color={theme.text} />
                ) : (
                  <Text style={global.secondaryText}>
                    {share.query.trim()
                      ? (share.searchError ??
                        (share.query.trim().length < 2
                          ? "Enter at least 2 characters to find someone."
                          : "No users found. Try another name."))
                      : share.recentError
                        ? "Recent contacts couldn’t load. Search to find someone."
                        : "Your recent DM contacts will appear here. Search to find someone."}
                  </Text>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Send post to ${item.username}`}
                disabled={share.pending}
                style={({ pressed }) => [
                  styles.option,
                  { opacity: pressed ? activeOpacity : 1 },
                  { opacity: share.pending ? activeOpacity: 1 },
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  share.requestSend(item);
                }}
              >
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: item.profileImageUrl || PLACEHOLDER_AVATAR }}
                    style={styles.avatar}
                  />
                </View>

                <View style={styles.grow}>
                  <Text style={global.secondaryText}>@{item.username}</Text>
                </View>

                <Ionicons
                  name={
                    share.sentTo === item.username
                      ? "checkmark-circle"
                      : "send-outline"
                  }
                  size={22}
                  color={
                    share.sentTo === item.username ? theme.green : theme.text
                  }
                />
              </Pressable>
            )}
          />
        </BottomSheetModal>
        <ConfirmModal
          visible={Boolean(share.confirmRecipient)}
          title="Send this post?"
          message={`Are you sure you want to send this post to @${share.confirmRecipient?.username ?? ""}?`}
          confirmText="Send"
          cancelText="Cancel"
          onCancel={share.cancelSend}
          onConfirm={async () => {
            await share.confirmSend();
          }}
          confirmDisabled={share.pending}
        />
      </>
    );
  },
);

export default PostShareModal;

const PostShareModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    header: { gap: 12 },
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    grow: { flex: 1 },
    preview: { padding: 12, borderRadius: 12, gap: 4 },
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      minHeight: 64,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
    },
    search: { padding: 12, borderRadius: 12 },
    avatarContainer: {
      width: 44,
      height: 44,
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
      borderRadius: 24,
      overflow: "hidden",
    },
    avatar: {
      width: 44,
      height: 44,
    },
    empty: { paddingVertical: 24, alignItems: "center" },
    externalRail: { gap: 16, paddingVertical: 4 },
    externalOption: { width: 84, alignItems: "center", gap: 8 },
    externalCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderColor: isDark ? Colors.dark.icon : Colors.light.icon,
      alignItems: "center",
      justifyContent: "center",
    },
    externalName: { width: "100%", textAlign: "center" },
  });
