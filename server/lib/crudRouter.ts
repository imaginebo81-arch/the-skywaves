import { Router } from "express";
import type { ZodSchema } from "zod";
import { asyncHandler, ok } from "./http";
import { validate } from "../middleware/validate";
import { requireAdmin } from "../middleware/auth";
import { parseListQuery } from "./pagination";
import type { createCrud } from "./crud";

type Crud<Dto> = ReturnType<typeof createCrud<Dto>>;

interface CrudRouterConfig<Dto> {
  crud: Crud<Dto>;
  createSchema: ZodSchema;
  updateSchema: ZodSchema;
  toRow: (input: Record<string, unknown>) => Record<string, unknown>;
}

export function buildCrudRouter<Dto>(config: CrudRouterConfig<Dto>) {
  const { crud, createSchema, updateSchema, toRow } = config;
  const router = Router();
  router.use(requireAdmin);

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      ok(res, await crud.list(parseListQuery(req.query)));
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      ok(res, await crud.get(req.params.id));
    })
  );

  router.post(
    "/",
    validate(createSchema),
    asyncHandler(async (req, res) => {
      const row = toRow(req.body as Record<string, unknown>);
      ok(res, await crud.create(row, req.admin!.sub), 201);
    })
  );

  router.patch(
    "/:id",
    validate(updateSchema),
    asyncHandler(async (req, res) => {
      const row = toRow(req.body as Record<string, unknown>);
      ok(res, await crud.update(req.params.id, row, req.admin!.sub));
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      ok(res, await crud.softDelete(req.params.id, req.admin!.sub));
    })
  );

  router.post(
    "/:id/restore",
    asyncHandler(async (req, res) => {
      ok(res, await crud.restore(req.params.id, req.admin!.sub));
    })
  );

  router.post(
    "/:id/archive",
    asyncHandler(async (req, res) => {
      ok(res, await crud.archive(req.params.id, req.admin!.sub));
    })
  );

  router.post(
    "/:id/unarchive",
    asyncHandler(async (req, res) => {
      ok(res, await crud.unarchive(req.params.id, req.admin!.sub));
    })
  );

  return router;
}
