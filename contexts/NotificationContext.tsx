// /contexts/NotificationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Notification = {
  id: string;
  message: string;
  teamLogo?: string | number;
};

type NotificationContextType = {
  notifications: Notification[];
  showNotification: (notif: Notification) => void;
  onDismiss: (id: string) => void;

  // 🔔 team-level notification toggling
  toggleNotifications: (league: string, teamId: string | number) => Promise<void>;
  isNotified: (league: string, teamId: string | number) => boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const STORAGE_KEY = "teamNotifications";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teamNotifications, setTeamNotifications] = useState<Record<string, boolean>>({});

  // --- Load persisted team notifications on mount ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setTeamNotifications(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load team notifications:", e);
      }
    };
    loadSettings();
  }, []);

  // --- Persist when changed ---
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(teamNotifications)).catch((e) =>
      console.error("Failed to save team notifications:", e)
    );
  }, [teamNotifications]);

  // --- Show + dismiss ephemeral notifications ---
  const showNotification = useCallback((notif: Notification) => {
    setNotifications((prev) => [...prev, notif]);
  }, []);

  const onDismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // --- Team-level notification toggle ---
  const toggleNotifications = useCallback(
    async (league: string, teamId: string | number) => {
      const key = `${league}-${teamId}`;
      setTeamNotifications((prev) => {
        const updated = { ...prev, [key]: !prev[key] };
        return updated;
      });
    },
    []
  );

  const isNotified = useCallback(
    (league: string, teamId: string | number) => !!teamNotifications[`${league}-${teamId}`],
    [teamNotifications]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        onDismiss,
        toggleNotifications,
        isNotified,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
