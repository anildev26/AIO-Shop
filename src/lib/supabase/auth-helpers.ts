import { createServerSupabase, createServiceSupabase } from "./server";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
}

/** Get the current authenticated user with profile data */
export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email!,
    username: profile.username,
    role: profile.role as "USER" | "ADMIN",
  };
}

/** Check if current user is an admin */
export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

/** Register a new user via Supabase Auth */
export async function registerUser(email: string, password: string, username: string) {
  const serviceSupabase = await createServiceSupabase();

  // Check if username already taken
  const { data: existing } = await serviceSupabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (existing) {
    return { error: "Username already in use." };
  }

  const { data, error } = await serviceSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error) {
    if (error.message.includes("already")) {
      return { error: "Email already in use." };
    }
    return { error: error.message };
  }

  return { user: data.user };
}
