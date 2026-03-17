import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { optionalAuth } from "../../middleware/optionalAuthMiddleware";
import * as projectController from "./project.controller";

const router = Router();

// Public routes
router.get("/all", projectController.getAllProjectsController);
router.get("/suggested", optionalAuth, projectController.getSuggestedProjectsController);
router.get("/portfolio/:userId?", optionalAuth, projectController.getUserPortfolioController);

// Authenticated routes
router.get("/stats", requireAuth, projectController.getProjectStatsController);
router.get("/recommended", requireAuth, projectController.getPersonalizedRecommendationsController);

// Base / parametrized routes
router.get("/", optionalAuth, projectController.getAvailableProjectsController);
router.get("/:id", optionalAuth, projectController.getProjectDetailsController);

router.post("/start", requireAuth, projectController.startUserProjectController);
router.post("/complete", requireAuth, projectController.completeUserProjectController);

export default router;
