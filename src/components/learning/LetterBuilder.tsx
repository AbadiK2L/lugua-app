import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { LessonFeedback } from "@/src/components/learning/LessonFeedback";

type LetterItem = {
  id: string;
  value: string;
};

type LetterBuilderProps = {
  letters: string[];
  expectedAnswer: string;
  slotCount: number;
  sentenceBefore: string;
  sentenceAfter: string;
  completedText: string;
  correctConstructionText: string;
  explanation: string;
  validated: boolean;
  onValidation: (isCorrect: boolean, builtAnswer: string) => void;
  onContinue: () => void;
};

export function LetterBuilder({
  letters,
  expectedAnswer,
  slotCount,
  sentenceBefore,
  sentenceAfter,
  completedText,
  correctConstructionText,
  explanation,
  validated,
  onValidation,
  onContinue,
}: LetterBuilderProps) {
  const letterItems = useMemo(
    () =>
      letters.map((letter, index) => ({
        id: `${letter}-${index}`,
        value: letter,
      })),
    [letters],
  );

  const [placedLetters, setPlacedLetters] = useState<(LetterItem | null)[]>(
    () => Array.from({ length: slotCount }, () => null),
  );

  useEffect(() => {
    setPlacedLetters(Array.from({ length: slotCount }, () => null));
  }, [expectedAnswer, letters, slotCount]);

  const builtAnswer = placedLetters.map((letter) => letter?.value ?? "").join("");
  const normalizedBuiltAnswer = builtAnswer.toLocaleLowerCase();
  const normalizedExpectedAnswer = expectedAnswer.toLocaleLowerCase();
  const isComplete = placedLetters.every((letter) => letter !== null);
  const isCorrect = normalizedBuiltAnswer === normalizedExpectedAnswer;
  const usedLetterIds = new Set(
    placedLetters.flatMap((letter) => (letter ? [letter.id] : [])),
  );

  function addLetter(letter: LetterItem) {
    if (validated || usedLetterIds.has(letter.id)) {
      return;
    }

    const nextEmptyIndex = placedLetters.findIndex((placedLetter) => placedLetter === null);

    if (nextEmptyIndex === -1) {
      return;
    }

    setPlacedLetters((currentLetters) =>
      currentLetters.map((currentLetter, index) =>
        index === nextEmptyIndex ? letter : currentLetter,
      ),
    );
  }

  function removeLetterAt(indexToRemove: number) {
    if (validated) {
      return;
    }

    setPlacedLetters((currentLetters) =>
      currentLetters.map((letter, index) => (index === indexToRemove ? null : letter)),
    );
  }

  function removeLastLetter() {
    if (validated) {
      return;
    }

    const lastFilledIndex = placedLetters.reduce(
      (lastIndex, letter, index) => (letter ? index : lastIndex),
      -1,
    );

    if (lastFilledIndex === -1) {
      return;
    }

    removeLetterAt(lastFilledIndex);
  }

  function validateAnswer() {
    if (!isComplete || validated) {
      return;
    }

    onValidation(isCorrect, builtAnswer);
  }

  return (
    <View style={styles.container}>
      <View style={styles.sentenceRow}>
        <Text style={styles.sentenceText}>{sentenceBefore}</Text>
        <View style={styles.slots}>
          {placedLetters.map((letter, index) => (
            <TouchableOpacity
              key={`${index}-${letter?.id ?? "empty"}`}
              activeOpacity={0.85}
              disabled={!letter || validated}
              style={[
                styles.slot,
                validated && isCorrect && styles.correctSlot,
                validated && !isCorrect && styles.incorrectSlot,
              ]}
              onPress={() => removeLetterAt(index)}
            >
              <Text style={styles.slotText}>{letter?.value ?? "_"}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sentenceText}>{sentenceAfter}</Text>
      </View>

      {validated ? <Text style={styles.completedText}>{completedText}</Text> : null}

      <View style={styles.letterBank}>
        {letterItems.map((letter) => {
          const isUsed = usedLetterIds.has(letter.id);

          return (
            <TouchableOpacity
              key={letter.id}
              activeOpacity={0.85}
              disabled={validated || isUsed}
              style={[styles.letterButton, isUsed && styles.usedLetterButton]}
              onPress={() => addLetter(letter)}
            >
              <Text style={[styles.letterText, isUsed && styles.usedLetterText]}>
                {letter.value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!validated ? (
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!placedLetters.some((letter) => letter !== null)}
          style={[
            styles.clearButton,
            !placedLetters.some((letter) => letter !== null) && styles.disabledButton,
          ]}
          onPress={removeLastLetter}
        >
          <Text style={styles.clearButtonText}>Effacer</Text>
        </TouchableOpacity>
      ) : null}

      {validated && !isCorrect ? (
        <Text style={styles.correctConstruction}>
          Bonne construction : {correctConstructionText}
        </Text>
      ) : null}

      {validated ? (
        <LessonFeedback isCorrect={isCorrect} explanation={explanation} />
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!isComplete}
        style={[
          styles.primaryButton,
          !isComplete && styles.disabledButton,
          validated && styles.continueButton,
        ]}
        onPress={validated ? onContinue : validateAnswer}
      >
        <Text style={styles.primaryButtonText}>
          {validated ? "Continuer" : "Valider"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sentenceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },
  sentenceText: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 30,
  },
  slots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  slot: {
    width: 34,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#172033",
    alignItems: "center",
    justifyContent: "center",
  },
  correctSlot: {
    borderColor: "#22c55e",
    backgroundColor: "#12351f",
  },
  incorrectSlot: {
    borderColor: "#ef4444",
    backgroundColor: "#3b161a",
  },
  slotText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  completedText: {
    color: "#e2e8f0",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 24,
  },
  letterBank: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  letterButton: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#111827",
    borderColor: "#334155",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  usedLetterButton: {
    opacity: 0.35,
  },
  letterText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },
  usedLetterText: {
    color: "#94a3b8",
  },
  clearButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: 12,
    borderColor: "#334155",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  clearButtonText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "900",
  },
  correctConstruction: {
    color: "#22c55e",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 21,
  },
  primaryButton: {
    minHeight: 54,
    backgroundColor: "#38bdf8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  continueButton: {
    backgroundColor: "#22c55e",
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: "#082f49",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
});
