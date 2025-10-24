import { z } from "zod";

export const approveFeedbackSchema = z.object({
  rewardAmount: z.number().min(0),
  qualityScore: z.number().min(0).max(100).optional(),
});

export const rejectFeedbackSchema = z.object({
  reason: z.string().optional(),
});
