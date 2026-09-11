import { CircleDollarSign } from "lucide-react";

type Invoice = {
  id: string;
  organization_name: string;
  organization_phone: string | null;
  amount: number | string;
  due_date: string;
};

type FinanceListProps = {
  invoices: Invoice[];
};

function formatCurrency(amount: number | string) {
  return Number(amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDueDate(dueDate: string) {
  const [year, month, day] = dueDate.split("-");
  return `${day}/${month}/${year}`;
}

function isOverdue(dueDate: string) {
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

export function FinanceList({ invoices }: FinanceListProps) {
  if (invoices.length === 0) {
    return (
      <section className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#1b2823]/20 bg-white/50 px-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e8efe4] text-[#1b2823]"><CircleDollarSign size={22} /></span>
        <h2 className="mt-5 text-lg font-semibold">Nenhuma mensalidade encontrada</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#1b2823]/55">Cadastre o valor e o dia de vencimento nos clientes para gerar as mensalidades.</p>
      </section>
    );
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-[#1b2823]/10 bg-white shadow-sm">
      <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-[#1b2823]/10 px-6 py-4 text-xs font-semibold tracking-[0.12em] text-[#1b2823]/45 uppercase md:grid">
        <span>Cliente</span>
        <span>Telefone</span>
        <span className="text-center">Status</span>
        <span className="text-right">Valor</span>
        <span className="text-right">Vencimento</span>
      </div>
      <div className="divide-y divide-[#1b2823]/10">
        {invoices.map((invoice) => {
          const overdue = isOverdue(invoice.due_date);

          return (
            <div className="grid gap-4 px-6 py-5 transition-colors hover:bg-[#f8f7f4] md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_0.8fr] md:items-center md:gap-4" key={invoice.id}>
              <p className="font-medium">{invoice.organization_name}</p>
              <p className="text-sm text-[#1b2823]/60">{invoice.organization_phone || "Telefone não informado"}</p>
              <span className={`w-fit justify-self-center rounded-full px-3 py-1 text-center text-xs font-medium ${overdue ? "bg-[#fbe9e3] text-[#8d3822]" : "bg-[#e8efe4] text-[#31533f]"}`}>
                {overdue ? "Vencida" : "A Vencer"}
              </span>
              <p className="text-right text-sm font-medium">{formatCurrency(invoice.amount)}</p>
              <p className="text-right text-sm text-[#1b2823]/60">{formatDueDate(invoice.due_date)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
