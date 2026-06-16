import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/errors";
import { isProd } from "../env";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Endpoint not found", code: "NOT_FOUND" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  console.error("[error]", err);
  res.status(500).json({
    error: isProd ? "Something went wrong" : String((err as Error)?.message ?? err),
    code: "INTERNAL_ERROR",
  });
}
