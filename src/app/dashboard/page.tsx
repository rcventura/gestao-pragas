import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

const indicators = [
  { label: "Clientes Ativos", value: "0", icon: Building2 },
  { label: "Faturas atrasadas", value: "0", icon: CircleDollarSign },
];

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Clientes", icon: Users },
  { label: "Financeiro", icon: CircleDollarSign },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const userName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "Usuário";

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#1b2823]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#1b2823]/10 bg-[#eeeae1] px-4 py-7 lg:flex">
          <Link className="border-b border-[#1b2823]/10 px-3 pb-6" href="/">
            <span className="block text-sm font-semibold tracking-[0.16em] uppercase">Gestão de Pragas</span>
            <span className="mt-2 block text-xs text-[#1b2823]/50">Sistema operacional</span>
          </Link>
          <nav className="mt-10 flex-1 space-y-1 text-sm" aria-label="Navegação principal">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${item.active ? "bg-[#1b2823] font-medium text-white shadow-sm" : "text-[#1b2823]/60 hover:bg-white/70 hover:text-[#1b2823]"}`}
                  key={item.label}
                  type="button"
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="border-t border-[#1b2823]/10 pt-3">
            <form action={signOut}>
              <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#1b2823]/60 transition-colors hover:bg-[#b42318] hover:text-white" type="submit">
                <LogOut size={18} strokeWidth={1.8} />
                <span>Sair</span>
              </button>
            </form>
            <div className="mt-2 border-t border-[#1b2823]/10 px-3 pt-2">
              <p className="truncate text-sm font-medium text-[#1b2823]">{userName}</p>
              <p className="mt-1 truncate text-xs text-[#1b2823]/50">{user.email}</p>
            </div>
          </div>
        </aside>
        <section className="min-w-0 flex-1 px-6 py-8 sm:px-10 lg:px-12">
          <header className="flex items-start justify-between gap-4 border-b border-[#1b2823]/10 pb-8">
            <div>
              <p className="text-sm text-[#b45432]">Painel administrativo</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Administrador</h1>
            </div>
          </header>
          <div className="grid gap-4 py-8 md:grid-cols-3">
            {indicators.map((indicator) => (
              <div className="rounded-2xl bg-white p-6 shadow-sm" key={indicator.label}>
                <div className="flex items-center gap-3 text-sm text-[#1b2823]/55">
                  <indicator.icon size={18} strokeWidth={1.8} />
                  <p>{indicator.label}</p>
                </div>
                <p className="mt-5 text-4xl font-semibold">{indicator.value}</p>
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
