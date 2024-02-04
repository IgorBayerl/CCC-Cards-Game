// src/validation/gameEventsValidation.ts
import {z} from "zod";

const DeckData = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  darknessLevel: z.number(),
  icon: z.string(),
  language: z.string(),
  questionCount: z.number(),
  answerCount: z.number(),
  selected: z.boolean().optional(),
});

export const setConfigData = z
  .object({
    roomSize: z.number().min(4).max(20),
    availableDecks: z.array(DeckData).optional(),
    scoreToWin: z.number().min(1).max(20),
    roundTime: z.number().min(10).max(60),
  })
  .partial();

export type ISetConfigData = z.infer<typeof setConfigData>;

// Card.ts
const cardSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const answerCardSchema = cardSchema;

export const questionCardSchema = cardSchema.extend({
  spaces: z.number(),
});

// PlayerSelectionPayload schema
export const playerSelectionPayloadSchema = z.object({
  selection: z.array(answerCardSchema),
});

export const judgeDecisionPayloadSchema = z.object({
  winner: z.string(),
});
