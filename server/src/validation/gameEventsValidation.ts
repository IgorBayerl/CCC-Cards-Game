// src/validation/gameEventsValidation.ts
import { z } from 'zod'

export const SetConfigSchema = z.object({
  roomSize: z.number().min(4).max(20),
  decks: z.array(z.string()),
  scoreToWin: z.number().min(4).max(20),
  time: z.number().min(30).max(120),
})

export const AdmCommandSchema = z.enum(['start', 'next_round', 'end'])
