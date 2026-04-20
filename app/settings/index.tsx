import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConfirmModal from "components/ConfirmModal";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigation, useRouter } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useAuth } from "hooks/UserHooks/useAuth";
import { useLayoutEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SettingsScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const { deleteAccount } = useAuth();
  const router = useRouter();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const styles = getStyles(isDark);

  const signOut = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/login");
    } catch (error) {
      console.warn("Failed to sign out:", error);
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      if (!password.trim()) {
        alert("Please enter your password.");
        return;
      }
      await deleteAccount();
      setShowDeleteModal(false);
      setPassword("");
      router.replace("/settings/deleteaccountsplash");
    } catch (error) {
      alert("Failed to delete account. Check your password and try again.");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeaderTitle title="Settings" onBack={goBack} />,
    });
  }, [navigation, isDark]);

  return (
    <View style={[styles.screen]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable
          style={styles.optionButton}
          onPress={() => router.push("/settings/accountdetails")}
        >
          <Text style={styles.optionText}>Account Details</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        </Pressable>

        <Pressable
          style={styles.optionButton}
          onPress={() => router.push("/settings/preferences")}
        >
          <Text style={styles.optionText}>Preferences</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? Colors.white : Colors.black}
          />
        </Pressable>

        <Pressable
          style={styles.dangerButton}
          onPress={() => setShowSignOutModal(true)}
        >
          <Text style={[styles.dangerText]}>Sign Out</Text>
        </Pressable>
        <Pressable
          style={styles.dangerButton}
          onPress={() => setShowDeleteModal(true)}
        >
          <Text style={styles.dangerText}>Delete Account</Text>
        </Pressable>
      </ScrollView>
      <ConfirmModal
        visible={showSignOutModal}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={() => {
          setShowSignOutModal(false);
          signOut();
        }}
        onCancel={() => setShowSignOutModal(false)}
      />

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Account"
        message="This action cannot be undone. Please enter your password to confirm deletion."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteAccount}
        onCancel={() => {
          setShowDeleteModal(false);
          setPassword("");
        }}
      >
        <TextInput
          placeholder="Current Password"
          placeholderTextColor={Colors.midTone}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </ConfirmModal>
    </View>
  );
}

export const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      position: "relative",
    },
    container: { gap: 20 },
    wrapper: {
      paddingHorizontal: 12,
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingTop: 20,
      paddingBottom: 40,
    },
    heading: { marginBottom: 0 },
    optionButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? Colors.transparentLightGray
        : Colors.transparentDarkGray,
    },
    optionText: {
      color: isDark ? Colors.white : Colors.black,
      fontSize: 18,
      fontFamily: Fonts.OSREGULAR,
    },
    dangerButton: {
      paddingVertical: 12,
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? Colors.transparentLightGray
        : Colors.transparentDarkGray,
    },
    dangerText: {
      color: isDark ? Colors.dark.lightRed : Colors.light.red,
      fontSize: 18,
      fontFamily: Fonts.OSMEDIUM,
    },
    closeButton: {
      position: "absolute",
      top: 24,
      right: 15,
    },
    input: {
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
      color: isDark ? Colors.white : Colors.black,
      borderColor: isDark ? Colors.darkGray : Colors.lightGray,
      padding: 20,
      borderRadius: 8,
      fontSize: 16,
      marginVertical: 12,
      fontFamily: Fonts.OSLIGHT,
      width: "100%",
    },
  });
