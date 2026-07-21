import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { LessonFeedback } from "@/src/components/learning/LessonFeedback";

type LetterItem = {
  id: string;
  value: string;
};

function createLetterItems(letters: string[]): LetterItem[] {
  return letters.map((letter, index) => ({
    id: `${letter}-${index}`,
    value: letter,
  }));
}

function shuffleLetterItems(items: LetterItem[]): LetterItem[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function getProposedAnswer(items: LetterItem[], slotCount: number) {
  return items
    .slice(0, slotCount)
    .map((item) => item.value)
    .join("")
    .toLocaleLowerCase();
}

function avoidSolvedInitialOrder(
  items: LetterItem[],
  expectedAnswer: string,
  slotCount: number,
): LetterItem[] {
  const normalizedExpectedAnswer = expectedAnswer.toLocaleLowerCase();

  if (getProposedAnswer(items, slotCount) !== normalizedExpectedAnswer) {
    return items;
  }

  const shuffled = [...items];
  const slotLimit = Math.min(slotCount, shuffled.length);

  for (let slotIndex = 0; slotIndex < slotLimit; slotIndex += 1) {
    const slotValue = shuffled[slotIndex].value.toLocaleLowerCase();
    const distractorIndex = shuffled.findIndex(
      (item, itemIndex) =>
        itemIndex >= slotCount && item.value.toLocaleLowerCase() !== slotValue,
    );

    if (distractorIndex === -1) {
      continue;
    }

    [shuffled[slotIndex], shuffled[distractorIndex]] = [
      shuffled[distractorIndex],
      shuffled[slotIndex],
    ];

    return shuffled;
  }

  for (let firstIndex = 0; firstIndex < slotLimit - 1; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < slotLimit; secondIndex += 1) {
      if (
        shuffled[firstIndex].value.toLocaleLowerCase() ===
        shuffled[secondIndex].value.toLocaleLowerCase()
      ) {
        continue;
      }

      [shuffled[firstIndex], shuffled[secondIndex]] = [
        shuffled[secondIndex],
        shuffled[firstIndex],
      ];

      return shuffled;
    }
  }

  return shuffled;
}

function createShuffledLetterItems(
  letters: string[],
  expectedAnswer: string,
  slotCount: number,
): LetterItem[] {
  return avoidSolvedInitialOrder(
    shuffleLetterItems(createLetterItems(letters)),
    expectedAnswer,
    slotCount,
  );
}

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
  const lettersSignature = letters.join("\u0000");
  const lettersRef = useRef(letters);
  lettersRef.current = letters;
  const [letterItems, setLetterItems] = useState<LetterItem[]>(() =>
    createShuffledLetterItems(letters, expectedAnswer, slotCount),
  );

  const [placedLetters, setPlacedLetters] = useState<(LetterItem | null)[]>(
    () => Array.from({ length: slotCount }, () => null),
  );

  useEffect(() => {
    setLetterItems(
      createShuffledLetterItems(lettersRef.current, expectedAnswer, slotCount),
    );
    setPlacedLetters(Array.from({ length: slotCount }, () => null));
  }, [expectedAnswer, lettersSignature, slotCount]);

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
        <Text style={styles.bracketText}>[</Text>
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
        <Text style={styles.bracketText}>]</Text>
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
  bracketText: {
    color: "#94a3b8",
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
