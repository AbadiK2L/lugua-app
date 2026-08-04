import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { LanguageSelector } from "@/src/components/home/LanguageSelector";
import { HOME_COLORS } from "@/src/components/home/homeColors";
import { NotificationBellButton } from "@/src/components/navigation/NotificationBellButton";
import { useLanguageSelection } from "@/src/contexts/LanguageSelectionContext";

const menuItems = [
  { id: "course", label: "Créer un cours", icon: "books.vertical.fill" as const },
  { id: "class", label: "Créer une classe", icon: "person.3.fill" as const },
  { id: "assignment", label: "Créer un devoir", icon: "doc.text.fill" as const },
  { id: "resource", label: "Ajouter une ressource", icon: "plus.rectangle.fill" as const },
];

export function TeacherAppHeader() {
  const { selectedLanguage, setSelectedLanguage } = useLanguageSelection();
  const { width } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const showLabels = width >= 560;

  function handleMenuItem(id: string) {
    setMenuVisible(false);

    if (id === "course") {
      router.push("/teacher/course-builder");
      return;
    }

    if (id === "class") {
      router.push({ pathname: "/teacher/classes", params: { create: "1" } });
      return;
    }

    if (id === "assignment") {
      router.push("/teacher/assignment-builder");
      return;
    }

    const messages: Record<string, [string, string]> = {
      resource: ["Ajouter une ressource", "L’ajout de ressources sera disponible prochainement."],
    };
    const message = messages[id];

    if (message) {
      Alert.alert(message[0], message[1]);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ouvrir le profil professeur"
        onPress={() => router.push("/teacher/profile")}
        style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
      >
        <IconSymbol name="person.fill" size={20} color={HOME_COLORS.accent} />
        {showLabels ? <Text style={styles.profileLabel}>Profil</Text> : null}
      </Pressable>

      <LanguageSelector value={selectedLanguage} onChange={setSelectedLanguage} />

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Créer"
          accessibilityHint="Ouvre les actions de création professeur"
          onPress={() => setMenuVisible(true)}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <IconSymbol name="plus.rectangle.fill" size={18} color={HOME_COLORS.accent} />
          {showLabels ? <Text style={styles.actionLabel}>Créer</Text> : null}
        </Pressable>
        <NotificationBellButton href="/teacher/notifications" showLabel={showLabels} />
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.menu} onPress={(event) => event.stopPropagation()}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Créer</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                onPress={() => setMenuVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={18} color={HOME_COLORS.textSecondary} />
              </Pressable>
            </View>
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => handleMenuItem(item.id)}
                style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              >
                <IconSymbol name={item.icon} size={20} color={HOME_COLORS.accent} />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileButton: {
    minWidth: 44,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 8,
  },
  profileLabel: {
    color: HOME_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "800",
  },
  actions: {
    flexShrink: 0,
    flexDirection: "row",
    gap: 6,
    marginLeft: "auto",
  },
  actionButton: {
    minWidth: 44,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 12,
    backgroundColor: HOME_COLORS.surface,
    paddingHorizontal: 8,
  },
  actionLabel: {
    color: HOME_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.48)",
    paddingTop: 78,
    paddingHorizontal: 16,
  },
  menu: {
    width: "100%",
    maxWidth: 340,
    gap: 4,
    borderWidth: 1,
    borderColor: HOME_COLORS.border,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.card,
    padding: 10,
  },
  menuHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  menuTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "900",
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItem: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  menuItemLabel: {
    color: HOME_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: {
    backgroundColor: HOME_COLORS.surfaceRaised,
    opacity: 0.84,
  },
});
