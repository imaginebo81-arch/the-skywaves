import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("skywaves"),
  SUPABASE_DB_SCHEMA: z.string().min(1).default("skywaves"),
  JWT_SECRET: z.string().min(16),
  ADMIN_COOKIE_NAME: z.string().min(1).default("skw_admin"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  RESULT_TOKEN_TTL_SECONDS: z.coerce.number().default(600),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
