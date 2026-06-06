import { useNavigation } from "@react-navigation/native";
import Button from "components/Button";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { goBack } from "expo-router/build/global-state/routing";
import { useAccountDetails } from "hooks/UserHooks/useAccountDetails";
import { useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function AccountDetailsScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const styles = accountDetailsStyles(isDark);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const {
    isLoading,
    currentUserId,
    userData,
    isChangingPassword,
    changePassword,
  } = useAccountDetails();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle title="Account Details" onBack={goBack} />
      ),
    });
  }, [navigation, isDark]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert(
        "Error",
        "New password cannot be the same as current password.",
      );
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters long.");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Password updated successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? Colors.black : Colors.white,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? Colors.white : Colors.black}
        />
      </View>
    );
  }

  if (!currentUserId || !userData) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? Colors.black : Colors.white,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={{ color: isDark ? Colors.white : Colors.black }}>
          Unable to load account details.
        </Text>
      </View>
    );
  }

  const formattedDate = new Date(userData.created_at).toLocaleDateString(
    "en-US",
    {
      dateStyle: "long",
    },
  );

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainerStyle}
      enableOnAndroid
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <HeadingTwo isDark={isDark}>Full Name</HeadingTwo>
      <Text style={styles.text}>{userData.fullName}</Text>

      <HeadingTwo isDark={isDark}>Username</HeadingTwo>
      <Text style={styles.text}>{userData.username}</Text>

      <HeadingTwo isDark={isDark}>Email</HeadingTwo>
      <Text style={styles.text}>{userData.email}</Text>

      {/* Password Section */}

      <HeadingTwo isDark={isDark}>Password</HeadingTwo>
      <Text style={styles.text}>••••••••</Text>

      <View style={styles.input}>
        <TextInput
          placeholder="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholderTextColor={Colors.midTone}
          style={styles.inputText}
          autoCapitalize="none"
        />
      </View>

      {/* Change Password Inputs */}

      <View style={styles.input}>
        <TextInput
          placeholder="New Password"
          placeholderTextColor={Colors.midTone}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.inputText}
        />
      </View>

      <View style={styles.input}>
        <TextInput
          placeholder="Confirm New Password"
          placeholderTextColor={Colors.midTone}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.inputText}
        />
      </View>

      <Button
        onPress={handleChangePassword}
        disabled={isChangingPassword}
        isDark={isDark}
      >
        Change Password
      </Button>

      <Text style={styles.memberSince}>Member Since: {formattedDate}</Text>
    </KeyboardAwareScrollView>
  );
}
const accountDetailsStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1 },
    contentContainerStyle: {
      flex: 1,
      paddingHorizontal: 12,
      paddingTop: 20,
      gap: 16,
    },
    input: {
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      borderRadius: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    },

    inputText: {
      flex: 1,
      color: isDark ? Colors.white : Colors.black,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
    },

    button: {
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
    },
    text: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontSize: 16,
      fontFamily: Fonts.OSREGULAR,
      marginBottom: 10,
    },
    memberSince: {
      color: isDark ? Colors.darkGray : Colors.lightGray,
      fontSize: 16,
      marginTop: 12,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
    },
  });
