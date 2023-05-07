// src/validation/gameEventsValidation.ts
import { z } from 'zod'

export const JoinRequestSchema = z.object({
  username: z.string().min(3).max(20),
  pictureUrl: z.string(),
  roomId: z.string().uuid(),
})

