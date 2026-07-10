import type { Assessment, LinguisticContent } from "../../../types/learning";

const draftUserProvidedContent = {
  validationStatus: "draft",
  source: "user_provided",
  audioStatus: "missing",
  dialect: "unspecified",
} as const satisfies LinguisticContent;

export const shikomoriQuestionsA1Assessment: Assessment = {
  id: "shikomori-a1-questions-assessment",
  chapterId: "shikomori-a1-questions-chapter",
  languageId: "shikomori",
  level: "A1",
  title: "Contrôle A1 - Les mots interrogatifs",
  description:
    "Contrôle local pour vérifier la compréhension et l'usage des mots interrogatifs fournis.",
  deliveryMode: "local",
  supportsAudioRecording: false,
  supportsAutomaticCorrection: false,
  scoreCategories: [
    {
      id: "listening_comprehension",
      label: "Compréhension orale",
      maxScore: 4,
    },
    {
      id: "context_comprehension",
      label: "Compréhension du contexte",
      maxScore: 4,
    },
    {
      id: "translation",
      label: "Traduction",
      maxScore: 4,
    },
    {
      id: "sentence_building",
      label: "Construction de phrases",
      maxScore: 4,
    },
    {
      id: "oral_expression",
      label: "Expression orale",
      maxScore: 4,
    },
    {
      id: "pronunciation",
      label: "Prononciation",
      maxScore: 4,
    },
    {
      id: "interaction",
      label: "Interaction",
      maxScore: 4,
    },
  ],
  sections: [
    {
      id: "questions-a1-assessment-recognition",
      title: "Reconnaissance",
      description: "Identifier le sens d'une question shiKomori.",
      scoreCategoryIds: ["translation"],
      exercises: [
        {
          id: "questions-a1-assessment-recognition-ndahu",
          type: "recognition",
          instruction: "Choisis le sens correct.",
          prompt: "Ndahu?",
          conceptId: "questions-a1-concept-ndahu",
          exampleId: "questions-a1-example-ndahu-simple",
          correctOptionId: "questions-a1-assessment-recognition-ndahu-correct",
          options: [
            {
              id: "questions-a1-assessment-recognition-ndahu-correct",
              text: "Où ?",
              isCorrect: true,
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-assessment-recognition-ndahu-distractor-ndo",
              text: "Qui ?",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-assessment-recognition-ndahu-distractor-ndi",
              text: "Quand ?",
              ...draftUserProvidedContent,
            },
          ],
          ...draftUserProvidedContent,
        },
      ],
      ...draftUserProvidedContent,
    },
    {
      id: "questions-a1-assessment-context-choice",
      title: "Choix selon le contexte",
      description: "Choisir une question adaptée à une situation.",
      scoreCategoryIds: ["context_comprehension"],
      exercises: [
        {
          id: "questions-a1-assessment-context-market-price",
          type: "context_choice",
          instruction: "Choisis la question adaptée au marché.",
          prompt: "Tu veux demander à combien une personne vend les carottes.",
          conceptId: "questions-a1-concept-dje",
          contextId: "questions-a1-context-dje-price",
          correctOptionId: "questions-a1-assessment-context-market-price-correct",
          options: [
            {
              id: "questions-a1-assessment-context-market-price-correct",
              text: "Zekaroti ngohuzo dje?",
              isCorrect: true,
              exampleId: "questions-a1-example-dje-carrots-sell-price",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-assessment-context-market-price-hindri",
              text: "Zekaroti kilo hindri?",
              exampleId: "questions-a1-example-hindri-carrots-cost",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-assessment-context-market-price-ye-dje",
              text: "Ye dje?",
              exampleId: "questions-a1-example-dje-how-are-you",
              ...draftUserProvidedContent,
            },
          ],
          ...draftUserProvidedContent,
        },
      ],
      ...draftUserProvidedContent,
    },
    {
      id: "questions-a1-assessment-translation",
      title: "Traduction",
      description: "Traduire dans les deux sens.",
      scoreCategoryIds: ["translation", "sentence_building"],
      exercises: [
        {
          id: "questions-a1-assessment-translation-to-french",
          type: "translation_to_french",
          instruction: "Traduis en français.",
          prompt: "We ufanya hindri?",
          conceptId: "questions-a1-concept-hindri",
          exampleId: "questions-a1-example-hindri-action",
          targetLanguageText: "We ufanya hindri?",
          expectedAnswer: "Que fais-tu ?",
          scoreCategoryIds: ["translation"],
          ...draftUserProvidedContent,
        },
        {
          id: "questions-a1-assessment-translation-to-target",
          type: "translation_to_target",
          instruction: "Traduis en shiKomori.",
          prompt: "Pourquoi ?",
          conceptId: "questions-a1-concept-zabari",
          exampleId: "questions-a1-example-zabari-simple",
          frenchText: "Pourquoi ?",
          expectedAnswer: "Zabari?",
          scoreCategoryIds: ["translation", "sentence_building"],
          ...draftUserProvidedContent,
        },
      ],
      ...draftUserProvidedContent,
    },
    {
      id: "questions-a1-assessment-listening",
      title: "Compréhension d'une conversation",
      description:
        "Comprendre une situation de marché à partir d'un script provisoire.",
      scoreCategoryIds: ["listening_comprehension", "context_comprehension"],
      exercises: [
        {
          id: "questions-a1-assessment-listening-market-script",
          type: "listening",
          instruction: "Lis le script provisoire et choisis l'interprétation correcte.",
          prompt:
            "Au marché, deux questions connues sont utilisées pour parler du prix des carottes.",
          script: {
            id: "questions-a1-assessment-market-provisional-script",
            title: "Au marché",
            description:
              "Script provisoire composé uniquement d'énoncés shiKomori déjà fournis.",
            turns: [
              {
                id: "questions-a1-assessment-market-script-turn-sell-price",
                speaker: "client",
                text: "Zekaroti ngohuzo dje?",
                exampleId: "questions-a1-example-dje-carrots-sell-price",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-assessment-market-script-turn-cost",
                speaker: "client",
                text: "Zekaroti kilo hindri?",
                exampleId: "questions-a1-example-hindri-carrots-cost",
                ...draftUserProvidedContent,
              },
            ],
            requiresLinguisticReview: true,
            ...draftUserProvidedContent,
          },
          correctOptionId: "questions-a1-assessment-listening-market-correct",
          options: [
            {
              id: "questions-a1-assessment-listening-market-correct",
              text:
                "La situation porte sur le prix des carottes dans un échange commercial.",
              isCorrect: true,
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-assessment-listening-market-place",
              text: "La situation porte sur le lieu où se trouve Kassim.",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-assessment-listening-market-person",
              text: "La situation porte sur l'identité d'une personne.",
              ...draftUserProvidedContent,
            },
          ],
          scoreCategoryIds: ["listening_comprehension", "context_comprehension"],
          requiresLinguisticReview: true,
          notes:
            "Le script complet d'une conversation naturelle nécessitera des répliques supplémentaires validées.",
          ...draftUserProvidedContent,
        },
      ],
      requiresLinguisticReview: true,
      ...draftUserProvidedContent,
    },
    {
      id: "questions-a1-assessment-speaking",
      title: "Conversation orale",
      description: "Consigne orale d'une minute au marché.",
      scoreCategoryIds: [
        "oral_expression",
        "pronunciation",
        "interaction",
        "sentence_building",
      ],
      exercises: [
        {
          id: "questions-a1-assessment-speaking-market-minute",
          type: "conversation",
          instruction:
            "Pendant une minute, joue une situation au marché en utilisant les questions déjà fournies.",
          prompt:
            "Demande un prix ou une quantité pour les carottes, puis poursuis l'échange oralement.",
          acceptedAnswers: [
            "Zekaroti ngohuzo dje?",
            "Zekaroti kilo hindri?",
          ],
          scoreCategoryIds: [
            "oral_expression",
            "pronunciation",
            "interaction",
            "sentence_building",
          ],
          requiresLinguisticReview: true,
          notes:
            "Aucun enregistrement audio ni correction automatique n'est prévu dans ces données locales.",
          ...draftUserProvidedContent,
        },
      ],
      requiresLinguisticReview: true,
      ...draftUserProvidedContent,
    },
  ],
  ...draftUserProvidedContent,
};
