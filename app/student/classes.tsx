import { useFocusEffect } from "@react-navigation/native";
import { router, type Href, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { ProfileScreenShell } from "@/src/components/profile/ProfileScreenShell";
import { TeacherAssignmentActionDialog } from "@/src/components/teacher/assignments/TeacherAssignmentActionDialog";
import { useNotifications } from "@/src/contexts/NotificationsContext";
import {
  getClassesServiceErrorMessage,
  getMyClassMemberships,
  listDiscoverableClasses,
  requestToJoinClass,
  respondToClassInvitation,
} from "@/src/services/classesService";
import type {
  DiscoverableClass,
  StudentClassMembership,
} from "@/src/types/classes";

type ClassesTab = "my" | "discover";
type PendingInvitationResponse = {
  membership: StudentClassMembership;
  accept: boolean;
};

type ClassesParams = {
  tab?: string | string[];
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getInitialTab(value: string | string[] | undefined): ClassesTab {
  return getParam(value) === "discover" ? "discover" : "my";
}

function formatDate(value?: string) {
  if (!value) {
    return "Date indisponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date indisponible";
  }

  return new Intl.DateTimeFormat("fr-FR").format(date);
}

export default function StudentClassesScreen() {
  const params = useLocalSearchParams<ClassesParams>();
  const { refreshNotifications } = useNotifications();
  const [tab, setTab] = useState<ClassesTab>(() => getInitialTab(params.tab));
  const [memberships, setMemberships] = useState<StudentClassMembership[]>([]);
  const [discoverableClasses, setDiscoverableClasses] = useState<DiscoverableClass[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMembershipsLoading, setIsMembershipsLoading] = useState(false);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [membershipsError, setMembershipsError] = useState<string | null>(null);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [pendingResponse, setPendingResponse] = useState<PendingInvitationResponse>();
  const [requestTarget, setRequestTarget] = useState<DiscoverableClass>();
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const membershipRequestIdRef = useRef(0);
  const discoverRequestIdRef = useRef(0);
  const mutationRef = useRef(false);

  useEffect(() => {
    setTab(getInitialTab(params.tab));
  }, [params.tab]);

  const loadMemberships = useCallback(async () => {
    const requestId = membershipRequestIdRef.current + 1;
    membershipRequestIdRef.current = requestId;
    setIsMembershipsLoading(true);
    setMembershipsError(null);

    try {
      const nextMemberships = await getMyClassMemberships();

      if (membershipRequestIdRef.current === requestId) {
        setMemberships(nextMemberships);
      }
    } catch (caughtError) {
      if (membershipRequestIdRef.current === requestId) {
        setMembershipsError(getClassesServiceErrorMessage(caughtError));
      }
    } finally {
      if (membershipRequestIdRef.current === requestId) {
        setIsMembershipsLoading(false);
      }
    }
  }, []);

  const loadDiscoverable = useCallback(async (query = searchTerm) => {
    const requestId = discoverRequestIdRef.current + 1;
    discoverRequestIdRef.current = requestId;
    setIsDiscoverLoading(true);
    setDiscoverError(null);

    try {
      const nextClasses = await listDiscoverableClasses(query);

      if (discoverRequestIdRef.current === requestId) {
        setDiscoverableClasses(nextClasses);
      }
    } catch (caughtError) {
      if (discoverRequestIdRef.current === requestId) {
        setDiscoverError(getClassesServiceErrorMessage(caughtError));
      }
    } finally {
      if (discoverRequestIdRef.current === requestId) {
        setIsDiscoverLoading(false);
      }
    }
  }, [searchTerm]);

  useFocusEffect(
    useCallback(() => {
      void loadMemberships();
      if (tab === "discover") {
        void loadDiscoverable();
      }
      return undefined;
    }, [loadDiscoverable, loadMemberships, tab]),
  );

  useEffect(() => {
    if (tab !== "discover") {
      return;
    }

    const timeoutId = setTimeout(() => {
      void loadDiscoverable(searchTerm);
    }, 280);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadDiscoverable, searchTerm, tab]);

  async function refreshAll() {
    await loadMemberships();
    await loadDiscoverable();
    await refreshNotifications();
  }

  async function confirmInvitationResponse() {
    if (!pendingResponse || mutationRef.current) {
      return;
    }

    mutationRef.current = true;
    setIsMutating(true);
    setNotice(null);

    try {
      await respondToClassInvitation(
        pendingResponse.membership.membershipId,
        pendingResponse.accept,
      );
      setNotice(
        pendingResponse.accept
          ? {
              title: "Classe rejointe",
              message: "La classe apparaît maintenant dans Mes classes.",
            }
          : {
              title: "Invitation refusée",
              message: "L’invitation disparaît de tes invitations.",
            },
      );
      setPendingResponse(undefined);
      await refreshAll();
    } catch (caughtError) {
      setNotice({
        title: "Action impossible",
        message: getClassesServiceErrorMessage(caughtError),
      });
      setPendingResponse(undefined);
    } finally {
      mutationRef.current = false;
      setIsMutating(false);
    }
  }

  async function submitJoinRequest() {
    if (!requestTarget || mutationRef.current) {
      return;
    }

    const normalizedMessage = requestMessage.trim();

    if (normalizedMessage.length > 240) {
      setRequestError("Le message doit contenir 240 caractères maximum.");
      return;
    }

    mutationRef.current = true;
    setIsMutating(true);
    setRequestError(null);
    setNotice(null);

    try {
      await requestToJoinClass(requestTarget.id, normalizedMessage);
      setNotice({
        title: "Demande envoyée",
        message: "Le professeur a reçu ta demande de participation.",
      });
      setRequestTarget(undefined);
      setRequestMessage("");
      await refreshAll();
    } catch (caughtError) {
      setRequestError(getClassesServiceErrorMessage(caughtError));
    } finally {
      mutationRef.current = false;
      setIsMutating(false);
    }
  }

  const invitationDialog =
    pendingResponse?.accept
      ? {
          title: "Rejoindre cette classe ?",
          message:
            "Tu auras accès aux cours et devoirs partagés dans cette classe.",
          confirmLabel: "Accepter",
          destructive: false,
        }
      : {
          title: "Refuser cette invitation ?",
          message: "Elle disparaîtra de tes invitations.",
          confirmLabel: "Refuser",
          destructive: true,
        };

  return (
    <ProfileScreenShell fallbackHref="/student" title="Classes">
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ESPACE ÉLÈVE</Text>
        <Text style={styles.title}>Mes classes</Text>
        <Text style={styles.subtitle}>
          Rejoins les classes publiques ou réponds aux invitations reçues.
        </Text>
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        <TabButton label="Mes classes" selected={tab === "my"} onPress={() => setTab("my")} />
        <TabButton label="Découvrir" selected={tab === "discover"} onPress={() => setTab("discover")} />
      </View>

      {notice ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le message classes"
          onPress={() => setNotice(null)}
          style={styles.notice}
        >
          <Text style={styles.noticeTitle}>{notice.title}</Text>
          <Text style={styles.noticeText}>{notice.message}</Text>
        </Pressable>
      ) : null}

      {tab === "my" ? (
        <MyClassesTab
          memberships={memberships}
          isLoading={isMembershipsLoading}
          isMutating={isMutating}
          error={membershipsError}
          onRetry={loadMemberships}
          onAccept={(membership) => setPendingResponse({ membership, accept: true })}
          onDecline={(membership) => setPendingResponse({ membership, accept: false })}
        />
      ) : (
        <DiscoverClassesTab
          searchTerm={searchTerm}
          classes={discoverableClasses}
          isLoading={isDiscoverLoading}
          isMutating={isMutating}
          error={discoverError}
          onSearchChange={setSearchTerm}
          onRetry={() => {
            void loadDiscoverable();
          }}
          onRefresh={() => {
            void refreshAll();
          }}
          onOpenMyClasses={() => setTab("my")}
          onRequestJoin={(targetClass) => {
            setRequestTarget(targetClass);
            setRequestMessage("");
            setRequestError(null);
          }}
        />
      )}

      <TeacherAssignmentActionDialog
        visible={Boolean(pendingResponse)}
        title={invitationDialog.title}
        message={invitationDialog.message}
        confirmLabel={invitationDialog.confirmLabel}
        destructive={invitationDialog.destructive}
        submitting={isMutating}
        onCancel={() => setPendingResponse(undefined)}
        onConfirm={() => {
          void confirmInvitationResponse();
        }}
      />

      <JoinRequestDialog
        targetClass={requestTarget}
        message={requestMessage}
        error={requestError}
        submitting={isMutating}
        onMessageChange={setRequestMessage}
        onCancel={() => {
          if (!isMutating) {
            setRequestTarget(undefined);
            setRequestMessage("");
            setRequestError(null);
          }
        }}
        onSubmit={() => {
          void submitJoinRequest();
        }}
      />
    </ProfileScreenShell>
  );
}

function MyClassesTab({
  memberships,
  isLoading,
  isMutating,
  error,
  onRetry,
  onAccept,
  onDecline,
}: {
  memberships: StudentClassMembership[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  onRetry: () => void | Promise<void>;
  onAccept: (membership: StudentClassMembership) => void;
  onDecline: (membership: StudentClassMembership) => void;
}) {
  const invitations = memberships.filter(
    (membership) => membership.membershipStatus === "invited",
  );
  const requests = memberships.filter(
    (membership) => membership.membershipStatus === "requested",
  );
  const activeClasses = memberships.filter(
    (membership) => membership.membershipStatus === "active",
  );

  if (isLoading && memberships.length === 0) {
    return <LoadingState label="Chargement des classes…" />;
  }

  if (error) {
    return (
      <StateCard title="Mes classes indisponibles" text={error}>
        <SmallButton
          label="Réessayer"
          onPress={() => {
            void onRetry();
          }}
        />
      </StateCard>
    );
  }

  if (memberships.length === 0) {
    return (
      <StateCard
        title="Aucune classe rejointe"
        text="Les invitations envoyées par un professeur apparaîtront ici."
      />
    );
  }

  return (
    <View style={styles.groups}>
      {invitations.length > 0 ? (
        <ClassGroup title="Invitations reçues">
          {invitations.map((membership) => (
            <MembershipCard
              key={membership.membershipId}
              membership={membership}
              footer={`Invitée le ${formatDate(membership.invitedAt)}`}
              actions={
                <View style={styles.actions}>
                  <SmallButton label="Accepter" disabled={isMutating} onPress={() => onAccept(membership)} primary />
                  <SmallButton label="Refuser" disabled={isMutating} onPress={() => onDecline(membership)} destructive />
                </View>
              }
            />
          ))}
        </ClassGroup>
      ) : null}

      {requests.length > 0 ? (
        <ClassGroup title="Demandes envoyées">
          {requests.map((membership) => (
            <MembershipCard
              key={membership.membershipId}
              membership={membership}
              footer={`En attente de validation · demandée le ${formatDate(membership.requestedAt)}`}
            />
          ))}
        </ClassGroup>
      ) : null}

      <ClassGroup title="Classes rejointes">
        {activeClasses.length === 0 ? (
          <StateCard
            title="Aucune classe rejointe"
            text="Les invitations acceptées et demandes validées apparaîtront ici."
            compact
          />
        ) : (
          activeClasses.map((membership) => (
            <MembershipCard
              key={membership.membershipId}
              membership={membership}
              footer={`Rejointe le ${formatDate(membership.joinedAt ?? membership.respondedAt)}`}
              onOpen={() =>
                router.push(
                  `/student/class/${membership.classId}` as Href,
                )
              }
            />
          ))
        )}
      </ClassGroup>
    </View>
  );
}

function DiscoverClassesTab({
  searchTerm,
  classes,
  isLoading,
  isMutating,
  error,
  onSearchChange,
  onRetry,
  onRefresh,
  onOpenMyClasses,
  onRequestJoin,
}: {
  searchTerm: string;
  classes: DiscoverableClass[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  onSearchChange: (value: string) => void;
  onRetry: () => void;
  onRefresh: () => void;
  onOpenMyClasses: () => void;
  onRequestJoin: (targetClass: DiscoverableClass) => void;
}) {
  return (
    <View style={styles.groups}>
      <View style={styles.searchBlock}>
        <TextInput
          accessibilityLabel="Rechercher une classe ou un professeur"
          value={searchTerm}
          onChangeText={onSearchChange}
          placeholder="Rechercher une classe ou un professeur"
          placeholderTextColor={HOME_COLORS.textMuted}
          style={styles.searchInput}
        />
        <SmallButton label="Actualiser" disabled={isLoading} onPress={onRefresh} />
      </View>

      {isLoading && classes.length === 0 ? (
        <LoadingState label="Chargement de l’annuaire…" />
      ) : error ? (
        <StateCard title="Annuaire indisponible" text={error}>
          <SmallButton label="Réessayer" disabled={isLoading} onPress={onRetry} />
        </StateCard>
      ) : classes.length === 0 ? (
        <StateCard
          title="Aucune classe trouvée"
          text="Essaie un autre nom ou reviens plus tard."
        />
      ) : (
        <View style={styles.list}>
          {classes.map((discoverableClass) => (
            <DiscoverableClassCard
              key={discoverableClass.id}
              discoverableClass={discoverableClass}
              disabled={isMutating}
              onOpenMyClasses={onOpenMyClasses}
              onRequestJoin={() => onRequestJoin(discoverableClass)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function DiscoverableClassCard({
  discoverableClass,
  disabled,
  onOpenMyClasses,
  onRequestJoin,
}: {
  discoverableClass: DiscoverableClass;
  disabled: boolean;
  onOpenMyClasses: () => void;
  onRequestJoin: () => void;
}) {
  const status = discoverableClass.membershipStatus;
  const buttonLabel =
    status === "requested"
      ? "Demande envoyée"
      : status === "invited"
        ? "Invitation reçue"
        : status === "active"
          ? "Déjà membre"
          : "Demander à participer";
  const buttonDisabled = disabled || status === "requested" || status === "active";

  return (
    <View style={styles.classCard}>
      <View style={styles.heading}>
        <Text style={styles.className} numberOfLines={2}>
          {discoverableClass.name}
        </Text>
        <Text style={styles.classDescription} numberOfLines={3}>
          {discoverableClass.description || "Aucune description ajoutée."}
        </Text>
        <Text style={styles.meta}>
          {discoverableClass.teacherName} · {discoverableClass.language} ·{" "}
          {discoverableClass.variety} · {discoverableClass.level ?? "Niveau non défini"}
        </Text>
        <Text style={styles.meta}>
          {discoverableClass.activeMemberCount} membre
          {discoverableClass.activeMemberCount === 1 ? "" : "s"} actif
          {discoverableClass.activeMemberCount === 1 ? "" : "s"}
        </Text>
      </View>
      <SmallButton
        label={buttonLabel}
        disabled={buttonDisabled}
        primary={!status}
        onPress={status === "invited" ? onOpenMyClasses : onRequestJoin}
      />
    </View>
  );
}

function MembershipCard({
  membership,
  footer,
  actions,
  onOpen,
}: {
  membership: StudentClassMembership;
  footer: string;
  actions?: ReactNode;
  onOpen?: () => void;
}) {
  const content = (
    <>
      <View style={styles.heading}>
        <Text style={styles.className} numberOfLines={2}>
          {membership.className}
        </Text>
        {membership.classDescription ? (
          <Text style={styles.classDescription} numberOfLines={3}>
            {membership.classDescription}
          </Text>
        ) : null}
        <Text style={styles.meta}>
          {membership.teacherName} · {membership.language} · {membership.variety} ·{" "}
          {membership.level ?? "Niveau non défini"}
        </Text>
        <Text style={styles.meta}>{footer}</Text>
      </View>
      {actions}
      {onOpen ? (
        <View style={styles.openRow}>
          <Text style={styles.openLabel}>Voir la classe</Text>
          <IconSymbol
            name="chevron.right"
            size={18}
            color={HOME_COLORS.accent}
          />
        </View>
      ) : null}
    </>
  );

  return onOpen ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir la classe ${membership.className}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.classCard, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={styles.classCard}>{content}</View>
  );
}

function JoinRequestDialog({
  targetClass,
  message,
  error,
  submitting,
  onMessageChange,
  onCancel,
  onSubmit,
}: {
  targetClass?: DiscoverableClass;
  message: string;
  error: string | null;
  submitting: boolean;
  onMessageChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal
      visible={Boolean(targetClass)}
      transparent
      animationType="fade"
      onRequestClose={submitting ? undefined : onCancel}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Annuler la demande de participation"
          disabled={submitting}
          onPress={onCancel}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Demander à rejoindre cette classe ?</Text>
          <Text style={styles.modalText}>
            Le professeur recevra ta demande et pourra l’accepter ou la refuser.
          </Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Message au professeur</Text>
            <TextInput
              accessibilityLabel="Message au professeur"
              value={message}
              onChangeText={onMessageChange}
              placeholder="Message facultatif"
              placeholderTextColor={HOME_COLORS.textMuted}
              multiline
              maxLength={240}
              style={[styles.searchInput, styles.messageInput]}
            />
            <Text style={styles.counter}>{message.length}/240</Text>
          </View>
          {error ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {error}
            </Text>
          ) : null}
          <View style={styles.modalActions}>
            <SmallButton label="Annuler" disabled={submitting} onPress={onCancel} />
            <SmallButton
              label={submitting ? "Envoi…" : "Envoyer la demande"}
              disabled={submitting}
              onPress={onSubmit}
              primary
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ClassGroup({
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

function TabButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        selected && styles.tabButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.tabText, selected && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function StateCard({
  title,
  text,
  compact = false,
  children,
}: {
  title: string;
  text: string;
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <View style={[styles.stateCard, compact && styles.compactStateCard]}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateText}>{text}</Text>
      {children}
    </View>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <View style={styles.stateCard}>
      <ActivityIndicator color={HOME_COLORS.accent} />
      <Text style={styles.stateText}>{label}</Text>
    </View>
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
        primary && styles.primaryButton,
        destructive && styles.destructiveButton,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.smallButtonText,
          primary && styles.primaryButtonText,
          destructive && styles.destructiveText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 6 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 30, fontWeight: "900" },
  subtitle: { color: HOME_COLORS.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 21 },
  tabs: { flexDirection: "row", gap: 6, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 4 },
  tabButton: { minHeight: 44, flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 8, paddingHorizontal: 8 },
  tabButtonActive: { backgroundColor: HOME_COLORS.accentSoft },
  tabText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "900" },
  tabTextActive: { color: HOME_COLORS.accent },
  notice: { gap: 4, borderWidth: 1, borderColor: HOME_COLORS.accent, borderRadius: 12, backgroundColor: HOME_COLORS.accentSoft, padding: 13 },
  noticeTitle: { color: HOME_COLORS.textPrimary, fontSize: 14, fontWeight: "900" },
  noticeText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  groups: { gap: 14 },
  group: { gap: 8 },
  groupTitle: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  list: { gap: 8 },
  searchBlock: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  searchInput: { minHeight: 48, minWidth: 0, flex: 1, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, color: HOME_COLORS.textPrimary, fontSize: 14, paddingHorizontal: 12 },
  stateCard: { gap: 8, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  compactStateCard: { backgroundColor: HOME_COLORS.surface, padding: 13 },
  stateTitle: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  stateText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  classCard: { gap: 9, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 15 },
  heading: { minWidth: 0, flex: 1, gap: 4 },
  className: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  classDescription: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  meta: { color: HOME_COLORS.accentMuted, fontSize: 12, fontWeight: "800", lineHeight: 18 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  openRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 3, paddingTop: 2 },
  openLabel: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  smallButton: { minHeight: 44, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 9, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 11 },
  primaryButton: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  destructiveButton: { borderColor: "#8e4654" },
  smallButtonText: { color: HOME_COLORS.textPrimary, fontSize: 11, fontWeight: "900" },
  primaryButtonText: { color: HOME_COLORS.ink },
  destructiveText: { color: "#ffb4c0" },
  modalRoot: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(7, 17, 31, 0.84)", padding: 16 },
  modalCard: { width: "100%", maxWidth: 520, gap: 12, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 18, backgroundColor: HOME_COLORS.card, padding: 18 },
  modalTitle: { color: HOME_COLORS.textPrimary, fontSize: 20, fontWeight: "900" },
  modalText: { color: HOME_COLORS.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 21 },
  field: { gap: 6 },
  fieldLabel: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "800" },
  messageInput: { minHeight: 92, textAlignVertical: "top", paddingTop: 12, paddingBottom: 12 },
  counter: { alignSelf: "flex-end", color: HOME_COLORS.textMuted, fontSize: 11, fontWeight: "800" },
  errorText: { color: "#ffb4c0", fontSize: 13, fontWeight: "800", lineHeight: 19 },
  modalActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 8 },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
