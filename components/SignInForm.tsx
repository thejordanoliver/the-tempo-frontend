// components/SignInForm.tsx
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Styles";
import React from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { formStyles } from "styles/FormStyles";
type SignInFormProps = {
  username: string;
  password: string;
  showPassword: boolean;
  onUsernameChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onToggleShowPassword: () => void;
  onSubmit: () => void;
};

export default function SignInForm({
  username,
  password,
  showPassword,
  onUsernameChange,
  onPasswordChange,
  onToggleShowPassword,
  onSubmit,
}: SignInFormProps) {
  const isDark = useColorScheme() === "dark";

  const styles = formStyles(isDark);

  return (
    <View style={styles.signInInputContainer}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={onUsernameChange}
        style={styles.input}
        placeholderTextColor={Colors.midTone}
        autoCapitalize="none"
      />
      <View style={styles.passwordRow}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
          placeholderTextColor={Colors.midTone}
        />
        <Pressable
          onPress={onToggleShowPassword}
          style={styles.iconButton}
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        </Pressable>
      </View>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSubmit}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
