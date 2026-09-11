import { requireRole } from "@/lib/auth/authorization";
import { DashboardSidebar } from "../dashboard-sidebar";
import { FinanceList } from "./finance-list";

export default async function FinanceiroPage() {
  const { supabase, user, fullName } = await requireRole(["super_admin", "admin", "operator"]);
  const userName = fullName || user.user_metadata?.full_name || user.user_metadata?.name || "Usuário";

  await supabase.rpc("ensure_current_month_invoices");
  const { data: invoices } = await supabase.rpc("list_invoices_for_admin");

  return (
    <main className="flex min-h-screen flex-col bg-[#f4f1eb] text-[#1b2823] lg:flex-row">
      <DashboardSidebar activePath="/dashboard/financeiro" email={user.email ?? ""} userName={userName} />
      <section className="min-w-0 flex-1 px-6 py-8 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <header className="border-b border-[#1b2823]/10 pb-8">
            <p className="text-sm font-semibold tracking-[0.16em] text-[#b45432] uppercase">Financeiro</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Mensalidades</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#1b2823]/60">Acompanhe as mensalidades dos clientes cadastrados e seus vencimentos.</p>
          </header>

          <FinanceList invoices={invoices || []} />
        </div>
      </section>
    </main>
  );
}
