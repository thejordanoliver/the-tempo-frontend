import { CustomHeader } from "@/components/CustomHeader";
import Input from "@/components/Inputs/Input";
import ConfirmModal from "components/ConfirmModal";
import SettingsOverview from "components/Settings/SettingsOverview";
import { Colors, globalStyles } from "constants/styles";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { useAuth } from "hooks/UserHooks/useAuth";
import { useScopedRouter } from "hooks/useScopedRouter";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Linking, Text, View } from "react-native";
import { settingsStyles } from "styles/SettingsStyles";
import { AlertConfig } from "types/alert";

export default function SettingsScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { clearFavorites } = useFavoriteTeamsContext();
  const { user, deleteAccount, logout } = useAuth();
  const router = useScopedRouter();
  const navigation = useNavigation();
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [pendingAlertConfig, setPendingAlertConfig] =
    useState<AlertConfig | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const styles = settingsStyles(isDark);
  const sharedStyles = globalStyles(isDark);

  const closeAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

  const queueAlert = useCallback((config: AlertConfig) => {
    setPendingAlertConfig(config);
  }, []);

  useEffect(() => {
    if (
      !pendingAlertConfig ||
      showDeleteModal ||
      showLogoutModal ||
      alertConfig
    ) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const animationFrame = requestAnimationFrame(() => {
      timeout = setTimeout(() => {
        setAlertConfig(pendingAlertConfig);
        setPendingAlertConfig(null);
      }, 150);
    });

    return () => {
      cancelAnimationFrame(animationFrame);

      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [alertConfig, pendingAlertConfig, showDeleteModal, showLogoutModal]);

  const openSupportPage = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      queueAlert({
        title: "Unable to Open Page",
        message: `Please open ${url} in your browser, or contact jordanoliver@thetemposports.com.`,
        confirmText: "OK",
      });
    }
  };

  const signOut = async () => {
    try {
      clearFavorites();
      await logout();
    } catch (error) {
      console.warn("Failed to sign out:", error);

      setShowLogoutModal(false);

      queueAlert({
        title: "Sign Out Failed",
        message: "Something went wrong while signing out. Please try again.",
        confirmText: "OK",
      });
    }
  };

  const confirmDeleteAccount = async () => {
    const currentPassword = password;
    setDeleteError(null);

    if (!currentPassword) {
      setDeleteError("Please enter your current password.");
      return;
    }

    try {
      await deleteAccount(currentPassword);

      setShowDeleteModal(false);
      setPassword("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Check your password and try again.";

      console.warn("Failed to delete account:", message);

      setDeleteError(
        /(?:incorrect|invalid)(?: current)? password/i.test(message)
          ? "The password you entered is incorrect. Please try again."
          : message,
      );
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader title="Settings" onBack={navigation.goBack} />
      ),
    });
  }, [navigation]);

  const accountName =
    (user?.full_name ?? user?.fullName)?.trim() ||
    (user?.username ? `@${user.username}` : undefined);

  return (
    <View style={styles.container}>
      <SettingsOverview
        accountName={accountName}
        avatarUri={user?.profile_image ?? user?.profileImage}
        onAccountPress={() => router.push("/settings/accountdetails")}
        sections={[
          {
            title: "App",
            actions: [
              {
                label: "Preferences",
                description: "Theme and score layouts",
                icon: "options-outline",
                onPress: () => router.push("/settings/preferences"),
              },
              {
                label: "My Ticker",
                description: "Connect and manage your display",
                icon: "hardware-chip-outline",
                onPress: () => router.push("/(tabs)/(profile)/ticker"),
              },
            ],
          },
          {
            title: "Privacy & Support",
            actions: [
              {
                label: "Blocked Accounts",
                icon: "ban-outline",
                onPress: () => router.push("/settings/blocked-users"),
              },
              {
                label: "Privacy Policy",
                icon: "shield-checkmark-outline",
                kind: "external",
                onPress: () =>
                  void openSupportPage("https://thetemposports.com/privacy/"),
              },
              {
                label: "Help & Support",
                icon: "help-circle-outline",
                kind: "external",
                onPress: () =>
                  void openSupportPage("https://thetemposports.com/support/"),
              },
            ],
          },
          {
            title: "Account Actions",
            actions: [
              {
                label: "Logout",
                icon: "log-out-outline",
                kind: "confirmation",
                onPress: () => setShowLogoutModal(true),
              },
              {
                label: "Delete Account",
                icon: "trash-outline",
                kind: "destructive",
                onPress: () => {
                  setDeleteError(null);
                  setShowDeleteModal(true);
                },
              },
            ],
          },
          ...(__DEV__
            ? [
                {
                  title: "Development",
                  actions: [
                    {
                      label: "Ticker Design Preview",
                      icon: "construct-outline" as const,
                      onPress: () => router.push("/design-preview/ticker"),
                    },
                  ],
                },
              ]
            : []),
        ]}
      />

      <ConfirmModal
        visible={showLogoutModal}
        title="Logout?"
        message="You will need to log in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowLogoutModal(false);
          signOut();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Account"
        message="This action can't be undone. Enter your password to permanently delete your account."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteAccount}
        onCancel={() => {
          setShowDeleteModal(false);
          setPassword("");
          setDeleteError(null);
        }}
      >
        <Input
          placeholder="Current Password"
          placeholderTextColor={Colors.midTone}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setDeleteError(null);
          }}
        />
        {!!deleteError && (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={sharedStyles.errorText}
          >
            {deleteError}
          </Text>
        )}
      </ConfirmModal>

      <ConfirmModal
        visible={!!alertConfig}
        title={alertConfig?.title}
        message={alertConfig?.message}
        confirmText={alertConfig?.confirmText ?? "OK"}
        cancelText={alertConfig?.cancelText}
        showCancel={alertConfig?.showCancel ?? !!alertConfig?.cancelText}
        confirmDisabled={alertConfig?.confirmDisabled}
        variant={alertConfig?.variant ?? "default"}
        onCancel={closeAlert}
        onConfirm={closeAlert}
      />
    </View>
  );
}
