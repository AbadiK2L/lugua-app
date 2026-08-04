import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { TeacherAssignmentActionDialog } from "@/src/components/teacher/assignments/TeacherAssignmentActionDialog";
import type {
  ActionResult,
  ClassRosterMember,
  StudentDirectoryEntry,
} from "@/src/types/classes";

type PendingAction =
  | { type: "invite"; entry: StudentDirectoryEntry }
  | { type: "resend"; member: ClassRosterMember }
  | { type: "remove"; member: ClassRosterMember };

type TeacherClassMembersSectionProps = {
  members: ClassRosterMember[];
  classArchived: boolean;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onSearchStudents: (
    searchTerm: string,
  ) => Promise<ActionResult<StudentDirectoryEntry[]>>;
  onInviteStudent: (studentId: string) => Promise<ActionResult>;
  onRemoveMember: (studentId: string) => Promise<ActionResult>;
};

function formatShortDate(value?: string) {
  if (!value) {
    return "Date indisponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date indisponible";
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}

function getMemberStatusLabel(status: ClassRosterMember["status"]) {
  if (status === "active") {
    return "Membre actif";
  }

  if (status === "declined") {
    return "Invitation refusée";
  }

  if (status === "requested") {
    return "Demande en attente";
  }

  return "Invitation en attente";
}

export function TeacherClassMembersSection({
  members,
  classArchived,
  isLoading,
  isMutating,
  error,
  onRefresh,
  onSearchStudents,
  onInviteStudent,
  onRemoveMember,
}: TeacherClassMembersSectionProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<StudentDirectoryEntry[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>();
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const visibleMembers = members.filter(
    (member) => member.status !== "declined" && member.status !== "requested",
  );
  const activeCount = members.filter((member) => member.status === "active").length;
  const pendingCount = members.filter((member) => member.status === "invited").length;
  const memberByStudentId = useMemo(() => {
    const entries = new Map<string, ClassRosterMember>();
    members.forEach((member) => {
      entries.set(member.studentId, member);
    });
    return entries;
  }, [members]);

  useEffect(() => {
    if (!modalVisible) {
      return;
    }

    let active = true;
    const query = searchTerm.trim();
    setSearchError(null);

    if (query.length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsSearching(true);

      async function search() {
        const result = await onSearchStudents(query);

        if (!active) {
          return;
        }

        if (result.ok) {
          setSearchResults(result.data ?? []);
        } else {
          setSearchResults([]);
          setSearchError(result.message);
        }

        setIsSearching(false);
      }

      void search();
    }, 280);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [modalVisible, onSearchStudents, searchTerm]);

  function closeModal() {
    if (isMutating) {
      return;
    }

    setModalVisible(false);
    setSearchTerm("");
    setSearchResults([]);
    setSearchError(null);
  }

  async function confirmPendingAction() {
    if (!pendingAction || isMutating) {
      return;
    }

    setActionError(null);
    setNotice(null);

    const result =
      pendingAction.type === "remove"
        ? await onRemoveMember(pendingAction.member.studentId)
        : await onInviteStudent(
            pendingAction.type === "invite"
              ? pendingAction.entry.profileId
              : pendingAction.member.studentId,
          );

    if (!result.ok) {
      setActionError(result.message);
      setPendingAction(undefined);
      return;
    }

    if (pendingAction.type === "remove") {
      setNotice(
        pendingAction.member.status === "invited"
          ? "Invitation retirée"
          : "Élève retiré de la classe",
      );
    } else {
      setNotice(
        pendingAction.type === "resend"
          ? "Invitation renvoyée"
          : "Invitation envoyée",
      );
    }

    setPendingAction(undefined);
  }

  const pendingDialog =
    pendingAction?.type === "remove"
      ? {
          title:
            pendingAction.member.status === "invited"
              ? "Retirer l’invitation ?"
              : "Retirer de la classe ?",
          message:
            pendingAction.member.status === "invited"
              ? "L’invitation disparaîtra de l’espace de cet élève."
              : "Le profil élève ne sera pas supprimé. Seule son appartenance à cette classe sera retirée.",
          confirmLabel:
            pendingAction.member.status === "invited"
              ? "Retirer l’invitation"
              : "Retirer",
          destructive: true,
        }
      : pendingAction?.type === "resend"
        ? {
            title: "Renvoyer l’invitation ?",
            message:
              "Une invitation sera disponible dans son espace Lugua.",
            confirmLabel: "Renvoyer",
            destructive: false,
          }
        : {
            title: "Inviter cet élève ?",
            message:
              "Une invitation sera envoyée dans son espace Lugua.",
            confirmLabel: "Inviter",
            destructive: false,
          };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.heading}>
          <Text style={styles.sectionTitle}>Élèves</Text>
          <Text style={styles.sectionMeta}>
            {activeCount} actif{activeCount === 1 ? "" : "s"} · {pendingCount} invitation
            {pendingCount === 1 ? "" : "s"}
          </Text>
        </View>
        <ActionButton
          label="Ajouter un élève"
          disabled={classArchived}
          onPress={() => {
            setActionError(null);
            setNotice(null);
            setModalVisible(true);
          }}
          primary
        />
      </View>

      {classArchived ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Restaure la classe avant d’envoyer de nouvelles invitations.
          </Text>
        </View>
      ) : null}

      {notice ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le message des élèves"
          onPress={() => setNotice(null)}
          style={styles.notice}
        >
          <Text style={styles.noticeTitle}>{notice}</Text>
          <Text style={styles.noticeText}>
            L’élève pourra accepter ou refuser depuis son espace.
          </Text>
        </Pressable>
      ) : null}

      {actionError ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer l’erreur des élèves"
          onPress={() => setActionError(null)}
          style={[styles.notice, styles.errorNotice]}
        >
          <Text style={styles.noticeTitle}>Action impossible</Text>
          <Text style={styles.noticeText}>{actionError}</Text>
        </Pressable>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={HOME_COLORS.accent} />
          <Text style={styles.loadingText}>Chargement des membres…</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Membres indisponibles</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <ActionButton
            label="Réessayer"
            disabled={isLoading}
            onPress={() => {
              void onRefresh();
            }}
          />
        </View>
      ) : visibleMembers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucun membre actif</Text>
          <Text style={styles.emptyText}>
            Recherche un profil élève pour envoyer une invitation.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {visibleMembers.map((member) => (
            <MemberCard
              key={member.membershipId}
              member={member}
              disabled={isMutating}
              onResend={() => setPendingAction({ type: "resend", member })}
              onRemove={() => setPendingAction({ type: "remove", member })}
            />
          ))}
        </View>
      )}

      <StudentDirectoryModal
        visible={modalVisible}
        searchTerm={searchTerm}
        searchResults={searchResults}
        isSearching={isSearching}
        searchError={searchError}
        isMutating={isMutating}
        memberByStudentId={memberByStudentId}
        classArchived={classArchived}
        onSearchTermChange={setSearchTerm}
        onClose={closeModal}
        onInvite={(entry) => setPendingAction({ type: "invite", entry })}
        onReinvite={(member) => setPendingAction({ type: "resend", member })}
      />

      <TeacherAssignmentActionDialog
        visible={Boolean(pendingAction)}
        title={pendingDialog.title}
        message={pendingDialog.message}
        confirmLabel={pendingDialog.confirmLabel}
        destructive={pendingDialog.destructive}
        submitting={isMutating}
        onCancel={() => setPendingAction(undefined)}
        onConfirm={() => {
          void confirmPendingAction();
        }}
      />
    </View>
  );
}

