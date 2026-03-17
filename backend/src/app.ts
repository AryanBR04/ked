import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { corsOptions } from "./config/security";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { authRouter } from "./modules/auth/auth.routes";
import { healthRouter } from "./modules/health/health.routes";
import { progressRouter } from "./modules/progress/progress.routes";
import { subjectRouter } from "./modules/subjects/subject.routes";
import { youtubeRouter } from "./modules/youtube/youtube.routes";
import { videoRouter } from "./modules/videos/video.routes";
import { learningPathsRouter } from "./modules/learning-paths/learning-paths.routes";
import { careerTracksRouter } from "./modules/career-tracks/career-tracks.routes";
import learningRouter from "./modules/learning-stats/learning.routes";
import { notesRouter } from "./modules/notes/notes.routes";
import projectsRouter from "./modules/project/project.routes";
import { savedCoursesRouter } from "./modules/saved-courses/saved-courses.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json());
  app.use(requestLogger);

  app.use("/api/health", healthRouter);
  app.use("/api/search", (req, res, next) => {
    // Standardize tech search to /api/youtube/search
    if (req.query.q) {
      req.url = "/search";
      req.query.tech = req.query.q;
    }
    next();
  }, youtubeRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/subjects", subjectRouter);
  app.use("/api/videos", videoRouter);
  app.use("/api/progress", progressRouter);
  app.use("/api/youtube", youtubeRouter);
  app.use("/api/learning-paths", learningPathsRouter);
  app.use("/api/career-tracks", careerTracksRouter);
  app.use("/api/learning-stats", learningRouter);
  app.use("/api/notes", notesRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/saved-courses", savedCoursesRouter);

  app.use(errorHandler);

  return app;
}
