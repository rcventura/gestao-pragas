import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "../../dashboard-sidebar";
import { ClientToast } from "../client-toast";
import { NewClientForm } from "./new-client-form";

type NewClientPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewClientPage({ searchParams }: NewClientPageProps) {
  const params = await searchParams;
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
    <main className="flex h-screen flex-col overflow-hidden bg-[#f4f1eb] text-[#1b2823] lg:flex-row">
      <DashboardSidebar activePath="/dashboard/clients" email={user.email ?? ""} userName={userName} />
      <section className="min-h-0 min-w-0 flex-1 overflow-y-auto px-8 py-8 sm:px-12 lg:px-20">
      <ClientToast message={params.error} type="error" />
      <div className="mx-auto max-w-5xl">
        <header className="mt-0 border-b border-[#1b2823]/10 pb-8">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Novo cliente</h1>
          <p className="mt-3 text-sm leading-6 text-[#1b2823]/60">Cadastre a empresa cliente que fará parte da sua operação.</p>
        </header>
        <NewClientForm />
      </div>
      </section>
    </main>
  );
}
