import { supabase } from "@/src/lib/supabase";
import {
  mapLuguaNotificationRow,
  type LuguaNotification,
} from "@/src/types/notifications";

const CONFIGURATION_ERROR = "Configuration Supabase manquante.";

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
};

export class NotificationsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationsServiceError";
  }
}

function getClient() {
  if (!supabase) {
    throw new NotificationsServiceError(CONFIGURATION_ERROR);
  }

  return supabase;
}

function isErrorLike(error: unknown): error is SupabaseErrorLike {
  return typeof error === "object" && error !== null;
}

function mapNotificationsError(error: SupabaseErrorLike) {
  const message = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";

  if (
    error.status === 401 ||
    code.includes("jwt") ||
    message.includes("jwt") ||
    message.includes("session") ||
    message.includes("auth.uid")
  ) {
    return "Ta session a expiré. Connecte-toi de nouveau.";
  }

  if (
    error.status === 403 ||
    message.includes("permission denied") ||
    message.includes("access denied")
  ) {
    return "Tu n’as pas accès à ces notifications.";
  }

  if (
    message.includes("not found") ||
    message.includes("introuvable")
  ) {
    return "Notification introuvable.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network request failed") ||
    message.includes("networkerror") ||
    message.includes("fetch")
  ) {
    return "Connexion réseau impossible. Vérifie ta connexion puis réessaie.";
  }

  return "Les notifications n’ont pas pu être chargées. Réessaie dans un instant.";
}

export function getNotificationsServiceErrorMessage(error: unknown) {
  if (error instanceof NotificationsServiceError) {
    return error.message;
  }

  if (!isErrorLike(error)) {
    return "Une erreur inattendue est survenue. Réessaie dans un instant.";
  }

  return mapNotificationsError(error);
}

function throwIfError(error: SupabaseErrorLike | null) {
  if (error) {
    throw new NotificationsServiceError(mapNotificationsError(error));
  }
}

export async function listMyNotifications(
  options: {
    unreadOnly?: boolean;
    limit?: number;
  } = {},
): Promise<LuguaNotification[]> {
  const client = getClient();
  const { data, error } = await client.rpc("get_my_notifications", {
    result_limit: options.limit ?? 50,
    unread_only: options.unreadOnly ?? false,
  });

  throwIfError(error);

  return (data ?? []).map((row) => mapLuguaNotificationRow(row));
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  const client = getClient();
  const { error } = await client.rpc("mark_notification_read", {
    target_notification_id: notificationId,
  });

  throwIfError(error);
}

export async function markAllNotificationsRead(): Promise<void> {
  const client = getClient();
  const { error } = await client.rpc("mark_all_notifications_read");

  throwIfError(error);
}
