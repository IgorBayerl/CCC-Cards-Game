// src/validation/gameEventsValidation.ts
import { z } from 'zod'
import { IDeck } from '../models/Deck'

export const SetConfigSchema = z.object({
  roomSize: z.number().min(2).max(10),
  decks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      language: z.string(),
      cards: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
        })
      ),
    })
  ),
})
