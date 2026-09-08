import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "super_admin" | "admin" | "operator";

type AuthorizedContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  role: AppRole;
  organizationId: string | null;
  fullName: string | null;
};

export async function requireRole(roles: readonly AppRole[], loginPath = "/login"): Promise<AuthorizedContext> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(loginPath);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id, full_name, active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.active || !profile.role || !roles.includes(profile.role as AppRole)) {
    redirect("/login?error=unauthorized");
  }

  return {
    supabase,
    user,
    role: profile.role as AppRole,
    organizationId: profile.organization_id,
    fullName: profile.full_name,
  };
}

export function getSafeRedirectPath(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  const pathname = value.split(/[?#]/, 1)[0];
  const allowed = ["/dashboard", "/portal", "/reset-password"];

  return allowed.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    ? value
    : fallback;
}