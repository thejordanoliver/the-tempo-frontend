import Button from "@/components/Buttons/Button";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useReducedMotion } from "hooks/useReducedMotion";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, TextInput, View } from "react-native";
import { formStyles } from "styles/FormStyles";
import AuthFormLayout from "./AuthFormLayout";

type SignInFormProps = {
  isSubmitting?: boolean;
  username: string;
  password: string;
  showPassword: boolean;
  onUsernameChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onToggleShowPassword: () => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
};

export default function SignInForm({ ...props }: SignInFormProps) {
  const reduceMotion = useReducedMotion();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = formStyles(isDark);
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (reduceMotion) {
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
      return;
    }
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    Animated.spring(scaleAnim, {
      toValue: 1.2,
      friction: 3,
      useNativeDriver: true,
    }).start(() =>
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start(),
    );
  }, [props.showPassword, scaleAnim, reduceMotion]);

  return (
    <AuthFormLayout>
      <View style={styles.sectionContainer}>
        <View style={styles.formWrapper}>
          <View style={styles.input}>
            <TextInput
              accessibilityLabel="Username"
              placeholder="Username"
              editable={!props.isSubmitting}
              autoCorrect={false}
              textContentType="username"
              value={props.username}
              onChangeText={props.onUsernameChange}
              style={styles.inputText}
              placeholderTextColor={
                isDark ? Colors.dark.secondaryText : Colors.light.secondaryText
              }
              autoCapitalize="none"
            />
          </View>

          <View style={styles.input}>
            <TextInput
              accessibilityLabel="Password"
              placeholder="Password"
              editable={!props.isSubmitting}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              value={props.password}
              onChangeText={props.onPasswordChange}
              secureTextEntry={!props.showPassword}
              style={styles.inputText}
              placeholderTextColor={
                isDark ? Colors.dark.secondaryText : Colors.light.secondaryText
              }
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !!props.isSubmitting }}
              disabled={props.isSubmitting}
              style={{
                minWidth: 48,
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={props.onToggleShowPassword}
              accessibilityLabel={
                props.showPassword ? "Hide password" : "Show password"
              }
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                  name={props.showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={isDark ? Colors.white : Colors.black}
                />
              </Animated.View>
            </Pressable>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            isDark={isDark}
            onPress={props.onSubmit}
            disabled={props.isSubmitting}
          >
            {props.isSubmitting ? "Signing In…" : "Sign In"}
          </Button>
          <Button
            isDark={isDark}
            onPress={props.onForgotPassword}
            disabled={props.isSubmitting}
            variant="text"
          >
            Forgot Password?
          </Button>
        </View>
      </View>
    </AuthFormLayout>
  );
}
