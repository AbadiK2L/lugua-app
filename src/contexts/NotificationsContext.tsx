import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { AppState } from "react-native";

import { useAuthSession } from "@/src/contexts/AuthSessionContext";
import {
  getNotificationsServiceErrorMessage,
  listMyNotifications,
  markAllNotificationsRead as markAllNotificationsReadService,
  markNotificationRead,
} from "@/src/services/notificationsService";
import type { ActionResult } from "@/src/types/classes";
import type { LuguaNotification } from "@/src/types/notifications";

type NotificationsContextValue = {
  notifications: LuguaNotification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<ActionResult>;
  markAllAsRead: () => Promise<ActionResult>;
};

const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

export function NotificationsProvider({ children }: PropsWithChildren) {
  const { profile, user } = useAuthSession();
  const [notifications, setNotifications] = useState<LuguaNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const mutationRef = useRef(false);
  const notificationsCountRef = useRef(0);
  const userId = profile?.id;
  const sessionUserId = user?.id;

  useEffect(() => {
    notificationsCountRef.current = notifications.length;
  }, [notifications.length]);

  const refreshNotifications = useCallback(async () => {
    if (!userId || !sessionUserId || userId !== sessionUserId) {
      requestIdRef.current += 1;
      notificationsCountRef.current = 0;
      setNotifications([]);
      setError(null);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const hasExistingNotifications = notificationsCountRef.current > 0;

    if (hasExistingNotifications) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const nextNotifications = await listMyNotifications({ limit: 50 });

      if (requestIdRef.current === requestId) {
        notificationsCountRef.current = nextNotifications.length;
        setNotifications(nextNotifications);
      }
    } catch (caughtError) {
      if (requestIdRef.current === requestId) {
        setError(getNotificationsServiceErrorMessage(caughtError));
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [sessionUserId, userId]);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshNotifications();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string): Promise<ActionResult> => {
      if (mutationRef.current) {
        return { ok: false, message: "Une action est déjà en cours." };
      }

      mutationRef.current = true;
      setError(null);

      try {
        await markNotificationRead(notificationId);
        setNotifications((currentNotifications) =>
          currentNotifications.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  readAt: notification.readAt ?? new Date().toISOString(),
                }
              : notification,
          ),
        );
        return { ok: true };
      } catch (caughtError) {
        const message = getNotificationsServiceErrorMessage(caughtError);
        setError(message);
        return { ok: false, message };
      } finally {
        mutationRef.current = false;
      }
    },
    [],
  );

  const markAllAsRead = useCallback(async (): Promise<ActionResult> => {
    if (mutationRef.current) {
      return { ok: false, message: "Une action est déjà en cours." };
    }

    mutationRef.current = true;
    setError(null);

    try {
      await markAllNotificationsReadService();
      const now = new Date().toISOString();
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          readAt: notification.readAt ?? now,
        })),
      );
      return { ok: true };
    } catch (caughtError) {
      const message = getNotificationsServiceErrorMessage(caughtError);
      setError(message);
      return { ok: false, message };
    } finally {
      mutationRef.current = false;
    }
  }, []);

  const unreadCount = useMemo(
    () =>
      notifications.filter((notification) => notification.readAt === undefined)
        .length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      isRefreshing,
      error,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [
      error,
      isLoading,
      isRefreshing,
      markAllAsRead,
      markAsRead,
      notifications,
      refreshNotifications,
      unreadCount,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications doit être utilisé dans NotificationsProvider",
    );
  }

  return context;
}
