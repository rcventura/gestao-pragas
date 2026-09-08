import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "../dashboard-sidebar";
import { ClientToast } from "./client-toast";
import { ClientsList } from "./clients-list";

type ClientsPageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
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

  const params = await searchParams;
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name, email, slug, active, created_at")
    .order("name");

  return (
    <main className="flex min-h-screen flex-col bg-[#f4f1eb] text-[#1b2823] lg:flex-row">
      <DashboardSidebar activePath="/dashboard/clients" email={user.email ?? ""} userName={userName} />
      <section className="min-w-0 flex-1 px-6 py-8 sm:px-10 lg:px-14">
      <ClientToast message={params.success} type="success" />
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-[#1b2823]/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link className="text-sm font-semibold tracking-[0.16em] text-[#b45432] uppercase" href="/dashboard">Dashboard</Link>
            <p className="mt-8 text-sm text-[#b45432]">Gestão de clientes</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Clientes</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#1b2823]/60">Consulte as empresas cadastradas e acompanhe quais estão ativas na operação.</p>
          </div>
          <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b2823] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2b3c35]" href="/dashboard/clients/new">
            <Plus size={18} />
            Novo cliente
          </Link>
        </header>

        <ClientsList organizations={organizations || []} />
      </div>
      </section>
    </main>
  );
}
