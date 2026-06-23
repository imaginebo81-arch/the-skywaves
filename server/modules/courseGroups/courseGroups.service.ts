import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { createCrud } from "../../lib/crud";

export interface CourseGroupDto {
  id: string;
  name: string;
  description: string | null;
  imagePath: string | null;
  status: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  archivedAt: string | null;
}

const SELECT =
  "id, name, description, image_path, status, display_order, created_at, updated_at, deleted_at, archived_at";

function toDto(row: Record<string, unknown>): CourseGroupDto {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    imagePath: (row.image_path as string) ?? null,
    status: row.status as string,
    displayOrder: Number(row.display_order ?? 0),
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) ?? null,
    deletedAt: (row.deleted_at as string) ?? null,
    archivedAt: (row.archived_at as string) ?? null,
  };
}

export const courseGroupsCrud = createCrud<CourseGroupDto>({
  table: "course_groups",
  entity: "course group",
  pk: "id",
  selectColumns: SELECT,
  searchColumns: ["name", "status"],
  defaultOrder: { column: "display_order", ascending: true },
  toDto,
  onBeforeDelete: async (id) => {
    await supabase.from("courses").update({ course_group_id: null }).eq("course_group_id", id);
  },
});

export function toCourseGroupRow(input: {
  name?: string;
  description?: string | null;
  imagePath?: string | null;
  status?: string;
  displayOrder?: number;
}) {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.description !== undefined) row.description = input.description;
  if (input.imagePath !== undefined) row.image_path = input.imagePath;
  if (input.status !== undefined) row.status = input.status;
  if (input.displayOrder !== undefined) row.display_order = input.displayOrder;
  return row;
}

export async function listPublicCourseGroups(signUrl: (path: string) => Promise<string | null>) {
  const { data, error } = await supabase
    .from("course_groups")
    .select(SELECT)
    .is("deleted_at", null)
    .is("archived_at", null)
    .eq("status", "active")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw ApiError.internal("Failed to load course groups");

  const groups = (data ?? []).map((r) => toDto(r as Record<string, unknown>));
  const signed = await Promise.all(groups.map((g) => (g.imagePath ? signUrl(g.imagePath) : Promise.resolve(null))));

  return groups.map((g, i) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    imageUrl: signed[i] ?? null,
  }));
}
