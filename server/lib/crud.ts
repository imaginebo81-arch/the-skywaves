import { supabase } from "../supabase";
import { ApiError } from "./errors";
import { writeAudit } from "./audit";
import { buildListResponse, range, type ListQuery } from "./pagination";

function asRow(value: unknown): Record<string, unknown> {
  return value as Record<string, unknown>;
}

export interface CrudConfig<Dto> {
  table: string;
  entity: string;
  pk: string;
  selectColumns: string;
  searchColumns: string[];
  defaultOrder?: { column: string; ascending: boolean };
  supportsArchive?: boolean;
  toDto: (row: Record<string, unknown>) => Dto;
  onBeforeDelete?: (id: string) => Promise<void>;
}

export function createCrud<Dto>(config: CrudConfig<Dto>) {
  const {
    table,
    entity,
    pk,
    selectColumns,
    searchColumns,
    defaultOrder = { column: "created_at", ascending: false },
    supportsArchive = true,
    toDto,
    onBeforeDelete,
  } = config;

  async function list(query: ListQuery) {
    let builder = supabase.from(table).select(selectColumns, { count: "exact" });

    if (!query.includeArchived) {
      builder = builder.is("deleted_at", null);
      if (supportsArchive) builder = builder.is("archived_at", null);
    }

    if (query.q && searchColumns.length > 0) {
      const term = query.q.replace(/[%,]/g, " ").trim();
      const orFilter = searchColumns.map((c) => `${c}.ilike.%${term}%`).join(",");
      builder = builder.or(orFilter);
    }

    const [from, to] = range(query.page, query.pageSize);
    builder = builder.order(defaultOrder.column, { ascending: defaultOrder.ascending }).range(from, to);

    const { data, error, count } = await builder;
    if (error) throw ApiError.internal(`Failed to list ${entity}: ${error.message}`);

    return buildListResponse((data ?? []).map((r) => toDto(asRow(r))), count, query.page, query.pageSize);
  }

  async function getRaw(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from(table)
      .select(selectColumns)
      .eq(pk, id)
      .maybeSingle();
    if (error) throw ApiError.internal(`Failed to load ${entity}: ${error.message}`);
    if (!data) throw ApiError.notFound(`${entity} not found`);
    return asRow(data);
  }

  async function get(id: string): Promise<Dto> {
    return toDto(await getRaw(id));
  }

  async function create(row: Record<string, unknown>, actorId: string): Promise<Dto> {
    const { data, error } = await supabase.from(table).insert(row).select(selectColumns).single();
    if (error) {
      if (error.code === "23505") throw ApiError.conflict(`${entity} already exists`, error.details);
      if (error.code === "23503") throw ApiError.badRequest(`Related record not found`, error.details);
      throw ApiError.internal(`Failed to create ${entity}: ${error.message}`);
    }
    const dto = toDto(asRow(data));
    await writeAudit({
      actorId,
      action: `${entity}.create`,
      entity,
      entityId: String(asRow(data)[pk]),
      newValue: data,
    });
    return dto;
  }

  async function update(id: string, patch: Record<string, unknown>, actorId: string): Promise<Dto> {
    const prev = await getRaw(id);
    const { data, error } = await supabase
      .from(table)
      .update(patch)
      .eq(pk, id)
      .select(selectColumns)
      .single();
    if (error) {
      if (error.code === "23505") throw ApiError.conflict(`${entity} value already in use`, error.details);
      throw ApiError.internal(`Failed to update ${entity}: ${error.message}`);
    }
    await writeAudit({
      actorId,
      action: `${entity}.update`,
      entity,
      entityId: id,
      prevValue: prev,
      newValue: data,
    });
    return toDto(asRow(data));
  }

  async function setFlag(
    id: string,
    column: "deleted_at" | "archived_at",
    value: string | null,
    action: string,
    actorId: string
  ): Promise<Dto> {
    const prev = await getRaw(id);
    const { data, error } = await supabase
      .from(table)
      .update({ [column]: value })
      .eq(pk, id)
      .select(selectColumns)
      .single();
    if (error) throw ApiError.internal(`Failed to ${action} ${entity}: ${error.message}`);
    await writeAudit({
      actorId,
      action: `${entity}.${action}`,
      entity,
      entityId: id,
      prevValue: prev,
      newValue: data,
    });
    return toDto(asRow(data));
  }

  async function hardDelete(id: string, actorId: string): Promise<{ id: string }> {
    const prev = await getRaw(id);
    if (onBeforeDelete) await onBeforeDelete(id);
    const { error } = await supabase.from(table).delete().eq(pk, id);
    if (error) {
      if (error.code === "23503") {
        throw ApiError.badRequest(`Cannot delete ${entity}: it is still referenced by other records.`);
      }
      throw ApiError.internal(`Failed to delete ${entity}: ${error.message}`);
    }
    await writeAudit({ actorId, action: `${entity}.delete`, entity, entityId: String(id), prevValue: prev, newValue: null });
    return { id: String(id) };
  }

  const nowIso = () => new Date().toISOString();

  return {
    list,
    get,
    getRaw,
    create,
    update,
    hardDelete,
    softDelete: hardDelete,
    archive: (id: string, actorId: string) => setFlag(id, "archived_at", nowIso(), "archive", actorId),
    restore: (id: string, actorId: string) => setFlag(id, "deleted_at", null, "restore", actorId),
    unarchive: (id: string, actorId: string) => setFlag(id, "archived_at", null, "unarchive", actorId),
  };
}
