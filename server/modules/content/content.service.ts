import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { writeAudit } from "../../lib/audit";
import { defaultSiteContent, type SiteContent } from "../../../src/data/siteContent";

type ContentRow = { key: string; data: unknown };

export async function getMergedContent(): Promise<SiteContent> {
  const { data, error } = await supabase
    .from("site_content")
    .select("key, data")
    .is("deleted_at", null);

  if (error) throw ApiError.internal("Failed to load content");

  const merged: Record<string, unknown> = { ...defaultSiteContent };
  for (const row of (data ?? []) as ContentRow[]) {
    if (row.key in defaultSiteContent) {
      merged[row.key] = row.data;
    }
  }
  return merged as unknown as SiteContent;
}

export async function getContentKey(key: string) {
  if (!(key in defaultSiteContent)) throw ApiError.notFound("Unknown content key");
  const { data, error } = await supabase
    .from("site_content")
    .select("key, data, updated_at")
    .eq("key", key)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw ApiError.internal("Failed to load content");
  return {
    key,
    data: data?.data ?? (defaultSiteContent as unknown as Record<string, unknown>)[key],
    isDefault: !data,
    updatedAt: data?.updated_at ?? null,
  };
}

export async function listContentKeys() {
  const { data, error } = await supabase
    .from("site_content")
    .select("key, updated_at")
    .is("deleted_at", null);
  if (error) throw ApiError.internal("Failed to load content");
  const overridden = new Map((data ?? []).map((r) => [r.key, r.updated_at]));
  return Object.keys(defaultSiteContent).map((key) => ({
    key,
    isDefault: !overridden.has(key),
    updatedAt: overridden.get(key) ?? null,
  }));
}

export async function upsertContent(key: string, value: unknown, actorId: string) {
  if (!(key in defaultSiteContent)) throw ApiError.notFound("Unknown content key");
  const { data: prev } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", key)
    .maybeSingle();

  const { data, error } = await supabase
    .from("site_content")
    .upsert({ key, data: value, updated_by: actorId, deleted_at: null }, { onConflict: "key" })
    .select("key, data, updated_at")
    .single();
  if (error) throw ApiError.internal(`Failed to save content: ${error.message}`);

  await writeAudit({
    actorId,
    action: "content.update",
    entity: "site_content",
    entityId: key,
    prevValue: prev?.data ?? null,
    newValue: value,
  });
  return data;
}

export async function restoreContent(key: string, actorId: string) {
  if (!(key in defaultSiteContent)) throw ApiError.notFound("Unknown content key");
  const { data: prev } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", key)
    .maybeSingle();

  const { error } = await supabase.from("site_content").delete().eq("key", key);
  if (error) throw ApiError.internal("Failed to restore default content");

  await writeAudit({
    actorId,
    action: "content.restore",
    entity: "site_content",
    entityId: key,
    prevValue: prev?.data ?? null,
    newValue: (defaultSiteContent as unknown as Record<string, unknown>)[key],
  });
  return { key, data: (defaultSiteContent as unknown as Record<string, unknown>)[key], isDefault: true };
}
