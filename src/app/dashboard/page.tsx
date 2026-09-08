import { redirect } from "next/navigation";
import {
  Building2,
  CircleDollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "./dashboard-sidebar";

const indicators = [
  { label: "Clientes Ativos", value: "0", icon: Building2 },
  { label: "Faturas atrasadas", value: "0", icon: CircleDollarSign },
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
      <div className="flex min-h-screen flex-col lg:flex-row">
        <DashboardSidebar activePath="/dashboard" email={user.email ?? ""} userName={userName} />
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
