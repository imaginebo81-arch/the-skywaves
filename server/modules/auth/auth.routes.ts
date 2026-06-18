import { Router } from "express";
import { z } from "zod";
import { env, isProd } from "../../env";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin } from "../../middleware/auth";
import { authRateLimit } from "../../middleware/rateLimit";
import { writeAudit } from "../../lib/audit";
import { getProfile, login } from "./auth.service";

const router = Router();

const loginSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(200),
});

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  maxAge: 8 * 60 * 60 * 1000,
  path: "/",
};

router.post(
  "/login",
  authRateLimit,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body as z.infer<typeof loginSchema>;
    try {
      const { token, admin } = await login(username, password);
      res.cookie(env.ADMIN_COOKIE_NAME, token, cookieOptions);
      await writeAudit({ actorId: admin.id, action: "auth.login", entity: "admin_users", entityId: admin.id });
      ok(res, { admin });
    } catch (err) {
      await writeAudit({ actorId: "public", action: "auth.login_fail", entity: "admin_users", entityId: username, newValue: { username } }).catch(() => {});
      throw err;
    }
  })
);

router.post(
  "/logout",
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.clearCookie(env.ADMIN_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    await writeAudit({
      actorId: req.admin!.sub,
      action: "auth.logout",
      entity: "admin_users",
      entityId: req.admin!.sub,
    });
    ok(res, { success: true });
  })
);

router.get(
  "/me",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const profile = await getProfile(req.admin!.sub);
    ok(res, { admin: profile });
  })
);

export default router;
