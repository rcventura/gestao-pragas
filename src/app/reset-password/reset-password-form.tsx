"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePassword, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form className="mt-8 space-y-5" action={formAction}>
      <label className="block text-sm font-medium">
        Nova senha
        <input className="mt-2 w-full rounded-xl border border-[#1b2823]/15 bg-[#f8f7f4] px-4 py-3 outline-none transition focus:border-[#b45432]" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      {state.error && <p className="text-sm text-[#8d3822]">{state.error}</p>}
      <button className="w-full rounded-xl bg-[#1b2823] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2b3c35] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar nova senha"}
      </button>
      <Link className="block text-center text-sm font-medium text-[#b45432] hover:underline" href="/login">Voltar para o login</Link>
    </form>
  );
}