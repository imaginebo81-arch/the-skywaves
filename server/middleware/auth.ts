import type { NextFunction, Request, Response } from "express";
import { env } from "../env";
import { ApiError } from "../lib/errors";
import { verifyAdminToken, type AdminTokenPayload } from "../lib/tokens";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.ADMIN_COOKIE_NAME];
  if (!token) {
    throw ApiError.unauthorized();
  }
  try {
    req.admin = verifyAdminToken(token);
    next();
  } catch {
    throw ApiError.unauthorized("Session expired or invalid");
  }
}

export function requireRole(...roles: AdminTokenPayload["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) throw ApiError.unauthorized();
    if (!roles.includes(req.admin.role)) {
      throw ApiError.forbidden("This action requires elevated privileges");
    }
    next();
  };
}
