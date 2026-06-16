import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../lib/errors";

type Source = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      // Reassign parsed/coerced values back so handlers receive clean data.
      if (source === "query") {
        (req as Request & { validatedQuery?: unknown }).validatedQuery = parsed;
      } else {
        req[source] = parsed;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw ApiError.badRequest("Validation failed", err.issues);
      }
      throw err;
    }
  };
}
