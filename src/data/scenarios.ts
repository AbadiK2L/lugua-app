export type ScenarioLevel = "débutant" | "intermédiaire" | "avancé";

export type ScenarioTurn = {
  role: "assistant" | "learner";
  text: string;
  hint?: string;
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  dialect: "shingazidja";
  level: ScenarioLevel;
  accentColor: string;
  turns: ScenarioTurn[];
};

export const scenarios: Scenario[] = [
  {
    id: "presentation",
    title: "Se présenter",
    description: "Dire son nom, saluer et expliquer d'où l'on vient.",
    dialect: "shingazidja",
    level: "débutant",
    accentColor: "#38bdf8",
    turns: [
      { role: "assistant", text: "Habari! Jina langu ni Pingo. Jina lako nani?" },
      { role: "learner", text: "Jina langu ni ...", hint: "Dis ton prénom après Jina langu ni." },
      { role: "assistant", text: "Karibu sana! Unatoka wapi?" },
      { role: "learner", text: "Ninatoka ...", hint: "Dis ta ville ou ton pays." },
    ],
  },
  {
    id: "marche",
    title: "Au marché",
    description: "Acheter des fruits et demander un prix simplement.",
    dialect: "shingazidja",
    level: "débutant",
    accentColor: "#22c55e",
    turns: [
      { role: "assistant", text: "Karibu dukani! Unataka nini leo?" },
      { role: "learner", text: "Ninataka matunda, tafadhali.", hint: "Je veux des fruits, s'il vous plaît." },
      { role: "assistant", text: "Vizuri! Unataka ndizi au machungwa?" },
      { role: "learner", text: "Ninataka ndizi mbili.", hint: "Je veux deux bananes." },
    ],
  },
  {
    id: "maison",
    title: "À la maison",
    description: "Parler avec sa famille autour d'un repas.",
    dialect: "shingazidja",
    level: "débutant",
    accentColor: "#f59e0b",
    turns: [
      { role: "assistant", text: "Habari za nyumbani! Chakula kiko tayari." },
      { role: "learner", text: "Vizuri sana! Chakula ni nini leo?", hint: "Super, qu'est-ce qu'on mange aujourd'hui ?" },
      { role: "assistant", text: "Leo tunakula samaki na wali. Unafurahi?" },
      { role: "learner", text: "Ndiyo, ninapenda samaki sana!", hint: "Oui, j'aime beaucoup le poisson." },
    ],
  },
  {
    id: "chemin",
    title: "Demander son chemin",
    description: "Trouver son chemin en ville avec des phrases utiles.",
    dialect: "shingazidja",
    level: "intermédiaire",
    accentColor: "#a78bfa",
    turns: [
      { role: "assistant", text: "Samahani, naweza kukusaidia?" },
      { role: "learner", text: "Ndiyo, tafadhali. Uko wapi hospitali?", hint: "Oui, s'il vous plaît. Où est l'hôpital ?" },
      { role: "assistant", text: "Hospitali iko mbali kidogo. Nenda moja kwa moja, kisha geuka kushoto." },
      { role: "learner", text: "Shukrani sana!", hint: "Merci beaucoup." },
    ],
  },
];

export const getScenarioById = (id: string) =>
  scenarios.find((scenario) => scenario.id === id);

export const scenariosByLevel = (level: ScenarioLevel) =>
  scenarios.filter((scenario) => scenario.level === level);
