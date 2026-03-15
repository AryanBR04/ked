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

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json());
  app.use(requestLogger);

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/subjects", subjectRouter);
  app.use("/api/videos", videoRouter);
  app.use("/api/progress", progressRouter);
  app.use("/api/youtube", youtubeRouter);

  app.use(errorHandler);

  return app;
}
