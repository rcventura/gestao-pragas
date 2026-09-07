import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f1eb] px-6 py-12 text-[#1b2823]">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl shadow-[#1b2823]/10 sm:p-10">
        <Link className="text-sm font-semibold tracking-[0.16em] text-[#b45432] uppercase" href="/">
          Gestão de Pragas
        </Link>
        <h1 className="mt-12 text-3xl font-semibold tracking-[-0.03em]">Acesse sua conta</h1>
        <p className="mt-3 text-sm leading-6 text-[#1b2823]/60">Entre para acompanhar seus atendimentos e sua operação.</p>
        <form className="mt-8 space-y-5" action="/dashboard">
          <label className="block text-sm font-medium">
            E-mail
            <input className="mt-2 w-full rounded-xl border border-[#1b2823]/15 bg-[#f8f7f4] px-4 py-3 outline-none transition focus:border-[#b45432]" name="email" type="email" placeholder="voce@empresa.com" required />
          </label>
          <label className="block text-sm font-medium">
            Senha
            <input className="mt-2 w-full rounded-xl border border-[#1b2823]/15 bg-[#f8f7f4] px-4 py-3 outline-none transition focus:border-[#b45432]" name="password" type="password" placeholder="Sua senha" required />
          </label>
          <button className="w-full rounded-xl bg-[#1b2823] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2b3c35]" type="submit">
            Entrar
          </button>
        </form>
        <p className="mt-6 text-center text-xs leading-5 text-[#1b2823]/50">A autenticação Supabase será ativada após configurar as variáveis de ambiente.</p>
      </section>
    </main>
  );
}
