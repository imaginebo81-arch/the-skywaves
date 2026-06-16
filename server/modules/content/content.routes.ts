import { Router } from "express";
import { z } from "zod";
import { asyncHandler, ok } from "../../lib/http";
import { validate } from "../../middleware/validate";
import { requireAdmin } from "../../middleware/auth";
import {
  getContentKey,
  getMergedContent,
  listContentKeys,
  restoreContent,
  upsertContent,
} from "./content.service";

export const publicContentRouter = Router();

publicContentRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    ok(res, { content: await getMergedContent() });
  })
);

publicContentRouter.get(
  "/:key",
  asyncHandler(async (req, res) => {
    ok(res, await getContentKey(req.params.key));
  })
);

export const adminContentRouter = Router();
adminContentRouter.use(requireAdmin);

const upsertSchema = z.object({ data: z.unknown() });

adminContentRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    ok(res, { keys: await listContentKeys() });
  })
);

adminContentRouter.get(
  "/:key",
  asyncHandler(async (req, res) => {
    ok(res, await getContentKey(req.params.key));
  })
);

adminContentRouter.put(
  "/:key",
  validate(upsertSchema),
  asyncHandler(async (req, res) => {
    const { data } = req.body as { data: unknown };
    ok(res, await upsertContent(req.params.key, data, req.admin!.sub));
  })
);

adminContentRouter.post(
  "/:key/restore",
  asyncHandler(async (req, res) => {
    ok(res, await restoreContent(req.params.key, req.admin!.sub));
  })
);
