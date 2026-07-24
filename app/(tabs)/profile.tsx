import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { ProfileRolePreviewSwitch } from "@/src/components/profile/ProfileRolePreviewSwitch";
import { StudentProfileContent } from "@/src/components/profile/StudentProfileContent";
import { TeacherProfileContent } from "@/src/components/profile/TeacherProfileContent";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";
import { useLanguageSelection } from "@/src/contexts/LanguageSelectionContext";
import { languageOptions } from "@/src/components/home/LanguageSelector";
import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";
import { dictionaryEntries } from "@/src/data/dictionary";
import type { UserRole } from "@/src/types/profile";

const chapter = shikomoriQuestionsA1Path?.chapter;
const language = shikomoriQuestionsA1Path?.language;
const level = shikomoriQuestionsA1Path?.level;
const conceptCount =
  chapter?.blocks.reduce((total, block) => total + block.concepts.length, 0) ?? 0;
const firstAvailableLesson = dictionaryEntries.find((entry) => entry.lessonAvailable);

export default function ProfileScreen() {
  const [activeRole, setActiveRole] = useState<UserRole>("student");
  const [isBackFocused, setIsBackFocused] = useState(false);
  const { bottomAreaHeight } = useBottomNavigationLayout();
  const { selectedLanguage, setSelectedLanguage } = useLanguageSelection();
  const selectedLanguageOption =
    languageOptions.find((option) => option.id === selectedLanguage) ?? languageOptions[0];
  const languageLabel = language?.name ?? selectedLanguageOption.label;
  const currentVariety =
    selectedLanguage === "shikomori"
      ? selectedLanguageOption.detail
      : selectedLanguageOption.label;

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  }

  function openFirstLesson() {
    if (firstAvailableLesson?.conceptId) {
      router.push(`/lesson/${firstAvailableLesson.conceptId}`);
      return;
    }

    router.replace("/(tabs)/lessons");
  }

  function showAlert(title: string, message: string) {
    Alert.alert(title, message);
  }

  function showEditProfile() {
    showAlert(
      "Modification du profil",
      "Cette fonction sera disponible prochainement.",
    );
  }

  const sharedActions = {
    onEditProfile: showEditProfile,
    onOpenNotifications: () =>
      showAlert(
        "Notifications",
        activeRole === "teacher"
          ? "Les alertes liées aux classes, élèves et devoirs seront disponibles prochainement."
          : "Les rappels et alertes seront disponibles prochainement.",
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
  };

  const studentActions = {
    ...sharedActions,
    onOpenLessons: openFirstLesson,
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

  const teacherActions = {
    ...sharedActions,
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
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: bottomAreaHeight + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.column}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour à la page précédente"
                accessibilityState={{ disabled: false }}
                onPress={handleBack}
                onFocus={() => setIsBackFocused(true)}
                onBlur={() => setIsBackFocused(false)}
                style={({ pressed }) => [
                  styles.backButton,
                  isBackFocused && styles.focused,
                  pressed && styles.pressed,
                ]}
              >
                <IconSymbol name="chevron.left" size={20} color={HOME_COLORS.accent} />
                <Text style={styles.backLabel}>Retour</Text>
              </Pressable>
              <Text style={styles.topBarTitle}>Profil</Text>
              <View style={styles.topBarSide} />
            </View>

            <ProfileRolePreviewSwitch value={activeRole} onChange={setActiveRole} />

            {activeRole === "student" ? (
              <StudentProfileContent
                languageLabel={languageLabel}
                selectedLanguage={selectedLanguage}
                currentVariety={currentVariety}
                conceptCount={conceptCount}
                currentLevel={level?.level ?? "—"}
                onChangeLanguage={setSelectedLanguage}
                actions={studentActions}
              />
            ) : (
              <TeacherProfileContent
                languageLabel={languageLabel}
                selectedLanguage={selectedLanguage}
                currentVariety={currentVariety}
                onChangeLanguage={setSelectedLanguage}
                actions={teacherActions}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: HOME_COLORS.navy,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  column: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    gap: 20,
  },
  topBar: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarSide: {
    width: 112,
    minHeight: 44,
  },
  backButton: {
    minWidth: 112,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 10,
  },
  backLabel: {
    color: HOME_COLORS.accent,
    fontSize: 14,
    fontWeight: "800",
  },
  topBarTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  pressed: {
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
  focused: {
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
});
