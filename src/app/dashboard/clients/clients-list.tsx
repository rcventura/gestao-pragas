"use client";

import Link from "next/link";
import { Building2, ChevronLeft, ChevronRight, Mail, Search, Users } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string | null;
  slug: string;
  active: boolean;
  created_at: string;
};

type ClientsListProps = {
  organizations: Client[];
  page: number;
  query: string;
  showInactive: boolean;
  totalPages: number;
};

export function ClientsList({ organizations, page, query, showInactive, totalPages }: ClientsListProps) {
  const createHref = (nextPage: number, inactive = showInactive) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (inactive) params.set("status", "inactive");
    if (nextPage > 1) params.set("page", String(nextPage));
    const search = params.toString();
    return search ? `/dashboard/clients?${search}` : "/dashboard/clients";
  };

  return (
    <>
      <section className="py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex w-fit rounded-xl border border-[#1b2823]/10 bg-white p-1" aria-label="Status dos clientes">
            <Link className={`rounded-lg px-4 py-2 text-sm transition-colors ${!showInactive ? "bg-[#1b2823] font-medium text-white" : "text-[#1b2823]/55 hover:text-[#1b2823]"}`} href={createHref(1, false)}>Clientes ativos</Link>
            <Link className={`rounded-lg px-4 py-2 text-sm transition-colors ${showInactive ? "bg-[#1b2823] font-medium text-white" : "text-[#1b2823]/55 hover:text-[#1b2823]"}`} href={createHref(1, true)}>Clientes inativos</Link>
          </nav>
          <label className="relative w-full max-w-md">
            <span className="sr-only">Pesquisar empresa ou e-mail</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1b2823]/40" size={18} />
            <input className="w-full rounded-xl border border-[#1b2823]/15 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#b45432]" defaultValue={query} name="q" placeholder="Pesquisar empresa ou e-mail" type="search" form="client-search" />
          </label>
          <form className="hidden" id="client-search" method="get" action="/dashboard/clients" />
        </div>
      </section>

      {organizations.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-[#1b2823]/10 bg-white shadow-sm">
          <div className="hidden grid-cols-[1.4fr_1fr_0.7fr] gap-4 border-b border-[#1b2823]/10 px-6 py-4 text-xs font-semibold tracking-[0.12em] text-[#1b2823]/45 uppercase md:grid">
            <span>Empresa</span>
            <span>E-mail</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-[#1b2823]/10">
            {organizations.map((client) => (
              <div className="grid gap-3 px-6 py-5 transition-colors hover:bg-[#f8f7f4] md:grid-cols-[1.4fr_1fr_0.7fr] md:items-center md:gap-4" key={client.id}>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#e8efe4] text-[#1b2823]"><Building2 size={19} /></span>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="mt-1 text-xs text-[#1b2823]/45">/{client.slug}</p>
                  </div>
                </div>
                <p className="flex items-center gap-2 text-sm text-[#1b2823]/60"><Mail size={15} />{client.email || "E-mail não informado"}</p>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${client.active ? "bg-[#e8efe4] text-[#31533f]" : "bg-[#fbe9e3] text-[#8d3822]"}`}>{client.active ? "Ativo" : "Inativo"}</span>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="flex items-center justify-between border-t border-[#1b2823]/10 px-6 py-4 text-sm" aria-label="Paginação de clientes">
              <Link className={page <= 1 ? "pointer-events-none text-[#1b2823]/25" : "text-[#b45432]"} href={createHref(page - 1)} aria-disabled={page <= 1}>
                <ChevronLeft size={18} aria-hidden="true" />
                <span className="sr-only">Página anterior</span>
              </Link>
              <span className="text-[#1b2823]/55">Página {page} de {totalPages}</span>
              <Link className={page >= totalPages ? "pointer-events-none text-[#1b2823]/25" : "text-[#b45432]"} href={createHref(page + 1)} aria-disabled={page >= totalPages}>
                <ChevronRight size={18} aria-hidden="true" />
                <span className="sr-only">Próxima página</span>
              </Link>
            </nav>
          )}
        </section>
      ) : (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#1b2823]/20 bg-white/50 px-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e8efe4] text-[#1b2823]"><Users size={22} /></span>
          <h2 className="mt-5 text-lg font-semibold">Nenhum cliente encontrado</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#1b2823]/55">{query ? "Tente pesquisar por outro nome ou e-mail." : showInactive ? "Não há clientes inativos cadastrados." : "Cadastre o primeiro cliente para começar a operação."}</p>
        </section>
      )}
    </>
  );
}
