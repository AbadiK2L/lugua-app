import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";
import { getSingleParam } from "@/src/components/teacher/assignments/assignmentUtils";
import { TeacherClassAssignmentsSection } from "@/src/components/teacher/classes/TeacherClassAssignmentsSection";
import { TeacherClassCoursesSection } from "@/src/components/teacher/classes/TeacherClassCoursesSection";
import { TeacherClassFormModal } from "@/src/components/teacher/classes/TeacherClassFormModal";
import { TeacherClassMembersSection } from "@/src/components/teacher/classes/TeacherClassMembersSection";
import { TeacherClassSettingsSection } from "@/src/components/teacher/classes/TeacherClassSettingsSection";
import { TeacherClassSummaryCard } from "@/src/components/teacher/classes/TeacherClassSummaryCard";
import { TeacherScreenShell } from "@/src/components/teacher/TeacherScreenShell";
import { useTeacherAssignments } from "@/src/contexts/TeacherAssignmentsContext";
import { useTeacherClasses } from "@/src/contexts/TeacherClassesContext";
import { useTeacherCourseDrafts } from "@/src/contexts/TeacherCourseDraftsContext";
import type { CreateTeacherClassInput } from "@/src/types/teacher";

type ClassDetailParams = {
  classId?: string | string[];
  notice?: string | string[];
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function TeacherClassDetailScreen() {
  const params = useLocalSearchParams<ClassDetailParams>();
  const classId = getParam(params.classId);
  const { assignments } = useTeacherAssignments();
  const { getClassById, updateClass, archiveClass, restoreClass, deleteClass, addStudent, updateStudent, removeStudent, regenerateInviteCode, assignCourseDraft, unassignCourseDraft } = useTeacherClasses();
  const { drafts } = useTeacherCourseDrafts();
  const teacherClass = classId ? getClassById(classId) : undefined;
  const classAssignments = assignments.filter(
    (assignment) => assignment.classId === classId,
  );
  const [editVisible, setEditVisible] = useState(false);
  const [notice, setNotice] = useState<string | undefined>();

  useEffect(() => {
    if (getParam(params.notice) === "created") {
      setNotice("Classe créée · Cette classe est conservée uniquement pendant la session de démonstration.");
    }
  }, [params.notice]);

  if (!teacherClass) {
    return (
      <TeacherScreenShell hideBottomNavigation>
        <View style={styles.notFound}>
          <Text style={styles.eyebrow}>ESPACE PROFESSEUR</Text>
          <Text style={styles.title}>Classe introuvable</Text>
          <Text style={styles.subtitle}>
            Cette classe n’existe pas ou n’est plus disponible dans cette session.
          </Text>
          <ActionButton label="Retour aux classes" onPress={() => router.replace("/teacher/classes")} primary />
        </View>
      </TeacherScreenShell>
    );
  }

  const currentClass = teacherClass;

  function updateClassFromForm(input: CreateTeacherClassInput) {
    updateClass(currentClass.id, input);
    setEditVisible(false);
    setNotice("Classe modifiée · Les changements restent locaux pendant cette session.");
  }

  function confirmArchive() {
    if (currentClass.status === "archived") {
      Alert.alert("Restaurer cette classe ?", "Elle redeviendra active.", [
        { text: "Annuler", style: "cancel" },
        { text: "Restaurer", onPress: () => restoreClass(currentClass.id) },
      ]);
      return;
    }

    Alert.alert("Archiver cette classe ?", "Elle restera accessible dans le filtre Archivées.", [
      { text: "Annuler", style: "cancel" },
      { text: "Archiver", onPress: () => archiveClass(currentClass.id) },
    ]);
  }

  function confirmRegenerateCode() {
    Alert.alert("Régénérer le code d’invitation ?", "L’ancien code ne sera plus affiché dans cette session.", [
      { text: "Annuler", style: "cancel" },
      { text: "Régénérer", onPress: () => regenerateInviteCode(currentClass.id) },
    ]);
  }

  function confirmDelete() {
    Alert.alert(
      "Supprimer définitivement cette classe de la session ?",
      "Les élèves et les attributions locales de cette classe seront supprimés. Les brouillons de cours resteront disponibles.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            deleteClass(currentClass.id);
            router.replace("/teacher/classes");
          },
        },
      ],
    );
  }

  return (
    <TeacherScreenShell hideBottomNavigation>
      <View style={styles.topLine}>
        <Pressable accessibilityRole="button" accessibilityLabel="Retour aux classes" onPress={() => router.replace("/teacher/classes")} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Text style={styles.backText}>← Retour</Text>
        </Pressable>
        <Text style={[styles.status, currentClass.status === "archived" && styles.archivedStatus]}>
          {currentClass.status === "active" ? "Active" : "Archivée"}
        </Text>
      </View>

      {notice ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Fermer le message de classe" onPress={() => setNotice(undefined)} style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
        </Pressable>
      ) : null}

      <TeacherClassSummaryCard teacherClass={currentClass} />

      <View style={styles.headerActions}>
        <ActionButton label="Modifier" onPress={() => setEditVisible(true)} primary />
        <ActionButton label={currentClass.status === "active" ? "Archiver" : "Restaurer"} onPress={confirmArchive} />
      </View>

      <TeacherClassMembersSection
        students={currentClass.students}
        onAddStudent={(input) => addStudent(currentClass.id, input)}
        onUpdateStudent={(studentId, updates) => updateStudent(currentClass.id, studentId, updates)}
        onRemoveStudent={(studentId) => removeStudent(currentClass.id, studentId)}
      />
      <TeacherClassCoursesSection
        assignedDraftIds={currentClass.assignedCourseDraftIds}
        drafts={drafts}
        onAssign={(draftId) => assignCourseDraft(currentClass.id, draftId)}
        onUnassign={(draftId) => unassignCourseDraft(currentClass.id, draftId)}
        onGoToCourses={() => router.push({ pathname: "/teacher/courses", params: { mode: "my_courses" } })}
      />
      <TeacherClassAssignmentsSection
        assignments={classAssignments}
        onCreate={() =>
          router.push({
            pathname: "/teacher/assignment-builder",
            params: { classId: currentClass.id },
          })
        }
        onOpen={(assignmentId) => {
          const normalizedAssignmentId = getSingleParam(assignmentId);
          if (!normalizedAssignmentId) {
            setNotice(
              "Devoir introuvable · Ce devoir n’est plus disponible dans cette session.",
            );
            return;
          }
          router.push({
            pathname: "/teacher/assignment/[assignmentId]",
            params: { assignmentId: normalizedAssignmentId },
          });
        }}
      />
      <TeacherClassSettingsSection
        teacherClass={currentClass}
        onEdit={() => setEditVisible(true)}
        onRegenerateCode={confirmRegenerateCode}
        onArchive={confirmArchive}
        onRestore={confirmArchive}
        onDelete={confirmDelete}
      />

      <TeacherClassFormModal
        visible={editVisible}
        mode="edit"
        initialClass={currentClass}
        onClose={() => setEditVisible(false)}
        onSubmit={updateClassFromForm}
      />
    </TeacherScreenShell>
  );
}

function ActionButton({ label, onPress, primary = false }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.actionButton, primary && styles.primaryButton, pressed && styles.pressed]}>
      <Text style={[styles.actionText, primary && styles.primaryActionText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topLine: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  backButton: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 4 },
  backText: { color: HOME_COLORS.accent, fontSize: 14, fontWeight: "800" },
  status: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  archivedStatus: { color: HOME_COLORS.textMuted },
  notice: { borderWidth: 1, borderColor: HOME_COLORS.accent, borderRadius: 12, backgroundColor: HOME_COLORS.accentSoft, padding: 13 },
  noticeText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "800", lineHeight: 19 },
  headerActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  notFound: { gap: 10, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 18 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 12, fontWeight: "900" },
  title: { color: HOME_COLORS.textPrimary, fontSize: 28, fontWeight: "900" },
  subtitle: { color: HOME_COLORS.textSecondary, fontSize: 15, fontWeight: "600", lineHeight: 22 },
  actionButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  primaryButton: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  actionText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  primaryActionText: { color: HOME_COLORS.ink },
  pressed: { opacity: 0.78 },
});
