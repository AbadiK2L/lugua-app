import { LanguageSelector } from "@/src/components/home/LanguageSelector";
import type { LanguageSelectionId } from "@/src/components/home/LanguageSelector";
import { ProfileAccountSection } from "@/src/components/profile/ProfileAccountSection";
import { ProfileIdentityCard } from "@/src/components/profile/ProfileIdentityCard";
import { ProfileMenuRow } from "@/src/components/profile/ProfileMenuRow";
import { ProfileSection } from "@/src/components/profile/ProfileSection";
import { TeacherOverviewCard } from "@/src/components/profile/TeacherOverviewCard";
import { StyleSheet, Text, View } from "react-native";
import type { TeacherProfileActions } from "@/src/types/profile";

type TeacherProfileContentProps = {
  displayName: string;
  languageLabel: string;
  selectedLanguage: LanguageSelectionId;
  currentVariety: string;
  statusMessage?: string | null;
  onChangeLanguage: (
    language: LanguageSelectionId,
  ) => void | Promise<unknown>;
  actions: TeacherProfileActions;
};

export function TeacherProfileContent({
  displayName,
  languageLabel,
  selectedLanguage,
  currentVariety,
  statusMessage,
  onChangeLanguage,
  actions,
}: TeacherProfileContentProps) {
  return (
    <View style={styles.content}>
      <ProfileIdentityCard
        title={displayName || "Utilisateur Lugua"}
        subtitle={`Professeur · ${languageLabel}`}
        role="teacher"
        onPressEdit={actions.onEditProfile}
      />

      {statusMessage ? (
        <Text
          accessibilityLiveRegion="polite"
          role="status"
          style={styles.status}
        >
          {statusMessage}
        </Text>
      ) : null}

      <TeacherOverviewCard
        rows={[
          { label: "Classes actives", value: "—" },
          { label: "Élèves", value: "—" },
          { label: "Devoirs publiés", value: "—" },
          { label: "Contenus créés", value: "—" },
        ]}
      />

      <ProfileSection title="Gestion pédagogique">
        <ProfileMenuRow
          icon="person.3.fill"
          label="Mes classes"
          value="Aucune"
          onPress={actions.onOpenClasses}
          accessibilityHint="Affiche la disponibilité de la gestion des classes"
          isLast={false}
        />
        <ProfileMenuRow
          icon="graduationcap.fill"
          label="Mes élèves"
          value="Aucun"
          onPress={actions.onOpenStudents}
          accessibilityHint="Affiche la disponibilité du suivi des élèves"
          isLast={false}
        />
        <ProfileMenuRow
          icon="doc.text.fill"
          label="Créer un devoir"
          value="Bientôt"
          onPress={actions.onCreateAssignment}
          accessibilityHint="Affiche la disponibilité de la création de devoirs"
          isLast={false}
        />
        <ProfileMenuRow
          icon="doc.text.fill"
          label="Mes devoirs"
          value="Aucun"
          onPress={actions.onOpenAssignments}
          accessibilityHint="Affiche la disponibilité des devoirs"
          isLast={false}
        />
        <ProfileMenuRow
          icon="books.vertical.fill"
          label="Mes contenus"
          value="Aucun"
          onPress={actions.onOpenContent}
          accessibilityHint="Affiche la disponibilité de la création de contenus"
          isLast
        />
      </ProfileSection>

      <ProfileSection title="Outils">
        <ProfileMenuRow
          icon="chart.bar.fill"
          label="Suivi des élèves"
          value="Bientôt"
          onPress={actions.onOpenStudentTracking}
          accessibilityHint="Affiche la disponibilité du suivi des élèves"
          isLast={false}
        />
        <ProfileMenuRow
          icon="megaphone.fill"
          label="Envoyer une annonce"
          value="Bientôt"
          onPress={actions.onSendAnnouncement}
          accessibilityHint="Affiche la disponibilité des annonces"
          isLast={false}
        />
        <ProfileMenuRow
          icon="plus.rectangle.fill"
          label="Ajouter une ressource"
          value="Bientôt"
          onPress={actions.onAddResource}
          accessibilityHint="Affiche la disponibilité de l’ajout de ressources"
          isLast
        />
      </ProfileSection>

      <ProfileSection title="Préférences">
        <ProfileMenuRow
          icon="book.fill"
          label="Langue enseignée"
          value={languageLabel}
          isLast={false}
        />
        <ProfileMenuRow
          icon="globe"
          label="Variété"
          value={currentVariety}
          trailing={
            <LanguageSelector
              value={selectedLanguage}
              onChange={onChangeLanguage}
            />
          }
          isLast={false}
        />
        <ProfileMenuRow
          icon="bell.fill"
          label="Notifications"
          value="Bientôt"
          onPress={actions.onOpenNotifications}
          accessibilityHint="Affiche la disponibilité des notifications"
          isLast
        />
      </ProfileSection>

      <ProfileAccountSection actions={actions} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
  status: {
    borderWidth: 1,
    borderColor: "#2f8052",
    borderRadius: 12,
    backgroundColor: "rgba(67, 209, 124, 0.12)",
    color: "#b9f0c9",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    padding: 13,
  },
});
