import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Comorienne 🇰🇲</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/quiz")}
      >
        <Text style={styles.buttonText}>Commencer le quiz</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 28,
    marginBottom: 30,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});