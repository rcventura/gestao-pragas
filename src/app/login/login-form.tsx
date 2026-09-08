"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthFormState, type LoginMode } from "@/app/actions/auth";

const initialState: AuthFormState = {};

export function LoginForm({ mode }: { mode: LoginMode }) {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const next = searchParams.get("next") || (mode === "admin" ? "/dashboard" : "/portal");
  const resetSuccess = searchParams.get("reset") === "success";

  return (
    <>
      {resetSuccess && <p className="mt-6 rounded-xl bg-[#e8efe4] px-4 py-3 text-sm text-[#1b2823]">Senha atualizada. Entre com sua nova senha.</p>}
      {state.error && <p className="mt-6 rounded-xl bg-[#fbe9e3] px-4 py-3 text-sm text-[#8d3822]">{state.error}</p>}
      <form className="mt-8 space-y-5" action={formAction}>
        <input name="next" type="hidden" value={next} />
        <input name="mode" type="hidden" value={mode} />
        <label className="block text-sm font-medium">
          E-mail
          <input className="mt-2 w-full rounded-xl border border-[#1b2823]/15 bg-[#f8f7f4] px-4 py-3 outline-none transition focus:border-[#b45432]" name="email" type="email" placeholder="voce@empresa.com" autoComplete="email" required />
        </label>
        <label className="block text-sm font-medium">
          Senha
          <input className="mt-2 w-full rounded-xl border border-[#1b2823]/15 bg-[#f8f7f4] px-4 py-3 outline-none transition focus:border-[#b45432]" name="password" type="password" placeholder="Sua senha" autoComplete="current-password" required />
        </label>
        <button className="w-full rounded-xl bg-[#1b2823] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2b3c35] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <Link className="mt-6 block text-center text-sm font-medium text-[#b45432] hover:underline" href={`/forgot-password?mode=${mode}`}>Esqueci minha senha</Link>
    </>
  );
}