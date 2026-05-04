import { Ionicons } from "@expo/vector-icons";
import Button from "components/Button";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  forgotPassword,
  resetPassword,
  verifyResetCode,
} from "utils/apiClient";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{6}$/;
const RESEND_COOLDOWN_SECONDS = 60;
const CODE_EXPIRATION_MINUTES = 10;

type ResetStep = "email" | "code" | "password";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = authStyles(isDark);

  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const trimmedCode = code.trim();
  const isValidResetPassword =
    Boolean(email.trim()) &&
    CODE_PATTERN.test(trimmedCode) &&
    password.length >= 8 &&
    confirmPassword.length >= 8 &&
    password === confirmPassword;

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  const validateEmail = () => {
    if (!normalizedEmail) {
      setError("Email is required.");
      return false;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return false;
    }

    return true;
  };

  const validateCode = () => {
    if (!trimmedCode) {
      setError("Code is required.");
      return false;
    }

    if (!CODE_PATTERN.test(trimmedCode)) {
      setError("Enter the 6-digit code from your email.");
      return false;
    }

    return true;
  };

  const requestCode = async ({ isResend = false } = {}) => {
    setError("");
    setSuccess("");

    if (!validateEmail()) return;

    try {
      setLoading(true);
      await forgotPassword(normalizedEmail);
      setStep("code");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setSuccess(
        isResend
          ? "A new code has been sent."
          : "Check your email for a 6-digit code.",
      );
    } catch (err: any) {
      setError(
        err.response?.data?.error ??
          err.response?.data?.message ??
          "Unable to send reset code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError("");
    setSuccess("");

    if (!validateEmail() || !validateCode()) return;

    try {
      setLoading(true);
      await verifyResetCode(normalizedEmail, trimmedCode);
      setStep("password");
      setSuccess("Code verified. Enter a new password.");
    } catch (err: any) {
      setError(
        err.response?.data?.error ??
          err.response?.data?.message ??
          "Invalid or expired code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    setError("");
    setSuccess("");

    if (!validateEmail() || !validateCode()) return;

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Confirm password is required.");
      return;
    }

    if (confirmPassword.length < 8) {
      setError("Confirm password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(normalizedEmail, trimmedCode, password);
      setSuccess("Password updated. Redirecting to login...");
      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (err: any) {
      setError(
        err.response?.data?.error ??
          err.response?.data?.message ??
          "Unable to update password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <>
      <View style={styles.input}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={Colors.midTone}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          style={styles.inputText}
          editable={!loading}
        />
      </View>

      <Button
        isDark={isDark}
        onPress={() => requestCode()}
        disabled={loading}
        style={styles.button}
      >
        {loading ? "Sending..." : "Send Code"}
      </Button>
    </>
  );

  const renderCodeStep = () => (
    <>
      <View style={styles.input}>
        <TextInput
          value={code}
          onChangeText={(value) =>
            setCode(value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="6-digit code"
          placeholderTextColor={Colors.midTone}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={6}
          style={[styles.inputText, styles.codeInputText]}
          editable={!loading}
        />
      </View>

      <Text style={styles.helperText}>
        Codes expire after {CODE_EXPIRATION_MINUTES} minutes.
      </Text>

      <Button
        isDark={isDark}
        onPress={verifyCode}
        disabled={loading}
        style={styles.button}
      >
        {loading ? "Verifying..." : "Verify Code"}
      </Button>

      <Pressable
        onPress={() => requestCode({ isResend: true })}
        disabled={loading || resendCooldown > 0}
        style={styles.linkButton}
      >
        <Text
          style={[
            styles.linkText,
            (loading || resendCooldown > 0) && styles.disabledLinkText,
          ]}
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Resend code"}
        </Text>
      </Pressable>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <View style={styles.input}>
        <TextInput
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setSuccess("");
          }}
          placeholder="New password"
          placeholderTextColor={Colors.midTone}
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          style={styles.inputText}
          editable={!loading}
        />
        <Pressable
          onPress={() => setShowPassword((value) => !value)}
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        </Pressable>
      </View>

      <View style={styles.input}>
        <TextInput
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            setSuccess("");
          }}
          placeholder="Confirm password"
          placeholderTextColor={Colors.midTone}
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          style={styles.inputText}
          editable={!loading}
        />
      </View>

      <Button
        isDark={isDark}
        onPress={updatePassword}
        disabled={loading || !isValidResetPassword}
        style={styles.button}
      >
        {loading ? "Updating..." : "Update Password"}
      </Button>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.kicker}>Step {stepOrder[step]} of 3</Text>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>{subtitleByStep[step]}</Text>
              </View>

              <View style={styles.form}>
                {step === "email" && renderEmailStep()}
                {step === "code" && renderCodeStep()}
                {step === "password" && renderPasswordStep()}

                {!!error && <Text style={styles.errorText}>{error}</Text>}
                {!!success && <Text style={styles.successText}>{success}</Text>}

                <Pressable
                  onPress={() => router.replace("/login")}
                  disabled={loading}
                  style={styles.linkButton}
                >
                  <Text style={styles.linkText}>Back to Login</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const stepOrder: Record<ResetStep, number> = {
  email: 1,
  code: 2,
  password: 3,
};

const subtitleByStep: Record<ResetStep, string> = {
  email: "Enter your email and we will send you a 6-digit code.",
  code: "Check your email for a 6-digit code.",
  password: "Enter a new password for your account.",
};

const authStyles = (isDark: boolean) => {
  const surface = isDark
    ? Colors.dark.itemBackground
    : Colors.light.itemBackground;
  const text = isDark ? Colors.white : Colors.black;
  const secondaryText = isDark ? Colors.lightGray : Colors.darkGray;
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    keyboardView: {
      flex: 1,
    },
    container: {
      flex: 1,
      padding: 12,
      backgroundColor: isDark ? Colors.black : Colors.white,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      gap: 32,
    },
    header: {
      gap: 8,
    },
    kicker: {
      color: Colors.midTone,
      fontSize: 13,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      textTransform: "uppercase",
    },
    title: {
      color: text,
      fontSize: 34,
      fontFamily: Fonts.OSBOLD,
      textAlign: "center",
    },
    subtitle: {
      color: secondaryText,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
      paddingHorizontal: 24,
    },
    form: {
      gap: 12,
    },
    input: {
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: surface,
      borderRadius: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: border,
    },
    inputText: {
      flex: 1,
      color: text,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },
    codeInputText: {
      textAlign: "center",
      letterSpacing: 8,
      fontSize: 22,
      fontFamily: Fonts.OSMEDIUM,
    },
    helperText: {
      color: secondaryText,
      fontSize: 14,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
    },
    errorText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: 15,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
    },
    successText: {
      color: isDark ? Colors.dark.limeGreen : Colors.light.green,
      fontSize: 15,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
    },
    button: {
      marginTop: 8,
    },
    linkButton: {
      alignSelf: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    linkText: {
      color: Colors.midTone,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },
    disabledLinkText: {
      opacity: 0.6,
    },
  });
};
