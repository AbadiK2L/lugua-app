import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { useAuthSession } from "@/src/contexts/AuthSessionContext";
import { useNotifications } from "@/src/contexts/NotificationsContext";
import type {
  LuguaNotification,
  LuguaNotificationType,
} from "@/src/types/notifications";

type NotificationCopy = {
  title: string;
  message: string;
  actionLabel?: string;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date indisponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getNotificationCopy({
  type,
  className,
  actorName,
  isTeacher,
}: {
  type: LuguaNotificationType;
  className?: string;
  actorName?: string;
  isTeacher: boolean;
}): NotificationCopy {
  const normalizedClassName = className ?? "cette classe";
  const normalizedActorName = actorName ?? "Un utilisateur Lugua";

  if (type === "class_invitation") {
    return {
      title: "Invitation à rejoindre une classe",
      message: `${normalizedActorName} t’invite à rejoindre « ${normalizedClassName} ».`,
      actionLabel: "Voir l’invitation",
    };
  }

  if (type === "class_invitation_accepted") {
    return {
      title: "Invitation acceptée",
      message: isTeacher
        ? `${normalizedActorName} a rejoint « ${normalizedClassName} ».`
        : `Tu as rejoint « ${normalizedClassName} ».`,
    };
  }

  if (type === "class_invitation_declined") {
    return {
      title: "Invitation refusée",
      message: isTeacher
        ? `${normalizedActorName} a refusé l’invitation pour « ${normalizedClassName} ».`
        : `L’invitation pour « ${normalizedClassName} » a été refusée.`,
    };
  }

  if (type === "join_request_received") {
    return {
      title: "Nouvelle demande de participation",
      message: `${normalizedActorName} souhaite rejoindre « ${normalizedClassName} ».`,
      actionLabel: "Voir la demande",
    };
  }

  if (type === "join_request_approved") {
    return {
      title: "Demande acceptée",
      message: `Ta demande pour « ${normalizedClassName} » a été acceptée.`,
    };
  }

  if (type === "join_request_declined") {
    return {
      title: "Demande refusée",
      message: `Ta demande pour « ${normalizedClassName} » n’a pas été acceptée.`,
    };
  }

  return {
    title: "Accès à la classe retiré",
    message: `Tu ne fais plus partie de « ${normalizedClassName} ».`,
  };
}

export function NotificationsScreenContent() {
  const { profile } = useAuthSession();
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const unreadNotifications = notifications.filter(
    (notification) => !notification.readAt,
  );
  const olderNotifications = notifications.filter(
    (notification) => notification.readAt,
  );
  const isTeacher = profile?.role === "teacher";

  useFocusEffect(
    useCallback(() => {
      void refreshNotifications();
      return undefined;
    }, [refreshNotifications]),
  );

  async function openNotification(notification: LuguaNotification) {
    setActionError(null);

    if (!notification.readAt) {
      const result = await markAsRead(notification.id);

      if (!result.ok) {
        setActionError(result.message);
        return;
      }
    }

    if (isTeacher && notification.classId) {
      router.push({
        pathname: "/teacher/class/[classId]",
        params: { classId: notification.classId },
      });
      return;
    }

    if (!isTeacher) {
      router.push({
        pathname: "/student/classes",
        params: { tab: "my" },
      });
    }
  }

  async function markEveryNotificationRead() {
    if (isMarkingAll || unreadCount === 0) {
      return;
    }

    setIsMarkingAll(true);
    setActionError(null);
    const result = await markAllAsRead();

    if (!result.ok) {
      setActionError(result.message);
    }

    setIsMarkingAll(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.intro}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>CENTRE LUGUA</Text>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            Les invitations et réponses concernant tes classes apparaissent ici.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tout marquer comme lu"
          accessibilityState={{ disabled: unreadCount === 0 || isMarkingAll }}
          disabled={unreadCount === 0 || isMarkingAll}
          onPress={() => {
            void markEveryNotificationRead();
          }}
          style={({ pressed }) => [
            styles.markAllButton,
            (unreadCount === 0 || isMarkingAll) && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.markAllText}>
            {isMarkingAll ? "Lecture…" : "Tout marquer comme lu"}
          </Text>
        </Pressable>
      </View>

      {actionError ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer l’erreur notifications"
          onPress={() => setActionError(null)}
          style={[styles.notice, styles.errorNotice]}
        >
          <Text style={styles.noticeTitle}>Action impossible</Text>
          <Text style={styles.noticeText}>{actionError}</Text>
        </Pressable>
      ) : null}

      {error ? (
        <View style={[styles.notice, styles.errorNotice]}>
          <Text style={styles.noticeTitle}>Notifications indisponibles</Text>
          <Text style={styles.noticeText}>{error}</Text>
          <SmallButton
            label="Réessayer"
            disabled={isRefreshing || isLoading}
            onPress={() => {
              void refreshNotifications();
            }}
          />
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={HOME_COLORS.accent} />
          <Text style={styles.stateText}>Chargement des notifications…</Text>
        </View>
      ) : notifications.length === 0 && !error ? (
        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Aucune notification</Text>
          <Text style={styles.stateText}>
            Les invitations et réponses concernant tes classes apparaîtront ici.
          </Text>
        </View>
      ) : (
        <View style={styles.sections}>
          {unreadNotifications.length > 0 ? (
            <NotificationGroup title="Nouvelles">
              {unreadNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  isTeacher={isTeacher}
                  onOpen={() => {
                    void openNotification(notification);
                  }}
                />
              ))}
            </NotificationGroup>
          ) : null}

          {olderNotifications.length > 0 ? (
            <NotificationGroup title="Plus anciennes">
              {olderNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  isTeacher={isTeacher}
                  onOpen={() => {
                    void openNotification(notification);
                  }}
                />
              ))}
            </NotificationGroup>
          ) : null}
        </View>
      )}
    </View>
  );
}

function NotificationGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.list}>{children}</View>
    </View>
  );
}

function NotificationCard({
  notification,
  isTeacher,
  onOpen,
}: {
  notification: LuguaNotification;
  isTeacher: boolean;
  onOpen: () => void;
}) {
  const copy = getNotificationCopy({
    type: notification.type,
    className: notification.className,
    actorName: notification.actorName,
    isTeacher,
  });
  const unread = !notification.readAt;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${copy.title}, ${unread ? "non lue" : "lue"}`}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.notificationCard,
        unread && styles.unreadCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.heading}>
          <Text style={styles.cardTitle}>{copy.title}</Text>
          <Text style={styles.cardMessage}>{copy.message}</Text>
        </View>
        {unread ? <View style={styles.unreadDot} /> : null}
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{formatDate(notification.createdAt)}</Text>
        {copy.actionLabel ? (
          <Text style={styles.actionText}>{copy.actionLabel}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function SmallButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.smallButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.smallButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  intro: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  heading: { minWidth: 0, flex: 1, gap: 5 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  markAllButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 10,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 13,
  },
  markAllText: {
    color: HOME_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "900",
  },
  notice: {
    gap: 8,
    borderWidth: 1,
    borderColor: HOME_COLORS.accent,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.accentSoft,
    padding: 14,
  },
  errorNotice: { borderColor: "#d86f7e" },
  noticeTitle: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  noticeText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  stateCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 18,
  },
  stateTitle: { color: HOME_COLORS.textPrimary, fontSize: 17, fontWeight: "900" },
  stateText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  sections: { gap: 16 },
  group: { gap: 9 },
  groupTitle: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  list: { gap: 8 },
  notificationCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.card,
    padding: 15,
  },
  unreadCard: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.cardActive,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: HOME_COLORS.accent,
    marginTop: 5,
  },
  cardTitle: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  cardMessage: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  dateText: { color: HOME_COLORS.textMuted, fontSize: 11, fontWeight: "800" },
  actionText: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  smallButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 9,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 12,
  },
  smallButtonText: { color: HOME_COLORS.textPrimary, fontSize: 12, fontWeight: "900" },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
