import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HOME_COLORS } from "@/src/components/home/homeColors";

type LearningStep = {
  id: string;
  label: string;
};

type LearningHeroCardProps = {
  levelCode: string;
  levelAudienceLabel: string;
  languageName: string;
  levelNumberLabel: string;
  chapterTitle: string;
  conceptCount: number;
  steps: LearningStep[];
  onPress: () => void;
};

export function LearningHeroCard({
  levelCode,
  levelAudienceLabel,
  languageName,
  levelNumberLabel,
  chapterTitle,
  conceptCount,
  steps,
  onPress,
}: LearningHeroCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>
          {levelCode} · {levelAudienceLabel}
        </Text>
        <Text style={styles.languageLine}>
          {languageName} — {levelNumberLabel}
        </Text>
        <Text style={styles.chapterTitle}>{chapterTitle}</Text>
        <Text style={styles.count}>{conceptCount} notions disponibles</Text>
      </View>

      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.illustration}
      >
        <View style={styles.moon} />
        <View style={styles.horizon} />
        <View style={styles.house}>
          <View style={styles.houseRoof} />
          <View style={styles.houseWindow} />
          <View style={styles.houseWindowSmall} />
        </View>
        <View style={styles.palmTrunk} />
        <View style={styles.palmCrown}>
          <View style={[styles.palmLeaf, styles.palmLeafOne]} />
          <View style={[styles.palmLeaf, styles.palmLeafTwo]} />
          <View style={[styles.palmLeaf, styles.palmLeafThree]} />
          <View style={[styles.palmLeaf, styles.palmLeafFour]} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.steps}
      >
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepItem}>
            <View style={styles.stepTopline}>
              <View style={[styles.stepCircle, index === 0 && styles.stepCircleCurrent]}>
                <Text style={[styles.stepNumber, index === 0 && styles.stepNumberCurrent]}>
                  {index + 1}
                </Text>
              </View>
              {index < steps.length - 1 ? <View style={styles.stepConnector} /> : null}
            </View>
            <Text style={styles.stepLabel} numberOfLines={2}>
              {step.label}
            </Text>
          </View>
        ))}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Commencer la leçon"
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Commencer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: HOME_COLORS.card,
    padding: 16,
    gap: 12,
  },
  copy: {
    maxWidth: "78%",
    gap: 4,
  },
  eyebrow: {
    color: HOME_COLORS.accent,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  languageLine: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  chapterTitle: {
    color: HOME_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 26,
    marginTop: 3,
  },
  count: {
    color: HOME_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  illustration: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 138,
    height: 128,
    opacity: 0.78,
  },
  moon: {
    position: "absolute",
    top: 10,
    right: 26,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
  horizon: {
    position: "absolute",
    right: -12,
    bottom: 0,
    left: -12,
    height: 26,
    backgroundColor: HOME_COLORS.surface,
    transform: [{ skewX: "-12deg" }],
  },
  house: {
    position: "absolute",
    right: 24,
    bottom: 17,
    width: 56,
    height: 45,
    backgroundColor: HOME_COLORS.border,
  },
  houseRoof: {
    position: "absolute",
    top: -14,
    left: -6,
    width: 0,
    height: 0,
    borderRightWidth: 34,
    borderBottomWidth: 15,
    borderLeftWidth: 34,
    borderRightColor: "transparent",
    borderBottomColor: HOME_COLORS.accent,
    borderLeftColor: "transparent",
  },
  houseWindow: {
    position: "absolute",
    left: 10,
    bottom: 11,
    width: 11,
    height: 12,
    backgroundColor: HOME_COLORS.accent,
  },
  houseWindowSmall: {
    position: "absolute",
    right: 10,
    bottom: 11,
    width: 11,
    height: 12,
    backgroundColor: HOME_COLORS.accent,
  },
  palmTrunk: {
    position: "absolute",
    right: 88,
    bottom: 14,
    width: 7,
    height: 72,
    borderRadius: 4,
    backgroundColor: "#bd8055",
    transform: [{ rotate: "-12deg" }],
  },
  palmCrown: {
    position: "absolute",
    right: 65,
    bottom: 83,
    width: 56,
    height: 32,
  },
  palmLeaf: {
    position: "absolute",
    top: 12,
    left: 25,
    width: 38,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#367a57",
  },
  palmLeafOne: {
    transform: [{ rotate: "-20deg" }],
  },
  palmLeafTwo: {
    transform: [{ rotate: "25deg" }],
  },
  palmLeafThree: {
    transform: [{ rotate: "-55deg" }],
  },
  palmLeafFour: {
    transform: [{ rotate: "55deg" }],
  },
  steps: {
    alignItems: "flex-start",
    paddingRight: 10,
  },
  stepItem: {
    width: 72,
    gap: 6,
  },
  stepTopline: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: HOME_COLORS.textMuted,
    borderRadius: 14,
    backgroundColor: HOME_COLORS.surfaceRaised,
  },
  stepCircleCurrent: {
    borderColor: HOME_COLORS.accent,
    backgroundColor: HOME_COLORS.accent,
  },
  stepNumber: {
    color: HOME_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  stepNumberCurrent: {
    color: HOME_COLORS.ink,
  },
  stepConnector: {
    width: 44,
    height: 1,
    backgroundColor: HOME_COLORS.textMuted,
  },
  stepLabel: {
    color: HOME_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 13,
  },
  button: {
    alignSelf: "flex-start",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: HOME_COLORS.accent,
    paddingHorizontal: 24,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: HOME_COLORS.ink,
    fontSize: 15,
    fontWeight: "800",
  },
});
