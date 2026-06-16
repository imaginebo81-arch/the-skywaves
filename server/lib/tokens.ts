import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../env";

export interface AdminTokenPayload {
  sub: string;
  username: string;
  role: "superadmin" | "admin";
}

export function signAdminToken(payload: AdminTokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
}

export function signResultToken(rollNumber: string): string {
  const options: SignOptions = { expiresIn: env.RESULT_TOKEN_TTL_SECONDS };
  return jwt.sign({ scope: "result", rollNumber }, env.JWT_SECRET, options);
}

export function verifyResultToken(token: string): { rollNumber: string } {
  const decoded = jwt.verify(token, env.JWT_SECRET) as {
    scope?: string;
    rollNumber?: string;
  };
  if (decoded.scope !== "result" || !decoded.rollNumber) {
    throw new Error("Invalid result token");
  }
  return { rollNumber: decoded.rollNumber };
}