function MemberCard({
  member,
  disabled,
  onResend,
  onRemove,
}: {
  member: ClassRosterMember;
  disabled: boolean;
  onResend: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.studentCopy}>
        <Text style={styles.studentName} numberOfLines={2}>
          {member.displayName}
        </Text>
        <Text style={styles.studentMeta} numberOfLines={2}>
          {member.preferredLanguage} · {member.preferredVariety}
        </Text>
        <Text style={styles.studentStatus}>
          {getMemberStatusLabel(member.status)}
          {" · "}
          {member.status === "active"
            ? `Depuis le ${formatShortDate(member.joinedAt)}`
            : `Invité le ${formatShortDate(member.invitedAt)}`}
        </Text>
      </View>
      <View style={styles.studentActions}>
        {member.status === "invited" ? (
          <SmallButton
            label="Renvoyer l’invitation"
            disabled={disabled}
            onPress={onResend}
          />
        ) : null}
        <SmallButton
          label={member.status === "invited" ? "Retirer l’invitation" : "Retirer de la classe"}
          destructive
          disabled={disabled}
          onPress={onRemove}
        />
      </View>
    </View>
  );
}

function StudentDirectoryModal({
  visible,
  searchTerm,
  searchResults,
  isSearching,
  searchError,
  isMutating,
  memberByStudentId,
  classArchived,
  onSearchTermChange,
  onClose,
  onInvite,
  onReinvite,
}: {
  visible: boolean;
  searchTerm: string;
  searchResults: StudentDirectoryEntry[];
  isSearching: boolean;
  searchError: string | null;
  isMutating: boolean;
  memberByStudentId: Map<string, ClassRosterMember>;
  classArchived: boolean;
  onSearchTermChange: (value: string) => void;
  onClose: () => void;
  onInvite: (entry: StudentDirectoryEntry) => void;
  onReinvite: (member: ClassRosterMember) => void;
}) {
  const query = searchTerm.trim();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isMutating ? undefined : onClose}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer l’annuaire élèves"
          disabled={isMutating}
          onPress={onClose}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>AJOUTER UN ÉLÈVE</Text>
              <Text style={styles.modalTitle}>Ajouter un élève</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              disabled={isMutating}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                isMutating && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <TextInput
            accessibilityLabel="Rechercher un profil élève"
            value={searchTerm}
            onChangeText={onSearchTermChange}
            placeholder="Rechercher un profil élève"
            placeholderTextColor={HOME_COLORS.textMuted}
            autoCapitalize="words"
            style={styles.input}
          />

          {query.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Commence à saisir un nom</Text>
              <Text style={styles.emptyText}>
                Commence à saisir un nom pour rechercher un élève.
              </Text>
            </View>
          ) : isSearching ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={HOME_COLORS.accent} />
              <Text style={styles.loadingText}>Recherche en cours…</Text>
            </View>
          ) : searchError ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Recherche indisponible</Text>
              <Text style={styles.emptyText}>{searchError}</Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Aucun profil élève trouvé</Text>
              <Text style={styles.emptyText}>
                Essaie un autre nom ou vérifie que l’élève possède un profil Lugua.
              </Text>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultList}
            >
              {searchResults.map((entry) => {
                const existingMember = memberByStudentId.get(entry.profileId);
                const inviteDisabled =
                  classArchived ||
                  isMutating ||
                  existingMember?.status === "active" ||
                  existingMember?.status === "invited" ||
                  existingMember?.status === "requested";
                const buttonLabel =
                  existingMember?.status === "active"
                    ? "Membre"
                    : existingMember?.status === "invited"
                      ? "Invité"
                      : existingMember?.status === "requested"
                        ? "Demande reçue"
                      : existingMember?.status === "declined"
                        ? "Réinviter"
                        : "Inviter";

                return (
                  <View key={entry.profileId} style={styles.resultCard}>
                    <View style={styles.studentCopy}>
                      <Text style={styles.studentName} numberOfLines={2}>
                        {entry.displayName}
                      </Text>
                      <Text style={styles.studentMeta} numberOfLines={2}>
                        {entry.preferredLanguage} · {entry.preferredVariety}
                      </Text>
                      {existingMember ? (
                        <Text style={styles.studentStatus}>
                          {getMemberStatusLabel(existingMember.status)}
                        </Text>
                      ) : null}
                    </View>
                    <SmallButton
                      label={buttonLabel}
                      disabled={inviteDisabled}
                      onPress={() => {
                        if (existingMember?.status === "declined") {
                          onReinvite(existingMember);
                          return;
                        }
                        onInvite(entry);
                      }}
                      primary={!existingMember}
                    />
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ActionButton({
  label,
  onPress,
  primary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
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
        styles.actionButton,
        primary && styles.primaryButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionText, primary && styles.primaryActionText]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SmallButton({
  label,
  onPress,
  primary = false,
  destructive = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  destructive?: boolean;
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
        primary && styles.primarySmallButton,
        destructive && styles.destructiveButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.smallButtonText,
          primary && styles.primarySmallButtonText,
          destructive && styles.destructiveText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  heading: { minWidth: 0, flex: 1, gap: 3 },
  sectionTitle: { color: HOME_COLORS.textPrimary, fontSize: 19, fontWeight: "900" },
  sectionMeta: { color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  emptyState: { gap: 7, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  emptyTitle: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  emptyText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  loadingCard: { minHeight: 86, alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  loadingText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "800" },
  notice: { gap: 4, borderWidth: 1, borderColor: HOME_COLORS.accent, borderRadius: 12, backgroundColor: HOME_COLORS.accentSoft, padding: 12 },
  errorNotice: { borderColor: "#d86f7e" },
  noticeTitle: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "900" },
  noticeText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  list: { gap: 8 },
  studentCard: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 12 },
  studentCopy: { minWidth: 0, flex: 1, gap: 3 },
  studentName: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  studentMeta: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "700", lineHeight: 18 },
  studentStatus: { color: HOME_COLORS.accentMuted, fontSize: 11, fontWeight: "800", lineHeight: 16 },
  studentActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 5 },
  smallButton: { minHeight: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 9, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 10 },
  primarySmallButton: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  destructiveButton: { borderColor: "#8e4654" },
  smallButtonText: { color: HOME_COLORS.textPrimary, fontSize: 11, fontWeight: "800" },
  primarySmallButtonText: { color: HOME_COLORS.ink },
  destructiveText: { color: "#ffb4c0" },
  modalRoot: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(7, 17, 31, 0.84)", padding: 16 },
  modalCard: { width: "100%", maxWidth: 560, maxHeight: "88%", gap: 12, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 18, backgroundColor: HOME_COLORS.card, padding: 18 },
  modalHeader: { minHeight: 48, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900", letterSpacing: 0.6 },
  modalTitle: { color: HOME_COLORS.textPrimary, fontSize: 21, fontWeight: "900" },
  closeButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  closeText: { color: HOME_COLORS.textSecondary, fontSize: 28, lineHeight: 30 },
  input: { minHeight: 48, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, color: HOME_COLORS.textPrimary, fontSize: 14, paddingHorizontal: 12 },
  resultList: { gap: 8, paddingBottom: 4 },
  resultCard: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 12 },
  actionButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  primaryButton: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  actionText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  primaryActionText: { color: HOME_COLORS.ink },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
