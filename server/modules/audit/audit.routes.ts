import { Router } from "express";
import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { asyncHandler, ok } from "../../lib/http";
import { requireAdmin } from "../../middleware/auth";
import { buildListResponse, parseListQuery, range } from "../../lib/pagination";

export const adminAuditRouter = Router();
adminAuditRouter.use(requireAdmin);

adminAuditRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = parseListQuery(req.query);
    let builder = supabase
      .from("audit_logs")
      .select("id, action, entity, entity_id, prev_value, new_value, created_at, actor_admin_id, admin_users(username, display_name)", { count: "exact" });

    if (typeof req.query.entity === "string") builder = builder.eq("entity", req.query.entity);
    if (typeof req.query.entityId === "string") builder = builder.eq("entity_id", req.query.entityId);
    if (typeof req.query.action === "string") builder = builder.eq("action", req.query.action);
    if (typeof req.query.from === "string") builder = builder.gte("created_at", req.query.from);
    if (typeof req.query.to === "string") builder = builder.lte("created_at", req.query.to);

    const [from, to] = range(q.page, q.pageSize);
    const { data, error, count } = await builder.order("created_at", { ascending: false }).range(from, to);
    if (error) throw ApiError.internal("Failed to load audit logs");

    const items = (data ?? []).map((r) => {
      const actor = (r as { admin_users?: { username?: string; display_name?: string } | null }).admin_users;
      return {
        id: r.id,
        action: r.action,
        entity: r.entity,
        entityId: r.entity_id,
        prevValue: r.prev_value,
        newValue: r.new_value,
        createdAt: r.created_at,
        actor: actor?.display_name || actor?.username || "system",
      };
    });
    ok(res, buildListResponse(items, count, q.page, q.pageSize));
  })
);
