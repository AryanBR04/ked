import type { NextFunction, Request, Response } from "express";

export function requestLogger(request: Request, response: Response, next: NextFunction) {
  const start = Date.now();

  response.on("finish", () => {
    const duration = Date.now() - start;
    console.info(
      `${request.method} ${request.originalUrl} ${response.statusCode} ${duration}ms`
    );
  });

  next();
}

