import { LanguageSelector } from "@/src/components/home/LanguageSelector";
import { ProfileAccountSection } from "@/src/components/profile/ProfileAccountSection";
import { ProfileIdentityCard } from "@/src/components/profile/ProfileIdentityCard";
import { ProfileMenuRow } from "@/src/components/profile/ProfileMenuRow";
import { ProfileProgressCard } from "@/src/components/profile/ProfileProgressCard";
import { ProfileSection } from "@/src/components/profile/ProfileSection";
import type { LanguageSelectionId } from "@/src/components/home/LanguageSelector";
import type { StudentProfileActions } from "@/src/types/profile";
import { StyleSheet, View } from "react-native";

type StudentProfileContentProps = {
  languageLabel: string;
  selectedLanguage: LanguageSelectionId;
  currentVariety: string;
  conceptCount: number;
  currentLevel: string;
  onChangeLanguage: (language: LanguageSelectionId) => void;
  actions: StudentProfileActions;
};

export function StudentProfileContent({
  languageLabel,
  selectedLanguage,
  currentVariety,
  conceptCount,
  currentLevel,
  onChangeLanguage,
  actions,
}: StudentProfileContentProps) {
  return (
    <View style={styles.content}>
      <ProfileIdentityCard
        title="Mon profil"
        subtitle={`Élève · ${languageLabel}`}
        role="student"
        onPressEdit={actions.onEditProfile}
      />

      <ProfileProgressCard
        rows={[
          { label: "Niveau actuel", value: currentLevel },
          {
            label: "Notions disponibles",
            value: conceptCount > 0 ? String(conceptCount) : "Aucune",
          },
          { label: "Leçons terminées", value: "—" },
          { label: "Série", value: "—" },
        ]}
      />

      <ProfileSection title="Mon apprentissage">
        <ProfileMenuRow
          icon="book.fill"
          label="Mes leçons"
          value={conceptCount > 0 ? `${conceptCount} notions` : "Aucune"}
          onPress={actions.onOpenLessons}
          accessibilityHint="Ouvre la première leçon disponible ou les scénarios"
          isLast={false}
        />
        <ProfileMenuRow
          icon="doc.text.fill"
          label="Mes devoirs"
          value="Aucun"
          onPress={actions.onOpenAssignments}
          accessibilityHint="Affiche l’état des devoirs"
          isLast={false}
        />
        <ProfileMenuRow
          icon="bubble.left.fill"
          label="Entraînement IA"
          value="Bientôt"
          onPress={actions.onOpenAiTraining}
          accessibilityHint="Affiche la disponibilité de l’entraînement IA"
          isLast={false}
        />
        <ProfileMenuRow
          icon="bookmark.fill"
          label="Mots enregistrés"
          value="Aucun"
          onPress={actions.onOpenSavedWords}
          accessibilityHint="Affiche la disponibilité des favoris"
          isLast
        />
      </ProfileSection>

      <ProfileSection title="Préférences">
        <ProfileMenuRow
          icon="book.fill"
          label="Langue étudiée"
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
          icon="speaker.wave.2.fill"
          label="Audio et sous-titres"
          value="Bientôt"
          onPress={actions.onOpenAudioSettings}
          accessibilityHint="Affiche la disponibilité des réglages audio"
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
});
