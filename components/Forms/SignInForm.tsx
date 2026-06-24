import { Ionicons } from "@expo/vector-icons";
import Button from "components/Button";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native"; // FIX #9: merged into a single import block
import { formStyles } from "styles/FormStyles";

type SignInFormProps = {
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
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = formStyles(isDark);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
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
  }, [props.showPassword, scaleAnim]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.sectionContainer}>
        <View style={styles.formWrapper}>
          <View style={styles.input}>
            <TextInput
              placeholder="Username"
              value={props.username}
              onChangeText={props.onUsernameChange}
              style={styles.inputText}
              placeholderTextColor={Colors.midTone}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.input}>
            <TextInput
              placeholder="Password"
              value={props.password}
              onChangeText={props.onPasswordChange}
              secureTextEntry={!props.showPassword}
              style={styles.inputText}
              placeholderTextColor={Colors.midTone}
            />
            <Pressable
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

        <Button isDark={isDark} onPress={props.onSubmit}>
          Sign In
        </Button>
        <Pressable
          onPress={props.onForgotPassword}
          style={styles.forgotPasswordLink}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}
