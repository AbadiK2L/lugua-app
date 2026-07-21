import type {
  Chapter,
  Language,
  LanguageLevel,
  LinguisticContent,
  Skill,
} from "../../../types/learning";
import { shikomoriQuestionsA1Assessment } from "./questions-a1-assessment";

const draftUserProvidedContent = {
  validationStatus: "draft",
  source: "user_provided",
  audioStatus: "missing",
  dialect: "unspecified",
} as const satisfies LinguisticContent;

export const shikomoriQuestionsA1Chapter: Chapter = {
  id: "shikomori-a1-questions-chapter",
  languageId: "shikomori",
  level: "A1",
  skillId: "poser-une-question",
  title: "Les mots interrogatifs",
  description:
    "Premier chapitre pilote A1 pour apprendre à poser une question en shiKomori.",
  blocks: [
    {
      id: "questions-a1-block-place",
      chapterId: "shikomori-a1-questions-chapter",
      title: "Demander un lieu",
      objective: "Utiliser Ndahu pour demander où.",
      concepts: [
        {
          id: "questions-a1-concept-ndahu",
          blockId: "questions-a1-block-place",
          key: "Ndahu",
          title: "Ndahu",
          lessonConfig: {
            template: "single_meaning",
            conceptKind: "question_word",
            primaryExampleId: "questions-a1-example-ndahu-kassim",
            objectiveTitle: "Objectif",
            objective: "Savoir demander où se trouve une personne.",
            usages: [
              {
                id: "questions-a1-usage-ndahu-place",
                meaning: "Où ?",
                contextId: "questions-a1-context-ndahu-place",
                exampleIds: [
                  "questions-a1-example-ndahu-kassim",
                  "questions-a1-example-ndahu-simple",
                ],
                explanation:
                  "Ndahu sert à demander où se trouve une personne ou un élément.",
                situationPrompt: "Tu veux savoir où se trouve Kassim.",
              },
            ],
            exercises: {
              recognition: false,
              contextChoice: true,
              fillBlank: true,
              letterBuilder: true,
              directThinking: true,
            },
            distractorConceptIds: [
              "questions-a1-concept-ndo",
              "questions-a1-concept-ndi",
              "questions-a1-concept-zabari",
            ],
            letterDistractors: ["I", "B"],
          },
          examples: [
            {
              id: "questions-a1-example-ndahu-simple",
              targetLanguageText: "Ndahu?",
              frenchText: "Où ?",
              contextId: "questions-a1-context-ndahu-place",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-example-ndahu-kassim",
              targetLanguageText: "Kassim nge ndahu?",
              frenchText: "Où est Kassim ?",
              contextId: "questions-a1-context-ndahu-place",
              ...draftUserProvidedContent,
            },
          ],
          contexts: [
            {
              id: "questions-a1-context-ndahu-place",
              conceptId: "questions-a1-concept-ndahu",
              label: "Demander un lieu",
              description: "Demander où se trouve une personne ou un élément.",
              exampleIds: [
                "questions-a1-example-ndahu-simple",
                "questions-a1-example-ndahu-kassim",
              ],
              ...draftUserProvidedContent,
            },
          ],
          exercises: [
            {
              id: "questions-a1-exercise-ndahu-recognition",
              type: "recognition",
              instruction: "Choisis le sens correct.",
              prompt: "Ndahu?",
              conceptId: "questions-a1-concept-ndahu",
              contextId: "questions-a1-context-ndahu-place",
              exampleId: "questions-a1-example-ndahu-simple",
              correctOptionId: "questions-a1-exercise-ndahu-recognition-correct",
              options: [
                {
                  id: "questions-a1-exercise-ndahu-recognition-correct",
                  text: "Où ?",
                  isCorrect: true,
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-ndahu-recognition-ndo",
                  text: "Qui ?",
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-ndahu-recognition-ndi",
                  text: "Quand ?",
                  ...draftUserProvidedContent,
                },
              ],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-exercise-ndahu-translation-target",
              type: "translation_to_target",
              instruction: "Traduis en shiKomori.",
              prompt: "Où est Kassim ?",
              conceptId: "questions-a1-concept-ndahu",
              contextId: "questions-a1-context-ndahu-place",
              exampleId: "questions-a1-example-ndahu-kassim",
              frenchText: "Où est Kassim ?",
              expectedAnswer: "Kassim nge ndahu?",
              acceptedAnswers: ["Kassim nge ndahu?"],
              ...draftUserProvidedContent,
            },
          ],
          ...draftUserProvidedContent,
        },
      ],
      ...draftUserProvidedContent,
    },
    {
      id: "questions-a1-block-person",
      chapterId: "shikomori-a1-questions-chapter",
      title: "Demander une personne",
      objective: "Utiliser Ndo pour demander qui ou à qui.",
      concepts: [
        {
          id: "questions-a1-concept-ndo",
          blockId: "questions-a1-block-person",
          key: "Ndo",
          title: "Ndo",
          lessonConfig: {
            template: "single_meaning",
            conceptKind: "question_word",
            primaryExampleId: "questions-a1-example-ndo-we",
            objectiveTitle: "Demander l’identité d’une personne",
            objective: "Savoir demander qui est une personne.",
            usages: [
              {
                id: "questions-a1-usage-ndo-identity",
                meaning: "Qui ?",
                contextId: "questions-a1-context-ndo-identity",
                exampleIds: [
                  "questions-a1-example-ndo-we",
                  "questions-a1-example-ndo-simple",
                ],
                explanation: "Ndo sert à demander qui est une personne.",
                situationPrompt:
                  "Tu veux connaître l’identité d’une personne.",
              },
            ],
            exercises: {
              recognition: false,
              contextChoice: true,
              fillBlank: true,
              letterBuilder: true,
              directThinking: true,
            },
            distractorConceptIds: [
              "questions-a1-concept-ndahu",
              "questions-a1-concept-ndi",
              "questions-a1-concept-zabari",
            ],
            letterDistractors: ["A", "I"],
          },
          examples: [
            {
              id: "questions-a1-example-ndo-simple",
              targetLanguageText: "Ndo?",
              frenchText: "Qui ?",
              contextId: "questions-a1-context-ndo-identity",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-example-ndo-we",
              targetLanguageText: "We ndo?",
              frenchText: "Qui es-tu ?",
              contextId: "questions-a1-context-ndo-identity",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-example-ndo-ya",
              targetLanguageText: "Ya ndo?",
              frenchText: "À qui ?",
              contextId: "questions-a1-context-ndo-recipient",
              ...draftUserProvidedContent,
            },
          ],
          contexts: [
            {
              id: "questions-a1-context-ndo-identity",
              conceptId: "questions-a1-concept-ndo",
              label: "Demander une identité",
              description: "Demander qui est une personne.",
              exampleIds: [
                "questions-a1-example-ndo-simple",
                "questions-a1-example-ndo-we",
              ],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-context-ndo-recipient",
              conceptId: "questions-a1-concept-ndo",
              label: "Demander à qui",
              description: "Demander à quelle personne une chose est destinée.",
              exampleIds: ["questions-a1-example-ndo-ya"],
              ...draftUserProvidedContent,
            },
          ],
          exercises: [
            {
              id: "questions-a1-exercise-ndo-fill-blank",
              type: "fill_blank",
              instruction: "Complète la phrase avec le mot interrogatif.",
              prompt: "We ____?",
              conceptId: "questions-a1-concept-ndo",
              contextId: "questions-a1-context-ndo-identity",
              exampleId: "questions-a1-example-ndo-we",
              expectedAnswer: "ndo",
              acceptedAnswers: ["ndo", "Ndo"],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-exercise-ndo-context-choice",
              type: "context_choice",
              instruction: "Choisis la question adaptée.",
              prompt: "Tu veux demander qui est ton interlocuteur.",
              conceptId: "questions-a1-concept-ndo",
              contextId: "questions-a1-context-ndo-identity",
              correctOptionId: "questions-a1-exercise-ndo-context-choice-correct",
              options: [
                {
                  id: "questions-a1-exercise-ndo-context-choice-correct",
                  text: "We ndo?",
                  isCorrect: true,
                  exampleId: "questions-a1-example-ndo-we",
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-ndo-context-choice-ya",
                  text: "Ya ndo?",
                  exampleId: "questions-a1-example-ndo-ya",
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-ndo-context-choice-simple",
                  text: "Ndo?",
                  exampleId: "questions-a1-example-ndo-simple",
                  ...draftUserProvidedContent,
                },
              ],
              ...draftUserProvidedContent,
            },
          ],
          ...draftUserProvidedContent,
        },
      ],
      ...draftUserProvidedContent,
    },
    {
      id: "questions-a1-block-time",
      chapterId: "shikomori-a1-questions-chapter",
      title: "Demander un moment",
      objective: "Utiliser Ndi pour demander quand.",
      concepts: [
        {
          id: "questions-a1-concept-ndi",
          blockId: "questions-a1-block-time",
          key: "Ndi",
          title: "Ndi",
          lessonConfig: {
            template: "single_meaning",
            conceptKind: "question_word",
            primaryExampleId: "questions-a1-example-ndi-lewo",
            objectiveTitle: "Demander quand ou quel jour",
            objective:
              "Savoir demander quand quelque chose se passe ou quel jour nous sommes.",
            usages: [
              {
                id: "questions-a1-usage-ndi-time",
                meaning: "Quand ?",
                contextId: "questions-a1-context-ndi-time",
                exampleIds: [
                  "questions-a1-example-ndi-lewo",
                  "questions-a1-example-ndi-simple",
                ],
                explanation: "Ndi sert à demander quand ou à parler du jour.",
                situationPrompt:
                  "Tu veux demander quel jour nous sommes aujourd’hui.",
              },
            ],
            exercises: {
              recognition: false,
              contextChoice: true,
              fillBlank: true,
              letterBuilder: true,
              directThinking: true,
            },
            distractorConceptIds: [
              "questions-a1-concept-ndahu",
              "questions-a1-concept-ndo",
              "questions-a1-concept-zabari",
            ],
            letterDistractors: ["A", "O"],
          },
          examples: [
            {
              id: "questions-a1-example-ndi-simple",
              targetLanguageText: "Ndi?",
              frenchText: "Quand ?",
              contextId: "questions-a1-context-ndi-time",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-example-ndi-lewo",
              targetLanguageText: "Lewo ndi?",
              frenchText: "Aujourd’hui, c’est quel jour ?",
              contextId: "questions-a1-context-ndi-time",
              ...draftUserProvidedContent,
            },
          ],
          contexts: [
            {
              id: "questions-a1-context-ndi-time",
              conceptId: "questions-a1-concept-ndi",
              label: "Demander un moment",
              description: "Demander quand ou quel est le moment concerné.",
              exampleIds: [
                "questions-a1-example-ndi-simple",
                "questions-a1-example-ndi-lewo",
              ],
              ...draftUserProvidedContent,
            },
          ],
          exercises: [
            {
              id: "questions-a1-exercise-ndi-recognition",
              type: "recognition",
              instruction: "Choisis le sens correct.",
              prompt: "Ndi?",
              conceptId: "questions-a1-concept-ndi",
              contextId: "questions-a1-context-ndi-time",
              exampleId: "questions-a1-example-ndi-simple",
              correctOptionId: "questions-a1-exercise-ndi-recognition-correct",
              options: [
                {
                  id: "questions-a1-exercise-ndi-recognition-correct",
                  text: "Quand ?",
                  isCorrect: true,
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-ndi-recognition-ndahu",
                  text: "Où ?",
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-ndi-recognition-zabari",
                  text: "Pourquoi ?",
                  ...draftUserProvidedContent,
                },
              ],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-exercise-ndi-translation-french",
              type: "translation_to_french",
              instruction: "Traduis en français.",
              prompt: "Lewo ndi?",
              conceptId: "questions-a1-concept-ndi",
              contextId: "questions-a1-context-ndi-time",
              exampleId: "questions-a1-example-ndi-lewo",
              targetLanguageText: "Lewo ndi?",
              expectedAnswer: "Aujourd’hui, c’est quel jour ?",
              acceptedAnswers: ["Aujourd’hui, c’est quel jour ?"],
              ...draftUserProvidedContent,
            },
          ],
          ...draftUserProvidedContent,
        },
      ],
      ...draftUserProvidedContent,
    },
    {
      id: "questions-a1-block-manner-state-price",
      chapterId: "shikomori-a1-questions-chapter",
      title: "Demander une manière, un état ou un prix",
      objective: "Utiliser Dje pour demander comment ou à combien.",
      concepts: [
        {
          id: "questions-a1-concept-dje",
          blockId: "questions-a1-block-manner-state-price",
          key: "Dje",
          title: "Dje",
          interactiveLesson: {
            id: "questions-a1-lesson-dje",
            conceptId: "questions-a1-concept-dje",
            title: "Leçon interactive - Dje",
            enabled: true,
            unavailableMessage:
              "Cette leçon interactive sera bientôt disponible.",
            steps: [
              {
                id: "questions-a1-lesson-dje-objective",
                type: "objective",
                title: "Comprendre les deux usages de Dje",
                objective:
                  "Savoir utiliser Dje pour demander comment ou demander un prix selon le contexte.",
                actionLabel: "Découvrir",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-dje-discovery-how",
                type: "discovery",
                title: "Premier usage : comment",
                exampleIds: [
                  "questions-a1-example-dje-action",
                  "questions-a1-example-dje-simple",
                ],
                explanation:
                  "Ici, Dje sert à demander comment va une personne.",
                audioLabel: "Audio bientôt disponible",
                actionLabel: "Continuer",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-dje-discovery-price",
                type: "discovery",
                title: "Deuxième usage : le prix",
                exampleIds: ["questions-a1-example-dje-carrots-sell-price"],
                explanation:
                  "Dans une situation de vente, Dje sert à demander combien ou à quel prix.",
                audioLabel: "Audio bientôt disponible",
                actionLabel: "Continuer",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-dje-context-how",
                type: "exercise",
                exerciseType: "context_choice",
                title: "Reconnaître le sens « comment »",
                prompt: "Dans quelle phrase Dje signifie-t-il « comment » ?",
                options: [
                  {
                    id: "questions-a1-lesson-dje-context-how-correct",
                    text: "Ye hufanyiha dje?",
                    isCorrect: true,
                    exampleId: "questions-a1-example-dje-action",
                    explanation:
                      "La phrase parle de l’état d’une personne : Dje signifie donc « comment ».",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-context-how-price",
                    text: "Zekaroti ngohuzo dje?",
                    exampleId: "questions-a1-example-dje-carrots-sell-price",
                    explanation:
                      "La phrase parle d'une vente, pas de l'état d'une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-context-how-place",
                    text: "Kassim nge ndahu?",
                    exampleId: "questions-a1-example-ndahu-kassim",
                    explanation:
                      "Cette question sert à demander où se trouve Kassim.",
                    ...draftUserProvidedContent,
                  },
                ],
                correctOptionId: "questions-a1-lesson-dje-context-how-correct",
                feedbackExplanation:
                  "La phrase parle de l’état d’une personne : Dje signifie donc « comment ».",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-dje-context-price",
                type: "exercise",
                exerciseType: "context_choice",
                title: "Reconnaître le sens lié au prix",
                prompt: "Dans quelle phrase Dje sert-il à demander un prix ?",
                options: [
                  {
                    id: "questions-a1-lesson-dje-context-price-ndo",
                    text: "We ndo?",
                    exampleId: "questions-a1-example-ndo-we",
                    explanation:
                      "Cette question sert à demander qui est une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-context-price-ndi",
                    text: "Lewo ndi?",
                    exampleId: "questions-a1-example-ndi-lewo",
                    explanation:
                      "Cette question sert à demander un jour ou un moment.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-context-price-correct",
                    text: "Zekaroti ngohuzo dje?",
                    isCorrect: true,
                    exampleId: "questions-a1-example-dje-carrots-sell-price",
                    explanation:
                      "La phrase concerne la vente de carottes : Dje demande donc combien ou à quel prix.",
                    ...draftUserProvidedContent,
                  },
                ],
                correctOptionId: "questions-a1-lesson-dje-context-price-correct",
                feedbackExplanation:
                  "La phrase concerne la vente de carottes : Dje demande donc combien ou à quel prix.",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-dje-fill-blank-how",
                type: "exercise",
                interactionType: "answer_card_grid",
                exerciseType: "fill_blank",
                title: "Phrase à compléter : comment",
                prompt: "Ye hufanyiha ______ ?",
                options: [
                  {
                    id: "questions-a1-lesson-dje-fill-blank-how-correct",
                    text: "Dje",
                    isCorrect: true,
                    explanation:
                      "Dje complète la question pour demander comment va une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-fill-blank-how-ndi",
                    text: "Ndi",
                    explanation:
                      "Dje complète la question pour demander comment va une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-fill-blank-how-ndo",
                    text: "Ndo",
                    explanation:
                      "Dje complète la question pour demander comment va une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-fill-blank-how-ndahu",
                    text: "Ndahu",
                    explanation:
                      "Dje complète la question pour demander comment va une personne.",
                    ...draftUserProvidedContent,
                  },
                ],
                correctOptionId: "questions-a1-lesson-dje-fill-blank-how-correct",
                feedbackExplanation:
                  "Dje complète la question pour demander comment va une personne.",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-dje-fill-blank-price",
                type: "exercise",
                interactionType: "answer_card_grid",
                exerciseType: "fill_blank",
                title: "Phrase à compléter : prix",
                prompt: "Zekaroti ngohuzo ______ ?",
                options: [
                  {
                    id: "questions-a1-lesson-dje-fill-blank-price-correct",
                    text: "Dje",
                    isCorrect: true,
                    explanation:
                      "Dje complète la question pour demander un prix.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-fill-blank-price-zabari",
                    text: "Zabari",
                    explanation:
                      "Dje complète la question pour demander un prix.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-fill-blank-price-ndo",
                    text: "Ndo",
                    explanation:
                      "Dje complète la question pour demander un prix.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-fill-blank-price-ndi",
                    text: "Ndi",
                    explanation:
                      "Dje complète la question pour demander un prix.",
                    ...draftUserProvidedContent,
                  },
                ],
                correctOptionId:
                  "questions-a1-lesson-dje-fill-blank-price-correct",
                feedbackExplanation:
                  "Dje complète la question pour demander un prix.",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-dje-translation-target",
                type: "exercise",
                interactionType: "letter_builder",
                exerciseType: "translation_to_target",
                title: "Construction avec lettres",
                instruction: "Construis le mot utilisé dans les deux phrases.",
                sentenceBefore: "",
                sentenceAfter: "",
                letterBank: ["D", "J", "E", "A", "I"],
                expectedAnswer: "DJE",
                slotCount: 3,
                completedText: "Dje",
                correctConstructionText: "Dje",
                explanation:
                  "Le même mot peut signifier « comment » ou servir à demander un prix selon le contexte.",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-dje-direct-thinking",
                type: "exercise",
                exerciseType: "direct_thinking",
                title: "Pensée directe",
                prompt:
                  "Une personne vend des carottes. Tu veux connaître son prix.",
                question: "Que dois-tu dire ?",
                options: [
                  {
                    id: "questions-a1-lesson-dje-direct-thinking-correct",
                    text: "Zekaroti ngohuzo dje?",
                    isCorrect: true,
                    exampleId: "questions-a1-example-dje-carrots-sell-price",
                    explanation:
                      "Cette question demande le prix dans une situation de vente.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-direct-thinking-how",
                    text: "Ye hufanyiha dje?",
                    exampleId: "questions-a1-example-dje-action",
                    explanation:
                      "Cette question demande comment va une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-dje-direct-thinking-time",
                    text: "Lewo ndi?",
                    exampleId: "questions-a1-example-ndi-lewo",
                    explanation:
                      "Cette question sert à demander un jour ou un moment.",
                    ...draftUserProvidedContent,
                  },
                ],
                correctOptionId:
                  "questions-a1-lesson-dje-direct-thinking-correct",
                ...draftUserProvidedContent,
              },
            ],
            result: {
              title: "Leçon terminée",
              xpPerCorrectAnswer: 10,
              thresholds: [
                {
                  minPercentage: 80,
                  label: "Maîtrisé",
                },
                {
                  minPercentage: 60,
                  label: "En acquisition",
                },
                {
                  minPercentage: 0,
                  label: "À retravailler",
                },
              ],
            },
            ...draftUserProvidedContent,
          },
          examples: [
            {
              id: "questions-a1-example-dje-simple",
              targetLanguageText: "Dje?",
              frenchText: "Comment ?",
              contextId: "questions-a1-context-dje-action",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-example-dje-how-are-you",
              targetLanguageText: "Ye dje?",
              frenchText: "Comment vas-tu ?",
              contextId: "questions-a1-context-dje-news",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-example-dje-action",
              targetLanguageText: "Ye hufanyiha dje?",
              frenchText: "Comment vas-tu ?",
              contextId: "questions-a1-context-dje-action",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-example-dje-carrots-sell-price",
              targetLanguageText: "Zekaroti ngohuzo dje?",
              frenchText: "À combien tu vends les carottes ?",
              contextId: "questions-a1-context-dje-price",
              ...draftUserProvidedContent,
            },
          ],
          contexts: [
            {
              id: "questions-a1-context-dje-news",
              conceptId: "questions-a1-concept-dje",
              label: "Prendre des nouvelles",
              description: "Demander comment va une personne.",
              exampleIds: ["questions-a1-example-dje-how-are-you"],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-context-dje-action",
              conceptId: "questions-a1-concept-dje",
              label: "Demander comment se passe une action",
              description: "Demander la manière ou l'état d'une action.",
              exampleIds: [
                "questions-a1-example-dje-simple",
                "questions-a1-example-dje-action",
              ],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-context-dje-price",
              conceptId: "questions-a1-concept-dje",
              label: "Demander un prix dans une situation commerciale",
              description: "Demander à combien une personne vend un produit.",
              exampleIds: ["questions-a1-example-dje-carrots-sell-price"],
              ...draftUserProvidedContent,
            },
          ],
          exercises: [
            {
              id: "questions-a1-exercise-dje-context-news",
              type: "context_choice",
              instruction: "Choisis la question adaptée.",
              prompt: "Tu veux prendre des nouvelles d'une personne.",
              conceptId: "questions-a1-concept-dje",
              contextId: "questions-a1-context-dje-news",
              correctOptionId: "questions-a1-exercise-dje-context-news-correct",
              options: [
                {
                  id: "questions-a1-exercise-dje-context-news-correct",
                  text: "Ye dje?",
                  isCorrect: true,
                  exampleId: "questions-a1-example-dje-how-are-you",
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-dje-context-news-price",
                  text: "Zekaroti ngohuzo dje?",
                  exampleId: "questions-a1-example-dje-carrots-sell-price",
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-dje-context-news-simple",
                  text: "Dje?",
                  exampleId: "questions-a1-example-dje-simple",
                  ...draftUserProvidedContent,
                },
              ],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-exercise-dje-translation-target",
              type: "translation_to_target",
              instruction: "Traduis en shiKomori.",
              prompt: "À combien tu vends les carottes ?",
              conceptId: "questions-a1-concept-dje",
              contextId: "questions-a1-context-dje-price",
              exampleId: "questions-a1-example-dje-carrots-sell-price",
              frenchText: "À combien tu vends les carottes ?",
              expectedAnswer: "Zekaroti ngohuzo dje?",
              acceptedAnswers: ["Zekaroti ngohuzo dje?"],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-exercise-dje-direct-thinking-action",
              type: "direct_thinking",
              instruction: "Choisis directement la question adaptée à la situation.",
              prompt: "Tu veux demander comment se passe une action.",
              conceptId: "questions-a1-concept-dje",
              contextId: "questions-a1-context-dje-action",
              exampleId: "questions-a1-example-dje-action",
              expectedAnswer: "Ye hufanyiha dje?",
              acceptedAnswers: ["Ye hufanyiha dje?"],
              ...draftUserProvidedContent,
            },
          ],
          ...draftUserProvidedContent,
        },
      ],
      ...draftUserProvidedContent,
    },
    {
      id: "questions-a1-block-thing-choice-quantity",
      chapterId: "shikomori-a1-questions-chapter",
      title: "Demander une chose, un choix ou une quantité",
      objective: "Utiliser Hindri pour demander quoi, quel ou combien.",
      concepts: [
        {
          id: "questions-a1-concept-hindri",
          blockId: "questions-a1-block-thing-choice-quantity",
          key: "Hindri",
          title: "Hindri",
          interactiveLesson: {
            id: "questions-a1-lesson-hindri",
            conceptId: "questions-a1-concept-hindri",
            title: "Leçon interactive - Hindri",
            enabled: true,
            unavailableMessage:
              "Cette leçon interactive sera bientôt disponible.",
            steps: [
              {
                id: "questions-a1-lesson-hindri-objective",
                type: "objective",
                title: "Comprendre les différents usages de Hindri",
                objective:
                  "Savoir utiliser Hindri pour demander quoi, quel ou combien selon le contexte.",
                actionLabel: "Découvrir",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-hindri-discovery-general",
                type: "discovery",
                title: "Sens général",
                exampleIds: ["questions-a1-example-hindri-simple"],
                explanation:
                  "Hindri permet généralement de demander une information sur une chose, un choix ou une quantité.",
                audioLabel: "Audio bientôt disponible",
                actionLabel: "Continuer",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-hindri-discovery-which",
                type: "discovery",
                title: "Demander quel",
                exampleIds: [
                  "questions-a1-example-hindri-work",
                  "questions-a1-example-hindri-person",
                ],
                explanation: "Ici, Hindri permet de demander quel travail.",
                audioLabel: "Audio bientôt disponible",
                actionLabel: "Continuer",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-hindri-discovery-action",
                type: "discovery",
                title: "Demander une action",
                exampleIds: ["questions-a1-example-hindri-action"],
                explanation:
                  "Dans cette phrase, Hindri sert à demander quelle action la personne effectue.",
                audioLabel: "Audio bientôt disponible",
                actionLabel: "Continuer",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-hindri-discovery-quantity-price",
                type: "discovery",
                title: "Demander une quantité ou un prix",
                exampleIds: ["questions-a1-example-hindri-carrots-cost"],
                explanation:
                  "Dans cette situation, Hindri sert à demander une quantité ou un prix.",
                audioLabel: "Audio bientôt disponible",
                actionLabel: "Continuer",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-hindri-context-which",
                type: "exercise",
                exerciseType: "context_choice",
                title: "Reconnaître le sens « quel »",
                prompt:
                  "Dans quelle phrase Hindri sert-il à demander « quel » ?",
                options: [
                  {
                    id: "questions-a1-lesson-hindri-context-which-correct",
                    text: "Hazi hindri?",
                    isCorrect: true,
                    exampleId: "questions-a1-example-hindri-work",
                    explanation: "Cette phrase demande quel travail.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-hindri-context-which-action",
                    text: "We ufanya hindri?",
                    exampleId: "questions-a1-example-hindri-action",
                    explanation:
                      "Cette phrase demande ce que fait une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-hindri-context-which-price",
                    text: "Zekaroti kilo hindri?",
                    exampleId: "questions-a1-example-hindri-carrots-cost",
                    explanation:
                      "Cette phrase sert à demander une quantité ou un prix.",
                    ...draftUserProvidedContent,
                  },
                ],
                correctOptionId:
                  "questions-a1-lesson-hindri-context-which-correct",
                feedbackExplanation: "Cette phrase demande quel travail.",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-hindri-context-quantity-price",
                type: "exercise",
                exerciseType: "context_choice",
                title: "Reconnaître le sens « combien »",
                prompt:
                  "Dans quelle phrase Hindri sert-il à demander combien ?",
                options: [
                  {
                    id: "questions-a1-lesson-hindri-context-quantity-price-person",
                    text: "Mdru hindri?",
                    exampleId: "questions-a1-example-hindri-person",
                    explanation:
                      "Cette phrase demande quelle personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-hindri-context-quantity-price-correct",
                    text: "Zekaroti kilo hindri?",
                    isCorrect: true,
                    exampleId: "questions-a1-example-hindri-carrots-cost",
                    explanation:
                      "La phrase demande le prix ou la quantité liée aux carottes.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-hindri-context-quantity-price-action",
                    text: "We ufanya hindri?",
                    exampleId: "questions-a1-example-hindri-action",
                    explanation:
                      "Cette phrase demande ce que fait une personne.",
                    ...draftUserProvidedContent,
                  },
                ],
                correctOptionId:
                  "questions-a1-lesson-hindri-context-quantity-price-correct",
                feedbackExplanation:
                  "La phrase demande le prix ou la quantité liée aux carottes.",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-hindri-fill-blank-action",
                type: "exercise",
                interactionType: "answer_card_grid",
                exerciseType: "fill_blank",
                title: "Phrase à compléter",
                prompt: "We ufanya ______ ?",
                options: [
                  {
                    id: "questions-a1-lesson-hindri-fill-blank-action-correct",
                    text: "Hindri",
                    isCorrect: true,
                    explanation:
                      "Hindri complète la phrase pour demander ce que fait une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-hindri-fill-blank-action-dje",
                    text: "Dje",
                    explanation:
                      "Hindri complète la phrase pour demander ce que fait une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-hindri-fill-blank-action-ndo",
                    text: "Ndo",
                    explanation:
                      "Hindri complète la phrase pour demander ce que fait une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-hindri-fill-blank-action-ndi",
                    text: "Ndi",
                    explanation:
                      "Hindri complète la phrase pour demander ce que fait une personne.",
                    ...draftUserProvidedContent,
                  },
                ],
                correctOptionId:
                  "questions-a1-lesson-hindri-fill-blank-action-correct",
                feedbackExplanation:
                  "Hindri complète la phrase pour demander ce que fait une personne.",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-hindri-translation-target",
                type: "exercise",
                interactionType: "letter_builder",
                exerciseType: "translation_to_target",
                title: "Construction avec lettres",
                instruction: "Complète la phrase : Que fais-tu ?",
                sentenceBefore: "We ufanya",
                sentenceAfter: "?",
                letterBank: ["H", "I", "N", "D", "R", "I", "A", "O"],
                expectedAnswer: "HINDRI",
                slotCount: 6,
                completedText: "We ufanya hindri?",
                correctConstructionText: "We ufanya hindri?",
                explanation:
                  "Tu as construit Hindri, utilisé ici pour demander ce que fait une personne.",
                ...draftUserProvidedContent,
              },
              {
                id: "questions-a1-lesson-hindri-direct-thinking",
                type: "exercise",
                exerciseType: "direct_thinking",
                title: "Pensée directe",
                prompt:
                  "Une personne est occupée. Tu veux lui demander ce qu’elle fait.",
                question: "Que dois-tu dire ?",
                options: [
                  {
                    id: "questions-a1-lesson-hindri-direct-thinking-correct",
                    text: "We ufanya hindri?",
                    isCorrect: true,
                    exampleId: "questions-a1-example-hindri-action",
                    explanation:
                      "Cette question demande ce que fait une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-hindri-direct-thinking-dje",
                    text: "Ye hufanyiha dje?",
                    exampleId: "questions-a1-example-dje-action",
                    explanation:
                      "Cette question sert à demander comment va une personne.",
                    ...draftUserProvidedContent,
                  },
                  {
                    id: "questions-a1-lesson-hindri-direct-thinking-ndi",
                    text: "Lewo ndi?",
                    exampleId: "questions-a1-example-ndi-lewo",
                    explanation:
                      "Cette question sert à demander un jour ou un moment.",
                    ...draftUserProvidedContent,
                  },
                ],
                correctOptionId:
                  "questions-a1-lesson-hindri-direct-thinking-correct",
                ...draftUserProvidedContent,
              },
            ],
            result: {
              title: "Leçon terminée",
              xpPerCorrectAnswer: 10,
              thresholds: [
                {
                  minPercentage: 80,
                  label: "Maîtrisé",
                },
                {
                  minPercentage: 60,
                  label: "En acquisition",
                },
                {
                  minPercentage: 0,
                  label: "À retravailler",
                },
              ],
            },
            ...draftUserProvidedContent,
          },
          examples: [
            {
              id: "questions-a1-example-hindri-simple",
              targetLanguageText: "Hindri?",
              frenchText: "Quoi ?",
              contextId: "questions-a1-context-hindri-what",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-example-hindri-person",
              targetLanguageText: "Mdru hindri?",
              frenchText: "Quelle personne ?",
              contextId: "questions-a1-context-hindri-which",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-example-hindri-work",
              targetLanguageText: "Hazi hindri?",
              frenchText: "Quel travail ?",
              contextId: "questions-a1-context-hindri-which",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-example-hindri-action",
              targetLanguageText: "We ufanya hindri?",
              frenchText: "Que fais-tu ?",
              contextId: "questions-a1-context-hindri-action",
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-example-hindri-carrots-cost",
              targetLanguageText: "Zekaroti kilo hindri?",
              frenchText: "Les carottes coûtent combien ?",
              contextId: "questions-a1-context-hindri-quantity-price",
              ...draftUserProvidedContent,
            },
          ],
          contexts: [
            {
              id: "questions-a1-context-hindri-what",
              conceptId: "questions-a1-concept-hindri",
              label: "Demander quoi",
              description: "Demander la nature d'une chose.",
              exampleIds: ["questions-a1-example-hindri-simple"],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-context-hindri-which",
              conceptId: "questions-a1-concept-hindri",
              label: "Demander quel ou quelle",
              description: "Demander un choix ou une catégorie.",
              exampleIds: [
                "questions-a1-example-hindri-person",
                "questions-a1-example-hindri-work",
              ],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-context-hindri-action",
              conceptId: "questions-a1-concept-hindri",
              label: "Demander une action",
              description: "Demander ce qu'une personne fait.",
              exampleIds: ["questions-a1-example-hindri-action"],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-context-hindri-quantity-price",
              conceptId: "questions-a1-concept-hindri",
              label: "Demander une quantité ou un prix",
              description: "Demander combien coûte ou représente une quantité.",
              exampleIds: ["questions-a1-example-hindri-carrots-cost"],
              ...draftUserProvidedContent,
            },
          ],
          exercises: [
            {
              id: "questions-a1-exercise-hindri-recognition",
              type: "recognition",
              instruction: "Choisis le sens correct.",
              prompt: "Hindri?",
              conceptId: "questions-a1-concept-hindri",
              contextId: "questions-a1-context-hindri-what",
              exampleId: "questions-a1-example-hindri-simple",
              correctOptionId: "questions-a1-exercise-hindri-recognition-correct",
              options: [
                {
                  id: "questions-a1-exercise-hindri-recognition-correct",
                  text: "Quoi ?",
                  isCorrect: true,
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-hindri-recognition-where",
                  text: "Où ?",
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-hindri-recognition-why",
                  text: "Pourquoi ?",
                  ...draftUserProvidedContent,
                },
              ],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-exercise-hindri-context-work",
              type: "context_choice",
              instruction: "Choisis la question adaptée.",
              prompt: "Tu veux demander quel travail.",
              conceptId: "questions-a1-concept-hindri",
              contextId: "questions-a1-context-hindri-which",
              correctOptionId: "questions-a1-exercise-hindri-context-work-correct",
              options: [
                {
                  id: "questions-a1-exercise-hindri-context-work-correct",
                  text: "Hazi hindri?",
                  isCorrect: true,
                  exampleId: "questions-a1-example-hindri-work",
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-hindri-context-work-person",
                  text: "Mdru hindri?",
                  exampleId: "questions-a1-example-hindri-person",
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-hindri-context-work-action",
                  text: "We ufanya hindri?",
                  exampleId: "questions-a1-example-hindri-action",
                  ...draftUserProvidedContent,
                },
              ],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-exercise-hindri-translation-action",
              type: "translation_to_target",
              instruction: "Traduis en shiKomori.",
              prompt: "Que fais-tu ?",
              conceptId: "questions-a1-concept-hindri",
              contextId: "questions-a1-context-hindri-action",
              exampleId: "questions-a1-example-hindri-action",
              frenchText: "Que fais-tu ?",
              expectedAnswer: "We ufanya hindri?",
              acceptedAnswers: ["We ufanya hindri?"],
              ...draftUserProvidedContent,
            },
          ],
          ...draftUserProvidedContent,
        },
      ],
      ...draftUserProvidedContent,
    },
    {
      id: "questions-a1-block-reason",
      chapterId: "shikomori-a1-questions-chapter",
      title: "Demander une raison",
      objective: "Utiliser Zabari pour demander pourquoi.",
      concepts: [
        {
          id: "questions-a1-concept-zabari",
          blockId: "questions-a1-block-reason",
          key: "Zabari",
          title: "Zabari",
          lessonConfig: {
            template: "single_meaning",
            conceptKind: "question_word",
            primaryExampleId: "questions-a1-example-zabari-simple",
            objectiveTitle: "Demander une raison",
            objective: "Savoir utiliser Zabari pour demander pourquoi.",
            usages: [
              {
                id: "questions-a1-usage-zabari-reason",
                meaning: "Pourquoi ?",
                contextId: "questions-a1-context-zabari-reason",
                exampleIds: ["questions-a1-example-zabari-simple"],
                explanation:
                  "Zabari sert à demander la raison d’une action ou d’une situation.",
                situationPrompt:
                  "Tu veux connaître la raison d’une action.",
              },
            ],
            exercises: {
              recognition: true,
              contextChoice: true,
              fillBlank: true,
              letterBuilder: true,
              directThinking: true,
            },
            distractorConceptIds: [
              "questions-a1-concept-ndahu",
              "questions-a1-concept-ndo",
              "questions-a1-concept-ndi",
            ],
            letterDistractors: ["N", "O"],
          },
          examples: [
            {
              id: "questions-a1-example-zabari-simple",
              targetLanguageText: "Zabari?",
              frenchText: "Pourquoi ?",
              contextId: "questions-a1-context-zabari-reason",
              ...draftUserProvidedContent,
            },
          ],
          contexts: [
            {
              id: "questions-a1-context-zabari-reason",
              conceptId: "questions-a1-concept-zabari",
              label: "Demander une raison",
              description: "Demander pourquoi.",
              exampleIds: ["questions-a1-example-zabari-simple"],
              ...draftUserProvidedContent,
            },
          ],
          exercises: [
            {
              id: "questions-a1-exercise-zabari-recognition",
              type: "recognition",
              instruction: "Choisis le sens correct.",
              prompt: "Zabari?",
              conceptId: "questions-a1-concept-zabari",
              contextId: "questions-a1-context-zabari-reason",
              exampleId: "questions-a1-example-zabari-simple",
              correctOptionId: "questions-a1-exercise-zabari-recognition-correct",
              options: [
                {
                  id: "questions-a1-exercise-zabari-recognition-correct",
                  text: "Pourquoi ?",
                  isCorrect: true,
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-zabari-recognition-where",
                  text: "Où ?",
                  ...draftUserProvidedContent,
                },
                {
                  id: "questions-a1-exercise-zabari-recognition-what",
                  text: "Quoi ?",
                  ...draftUserProvidedContent,
                },
              ],
              ...draftUserProvidedContent,
            },
            {
              id: "questions-a1-exercise-zabari-translation-target",
              type: "translation_to_target",
              instruction: "Traduis en shiKomori.",
              prompt: "Pourquoi ?",
              conceptId: "questions-a1-concept-zabari",
              contextId: "questions-a1-context-zabari-reason",
              exampleId: "questions-a1-example-zabari-simple",
              frenchText: "Pourquoi ?",
              expectedAnswer: "Zabari?",
              acceptedAnswers: ["Zabari?"],
              ...draftUserProvidedContent,
            },
          ],
          ...draftUserProvidedContent,
        },
      ],
      ...draftUserProvidedContent,
    },
  ],
  assessments: [shikomoriQuestionsA1Assessment],
  ...draftUserProvidedContent,
};

export const shikomoriQuestionsA1Skill: Skill = {
  id: "poser-une-question",
  languageId: "shikomori",
  levelId: "shikomori-a1",
  title: "Poser une question",
  chapters: [shikomoriQuestionsA1Chapter],
};

export const shikomoriQuestionsA1Level: LanguageLevel = {
  id: "shikomori-a1",
  languageId: "shikomori",
  level: "A1",
  title: "A1",
  skills: [shikomoriQuestionsA1Skill],
};

export const shikomoriLanguage: Language = {
  id: "shikomori",
  name: "shiKomori",
  autonym: "shiKomori",
  levels: [shikomoriQuestionsA1Level],
};

export const shikomoriQuestionsA1Path = {
  language: shikomoriLanguage,
  level: shikomoriQuestionsA1Level,
  skill: shikomoriQuestionsA1Skill,
  chapter: shikomoriQuestionsA1Chapter,
};
