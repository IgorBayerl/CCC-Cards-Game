// src/validation/gameEventsValidation.ts
import { z } from 'zod'

export const UsernameSchema = z.string().min(3).max(20)
