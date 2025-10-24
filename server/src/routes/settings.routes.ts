import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import {
  changePassword,
  updateProfile,
  updateNotificationSettings,
  deleteAccount,
} from "../controllers/settings.controller.js";
import {
  changePasswordSchema,
  updateProfileSchema,
  notificationSettingsSchema,
  deleteAccountSchema,
} from "../validators/settings.schemas.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.put("/password", validateBody(changePasswordSchema), changePassword);

router.put("/profile", validateBody(updateProfileSchema), updateProfile);

router.put(
  "/notifications",
  validateBody(notificationSettingsSchema),
  updateNotificationSettings
);

router.delete("/account", validateBody(deleteAccountSchema), deleteAccount);

export default router;
