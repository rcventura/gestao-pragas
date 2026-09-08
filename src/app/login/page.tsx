import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1eb] px-6 py-12 text-[#1b2823]">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl shadow-[#1b2823]/10 sm:p-10">
        <Link className="text-sm font-semibold tracking-[0.16em] text-[#b45432] uppercase" href="/">
          Gestão de Pragas
        </Link>
        <h1 className="mt-12 text-3xl font-semibold tracking-[-0.03em]">Acesse sua conta</h1>
        <p className="mt-3 text-sm leading-6 text-[#1b2823]/60">Entre para acompanhar seus atendimentos e sua operação.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
