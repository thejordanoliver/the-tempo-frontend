import Button from "components/Buttons/Button";
import ConfirmModal from "components/ConfirmModal";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeader } from "components/CustomHeader";
import SettingsAvatar from "components/Settings/SettingsAvatar";
import SettingsStatus from "components/Settings/SettingsStatus";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { useSettingsContentStyle } from "hooks/useSettingsContentStyle";
import { useBlockedAccounts } from "hooks/UserHooks/useBlockedAccounts";
import { useLayoutEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import type { BlockedUser } from "services/usersApi";
import {
  settingsDetailStyles,
  settingsOverviewStyles,
} from "styles/SettingsStyles";

export default function BlockedUsersScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const page = settingsOverviewStyles(isDark);
  const styles = settingsDetailStyles(isDark);
  const text = globalStyles(isDark);
  const {
    users,
    loading,
    refreshing,
    loadError,
    actionErrorUserId,
    pendingUserId,
    load,
    unblock,
  } = useBlockedAccounts();
  const contentStyle = useSettingsContentStyle([
    page.content,
    !users.length && styles.emptyContent,
  ]);
  const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader title="Blocked Accounts" onBack={navigation.goBack} />
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={[page.overview, text.emptyContainer]}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <View style={page.overview}>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={() => void load(true)}
        contentContainerStyle={contentStyle}
        ListHeaderComponent={
          users.length && loadError ? (
            <Text
              accessibilityRole="alert"
              style={[text.errorText, styles.errorPanel]}
            >
              {loadError}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={
          loadError ? (
            <SettingsStatus
              icon="ban-outline"
              title={loadError}
              onRetry={() => void load()}
            />
          ) : (
            <SettingsStatus
              icon="shield-checkmark-outline"
              title="No blocked accounts"
              description="Accounts you block will appear here."
            />
          )
        }
        renderItem={({ item }) => {
          const pending = pendingUserId === item.id;
          const name = item.fullName?.trim();

          return (
            <View style={styles.field}>
              <View style={[page.row, styles.blockedRow]}>
                <View style={styles.blockedIdentity}>
                  <SettingsAvatar uri={item.profileImage} />
                  <View style={page.copy}>
                    <Text style={text.subtitle}>
                      {name || `@${item.username}`}
                    </Text>
                    {!!name && (
                      <Text style={[text.secondaryText, page.secondary]}>
                        @{item.username}
                      </Text>
                    )}
                  </View>
                </View>
                <Button
                  isDark={isDark}
                  variant="outline"
                  style={styles.unblockButton}
                  disabled={pendingUserId !== null}
                  accessibilityState={{ busy: pending }}
                  aria-busy={pending}
                  accessibilityLabel={
                    pending
                      ? `Unblocking ${item.username}`
                      : `Unblock ${item.username}`
                  }
                  onPress={() => setSelectedUser(item)}
                >
                  {pending ? "Unblocking…" : "Unblock"}
                </Button>
              </View>
              {actionErrorUserId === item.id && (
                <Text
                  accessibilityRole="alert"
                  style={[text.errorText, styles.errorPanel]}
                >
                  Couldn’t unblock that account. Try again.
                </Text>
              )}
            </View>
          );
        }}
      />

      <ConfirmModal
        visible={selectedUser !== null}
        title="Unblock account?"
        message={
          selectedUser
            ? `@${selectedUser.username} will be able to find and interact with you again.`
            : ""
        }
        confirmText="Unblock"
        cancelText="Cancel"
        onConfirm={() => {
          if (!selectedUser) return;
          setSelectedUser(null);
          void unblock(selectedUser.id);
        }}
        onCancel={() => setSelectedUser(null)}
      />
    </View>
  );
}
