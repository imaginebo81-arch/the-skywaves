import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabase = createClient<any, string>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: env.SUPABASE_DB_SCHEMA },
  }
);

export const STORAGE_BUCKET = env.SUPABASE_STORAGE_BUCKET;
