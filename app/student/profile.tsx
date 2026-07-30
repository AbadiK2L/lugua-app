import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { languageOptions } from "@/src/components/home/LanguageSelector";
import { ProfileEditDialog } from "@/src/components/profile/ProfileEditDialog";
import { ProfileScreenShell } from "@/src/components/profile/ProfileScreenShell";
import { ProfileSignOutDialog } from "@/src/components/profile/ProfileSignOutDialog";
import { StudentProfileContent } from "@/src/components/profile/StudentProfileContent";
import { useAuthSession } from "@/src/contexts/AuthSessionContext";
import { useLanguageSelection } from "@/src/contexts/LanguageSelectionContext";
import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";
import { dictionaryEntries } from "@/src/data/dictionary";
import { getPreferenceFromLanguageSelection } from "@/src/utils/languagePreference";

const { chapter, language, level } = shikomoriQuestionsA1Path;
const conceptCount = chapter.blocks.reduce(
  (total, block) => total + block.concepts.length,
  0,
);
const firstAvailableLesson = dictionaryEntries.find(
  (entry) => entry.lessonAvailable,
);

export default function StudentProfileScreen() {
  const {
    profile,
    isSubmitting,
    signOut,
    updateProfile,
  } = useAuthSession();
  const { selectedLanguage, setSelectedLanguage } = useLanguageSelection();
  const [editVisible, setEditVisible] = useState(false);
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const selectedLanguageOption =
    languageOptions.find((option) => option.id === selectedLanguage) ??
    languageOptions[0];
  const languageLabel =
    profile?.preferredLanguage === "shikomori"
      ? language.name
      : (profile?.preferredLanguage ?? language.name);
  const currentVariety =
    selectedLanguage === "shikomori"
      ? selectedLanguageOption.detail
      : selectedLanguageOption.label;

  function showAlert(title: string, message: string) {
    Alert.alert(title, message);
  }

  async function saveProfile({
    displayName,
    variety,
  }: {
    displayName: string;
    variety: typeof selectedLanguage;
  }) {
    const result = await updateProfile({
      displayName,
      preferredVariety: getPreferenceFromLanguageSelection(variety),
    });

    if (result.ok) {
      setEditVisible(false);
      setStatusMessage("Ton profil a été mis à jour.");
    }

    return result;
  }

  async function confirmSignOut() {
    if (isSubmitting) {
      return;
    }

    setSignOutError(null);
    const result = await signOut();

    if (!result.ok) {
      setSignOutError(result.message);
    }
  }

  const actions = {
    onEditProfile: () => {
      setStatusMessage(null);
      setEditVisible(true);
    },
    onSignOut: () => {
      setSignOutError(null);
      setSignOutVisible(true);
    },
    onOpenNotifications: () =>
      showAlert(
        "Notifications",
        "Les rappels et alertes seront disponibles prochainement.",
      ),
    onOpenAbout: () =>
      showAlert(
        "À propos de Lugua",
        "Lugua est une application d’apprentissage des langues centrée sur les usages réels, les leçons, le dictionnaire et la compréhension orale.",
      ),
    onOpenSources: () =>
      showAlert(
        "Sources linguistiques",
        "Contenus actuels\nCurriculum local Lugua\n\nConnexion ORELC\nNon active\n\nLes futures données externes seront affichées avec leur source, leur statut de validation et leur variété linguistique.",
      ),
    onOpenPrivacy: () =>
      showAlert(
        "Confidentialité",
        "La politique de confidentialité complète sera ajoutée avant la publication de l’application.",
      ),
    onOpenLessons: () => {
      if (firstAvailableLesson?.conceptId) {
        router.push(`/lesson/${firstAvailableLesson.conceptId}`);
        return;
      }

      router.replace("/student/scenarios");
    },
    onOpenAssignments: () =>
      showAlert("Devoirs", "Aucun devoir disponible pour le moment."),
    onOpenAiTraining: () =>
      showAlert(
        "Entraînement IA",
        "Cette fonction sera disponible prochainement.",
      ),
    onOpenSavedWords: () =>
      showAlert(
        "Mots enregistrés",
        "Les favoris du dictionnaire seront disponibles prochainement.",
      ),
    onOpenAudioSettings: () =>
      showAlert(
        "Audio et sous-titres",
        "Ces réglages seront disponibles prochainement.",
      ),
  };

  return (
    <ProfileScreenShell fallbackHref="/student">
      <StudentProfileContent
        displayName={profile?.displayName ?? "Utilisateur Lugua"}
        languageLabel={languageLabel}
        selectedLanguage={selectedLanguage}
        currentVariety={currentVariety}
        conceptCount={conceptCount}
        currentLevel={level.level}
        statusMessage={statusMessage}
        onChangeLanguage={setSelectedLanguage}
        actions={actions}
      />

      <ProfileEditDialog
        visible={editVisible}
        initialDisplayName={profile?.displayName ?? "Utilisateur Lugua"}
        initialVariety={selectedLanguage}
        role="student"
        submitting={isSubmitting}
        onCancel={() => setEditVisible(false)}
        onSave={saveProfile}
      />

      <ProfileSignOutDialog
        visible={signOutVisible}
        submitting={isSubmitting}
        error={signOutError}
        onCancel={() => setSignOutVisible(false)}
        onConfirm={() => {
          void confirmSignOut();
        }}
      />
    </ProfileScreenShell>
  );
}
