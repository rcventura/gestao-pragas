"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  return state.message ? (
    <>
      <p className="mt-8 rounded-xl bg-[#e8efe4] px-4 py-3 text-sm text-[#1b2823]">{state.message}</p>
      <Link className="mt-6 block text-center text-sm font-medium text-[#b45432] hover:underline" href="/login">Voltar para o login</Link>
    </>
  ) : state.error ? (
    <>
      <p className="mt-8 rounded-xl bg-[#fbe9e3] px-4 py-3 text-sm text-[#8d3822]">{state.error}</p>
      <Link className="mt-6 block text-center text-sm font-medium text-[#b45432] hover:underline" href="/login">Voltar para o login</Link>
    </>
  ) : (
    <form className="mt-8 space-y-5" action={formAction}>
      <label className="block text-sm font-medium">
        E-mail
        <input className="mt-2 w-full rounded-xl border border-[#1b2823]/15 bg-[#f8f7f4] px-4 py-3 outline-none transition focus:border-[#b45432]" name="email" type="email" placeholder="voce@empresa.com" autoComplete="email" required />
      </label>
      <button className="w-full rounded-xl bg-[#1b2823] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2b3c35] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar link de recuperação"}
      </button>
      {state.error && <p className="text-sm text-[#8d3822]">{state.error}</p>}
      <Link className="block text-center text-sm font-medium text-[#b45432] hover:underline" href="/login">Voltar para o login</Link>
    </form>
  );
}