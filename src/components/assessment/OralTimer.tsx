import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type OralTimerProps = {
  durationSeconds: number;
  locked: boolean;
  resetKey: string;
  onStarted: () => void;
  onCompleted: () => void;
};

function formatSeconds(seconds: number) {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function OralTimer({
  durationSeconds,
  locked,
  resetKey,
  onStarted,
  onCompleted,
}: OralTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    setSecondsRemaining(durationSeconds);
    setIsRunning(false);
    setHasStarted(false);
    setHasCompleted(false);
  }, [durationSeconds, resetKey]);

  useEffect(() => {
    if (locked) {
      setIsRunning(false);
    }
  }, [locked]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setSecondsRemaining((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && secondsRemaining === 0) {
      setIsRunning(false);
      setHasCompleted(true);
      onCompleted();
    }
  }, [isRunning, onCompleted, secondsRemaining]);

  function startTimer() {
    if (locked || isRunning || hasCompleted) {
      return;
    }

    setSecondsRemaining(durationSeconds);
    setHasStarted(true);
    setIsRunning(true);
    onStarted();
  }

  function completeTimer() {
    if (locked || !hasStarted) {
      return;
    }

    setIsRunning(false);
    setSecondsRemaining(0);
    setHasCompleted(true);
    onCompleted();
  }

  const startLabel = hasCompleted
    ? "Minute terminée"
    : isRunning
      ? "En cours..."
      : "Démarrer 1 minute";

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatSeconds(secondsRemaining)}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={locked || isRunning || hasCompleted}
          style={[
            styles.button,
            (locked || isRunning || hasCompleted) && styles.disabledButton,
          ]}
          onPress={startTimer}
        >
          <Text style={styles.buttonText}>{startLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={locked || !hasStarted || hasCompleted}
          style={[
            styles.secondaryButton,
            (locked || !hasStarted || hasCompleted) && styles.disabledButton,
          ]}
          onPress={completeTimer}
        >
          <Text style={styles.secondaryButtonText}>J’ai terminé</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  timerText: {
    color: "#f8fafc",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
  },
  actions: {
    gap: 10,
  },
  button: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#082f49",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.45,
  },
});
