import { z } from 'zod'

export const DecksQuerySchema = z.object({
  language: z.string().optional(),
  category: z
    .string()
    .transform((val) => {
      const parsed = parseInt(val, 10)
      return isNaN(parsed) ? undefined : parsed
    })
    .refine((val) => val === undefined || (val >= 0 && val <= 5), {
      message: 'Category must be between 0 and 5',
      path: ['category'],
    })
    .optional(),
})
