import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

const indicators = [
  { label: "OS abertas", value: "00", detail: "Aguardando atendimento" },
  { label: "Hoje", value: "00", detail: "Visitas programadas" },
  { label: "Clientes", value: "00", detail: "Cadastros ativos" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#1b2823]">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-[#1b2823]/10 px-6 py-8 lg:block">
          <Link className="text-sm font-semibold tracking-[0.16em] uppercase" href="/">Gestão de Pragas</Link>
          <nav className="mt-16 space-y-2 text-sm">
            <span className="block rounded-xl bg-[#1b2823] px-4 py-3 font-medium text-white">Visão geral</span>
            <span className="block px-4 py-3 text-[#1b2823]/55">Ordens de serviço</span>
            <span className="block px-4 py-3 text-[#1b2823]/55">Clientes</span>
            <span className="block px-4 py-3 text-[#1b2823]/55">Agenda</span>
          </nav>
        </aside>
        <section className="flex-1 px-6 py-8 sm:px-10 lg:px-14">
          <header className="flex items-start justify-between gap-4 border-b border-[#1b2823]/10 pb-8">
            <div>
              <p className="text-sm text-[#b45432]">Painel administrativo</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Bom dia, administrador.</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link className="rounded-full border border-[#1b2823]/20 px-4 py-2 text-sm" href="/portal">Ver portal do cliente</Link>
              <form action={signOut}>
                <button className="cursor-pointer rounded-full border border-[#1b2823]/20 px-4 py-2 text-sm transition-colors hover:bg-[#1b2823] hover:text-white" type="submit">Sair</button>
              </form>
            </div>
          </header>
          <div className="grid gap-4 py-8 md:grid-cols-3">
            {indicators.map((indicator) => (
              <div className="rounded-2xl bg-white p-6 shadow-sm" key={indicator.label}>
                <p className="text-sm text-[#1b2823]/55">{indicator.label}</p>
                <p className="mt-5 text-4xl font-semibold">{indicator.value}</p>
                <p className="mt-2 text-xs text-[#1b2823]/45">{indicator.detail}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-dashed border-[#1b2823]/20 bg-white/50 p-8">
            <p className="text-sm font-semibold">Seu painel está pronto para receber dados.</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#1b2823]/55">O próximo módulo será o cadastro de clientes e locais de atendimento, seguido pelo ciclo completo das ordens de serviço.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
