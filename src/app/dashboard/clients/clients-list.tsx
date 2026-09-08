"use client";

import Link from "next/link";
import { Building2, ChevronLeft, ChevronRight, Pencil, Search, UserCheck, UserMinus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { activateOrganization, deactivateOrganization } from "@/app/actions/clients";

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
};

const PAGE_SIZE = 25;

export function ClientsList({ organizations }: ClientsListProps) {
  const [clientToDeactivate, setClientToDeactivate] = useState<Client | null>(null);
  const [clientToActivate, setClientToActivate] = useState<Client | null>(null);
  const [searchText, setSearchText] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);

  const filteredOrganizations = useMemo(() => {
    const normalizedSearch = searchText.trim().toLocaleLowerCase();
    return organizations.filter((client) => {
      if (client.active === showInactive) return false;
      if (!normalizedSearch) return true;

      return [client.name, client.email, client.slug]
      .filter(Boolean)
      .some((value) => value!.toLocaleLowerCase().includes(normalizedSearch));
    });
  }, [organizations, searchText, showInactive]);

  const totalPages = Math.max(1, Math.ceil(filteredOrganizations.length / PAGE_SIZE));
  const visibleOrganizations = filteredOrganizations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeStatus(inactive: boolean) {
    setShowInactive(inactive);
    setPage(1);
    setSearchText("");
  }

  return (
    <>
      <section className="py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav className="flex w-fit rounded-xl border border-[#1b2823]/10 bg-white p-1" aria-label="Status dos clientes">
            <button className={`cursor-pointer rounded-lg px-4 py-2 text-sm transition-colors ${!showInactive ? "bg-[#1b2823] font-medium text-white" : "text-[#1b2823]/55 hover:text-[#1b2823]"}`} onClick={() => changeStatus(false)} type="button">Clientes ativos</button>
            <button className={`cursor-pointer rounded-lg px-4 py-2 text-sm transition-colors ${showInactive ? "bg-[#1b2823] font-medium text-white" : "text-[#1b2823]/55 hover:text-[#1b2823]"}`} onClick={() => changeStatus(true)} type="button">Clientes inativos</button>
          </nav>
          <label className="relative w-full max-w-md">
            <span className="sr-only">Pesquisar empresa ou e-mail</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1b2823]/40" size={18} />
            <input className="w-full rounded-xl border border-[#1b2823]/15 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#b45432]" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Pesquisar empresa ou e-mail" type="search" />
          </label>
          <form className="hidden" id="client-search" method="get" action="/dashboard/clients" />
        </div>
      </section>

      {filteredOrganizations.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-[#1b2823]/10 bg-white shadow-sm">
          <div className="hidden grid-cols-[1.4fr_1.3fr_0.7fr_0.4fr] gap-4 border-b border-[#1b2823]/10 px-6 py-4 text-xs font-semibold tracking-[0.12em] text-[#1b2823]/45 uppercase md:grid">
            <span>Empresa</span>
            <span>E-mail</span>
            <span className="text-center">Status</span>
            <span className="text-center">Ações</span>
          </div>
          <div className="divide-y divide-[#1b2823]/10">
            {visibleOrganizations.map((client) => (
              <div className="grid gap-4 px-6 py-5 transition-colors hover:bg-[#f8f7f4] md:grid-cols-[1.4fr_1.3fr_0.7fr_0.4fr] md:items-center md:gap-4" key={client.id}>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#e8efe4] text-[#1b2823]"><Building2 size={19} /></span>
                  <div>
                    <p className="font-medium">{client.name}</p>
                  </div>
                </div>
                <p className="flex justify-self-start gap-2 text-left text-sm text-[#1b2823]/60">{client.email || "E-mail não informado"}</p>
                <span className={`w-fit justify-self-center rounded-full px-3 py-1 text-center text-xs font-medium ${client.active ? "bg-[#e8efe4] text-[#31533f]" : "bg-[#fbe9e3] text-[#8d3822]"}`}>{client.active ? "Ativo" : "Inativo"}</span>
                <div className="flex items-center justify-center gap-1 text-[#1b2823]/55">
                  <Link className="inline-flex items-center justify-center rounded-lg p-2 text-[#1b2823]/55 hover:bg-[#e8efe4] hover:text-[#1b2823]" href={`/dashboard/clients/${client.id}/edit`} aria-label={`Editar ${client.name}`} title={`Editar ${client.name}`}>
                    <Pencil size={16} />
                  </Link>
                  {client.active && (
                    <button className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-[#8d3822]/70 hover:bg-[#fbe9e3] hover:text-[#8d3822]" onClick={() => setClientToDeactivate(client)} type="button" aria-label={`Inativar ${client.name}`} title={`Inativar ${client.name}`}>
                      <UserMinus size={16} />
                    </button>
                  )}
                  {!client.active && (
                    <button className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-[#31533f]/70 hover:bg-[#e8efe4] hover:text-[#31533f]" onClick={() => setClientToActivate(client)} type="button" aria-label={`Ativar ${client.name}`} title={`Ativar ${client.name}`}>
                      <UserCheck size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="flex items-center justify-between border-t border-[#1b2823]/10 px-6 py-4 text-sm" aria-label="Paginação de clientes">
              <button className={page <= 1 ? "pointer-events-none text-[#1b2823]/25" : "cursor-pointer text-[#b45432]"} onClick={() => setPage((currentPage) => currentPage - 1)} type="button" disabled={page <= 1}>
                <ChevronLeft size={18} aria-hidden="true" />
                <span className="sr-only">Página anterior</span>
              </button>
              <span className="text-[#1b2823]/55">Página {page} de {totalPages}</span>
              <button className={page >= totalPages ? "pointer-events-none text-[#1b2823]/25" : "cursor-pointer text-[#b45432]"} onClick={() => setPage((currentPage) => currentPage + 1)} type="button" disabled={page >= totalPages}>
                <ChevronRight size={18} aria-hidden="true" />
                <span className="sr-only">Próxima página</span>
              </button>
            </nav>
          )}
        </section>
      ) : (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#1b2823]/20 bg-white/50 px-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e8efe4] text-[#1b2823]"><Users size={22} /></span>
          <h2 className="mt-5 text-lg font-semibold">Nenhum cliente encontrado</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#1b2823]/55">{searchText ? "Tente pesquisar por outro nome ou e-mail." : showInactive ? "Não há clientes inativos cadastrados." : "Cadastre o primeiro cliente para começar a operação."}</p>
        </section>
      )}
      {clientToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b2823]/35 px-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setClientToDeactivate(null); }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="deactivate-client-title">
            <h2 className="text-xl font-semibold" id="deactivate-client-title">Inativar cliente?</h2>
            <p className="mt-2 text-sm leading-6 text-[#1b2823]/60">Informe por que {clientToDeactivate.name} será inativado.</p>
            <form className="mt-6" action={deactivateOrganization}>
              <input name="id" type="hidden" value={clientToDeactivate.id} />
              <label className="block text-sm font-medium" htmlFor="deactivation-reason">Motivo da inativação</label>
              <textarea className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[#1b2823]/15 bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b45432]" id="deactivation-reason" name="reason" maxLength={500} required />
              <div className="mt-6 flex justify-end gap-3">
                <button className="cursor-pointer rounded-xl border border-[#1b2823]/15 px-4 py-3 text-sm font-medium text-[#1b2823]/65 hover:bg-[#f8f7f4]" onClick={() => setClientToDeactivate(null)} type="button">Cancelar</button>
                <button className="cursor-pointer rounded-xl bg-[#8d3822] px-4 py-3 text-sm font-semibold text-white hover:bg-[#742d1c]" type="submit">Confirmar inativação</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {clientToActivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b2823]/35 px-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setClientToActivate(null); }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="activate-client-title">
            <h2 className="text-xl font-semibold" id="activate-client-title">Ativar cliente novamente?</h2>
            <p className="mt-2 text-sm leading-6 text-[#1b2823]/60">Deseja realmente ativar {clientToActivate.name} novamente?</p>
            <form className="mt-6 flex justify-end gap-3" action={activateOrganization}>
              <input name="id" type="hidden" value={clientToActivate.id} />
              <button className="cursor-pointer rounded-xl border border-[#1b2823]/15 px-4 py-3 text-sm font-medium text-[#1b2823]/65 hover:bg-[#f8f7f4]" onClick={() => setClientToActivate(null)} type="button">Cancelar</button>
              <button className="cursor-pointer rounded-xl bg-[#31533f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#264331]" type="submit">Confirmar ativação</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
