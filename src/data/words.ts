export type WordCategory =
  | "greetings"
  | "food"
  | "family"
  | "numbers"
  | "places"
  | "common";

export type Word = {
  id: string;
  word: string;
  translation: string;
  dialect: "shingazidja";
  category: WordCategory;
  example?: string;
};

export type QuizQuestion = {
  word: string;
  correct: string;
  options: string[];
};

export const words: Word[] = [
  { id: "w1", word: "Habari", translation: "Bonjour / Quoi de neuf", dialect: "shingazidja", category: "greetings", example: "Habari za asubuhi?" },
  { id: "w2", word: "Karibu", translation: "Bienvenue", dialect: "shingazidja", category: "greetings", example: "Karibu nyumbani." },
  { id: "w3", word: "Kwaheri", translation: "Au revoir", dialect: "shingazidja", category: "greetings", example: "Kwaheri, tutaonana." },
  { id: "w4", word: "Shukrani", translation: "Merci", dialect: "shingazidja", category: "greetings", example: "Shukrani sana!" },
  { id: "w5", word: "Samahani", translation: "Excusez-moi / Pardon", dialect: "shingazidja", category: "greetings", example: "Samahani, unajua njia?" },
  { id: "w6", word: "Chakula", translation: "Nourriture / Repas", dialect: "shingazidja", category: "food", example: "Chakula ni kizuri leo." },
  { id: "w7", word: "Maji", translation: "Eau", dialect: "shingazidja", category: "food", example: "Nipe maji tafadhali." },
  { id: "w8", word: "Mkate", translation: "Pain", dialect: "shingazidja", category: "food", example: "Ninataka mkate na siagi." },
  { id: "w9", word: "Matunda", translation: "Fruits", dialect: "shingazidja", category: "food", example: "Matunda ni mazuri kwa afya." },
  { id: "w10", word: "Samaki", translation: "Poisson", dialect: "shingazidja", category: "food", example: "Samaki wa bahari ni tamu." },
  { id: "w11", word: "Mama", translation: "Mère", dialect: "shingazidja", category: "family", example: "Mama yangu ni mpishi mzuri." },
  { id: "w12", word: "Baba", translation: "Père", dialect: "shingazidja", category: "family", example: "Baba anafanya kazi." },
  { id: "w13", word: "Ndugu", translation: "Frère / Ami proche", dialect: "shingazidja", category: "family", example: "Ndugu yangu anakaa Moroni." },
  { id: "w14", word: "Dada", translation: "Sœur", dialect: "shingazidja", category: "family", example: "Dada yangu ana miaka kumi." },
  { id: "w15", word: "Bibi", translation: "Grand-mère", dialect: "shingazidja", category: "family", example: "Bibi anatuambia hadithi." },
  { id: "w16", word: "Moja", translation: "Un (1)", dialect: "shingazidja", category: "numbers" },
  { id: "w17", word: "Mbili", translation: "Deux (2)", dialect: "shingazidja", category: "numbers" },
  { id: "w18", word: "Tatu", translation: "Trois (3)", dialect: "shingazidja", category: "numbers" },
  { id: "w19", word: "Nne", translation: "Quatre (4)", dialect: "shingazidja", category: "numbers" },
  { id: "w20", word: "Tano", translation: "Cinq (5)", dialect: "shingazidja", category: "numbers" },
  { id: "w21", word: "Ndzima", translation: "Île", dialect: "shingazidja", category: "places", example: "Ndzima ya Ngazidja ni nkubwa." },
  { id: "w22", word: "Bahari", translation: "Mer / Océan", dialect: "shingazidja", category: "places", example: "Bahari ni ya buluu." },
  { id: "w23", word: "Mji", translation: "Ville", dialect: "shingazidja", category: "places", example: "Moroni ni mji mkubwa." },
  { id: "w24", word: "Nyumba", translation: "Maison", dialect: "shingazidja", category: "places", example: "Nyumba yangu iko karibu." },
  { id: "w25", word: "Shule", translation: "École", dialect: "shingazidja", category: "places", example: "Watoto wanaenda shule." },
  { id: "w26", word: "Sawa", translation: "D'accord / OK", dialect: "shingazidja", category: "common", example: "Sawa, tutakwenda." },
  { id: "w27", word: "Ndiyo", translation: "Oui", dialect: "shingazidja", category: "common" },
  { id: "w28", word: "Hapana", translation: "Non", dialect: "shingazidja", category: "common" },
  { id: "w29", word: "Tafadhali", translation: "S'il vous plaît", dialect: "shingazidja", category: "common", example: "Tafadhali nisaidie." },
  { id: "w30", word: "Vizuri", translation: "Bien / Très bien", dialect: "shingazidja", category: "common", example: "Umefanya vizuri!" },
];

export const wordsByCategory = (category: WordCategory) =>
  words.filter((word) => word.category === category);

export function randomWords(count: number): Word[] {
  return [...words].sort(() => Math.random() - 0.5).slice(0, count);
}

function buildQuestion(target: Word): QuizQuestion {
  const distractors = words
    .filter((word) => word.id !== target.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((word) => word.translation);

  return {
    word: target.word,
    correct: target.translation,
    options: [...distractors, target.translation].sort(() => Math.random() - 0.5),
  };
}

export function buildQuizQuestions(count = 5): QuizQuestion[] {
  return randomWords(count).map(buildQuestion);
}

export const questions: QuizQuestion[] = words.slice(0, 5).map(buildQuestion);
