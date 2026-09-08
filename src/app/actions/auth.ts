"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
};

export type LoginMode = "admin" | "client";

function getStringValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function signIn(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = getStringValue(formData, "email");
  const password = getStringValue(formData, "password");
  const mode = getStringValue(formData, "mode") as LoginMode;
  const next = getStringValue(formData, "next") || (mode === "admin" ? "/dashboard" : "/portal");

  if (!email || !password) {
    return { error: "Informe seu e-mail e sua senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .maybeSingle();
  const hasAccess = mode === "admin"
    ? profile?.role === "super_admin"
    : profile?.role === "admin" || profile?.role === "operator";

  if (!hasAccess) {
    await supabase.auth.signOut({ scope: "local" });
    return {
      error: mode === "admin"
        ? "Esta entrada é exclusiva para superadministradores."
        : "Esta entrada é exclusiva para administradores e operadores.",
    };
  }

  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function requestPasswordReset(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = getStringValue(formData, "email");

  if (!email) {
    return { error: "Informe seu e-mail." };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: "Não foi possível solicitar a recuperação agora." };
  }

  return { message: "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação." };
}

export async function updatePassword(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const password = getStringValue(formData, "password");

  if (password.length < 8) {
    return { error: "A nova senha deve ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Não foi possível atualizar a senha." };
  }

  redirect("/login?reset=success");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/dashboard");
  revalidatePath("/portal");
  revalidatePath("/login");
  redirect("/login");
}