// src/validation/gameEventsValidation.ts
import { z } from 'zod'

export const JoinRequestSchema = z.object({
  username: z.string().min(1).max(20),
  pictureUrl: z.string(),
  roomId: z.string().uuid(),
  oldSocketId: z.string().optional(),
})

