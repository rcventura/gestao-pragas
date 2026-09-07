import Link from "next/link";

export default function ClientPortalPage() {
  return (
    <main className="min-h-screen bg-[#e8efe4] px-6 py-8 text-[#1b2823] sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b border-[#1b2823]/15 pb-6">
          <Link className="text-sm font-semibold tracking-[0.16em] uppercase" href="/">Gestão de Pragas</Link>
          <span className="rounded-full bg-white/70 px-4 py-2 text-xs text-[#1b2823]/60">Portal do cliente</span>
        </header>
        <section className="py-16 sm:py-24">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#b45432] uppercase">Área da sua empresa</p>
          <h1 className="mt-5 max-w-2xl text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">Tudo sobre seus atendimentos, com clareza.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#1b2823]/60">Acompanhe ordens de serviço, documentos, agenda e histórico em um único lugar.</p>
        </section>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6"><p className="text-sm text-[#1b2823]/55">Próximo atendimento</p><p className="mt-7 text-2xl font-semibold">Nenhum agendado</p></div>
          <div className="rounded-2xl bg-white p-6"><p className="text-sm text-[#1b2823]/55">Ordens em andamento</p><p className="mt-7 text-2xl font-semibold">00</p></div>
          <div className="rounded-2xl bg-white p-6"><p className="text-sm text-[#1b2823]/55">Documentos disponíveis</p><p className="mt-7 text-2xl font-semibold">00</p></div>
        </div>
      </div>
    </main>
  );
}
