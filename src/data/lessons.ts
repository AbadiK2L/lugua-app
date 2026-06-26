export type LessonLevel = "Débutant" | "Intermédiaire";

export type Lesson = {
  id: string;
  title: string;
  description: string;
  wordCount: number;
  level: LessonLevel;
  progress: number;
};

export const lessons: Lesson[] = [
  {
    id: "salutations",
    title: "Salutations",
    description: "Apprends à dire bonjour, remercier et prendre congé.",
    wordCount: 18,
    level: "Débutant",
    progress: 65,
  },
  {
    id: "famille",
    title: "Famille",
    description: "Découvre les mots utiles pour parler de tes proches.",
    wordCount: 22,
    level: "Débutant",
    progress: 35,
  },
  {
    id: "nourriture",
    title: "Nourriture",
    description: "Pratique le vocabulaire des repas et du marché.",
    wordCount: 26,
    level: "Débutant",
    progress: 48,
  },
  {
    id: "maison",
    title: "Maison",
    description: "Nomme les pièces, objets et habitudes du quotidien.",
    wordCount: 20,
    level: "Débutant",
    progress: 20,
  },
  {
    id: "ecole",
    title: "École",
    description: "Prépare les mots de la classe, des cours et du matériel.",
    wordCount: 24,
    level: "Intermédiaire",
    progress: 12,
  },
  {
    id: "voyage",
    title: "Voyage",
    description: "Entraîne-toi à demander ton chemin et te déplacer.",
    wordCount: 28,
    level: "Intermédiaire",
    progress: 8,
  },
];
