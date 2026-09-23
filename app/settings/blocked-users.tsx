import { CustomHeader } from "@/components/CustomHeader";
import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "components/ConfirmModal";
import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getBlockedUsers,
  unblockUser,
  type BlockedUser,
} from "services/usersApi";

export default function BlockedUsersScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const navigation = useNavigation();
  const router = useRouter();
  const styles = createStyles(isDark);
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  const loadUsers = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      setUsers(await getBlockedUsers());
    } catch {
      Alert.alert("Could not load blocked accounts", "Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadUsers();
  }, [loadUsers]));

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader title="Blocked Accounts" onBack={() => router.back()} />
      ),
    });
  }, [navigation, router]);

  const confirmUnblock = useCallback(async () => {
    if (!selectedUser || pendingUserId !== null) return;
    const user = selectedUser;
    setSelectedUser(null);
    setPendingUserId(user.id);
    try {
      await unblockUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch {
      Alert.alert("Could not unblock account", "Please try again later.");
    } finally {
      setPendingUserId(null);
    }
  }, [pendingUserId, selectedUser]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={isDark ? Colors.white : Colors.black} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={() => void loadUsers(true)}
        contentContainerStyle={users.length ? styles.list : styles.emptyList}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Ionicons
              name="shield-checkmark-outline"
              size={42}
              color={isDark ? Colors.lightGray : Colors.darkGray}
            />
            <Text style={styles.emptyTitle}>No blocked accounts</Text>
            <Text style={styles.emptyText}>
              Accounts you block will appear here.
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.profileImage ? (
              <Image source={{ uri: item.profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person" size={22} color={Colors.midTone} />
              </View>
            )}
            <View style={styles.identity}>
              <Text style={styles.username}>@{item.username}</Text>
              {item.fullName ? <Text style={styles.fullName}>{item.fullName}</Text> : null}
            </View>
            <TouchableOpacity
              style={styles.unblockButton}
              disabled={pendingUserId === item.id}
              onPress={() => setSelectedUser(item)}
              accessibilityRole="button"
              accessibilityLabel={`Unblock ${item.username}`}
            >
              <Text style={styles.unblockText}>
                {pendingUserId === item.id ? "Unblocking…" : "Unblock"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <ConfirmModal
        visible={selectedUser !== null}
        title="Unblock account?"
        message={selectedUser ? `@${selectedUser.username} will be able to find and interact with you again.` : ""}
        confirmText="Unblock"
        cancelText="Cancel"
        onConfirm={() => void confirmUnblock()}
        onCancel={() => setSelectedUser(null)}
      />
    </View>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? Colors.black : Colors.white },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? Colors.black : Colors.white },
  list: { padding: 16, gap: 10 },
  emptyList: { flexGrow: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, backgroundColor: isDark ? Colors.dark.itemBackground : Colors.light.itemBackground },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: { alignItems: "center", justifyContent: "center", backgroundColor: isDark ? Colors.darkGray : Colors.lightGray },
  identity: { flex: 1 },
  username: { fontFamily: Fonts.BOLD, fontSize: 15, color: isDark ? Colors.white : Colors.black },
  fullName: { marginTop: 3, fontFamily: Fonts.REGULAR, fontSize: 13, color: Colors.midTone },
  unblockButton: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: StyleSheet.hairlineWidth, borderColor: isDark ? Colors.lightGray : Colors.darkGray, borderRadius: 999 },
  unblockText: { fontFamily: Fonts.BOLD, fontSize: 13, color: isDark ? Colors.white : Colors.black },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { marginTop: 14, fontFamily: Fonts.BOLD, fontSize: 18, color: isDark ? Colors.white : Colors.black },
  emptyText: { marginTop: 6, fontFamily: Fonts.REGULAR, fontSize: 14, textAlign: "center", color: Colors.midTone },
});
