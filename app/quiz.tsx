import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ProgressBar from "../src/components/ProgressBar";
import { QuizCard } from "../src/components/QuizCard";
import { questions } from "../src/data/words";

export default function QuizScreen() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[questionIndex];
  const progressStep = questionIndex + 1;

  const feedback = useMemo(() => {
    if (selectedAnswer === null) {
      return "";
    }

    return selectedAnswer === currentQuestion.correct
      ? "Bonne reponse !"
      : `La bonne reponse etait : ${currentQuestion.correct}`;
  }, [currentQuestion.correct, selectedAnswer]);

  function handleSelectAnswer(answer: string) {
    setSelectedAnswer(answer);

    if (answer === currentQuestion.correct) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function handleNextQuestion() {
    if (questionIndex === questions.length - 1) {
      router.replace({
        pathname: "/result",
        params: {
          score: String(score),
          total: String(questions.length),
        },
      });
      return;
    }

    setQuestionIndex((currentIndex) => currentIndex + 1);
    setSelectedAnswer(null);
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Aucune question pour le moment</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.counter}>
          Question {questionIndex + 1}/{questions.length}
        </Text>
        <ProgressBar current={progressStep} total={questions.length} />
      </View>

      <QuizCard
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        onSelectAnswer={handleSelectAnswer}
      />

      <View style={styles.footer}>
        <Text style={styles.feedback}>{feedback}</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={selectedAnswer === null}
          style={[
            styles.primaryButton,
            selectedAnswer === null && styles.disabledButton,
          ]}
          onPress={handleNextQuestion}
        >
          <Text style={styles.primaryButtonText}>
            {questionIndex === questions.length - 1 ? "Voir le score" : "Question suivante"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 22,
    paddingTop: 70,
    paddingBottom: 32,
    justifyContent: "center",
    gap: 28,
  },
  header: {
    gap: 12,
  },
  counter: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  footer: {
    minHeight: 112,
    gap: 18,
    justifyContent: "flex-end",
  },
  feedback: {
    minHeight: 24,
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.45,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
});
