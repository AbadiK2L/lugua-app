import { useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { HOME_COLORS } from "@/src/components/home/homeColors";

type AuthScreenShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  onBack?: () => void;
};

export function AuthScreenShell({
  title,
  subtitle,
  children,
  onBack,
}: AuthScreenShellProps) {
  const [backFocused, setBackFocused] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.column}>
            {onBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour"
                onBlur={() => setBackFocused(false)}
                onFocus={() => setBackFocused(true)}
                onPress={onBack}
                style={({ pressed }) => [
                  styles.backButton,
                  backFocused && styles.focused,
                  pressed && styles.pressed,
                ]}
              >
                <IconSymbol
                  name="chevron.left"
                  size={19}
                  color={HOME_COLORS.accent}
                />
                <Text style={styles.backLabel}>Retour</Text>
              </Pressable>
            ) : null}

            <View style={styles.heading}>
              <Text style={styles.brand}>Lugua</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: HOME_COLORS.navy,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  column: {
    width: "100%",
    maxWidth: 500,
    gap: 28,
  },
  backButton: {
    minWidth: 88,
    minHeight: 44,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 10,
  },
  backLabel: {
    color: HOME_COLORS.accentMuted,
    fontSize: 14,
    fontWeight: "800",
  },
  heading: {
    gap: 9,
  },
  brand: {
    color: HOME_COLORS.accent,
    fontSize: 18,
    fontWeight: "900",
  },
  title: {
    color: HOME_COLORS.textPrimary,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  subtitle: {
    color: HOME_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  focused: {
    borderWidth: 2,
    borderColor: HOME_COLORS.textPrimary,
  },
  pressed: {
    backgroundColor: HOME_COLORS.surfaceRaised,
    opacity: 0.82,
  },
});
