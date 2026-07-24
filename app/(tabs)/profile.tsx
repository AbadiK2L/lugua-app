import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { LanguageSelector, languageOptions } from "@/src/components/home/LanguageSelector";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { ProfileIdentityCard } from "@/src/components/profile/ProfileIdentityCard";
import { ProfileMenuRow } from "@/src/components/profile/ProfileMenuRow";
import { ProfileProgressCard } from "@/src/components/profile/ProfileProgressCard";
import { ProfileSection } from "@/src/components/profile/ProfileSection";
import { useBottomNavigationLayout } from "@/src/contexts/BottomNavigationLayoutContext";
import { useLanguageSelection } from "@/src/contexts/LanguageSelectionContext";
import { shikomoriQuestionsA1Path } from "@/src/data/curriculum";
import { dictionaryEntries } from "@/src/data/dictionary";

const chapter = shikomoriQuestionsA1Path?.chapter;
const language = shikomoriQuestionsA1Path?.language;
const level = shikomoriQuestionsA1Path?.level;
const availableConceptCount =
  chapter?.blocks.reduce((total, block) => total + block.concepts.length, 0) ?? 0;
const firstAvailableLesson = dictionaryEntries.find((entry) => entry.lessonAvailable);

export default function ProfileScreen() {
  const [isBackFocused, setIsBackFocused] = useState(false);
  const { bottomAreaHeight } = useBottomNavigationLayout();
  const { selectedLanguage, setSelectedLanguage } = useLanguageSelection();
  const selectedLanguageOption =
    languageOptions.find((option) => option.id === selectedLanguage) ?? languageOptions[0];
  const currentLanguage = language?.name ?? selectedLanguageOption.label;
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

  function showEditProfile() {
    Alert.alert(
      "Modification du profil",
      "Cette fonction sera disponible prochainement.",
    );
  }

  function showAssignments() {
    Alert.alert("Devoirs", "Aucun devoir disponible pour le moment.");
  }

  function showAiTraining() {
    Alert.alert(
      "Entraînement IA",
      "Cette fonction sera disponible prochainement.",
    );
  }

  function showSavedWords() {
    Alert.alert(
      "Mots enregistrés",
      "Les favoris du dictionnaire seront disponibles prochainement.",
    );
  }

  function showAudioSettings() {
    Alert.alert(
      "Audio et sous-titres",
      "Ces réglages seront disponibles prochainement.",
    );
  }

  function showNotifications() {
    Alert.alert(
      "Notifications",
      "Les rappels et alertes seront disponibles prochainement.",
    );
  }

  function showAbout() {
    Alert.alert(
      "À propos de Lugua",
      "Lugua est une application d’apprentissage des langues centrée sur les usages réels, les leçons, le dictionnaire et la compréhension orale.",
    );
  }

  function showSources() {
    Alert.alert(
      "Sources linguistiques",
      "Contenus actuels\nCurriculum local Lugua\n\nConnexion ORELC\nNon active\n\nLes futures données externes seront affichées avec leur source, leur statut de validation et leur variété linguistique.",
    );
  }

  function showPrivacy() {
    Alert.alert(
      "Confidentialité",
      "La politique de confidentialité complète sera ajoutée avant la publication de l’application.",
    );
  }

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
              <Text style={styles.topBarTitle}>Profil élève</Text>
              <View style={styles.topBarSide} />
            </View>

            <ProfileIdentityCard
              languageLabel={currentLanguage}
              onEdit={showEditProfile}
            />

            <ProfileProgressCard
              rows={[
                { label: "Niveau actuel", value: level?.level ?? "—" },
                {
                  label: "Notions disponibles",
                  value:
                    availableConceptCount > 0
                      ? String(availableConceptCount)
                      : "Aucune",
                },
                { label: "Leçons terminées", value: "—" },
                { label: "Série", value: "—" },
              ]}
            />

            <ProfileSection title="Mon apprentissage">
              <ProfileMenuRow
                icon="book.fill"
                label="Mes leçons"
                value={
                  availableConceptCount > 0
                    ? `${availableConceptCount} notions`
                    : "Aucune"
                }
                onPress={openFirstLesson}
                accessibilityHint="Ouvre la première leçon disponible ou les scénarios"
                isLast={false}
              />
              <ProfileMenuRow
                icon="doc.text.fill"
                label="Mes devoirs"
                value="Aucun"
                onPress={showAssignments}
                accessibilityHint="Affiche l’état des devoirs"
                isLast={false}
              />
              <ProfileMenuRow
                icon="bubble.left.fill"
                label="Entraînement IA"
                value="Bientôt"
                onPress={showAiTraining}
                accessibilityHint="Affiche la disponibilité de l’entraînement IA"
                isLast={false}
              />
              <ProfileMenuRow
                icon="bookmark.fill"
                label="Mots enregistrés"
                value="Aucun"
                onPress={showSavedWords}
                accessibilityHint="Affiche la disponibilité des favoris"
                isLast
              />
            </ProfileSection>

            <ProfileSection title="Préférences">
              <ProfileMenuRow
                icon="book.fill"
                label="Langue étudiée"
                value={currentLanguage}
                isLast={false}
              />
              <ProfileMenuRow
                icon="globe"
                label="Variété"
                value={currentVariety}
                trailing={
                  <LanguageSelector
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                  />
                }
                isLast={false}
              />
              <ProfileMenuRow
                icon="speaker.wave.2.fill"
                label="Audio et sous-titres"
                value="Bientôt"
                onPress={showAudioSettings}
                accessibilityHint="Affiche la disponibilité des réglages audio"
                isLast={false}
              />
              <ProfileMenuRow
                icon="bell.fill"
                label="Notifications"
                value="Bientôt"
                onPress={showNotifications}
                accessibilityHint="Affiche la disponibilité des notifications"
                isLast
              />
            </ProfileSection>

            <ProfileSection title="Compte">
              <ProfileMenuRow
                icon="info.circle.fill"
                label="À propos de Lugua"
                value="Lugua"
                onPress={showAbout}
                accessibilityHint="Affiche les informations sur Lugua"
                isLast={false}
              />
              <ProfileMenuRow
                icon="book.fill"
                label="Sources linguistiques"
                value="Curriculum local"
                onPress={showSources}
                accessibilityHint="Affiche les sources linguistiques actuelles"
                isLast={false}
              />
              <ProfileMenuRow
                icon="lock.fill"
                label="Confidentialité"
                value="En préparation"
                onPress={showPrivacy}
                accessibilityHint="Affiche l’état de préparation de la confidentialité"
                isLast
              />
            </ProfileSection>
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
    position: "relative",
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
