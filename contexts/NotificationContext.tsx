import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addCenterNotificationToState,
  getUnreadCenterNotificationCount,
  MAX_CENTER_NOTIFICATIONS,
  mergeCenterNotificationStates,
} from "@/utils/notificationCenter";

export type Notification = {
  id: string;
  message: string;
  teamLogo?: string | number;
};

export type NotificationCenterType =
  | "messages"
  | "likes"
  | "comments"
  | "badges"
  | "game"
  | "followers";

export type GameSport =
  | "basketball"
  | "football"
  | "soccer"
  | "baseball"
  | "hockey"
  | "mma";

export type NotificationCenterItem = {
  id: string;
  type: NotificationCenterType;
  title: string;
  text: string;
  conversationId?: string | null;
  postId?: string | number | null;
  gameId?: string | number | null;
  sport?: string | null;
  userId?: string | null;
  senderUsername?: string | null;
  messageCount?: number;
  actorUsername?: string | null;
  actorUsernames?: string[];
  actorUserIds?: string[];
  likeCount?: number;
  readAt?: string | null;
  createdAt: string;
};

type NotificationContextType = {
  // Temporary in-app banners/toasts.
  notifications: Notification[];
  showNotification: (notif: Notification) => void;
  onDismiss: (id: string) => void;

  // Persistent local Notification Center history.
  centerNotifications: NotificationCenterItem[];
  addCenterNotification: (notification: NotificationCenterItem) => void;
  markCenterNotificationRead: (id: string) => void;
  markConversationNotificationsRead: (conversationId: string) => void;
  markAllCenterNotificationsRead: () => void;
  removeCenterNotification: (id: string) => void;
  clearCenterNotifications: () => void;
  unreadNotificationCount: number;

  // Team-level notification toggling.
  toggleNotifications: (
    league: string,
    teamId: string | number,
  ) => Promise<void>;
  isNotified: (league: string, teamId: string | number) => boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

const TEAM_NOTIFICATIONS_STORAGE_KEY = "teamNotifications";
const CENTER_NOTIFICATIONS_STORAGE_KEY = "notificationCenter";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const isNotificationCenterItem = (
  value: unknown,
): value is NotificationCenterItem => {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    typeof value.title === "string" &&
    typeof value.text === "string" &&
    typeof value.createdAt === "string"
  );
};

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [centerNotifications, setCenterNotifications] = useState<
    NotificationCenterItem[]
  >([]);
  const [teamNotifications, setTeamNotifications] = useState<
    Record<string, boolean>
  >({});

  const hasLoadedTeamNotificationsRef = useRef(false);
  const hasLoadedCenterNotificationsRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadPersistedState = async () => {
      try {
        const [storedTeamNotifications, storedCenterNotifications] =
          await Promise.all([
            AsyncStorage.getItem(TEAM_NOTIFICATIONS_STORAGE_KEY),
            AsyncStorage.getItem(CENTER_NOTIFICATIONS_STORAGE_KEY),
          ]);

        if (!isMounted) return;

        if (storedTeamNotifications) {
          try {
            const parsed = JSON.parse(storedTeamNotifications);

            if (isRecord(parsed)) {
              const normalized = Object.entries(parsed).reduce<
                Record<string, boolean>
              >((result, [key, value]) => {
                if (typeof value === "boolean") {
                  result[key] = value;
                }

                return result;
              }, {});

              setTeamNotifications(normalized);
            }
          } catch (error) {
            console.error("Failed to parse team notifications:", error);
          }
        }

        if (storedCenterNotifications) {
          try {
            const parsed = JSON.parse(storedCenterNotifications);

            if (Array.isArray(parsed)) {
              const normalized = parsed
                .filter(isNotificationCenterItem)
                .slice(0, MAX_CENTER_NOTIFICATIONS);

              setCenterNotifications((current) =>
                mergeCenterNotificationStates(normalized, current),
              );
            }
          } catch (error) {
            console.error("Failed to parse notification center:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load notification settings:", error);
      } finally {
        if (isMounted) {
          hasLoadedTeamNotificationsRef.current = true;
          hasLoadedCenterNotificationsRef.current = true;
        }
      }
    };

    void loadPersistedState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedTeamNotificationsRef.current) return;

    AsyncStorage.setItem(
      TEAM_NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(teamNotifications),
    ).catch((error) => {
      console.error("Failed to save team notifications:", error);
    });
  }, [teamNotifications]);

  useEffect(() => {
    if (!hasLoadedCenterNotificationsRef.current) return;

    AsyncStorage.setItem(
      CENTER_NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(centerNotifications),
    ).catch((error) => {
      console.error("Failed to save notification center:", error);
    });
  }, [centerNotifications]);

  const showNotification = useCallback((notif: Notification) => {
    setNotifications((current) => {
      const exists = current.some((item) => item.id === notif.id);

      if (exists) return current;

      return [...current, notif];
    });
  }, []);

  const onDismiss = useCallback((id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }, []);

  const addCenterNotification = useCallback(
    (notification: NotificationCenterItem) => {
      if (!notification.id) return;

      setCenterNotifications((current) =>
        addCenterNotificationToState(current, notification),
      );
    },
    [],
  );

  const markCenterNotificationRead = useCallback((id: string) => {
    const readAt = new Date().toISOString();

    setCenterNotifications((current) =>
      current.map((notification) =>
        notification.id === id && !notification.readAt
          ? { ...notification, readAt }
          : notification,
      ),
    );
  }, []);

  const markConversationNotificationsRead = useCallback(
    (conversationId: string) => {
      const normalizedConversationId = String(conversationId ?? "").trim();

      if (!normalizedConversationId) return;

      const readAt = new Date().toISOString();

      setCenterNotifications((current) =>
        current.map((notification) =>
          notification.type === "messages" &&
          String(notification.conversationId ?? "").trim() ===
            normalizedConversationId &&
          !notification.readAt
            ? { ...notification, readAt }
            : notification,
        ),
      );
    },
    [],
  );

  const markAllCenterNotificationsRead = useCallback(() => {
    const readAt = new Date().toISOString();

    setCenterNotifications((current) =>
      current.map((notification) =>
        notification.readAt ? notification : { ...notification, readAt },
      ),
    );
  }, []);

  const removeCenterNotification = useCallback((id: string) => {
    setCenterNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }, []);

  const clearCenterNotifications = useCallback(() => {
    setCenterNotifications([]);
  }, []);

  const unreadNotificationCount = useMemo(
    () => getUnreadCenterNotificationCount(centerNotifications),
    [centerNotifications],
  );

  const toggleNotifications = useCallback(
    async (league: string, teamId: string | number) => {
      const key = `${league}-${teamId}`;

      setTeamNotifications((current) => ({
        ...current,
        [key]: !current[key],
      }));
    },
    [],
  );

  const isNotified = useCallback(
    (league: string, teamId: string | number) =>
      Boolean(teamNotifications[`${league}-${teamId}`]),
    [teamNotifications],
  );

  const value = useMemo<NotificationContextType>(
    () => ({
      notifications,
      showNotification,
      onDismiss,
      centerNotifications,
      addCenterNotification,
      markCenterNotificationRead,
      markConversationNotificationsRead,
      markAllCenterNotificationsRead,
      removeCenterNotification,
      clearCenterNotifications,
      unreadNotificationCount,
      toggleNotifications,
      isNotified,
    }),
    [
      addCenterNotification,
      centerNotifications,
      clearCenterNotifications,
      isNotified,
      markAllCenterNotificationsRead,
      markCenterNotificationRead,
      markConversationNotificationsRead,
      notifications,
      onDismiss,
      removeCenterNotification,
      showNotification,
      toggleNotifications,
      unreadNotificationCount,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }

  return context;
}
