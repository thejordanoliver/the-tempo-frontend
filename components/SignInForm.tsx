import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Styles";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { formStyles } from "styles/FormStyles";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

type SignInFormProps = {
  username: string;
  password: string;
  showPassword: boolean;
  onUsernameChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onToggleShowPassword: () => void;
  onSubmit: () => void;
};

export default function SignInForm({ ...props }: SignInFormProps) {
  const isDark = useColorScheme() === "dark";
  const styles = formStyles(isDark);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
  }, [props.showPassword]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.formContainer}>
      <View style={styles.formWrapper}>
        <TextInput
          placeholder="Username"
          value={props.username}
          onChangeText={props.onUsernameChange}
          style={styles.input}
          placeholderTextColor={Colors.midTone}
          autoCapitalize="none"
        />

        <View style={styles.passwordInput}>
          <TextInput
            placeholder="Password"
            value={props.password}
            onChangeText={props.onPasswordChange}
            secureTextEntry={!props.showPassword}
            style={styles.passwordText}
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

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={props.onSubmit}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}
