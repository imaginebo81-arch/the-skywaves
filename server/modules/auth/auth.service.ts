import bcrypt from "bcryptjs";
import { supabase } from "../../supabase";
import { ApiError } from "../../lib/errors";
import { signAdminToken, type AdminTokenPayload } from "../../lib/tokens";

interface AdminRow {
  id: string;
  username: string;
  password_hash: string;
  role: "superadmin" | "admin";
  is_active: boolean;
  display_name: string | null;
}

export async function login(username: string, password: string) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, password_hash, role, is_active, display_name")
    .eq("username", username)
    .is("deleted_at", null)
    .maybeSingle<AdminRow>();

  if (error) throw ApiError.internal("Login failed");
  if (!data || !data.is_active) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", data.id);

  const payload: AdminTokenPayload = {
    sub: data.id,
    username: data.username,
    role: data.role,
  };

  return {
    token: signAdminToken(payload),
    admin: {
      id: data.id,
      username: data.username,
      role: data.role,
      displayName: data.display_name,
    },
  };
}

export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, role, display_name, last_login_at")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw ApiError.internal("Failed to load profile");
  if (!data) throw ApiError.unauthorized("Account no longer exists");

  return {
    id: data.id,
    username: data.username,
    role: data.role,
    displayName: data.display_name,
    lastLoginAt: data.last_login_at,
  };
}
