// src/validation/gameEventsValidation.ts
import {z} from "zod";

export const onJoinOptions = z.object({
  username: z.string().min(1).max(20),
  pictureUrl: z.string(),
  oldPlayerId: z.string().optional(),
  channelId: z.string().optional(),
});

export type IJoinRequest = z.infer<typeof onJoinOptions>;
