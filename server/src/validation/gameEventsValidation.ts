// src/validation/gameEventsValidation.ts
import { z } from 'zod'

export const SetConfigSchema = z.object({
  roomSize: z.number().min(4).max(20),
  decks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      language: z.string(),
      description: z.string(),
      category: z.number(),
      icon: z.string(),
      questions: z.number(),
      answers: z.number(),
      selected: z.boolean().optional(),
    })
  ),
  scoreToWin: z.number().min(1).max(20),
  // scoreToWin: z.number().min(4).max(20),
  time: z.number().min(10).max(60),
})

export const AdmCommandSchema = z.enum([
  'start',
  'next_round',
  'end',
  'start-new-game',
  'back-to-lobby',
])

