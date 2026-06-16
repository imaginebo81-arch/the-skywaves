import { supabase } from "../supabase";

export interface AuditEntry {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  prevValue?: unknown;
  newValue?: unknown;
}

export async function writeAudit(entry: AuditEntry): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert({
    actor_admin_id: entry.actorId ?? null,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId != null ? String(entry.entityId) : null,
    prev_value: entry.prevValue ?? null,
    new_value: entry.newValue ?? null,
  });

  if (error) {
    console.error("[audit] failed to write audit log", error.message, entry.action);
  }
}
