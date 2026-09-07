export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#1b2823]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#1b2823]/15 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b2823] text-sm font-bold text-[#d8e8d1]">
              GP
            </div>
            <span className="text-sm font-semibold tracking-[0.18em] uppercase">Gestão de Pragas</span>
          </div>
          <span className="text-sm text-[#1b2823]/60">Primeiro acesso</span>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="mb-6 text-sm font-semibold tracking-[0.2em] text-[#b45432] uppercase">Operação em um só lugar</p>
            <h1 className="max-w-xl text-5xl leading-[0.98] font-semibold tracking-[-0.04em] sm:text-7xl">
              Controle claro para cada atendimento.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-[#1b2823]/65">
              Uma base para organizar clientes, equipes e ordens de serviço de controle de pragas com mais rastreabilidade.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a className="rounded-full bg-[#b45432] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#913e25]" href="/login">
                Entrar no sistema
              </a>
              <span className="rounded-full border border-[#1b2823]/20 px-6 py-3 text-sm text-[#1b2823]/65">Acesso por convite</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-[#1b2823] p-8 text-[#f4f1eb] shadow-2xl shadow-[#1b2823]/15 sm:p-10">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[28px] border-[#d8e8d1]/15" />
            <p className="relative text-sm tracking-[0.16em] text-[#d8e8d1]/70 uppercase">Duas visões, uma operação</p>
            <div className="relative mt-12 space-y-5">
              <div className="border-t border-[#f4f1eb]/20 pt-5">
                <p className="text-xl font-medium">Painel administrativo</p>
                <p className="mt-2 text-sm leading-6 text-[#f4f1eb]/60">Clientes, agenda, técnicos e ordens de serviço.</p>
              </div>
              <div className="border-t border-[#f4f1eb]/20 pt-5">
                <p className="text-xl font-medium">Portal do cliente</p>
                <p className="mt-2 text-sm leading-6 text-[#f4f1eb]/60">Histórico, documentos e próximos atendimentos.</p>
              </div>
              <div className="border-t border-[#f4f1eb]/20 pt-5">
                <p className="text-xl font-medium">Área de campo</p>
                <p className="mt-2 text-sm leading-6 text-[#f4f1eb]/60">Execução guiada, evidências e sincronização offline.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#1b2823]/15 pt-5 text-xs text-[#1b2823]/50">
          Plataforma em construção · arquitetura preparada para múltiplas empresas
        </footer>
      </div>
    </main>
  );
}
