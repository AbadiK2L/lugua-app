import { useState } from "react";
import { Alert } from "react-native";

import { languageOptions } from "@/src/components/home/LanguageSelector";
import { ProfileEditDialog } from "@/src/components/profile/ProfileEditDialog";
import { ProfileScreenShell } from "@/src/components/profile/ProfileScreenShell";
import { ProfileSignOutDialog } from "@/src/components/profile/ProfileSignOutDialog";
import { TeacherProfileContent } from "@/src/components/profile/TeacherProfileContent";
import { useAuthSession } from "@/src/contexts/AuthSessionContext";
import { useLanguageSelection } from "@/src/contexts/LanguageSelectionContext";
import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";
import { getPreferenceFromLanguageSelection } from "@/src/utils/languagePreference";

export default function TeacherProfileScreen() {
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
      ? shikomoriQuestionsA1Path.language.name
      : (profile?.preferredLanguage ??
        shikomoriQuestionsA1Path.language.name);
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
        "Les alertes liées aux classes, élèves et devoirs seront disponibles prochainement.",
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
    onOpenClasses: () =>
      showAlert(
        "Mes classes",
        "La gestion des classes sera disponible prochainement.",
      ),
    onOpenStudents: () =>
      showAlert(
        "Mes élèves",
        "Le suivi des élèves sera disponible prochainement.",
      ),
    onCreateAssignment: () =>
      showAlert(
        "Créer un devoir",
        "La création et l’attribution de devoirs seront disponibles prochainement.",
      ),
    onOpenAssignments: () =>
      showAlert("Mes devoirs", "Aucun devoir n’a encore été créé."),
    onOpenContent: () =>
      showAlert(
        "Mes contenus",
        "La création de contenus pédagogiques sera disponible prochainement.",
      ),
    onOpenStudentTracking: () =>
      showAlert(
        "Suivi des élèves",
        "Les statistiques et la progression des élèves seront disponibles prochainement.",
      ),
    onSendAnnouncement: () =>
      showAlert(
        "Envoyer une annonce",
        "La communication avec les classes sera disponible prochainement.",
      ),
    onAddResource: () =>
      showAlert(
        "Ajouter une ressource",
        "L’ajout de documents, d’audios et de vidéos sera disponible prochainement.",
      ),
  };

  return (
    <ProfileScreenShell fallbackHref="/teacher">
      <TeacherProfileContent
        displayName={profile?.displayName ?? "Utilisateur Lugua"}
        languageLabel={languageLabel}
        selectedLanguage={selectedLanguage}
        currentVariety={currentVariety}
        statusMessage={statusMessage}
        onChangeLanguage={setSelectedLanguage}
        actions={actions}
      />

      <ProfileEditDialog
        visible={editVisible}
        initialDisplayName={profile?.displayName ?? "Utilisateur Lugua"}
        initialVariety={selectedLanguage}
        role="teacher"
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
