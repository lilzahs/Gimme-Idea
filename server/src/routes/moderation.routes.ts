import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import {
  getModerationQueue,
  approveFeedback,
  rejectFeedback,
  autoApproveAll,
} from "../controllers/moderation.controller.js";
import {
  approveFeedbackSchema,
  rejectFeedbackSchema,
} from "../validators/moderation.schemas.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.get("/", getModerationQueue);
router.post(
  "/:id/approve",
  validateBody(approveFeedbackSchema),
  approveFeedback
);
router.post("/:id/reject", validateBody(rejectFeedbackSchema), rejectFeedback);
router.post("/auto-approve", autoApproveAll);

export default router;
