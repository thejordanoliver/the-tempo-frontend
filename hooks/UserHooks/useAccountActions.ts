// hooks/useAccountActions.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useAuth } from "hooks/UserHooks/useAuth";

export function useAccountActions() {
  const { deleteAccount } = useAuth();
  const router = useRouter();

  const signOut = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/login");
    } catch (err) {
      console.warn("Failed to sign out:", err);
    }
  };

  const confirmDeleteAccount = async (password: string) => {
    if (!password.trim()) throw new Error("Password required");
    try {
      await deleteAccount();
      router.replace("/settings/deleteaccountsplash");
    } catch (err) {
      throw new Error("Failed to delete account. Check password.");
    }
  };

  return { signOut, confirmDeleteAccount };
}
