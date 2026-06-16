import { Router } from "express";
import { supabase } from "../../supabase";
import { asyncHandler, ok } from "../../lib/http";
import { requireAdmin } from "../../middleware/auth";

export const adminDashboardRouter = Router();
adminDashboardRouter.use(requireAdmin);

type FilterBuilder = {
  is: (column: string, value: null) => FilterBuilder;
  eq: (column: string, value: unknown) => FilterBuilder;
  then: Promise<{ count: number | null }>["then"];
};

async function countLive(table: string, extra?: (b: FilterBuilder) => FilterBuilder) {
  let builder = supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null) as unknown as FilterBuilder;
  if (extra) builder = extra(builder);
  const { count } = await builder;
  return count ?? 0;
}

adminDashboardRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [students, employees, courses, subjects, pendingRegistrations, totalRegistrations] = await Promise.all([
      countLive("students", (b) => b.is("archived_at", null)),
      countLive("employees", (b) => b.is("archived_at", null)),
      countLive("courses", (b) => b.is("archived_at", null)),
      countLive("subjects"),
      countLive("registrations", (b) => b.eq("status", "pending").is("archived_at", null)),
      countLive("registrations"),
    ]);

    const { data: recent } = await supabase
      .from("registrations")
      .select("id, name, admission_number, status, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5);

    ok(res, {
      stats: { students, employees, courses, subjects, pendingRegistrations, totalRegistrations },
      recentRegistrations: recent ?? [],
    });
  })
);
