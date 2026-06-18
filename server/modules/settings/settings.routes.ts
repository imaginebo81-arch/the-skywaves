import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin } from "../../middleware/auth";
import { listSettings, setSetting, getSocialLinks } from "./settings.service";

export const publicSettingsRouter = Router();
publicSettingsRouter.get("/social-links", asyncHandler(async (_req, res) => {
  ok(res, await getSocialLinks());
}));

export const adminSettingsRouter = Router();
adminSettingsRouter.use(requireAdmin);

const setSchema = z.object({ value: z.unknown() });

adminSettingsRouter.get("/", asyncHandler(async (_req, res) => {
  ok(res, { settings: await listSettings() });
}));

adminSettingsRouter.put("/:key", validate(setSchema), asyncHandler(async (req, res) => {
  const { value } = req.body as { value: unknown };
  ok(res, await setSetting(req.params.key, value, req.admin!.sub));
}));
