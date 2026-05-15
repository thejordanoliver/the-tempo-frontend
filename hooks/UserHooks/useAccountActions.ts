// hooks/useAccountActions.ts
import { useAuth } from "hooks/UserHooks/useAuth";

export function useAccountActions() {
  const { deleteAccount, logout } = useAuth();

  const signOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn("Failed to sign out:", err);
    }
  };

  const confirmDeleteAccount = async (password: string) => {
    if (!password.trim()) throw new Error("Password required");
    try {
      await deleteAccount(password);
    } catch {
      throw new Error("Failed to delete account. Check password.");
    }
  };

  return { signOut, confirmDeleteAccount };
}
