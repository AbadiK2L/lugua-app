import { useEffect, useState } from "react";
import {
  Alert,
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
import type {
  CreateTeacherStudentInput,
  TeacherStudent,
  TeacherStudentStatus,
  UpdateTeacherStudentInput,
} from "@/src/types/teacher";

type TeacherClassMembersSectionProps = {
  students: TeacherStudent[];
  onAddStudent: (input: CreateTeacherStudentInput) => void;
  onUpdateStudent: (studentId: string, updates: UpdateTeacherStudentInput) => void;
  onRemoveStudent: (studentId: string) => void;
};

export function TeacherClassMembersSection({
  students,
  onAddStudent,
  onUpdateStudent,
  onRemoveStudent,
}: TeacherClassMembersSectionProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<TeacherStudent | undefined>();

  function openCreate() {
    setEditingStudent(undefined);
    setModalVisible(true);
  }

  function openEdit(student: TeacherStudent) {
    setEditingStudent(student);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingStudent(undefined);
  }

  function submitStudent(input: CreateTeacherStudentInput) {
    if (editingStudent) {
      onUpdateStudent(editingStudent.id, input);
    } else {
      onAddStudent(input);
    }
    closeModal();
  }

  function confirmRemove(student: TeacherStudent) {
    Alert.alert(
      "Retirer cet élève ?",
      `${student.displayName} sera retiré de cette classe pendant la session actuelle.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: () => onRemoveStudent(student.id),
        },
      ],
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.heading}>
          <Text style={styles.sectionTitle}>Élèves</Text>
          <Text style={styles.sectionMeta}>{students.length} élève{students.length === 1 ? "" : "s"}</Text>
        </View>
        <ActionButton label="Ajouter un élève" onPress={openCreate} primary />
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aucun élève ajouté</Text>
          <Text style={styles.emptyText}>
            Ajoute manuellement un élève pour préparer la gestion de classe.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {students.map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentCopy}>
                <Text style={styles.studentName}>{student.displayName}</Text>
                {student.email ? <Text style={styles.studentEmail}>{student.email}</Text> : null}
                <Text style={styles.studentStatus}>{student.status === "active" ? "Actif" : "Invité"}</Text>
              </View>
              <View style={styles.studentActions}>
                <SmallButton label="Modifier" onPress={() => openEdit(student)} />
                <SmallButton label="Retirer" onPress={() => confirmRemove(student)} destructive />
              </View>
            </View>
          ))}
        </View>
      )}

      <TeacherStudentFormModal
        visible={modalVisible}
        student={editingStudent}
        onClose={closeModal}
        onSubmit={submitStudent}
      />
    </View>
  );
}

function TeacherStudentFormModal({
  visible,
  student,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  student?: TeacherStudent;
  onClose: () => void;
  onSubmit: (input: CreateTeacherStudentInput) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<TeacherStudentStatus>("active");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDisplayName(student?.displayName ?? "");
    setEmail(student?.email ?? "");
    setStatus(student?.status ?? "active");
    setError(undefined);
  }, [student, visible]);

  function submit() {
    if (!displayName.trim()) {
      setError("Ajoute le nom de l’élève.");
      return;
    }

    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Vérifie le format de l’e-mail.");
      return;
    }

    onSubmit({
      displayName: displayName.trim(),
      email: email.trim() || undefined,
      status,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le formulaire élève"
          onPress={onClose}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>{student ? "MODIFIER UN ÉLÈVE" : "AJOUTER UN ÉLÈVE"}</Text>
              <Text style={styles.modalTitle}>{student ? "Modifier l’élève" : "Ajouter un élève"}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
            <Field label="Nom affiché" value={displayName} onChangeText={setDisplayName} placeholder="Ex. Nassim Ali" />
            <Field label="E-mail (facultatif)" value={email} onChangeText={setEmail} placeholder="nom@exemple.com" keyboardType="email-address" />
            <View style={styles.field}>
              <Text style={styles.label}>Statut</Text>
              <View style={styles.choiceList}>
                <Choice label="Actif" selected={status === "active"} onPress={() => setStatus("active")} />
                <Choice label="Invité" selected={status === "invited"} onPress={() => setStatus("invited")} />
              </View>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.formActions}>
              <ActionButton label="Annuler" onPress={onClose} />
              <ActionButton label={student ? "Enregistrer" : "Ajouter l’élève"} onPress={submit} primary />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={HOME_COLORS.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        style={styles.input}
      />
    </View>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.choice, selected && styles.selectedChoice, pressed && styles.pressed]}
    >
      <Text style={[styles.choiceText, selected && styles.selectedChoiceText]}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({ label, onPress, primary = false }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.actionButton, primary && styles.primaryButton, pressed && styles.pressed]}>
      <Text style={[styles.actionText, primary && styles.primaryActionText]}>{label}</Text>
    </Pressable>
  );
}

function SmallButton({ label, onPress, destructive = false }: { label: string; onPress: () => void; destructive?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.smallButton, destructive && styles.destructiveButton, pressed && styles.pressed]}>
      <Text style={[styles.smallButtonText, destructive && styles.destructiveText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  heading: { flex: 1, gap: 3 },
  sectionTitle: { color: HOME_COLORS.textPrimary, fontSize: 19, fontWeight: "900" },
  sectionMeta: { color: HOME_COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  emptyState: { gap: 7, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 14, backgroundColor: HOME_COLORS.card, padding: 16 },
  emptyTitle: { color: HOME_COLORS.textPrimary, fontSize: 16, fontWeight: "900" },
  emptyText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 19 },
  list: { gap: 8 },
  studentCard: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 12, backgroundColor: HOME_COLORS.surface, padding: 12 },
  studentCopy: { flex: 1, gap: 2 },
  studentName: { color: HOME_COLORS.textPrimary, fontSize: 15, fontWeight: "900" },
  studentEmail: { color: HOME_COLORS.textSecondary, fontSize: 12, fontWeight: "600" },
  studentStatus: { color: HOME_COLORS.accentMuted, fontSize: 11, fontWeight: "800" },
  studentActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 5 },
  smallButton: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 9, paddingHorizontal: 9 },
  destructiveButton: { borderColor: "#8e4654" },
  smallButtonText: { color: HOME_COLORS.textPrimary, fontSize: 11, fontWeight: "800" },
  destructiveText: { color: "#ffb4c0" },
  modalRoot: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(7, 17, 31, 0.84)", padding: 16 },
  modalCard: { width: "100%", maxWidth: 520, maxHeight: "88%", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 18, backgroundColor: HOME_COLORS.card, padding: 18 },
  modalHeader: { minHeight: 48, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  eyebrow: { color: HOME_COLORS.accent, fontSize: 11, fontWeight: "900", letterSpacing: 0.6 },
  modalTitle: { color: HOME_COLORS.textPrimary, fontSize: 21, fontWeight: "900" },
  closeButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  closeText: { color: HOME_COLORS.textSecondary, fontSize: 28, lineHeight: 30 },
  form: { gap: 12, paddingBottom: 4 },
  field: { gap: 6 },
  label: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "800" },
  input: { minHeight: 48, borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, color: HOME_COLORS.textPrimary, fontSize: 14, paddingHorizontal: 12 },
  choiceList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  choice: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 12 },
  selectedChoice: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accentSoft },
  choiceText: { color: HOME_COLORS.textSecondary, fontSize: 13, fontWeight: "800" },
  selectedChoiceText: { color: HOME_COLORS.accent },
  errorText: { color: "#ffb4c0", fontSize: 13, fontWeight: "800", lineHeight: 19 },
  formActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 8 },
  actionButton: { minHeight: 46, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: HOME_COLORS.border, borderRadius: 10, backgroundColor: HOME_COLORS.surface, paddingHorizontal: 14 },
  primaryButton: { borderColor: HOME_COLORS.accent, backgroundColor: HOME_COLORS.accent },
  actionText: { color: HOME_COLORS.textPrimary, fontSize: 13, fontWeight: "900" },
  primaryActionText: { color: HOME_COLORS.ink },
  pressed: { opacity: 0.78 },
});
