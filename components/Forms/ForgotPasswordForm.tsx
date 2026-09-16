import { Ionicons } from "@expo/vector-icons";
import Button from "components/Buttons/Button";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import type { useForgotPasswordForm } from "hooks/UserHooks/useForgotPasswordForm";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { forgotPasswordStyles } from "styles/ForgotPasswordStyles";
import AuthFormLayout from "./AuthFormLayout";
import FormInput from "./FormInput";

const STEPS = {
  email: { number: 1, subtitle: "Enter your email and we will send you a 6-digit code." },
  code: { number: 2, subtitle: "Check your email for a 6-digit code." },
  password: { number: 3, subtitle: "Enter a new password for your account." },
};

type ForgotPasswordFormProps = {
  form: ReturnType<typeof useForgotPasswordForm>;
  onBack: () => void;
};

export default function ForgotPasswordForm({ form, onBack }: ForgotPasswordFormProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = forgotPasswordStyles(isDark);
  const global = globalStyles(isDark);
  const [showPassword, setShowPassword] = useState(false);
  const { step, isBusy, isRequestBusy, requestAction, resendCooldown } = form;
  const inputProps = {
    control: form.control,
    editable: !isRequestBusy,
    onChange: form.clearFeedback,
    containerStyle: styles.inputBorder,
    autoCapitalize: "none" as const,
    autoCorrect: false,
  };

  return (
    <AuthFormLayout contentContainerStyle={[styles.content, { padding: 12 }]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Step {STEPS[step].number} of 3</Text>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>{STEPS[step].subtitle}</Text>
      </View>
      <View style={styles.form}>
        {step === "email" && (
          <>
            <FormInput
              {...inputProps}
              name="email"
              placeholder="Email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <Button isDark={isDark} onPress={() => form.requestCode()} disabled={isBusy} style={styles.button}>
              {requestAction === "requesting" ? "Sending..." : "Send Code"}
            </Button>
          </>
        )}
        {step === "code" && (
          <>
            <FormInput
              {...inputProps}
              name="code"
              placeholder="6-digit code"
              normalize={(value) => value.replace(/\D/g, "").slice(0, 6)}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
              style={styles.codeInputText}
            />
            <Text style={styles.helperText}>Codes expire after 10 minutes.</Text>
            <Button isDark={isDark} onPress={form.verifyCode} disabled={isBusy} style={styles.button}>
              {requestAction === "verifying" ? "Verifying..." : "Verify Code"}
            </Button>
            <Pressable
              onPress={() => form.requestCode({ isResend: true })}
              disabled={isBusy || resendCooldown > 0}
              accessibilityRole="button"
              style={styles.linkButton}
            >
              <Text style={[styles.linkText, (isBusy || resendCooldown > 0) && styles.disabledLinkText]}>
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
              </Text>
            </Pressable>
          </>
        )}
        {step === "password" && (
          <>
            <FormInput
              {...inputProps}
              name="password"
              placeholder="New password"
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              trailing={
                <Pressable
                  onPress={() => setShowPassword((value) => !value)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  hitSlop={8}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={isDark ? Colors.white : Colors.black} />
                </Pressable>
              }
            />
            <FormInput
              {...inputProps}
              name="confirmPassword"
              placeholder="Confirm password"
              secureTextEntry={!showPassword}
              textContentType="newPassword"
            />
            <Button isDark={isDark} onPress={form.submitPassword} disabled={isBusy || !form.isValid} style={styles.button}>
              {form.isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </>
        )}
        {!!form.globalError && <Text selectable style={styles.errorText}>{form.globalError}</Text>}
        {!!form.success && <Text selectable style={styles.successText}>{form.success}</Text>}
        <Pressable
          onPress={onBack}
          disabled={isRequestBusy}
          accessibilityRole="button"
          style={({ pressed }) => [styles.linkButton, pressed && global.pressed]}
        >
          <Text style={styles.linkText}>Back to Login</Text>
        </Pressable>
      </View>
    </AuthFormLayout>
  );
}
