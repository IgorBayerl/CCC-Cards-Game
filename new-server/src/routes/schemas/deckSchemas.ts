import {z} from "zod";

export const DeckWithCardsSchema = z.object({
  title: z.string(),
  description: z.string(),
  darknessLevel: z.number(),
  icon: z.string(),
  language: z.string(),
  cards: z.object({
    questions: z.array(
      z.object({
        text: z.string(),
        spaces: z.number(),
      }),
    ),
    answers: z.array(
      z.object({
        text: z.string(),
      }),
    ),
  }),
});

export const DeckFiltersSchema = z.object({
  darknessLevel: z.array(
    z.number().refine(value => [1, 2, 3, 4, 5].includes(value), {
      message:
        "Invalid value for darknessLevel, expected values are [1, 2, 3, 4, 5]",
    }),
  ),
  language: z.array(z.string()),
});

export const QuestionSchema = z.object({
  text: z.string(),
  spaces: z.number(),
  deckId: z.string(),
});

export const AnswerSchema = z.object({
  text: z.string(),
  deckId: z.string(),
});

export const DeckSchema = z.object({
  title: z.string(),
  description: z.string(),
  language: z.string(),
  icon: z.string(),
  darknessLevel: z.number(),
});

export type TDeckWithCards = z.infer<typeof DeckWithCardsSchema>;
export type TDeckFilters = z.infer<typeof DeckFiltersSchema>;
export type TQuestion = z.infer<typeof QuestionSchema>;
export type TAnswer = z.infer<typeof AnswerSchema>;
export type TDeck = z.infer<typeof DeckSchema>;
