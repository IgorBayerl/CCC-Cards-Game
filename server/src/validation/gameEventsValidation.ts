// src/validation/gameEventsValidation.ts
import { z } from 'zod'

export const SetConfigSchema = z.object({
  roomSize: z.number().min(4).max(20),
  decks: z.array(z.string()),
})
