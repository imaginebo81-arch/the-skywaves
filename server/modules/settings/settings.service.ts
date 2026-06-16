import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { writeAudit } from "../../lib/audit";

export async function getSetting<T = unknown>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  if (error) return fallback;
  return (data?.value as T) ?? fallback;
}

export async function listSettings() {
  const { data, error } = await supabase.from("settings").select("key, value, updated_at");
  if (error) throw ApiError.internal("Failed to load settings");
  return data ?? [];
}

export async function setSetting(key: string, value: unknown, actorId: string) {
  const { data: prev } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  const { data, error } = await supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
    .select("key, value, updated_at")
    .single();
  if (error) throw ApiError.internal(`Failed to save setting: ${error.message}`);
  await writeAudit({
    actorId,
    action: "setting.update",
    entity: "settings",
    entityId: key,
    prevValue: prev?.value ?? null,
    newValue: value,
  });
  return data;
}

export async function getPassPercentage(): Promise<number> {
  const value = await getSetting<number | { value?: number }>("pass_percentage", 35);
  if (typeof value === "number") return value;
  return value?.value ?? 35;
}
