import { router } from "expo-router";
import { Alert } from "react-native";

import { languageOptions } from "@/src/components/home/LanguageSelector";
import { ProfileScreenShell } from "@/src/components/profile/ProfileScreenShell";
import { StudentProfileContent } from "@/src/components/profile/StudentProfileContent";
import { useLanguageSelection } from "@/src/contexts/LanguageSelectionContext";
import { useSessionPreview } from "@/src/contexts/SessionPreviewContext";
import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";
import { dictionaryEntries } from "@/src/data/dictionary";

const { chapter, language, level } = shikomoriQuestionsA1Path;
const conceptCount = chapter.blocks.reduce(
  (total, block) => total + block.concepts.length,
  0,
);
const firstAvailableLesson = dictionaryEntries.find((entry) => entry.lessonAvailable);

export default function StudentProfileScreen() {
  const { clearSession } = useSessionPreview();
  const { selectedLanguage, setSelectedLanguage } = useLanguageSelection();
  const selectedLanguageOption =
    languageOptions.find((option) => option.id === selectedLanguage) ?? languageOptions[0];
  const languageLabel = language.name;
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
      showAlert("Notifications", "Les rappels et alertes seront disponibles prochainement."),
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
      showAlert("Entraînement IA", "Cette fonction sera disponible prochainement."),
    onOpenSavedWords: () =>
      showAlert("Mots enregistrés", "Les favoris du dictionnaire seront disponibles prochainement."),
    onOpenAudioSettings: () =>
      showAlert("Audio et sous-titres", "Ces réglages seront disponibles prochainement."),
  };

  return (
    <ProfileScreenShell fallbackHref="/student">
      <StudentProfileContent
        languageLabel={languageLabel}
        selectedLanguage={selectedLanguage}
        currentVariety={currentVariety}
        conceptCount={conceptCount}
        currentLevel={level.level}
        onChangeLanguage={setSelectedLanguage}
        actions={actions}
      />
    </ProfileScreenShell>
  );
}
