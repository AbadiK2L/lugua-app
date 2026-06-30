import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { WordCategory, words } from "@/src/data/words";

const categoryLabels: Record<WordCategory, string> = {
  greetings: "Salutations",
  food: "Nourriture",
  family: "Famille",
  numbers: "Nombres",
  places: "Lieux",
  common: "Courant",
};

export default function VocabularyScreen() {
  const [search, setSearch] = useState("");

  const filteredWords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return words;
    }

    return words.filter(
      (word) =>
        word.word.toLowerCase().includes(query) ||
        word.translation.toLowerCase().includes(query) ||
        categoryLabels[word.category].toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Vocabulaire</Text>
        <Text style={styles.subtitle}>Recherche un mot en shikomori ou en français.</Text>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Rechercher"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.searchInput}
      />

      <View style={styles.list}>
        {filteredWords.map((word) => (
          <View key={word.id} style={styles.wordCard}>
            <View style={styles.wordHeader}>
              <Text style={styles.word}>{word.word}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{categoryLabels[word.category]}</Text>
              </View>
            </View>

            <Text style={styles.translation}>{word.translation}</Text>
            {word.example ? <Text style={styles.example}>{word.example}</Text> : null}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
  },
  searchInput: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#111827",
    color: "#f8fafc",
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "700",
  },
  list: {
    gap: 12,
  },
  wordCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#111827",
    padding: 16,
    gap: 8,
  },
  wordHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  word: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "900",
  },
  categoryBadge: {
    borderRadius: 999,
    backgroundColor: "#172033",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryText: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  translation: {
    color: "#cbd5e1",
    fontSize: 16,
    fontWeight: "800",
  },
  example: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
