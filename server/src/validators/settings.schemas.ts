import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  walletAddress: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  twitterHandle: z.string().optional(),
  githubUrl: z.string().url().optional(),
});

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  feedbackNotifications: z.boolean().optional(),
  projectUpdates: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1),
});
