import { zodResolver } from "@hookform/resolvers/zod";
import Button from "components/Buttons/Button";
import { CustomHeader } from "components/CustomHeader";
import CredentialRequirements from "components/Forms/CredentialRequirements";
import FormInput from "components/Forms/FormInput";
import SettingsAvatar from "components/Settings/SettingsAvatar";
import SettingsSection from "components/Settings/SettingsSection";
import SettingsStatus from "components/Settings/SettingsStatus";
import { SkeletonBlock } from "components/Skeletons/primitives";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation } from "expo-router";
import { useSettingsContentStyle } from "hooks/useSettingsContentStyle";
import { useAccountDetails } from "hooks/UserHooks/useAccountDetails";
import { useLayoutEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "schemas/auth/changePasswordSchema";
import {
  PASSWORD_REQUIREMENTS,
  passwordRules,
} from "schemas/auth/credentialRules";
import {
  settingsDetailStyles,
  settingsOverviewStyles,
} from "styles/SettingsStyles";

const INITIAL_VALUES: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const passwordFields = [
  {
    name: "currentPassword",
    label: "Current Password",
    autoComplete: "current-password",
  },
  { name: "newPassword", label: "New Password", autoComplete: "new-password" },
  {
    name: "confirmPassword",
    label: "Confirm New Password",
    autoComplete: "new-password",
  },
] as const;

export default function AccountDetailsScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const page = settingsOverviewStyles(isDark);
  const styles = settingsDetailStyles(isDark);
  const text = globalStyles(isDark);
  const contentStyle = useSettingsContentStyle([
    page.content,
    styles.emptyContent,
  ]);
  const { isLoading, userData, refetch, changePassword } = useAccountDetails();
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: INITIAL_VALUES,
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: zodResolver(changePasswordSchema),
  });
  const newPassword = useWatch({ control, name: "newPassword" });

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader title="Account Details" onBack={navigation.goBack} />
      ),
    });
  }, [navigation]);

  const handleChangePassword = async (values: ChangePasswordFormValues) => {
    setPasswordUpdated(false);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      setPasswordUpdated(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Failed to update password";

      if (message === "Current and new password are required") {
        setError("currentPassword", { type: "server", message });
        setError("newPassword", { type: "server", message });
      } else if (message === "Invalid current password") {
        setError("currentPassword", { type: "server", message });
      } else if (
        message === "New password must be different" ||
        message.startsWith("Password must")
      ) {
        setError("newPassword", { type: "server", message });
      } else {
        setError("root.server", { type: "server", message });
      }
    }
  };

  const memberSince = userData?.createdAt ? new Date(userData.createdAt) : null;
  const memberDate =
    memberSince && Number.isFinite(memberSince.getTime())
      ? memberSince.toLocaleDateString("en-US", { dateStyle: "long" })
      : null;
  const username = userData?.username ? `@${userData.username}` : "";
  const displayName = userData?.fullName?.trim();

  return (
    <KeyboardAwareScrollView
      style={page.overview}
      contentContainerStyle={contentStyle}
      enableOnAndroid
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      {isLoading ? (
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Loading account details"
          accessibilityState={{ busy: true }}
          style={[page.group, styles.panel]}
        >
          <SkeletonBlock width="66%" height={24} />
          <SkeletonBlock width="44%" />
          <SkeletonBlock width="72%" height={18} />
        </View>
      ) : !userData ? (
        <SettingsStatus
          title="Couldn’t load account details"
          icon="person-circle-outline"
          onRetry={() => void refetch()}
        />
      ) : (
        <>
          <SettingsSection title="Profile">
            <View style={page.group}>
              <View style={styles.identity}>
                <SettingsAvatar uri={userData.profileImage} />
                <View style={page.copy}>
                  <Text selectable style={text.title}>
                    {displayName || username}
                  </Text>
                  {!!displayName && !!username && (
                    <Text
                      selectable
                      style={[text.secondaryText, page.secondary]}
                    >
                      {username}
                    </Text>
                  )}
                </View>
              </View>
              <View style={page.row}>
                <View style={page.copy}>
                  <Text style={[text.caption, page.secondary]}>Email</Text>
                  <Text selectable style={text.textMedium}>
                    {userData.email}
                  </Text>
                </View>
              </View>
              {memberDate && (
                <View style={page.row}>
                  <View style={page.copy}>
                    <Text style={[text.caption, page.secondary]}>
                      Member Since
                    </Text>
                    <Text style={text.textMedium}>{memberDate}</Text>
                  </View>
                </View>
              )}
            </View>
          </SettingsSection>

          <SettingsSection title="Password">
            <View style={[page.group, styles.panel]}>
              {passwordFields.map(({ name, label, autoComplete }) => (
                <View key={name} style={styles.field}>
                  <Text style={text.subtitle}>{label}</Text>
                  <FormInput
                    control={control}
                    name={name}
                    accessibilityLabel={label}
                    autoComplete={autoComplete}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                    editable={!isSubmitting}
                    onChange={() => setPasswordUpdated(false)}
                  />
                  {name === "newPassword" &&
                    (newPassword ? (
                      <CredentialRequirements
                        title="Password requirements"
                        value={newPassword}
                        rules={passwordRules}
                      />
                    ) : (
                      <Text style={[text.caption, page.secondary]}>
                        {PASSWORD_REQUIREMENTS}
                      </Text>
                    ))}
                </View>
              ))}

              {errors.root?.server?.message && (
                <Text
                  accessibilityRole="alert"
                  style={[text.errorText, styles.errorPanel]}
                >
                  {errors.root.server.message}
                </Text>
              )}
              {passwordUpdated && (
                <Text
                  accessibilityLiveRegion="polite"
                  role="status"
                  style={[text.textMedium, styles.success]}
                >
                  Password updated successfully.
                </Text>
              )}
              <Button
                onPress={handleSubmit(handleChangePassword)}
                disabled={isSubmitting}
                accessibilityState={{ busy: isSubmitting }}
                aria-busy={isSubmitting}
                isDark={isDark}
              >
                {isSubmitting ? "Updating Password…" : "Change Password"}
              </Button>
            </View>
          </SettingsSection>
        </>
      )}
    </KeyboardAwareScrollView>
  );
}
