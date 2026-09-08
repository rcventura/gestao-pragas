import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { DashboardSidebar } from "../dashboard-sidebar";
import { ClientToast } from "./client-toast";
import { ClientsList } from "./clients-list";

type ClientsPageProps = {
  searchParams: Promise<{
    success?: string;
    q?: string;
    status?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 25;

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { supabase, user, fullName } = await requireRole(["super_admin", "admin", "operator"]);
  const userName = fullName || user.user_metadata?.full_name || user.user_metadata?.name || "Usuário";

  const params = await searchParams;
  const query = (params.q || "").trim().slice(0, 80);
  const status = params.status === "inactive" ? "inactive" : "active";
  const requestedPage = Number.parseInt(params.page || "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100_000) : 1;
  const searchTerm = query.replace(/[%,()_*]/g, " ").trim();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let organizationsQuery = supabase
    .from("organizations")
    .select("id, name, email, slug, active, created_at", { count: "exact" })
    .eq("active", status === "active")
    .order("name")
    .range(from, to);

  if (searchTerm) {
    organizationsQuery = organizationsQuery.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
  }

  const { data: filteredOrganizations, count } = await organizationsQuery;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

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

        <ClientsList
          organizations={filteredOrganizations || []}
          page={Math.min(page, totalPages)}
          query={query}
          showInactive={status === "inactive"}
          totalPages={totalPages}
        />
      </div>
      </section>
    </main>
  );
}
