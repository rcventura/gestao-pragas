import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";
import { DashboardSidebar } from "@/app/dashboard/dashboard-sidebar";
import { ClientToast } from "@/app/dashboard/clients/client-toast";
import { EditClientForm, type EditableClient } from "@/app/dashboard/clients/edit-client-form";

type EditClientPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

type StatusHistoryEntry = {
  id: string;
  status: "active" | "inactive";
  reason: string | null;
  changed_at: string;
  changed_by: string | null;
};

export default async function EditClientPage({ params, searchParams }: EditClientPageProps) {
  const { supabase, user, fullName } = await requireRole(["super_admin"]);
  const { id } = await params;
  const query = await searchParams;
  const [{ data, error }, { data: history }] = await Promise.all([
    supabase.rpc("get_organization_for_admin", { target_id: id }).maybeSingle(),
    supabase.rpc("get_organization_status_history", { target_id: id }),
  ]);
  const client = data as EditableClient | null;
  const statusHistory = (history || []) as StatusHistoryEntry[];

  if (error || !client) notFound();

  return (
    <main className="flex min-h-screen flex-col bg-[#f4f1eb] text-[#1b2823] lg:flex-row">
      <DashboardSidebar activePath="/dashboard/clients" email={user.email ?? ""} userName={fullName || "Usuário"} />
      <section className="min-w-0 flex-1 overflow-y-auto px-8 py-8 sm:px-12 lg:px-20">
        <ClientToast message={query.error} type="error" />
        <div className="mx-auto max-w-5xl">
          <header className="border-b border-[#1b2823]/10 pb-8">
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">Editar cliente</h1>
            <p className="mt-3 text-sm leading-6 text-[#1b2823]/60">Atualize os dados cadastrais de {client.name}.</p>
          </header>
          <EditClientForm client={client} />
          <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm sm:p-10 lg:p-12">
            <h2 className="text-xl font-semibold">Histórico de status</h2>
            <p className="mt-2 text-sm leading-6 text-[#1b2823]/60">Registro das inativações e reativações deste cliente.</p>
            {statusHistory.length > 0 ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead className="border-b border-[#1b2823]/10 text-xs tracking-[0.12em] text-[#1b2823]/45 uppercase">
                    <tr>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-3 py-3 font-semibold">Data</th>
                      <th className="px-3 py-3 font-semibold">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b2823]/10">
                    {statusHistory.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-3 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${entry.status === "active" ? "bg-[#e8efe4] text-[#31533f]" : "bg-[#fbe9e3] text-[#8d3822]"}`}>
                            {entry.status === "active" ? "Ativado" : "Inativado"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-[#1b2823]/60">{new Date(entry.changed_at).toLocaleString("pt-BR")}</td>
                        <td className="px-3 py-4 text-[#1b2823]/60">{entry.reason || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-6 text-sm text-[#1b2823]/55">Nenhuma alteração de status registrada.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}