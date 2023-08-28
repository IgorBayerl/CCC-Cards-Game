// src/validation/gameEventsValidation.ts
import {z} from "zod";

const DeckData = z.object({
  id: z.string(),
  name: z.string(),
  language: z.string(),
  description: z.string(),
  category: z.number(),
  icon: z.string(),
  questions: z.number(),
  answers: z.number(),
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
