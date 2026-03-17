import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import * as learningController from "./learning.controller";

const router = Router();

router.get("/", requireAuth, learningController.getAnalytics);

export default router;
