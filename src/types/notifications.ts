export type LuguaNotificationType =
  | "class_invitation"
  | "class_invitation_accepted"
  | "class_invitation_declined"
  | "join_request_received"
  | "join_request_approved"
  | "join_request_declined"
  | "removed_from_class";

export type LuguaNotificationRow = {
  notification_id: string;
  notification_type: LuguaNotificationType;
  class_id: string | null;
  class_name: string | null;
  actor_id: string | null;
  actor_name: string | null;
  membership_id: string | null;
  read_at: string | null;
  created_at: string;
};

export type LuguaNotification = {
  id: string;
  type: LuguaNotificationType;
  classId?: string;
  className?: string;
  actorId?: string;
  actorName?: string;
  membershipId?: string;
  readAt?: string;
  createdAt: string;
};

export function mapLuguaNotificationRow(
  row: LuguaNotificationRow,
): LuguaNotification {
  return {
    id: row.notification_id,
    type: row.notification_type,
    classId: row.class_id ?? undefined,
    className: row.class_name ?? undefined,
    actorId: row.actor_id ?? undefined,
    actorName: row.actor_name ?? undefined,
    membershipId: row.membership_id ?? undefined,
    readAt: row.read_at ?? undefined,
    createdAt: row.created_at,
  };
}
