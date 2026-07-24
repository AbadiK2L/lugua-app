import { router } from "expo-router";
import { Alert } from "react-native";

import { languageOptions } from "@/src/components/home/LanguageSelector";
import { ProfileScreenShell } from "@/src/components/profile/ProfileScreenShell";
import { TeacherProfileContent } from "@/src/components/profile/TeacherProfileContent";
import { useLanguageSelection } from "@/src/contexts/LanguageSelectionContext";
import { useSessionPreview } from "@/src/contexts/SessionPreviewContext";
import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";

export default function TeacherProfileScreen() {
  const { clearSession } = useSessionPreview();
  const { selectedLanguage, setSelectedLanguage } = useLanguageSelection();
  const selectedLanguageOption =
    languageOptions.find((option) => option.id === selectedLanguage) ?? languageOptions[0];
  const languageLabel = shikomoriQuestionsA1Path.language.name;
  const currentVariety =
    selectedLanguage === "shikomori"
      ? selectedLanguageOption.detail
      : selectedLanguageOption.label;

  function showAlert(title: string, message: string) {
    Alert.alert(title, message);
  }

  function exitDemo() {
    Alert.alert(
      "Quitter le mode de démonstration ?",
      "Tu reviendras à l’écran de sélection du rôle.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Quitter",
          style: "destructive",
          onPress: () => {
            clearSession();
            router.replace("/auth/welcome");
          },
        },
      ],
    );
  }

  const actions = {
    onEditProfile: () =>
      showAlert("Modification du profil", "Cette fonction sera disponible prochainement."),
    onExitDemo: exitDemo,
    onOpenNotifications: () =>
      showAlert("Notifications", "Les alertes liées aux classes, élèves et devoirs seront disponibles prochainement."),
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
      showAlert("Mes classes", "La gestion des classes sera disponible prochainement."),
    onOpenStudents: () =>
      showAlert("Mes élèves", "Le suivi des élèves sera disponible prochainement."),
    onCreateAssignment: () =>
      showAlert("Créer un devoir", "La création et l’attribution de devoirs seront disponibles prochainement."),
    onOpenAssignments: () =>
      showAlert("Mes devoirs", "Aucun devoir n’a encore été créé."),
    onOpenContent: () =>
      showAlert("Mes contenus", "La création de contenus pédagogiques sera disponible prochainement."),
    onOpenStudentTracking: () =>
      showAlert("Suivi des élèves", "Les statistiques et la progression des élèves seront disponibles prochainement."),
    onSendAnnouncement: () =>
      showAlert("Envoyer une annonce", "La communication avec les classes sera disponible prochainement."),
    onAddResource: () =>
      showAlert("Ajouter une ressource", "L’ajout de documents, d’audios et de vidéos sera disponible prochainement."),
  };

  return (
    <ProfileScreenShell fallbackHref="/teacher">
      <TeacherProfileContent
        languageLabel={languageLabel}
        selectedLanguage={selectedLanguage}
        currentVariety={currentVariety}
        onChangeLanguage={setSelectedLanguage}
        actions={actions}
      />
    </ProfileScreenShell>
  );
}
