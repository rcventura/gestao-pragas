import Link from "next/link";
import { CircleDollarSign, LayoutDashboard, LogOut, Users } from "lucide-react";
import { signOut } from "@/app/actions/auth";

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Clientes", icon: Users, href: "/dashboard/clients" },
  { label: "Financeiro", icon: CircleDollarSign, href: "/dashboard/financeiro" },
];

type DashboardSidebarProps = {
  userName: string;
  email: string;
  activePath: string;
};

export function DashboardSidebar({ userName, email, activePath }: DashboardSidebarProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#1b2823]/10 bg-[#eeeae1] px-4 py-7 lg:flex">
        <Link className="border-b border-[#1b2823]/10 px-3 pb-6" href="/">
          <span className="block text-sm font-semibold tracking-[0.16em] uppercase">Gestão de Pragas</span>
          <span className="mt-2 block text-xs text-[#1b2823]/50">Sistema operacional</span>
        </Link>
        <nav className="mt-10 flex-1 space-y-1 text-sm" aria-label="Navegação principal">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = activePath === item.href;

            return (
              <Link className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${active ? "bg-[#1b2823] font-medium text-white shadow-sm" : "text-[#1b2823]/60 hover:bg-white/70 hover:text-[#1b2823]"}`} href={item.href} key={item.label}>
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[#1b2823]/10 pt-3">
          <form action={signOut}>
            <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#1b2823]/60 transition-colors hover:bg-[#b42318] hover:text-white" type="submit">
              <LogOut size={18} strokeWidth={1.8} />
              <span>Sair</span>
            </button>
          </form>
          <div className="mt-2 border-t border-[#1b2823]/10 px-3 pt-2">
            <p className="truncate text-sm font-medium text-[#1b2823]">{userName}</p>
            <p className="mt-1 truncate text-xs text-[#1b2823]/50">{email}</p>
          </div>
        </div>
      </aside>
      <details className="mb-6 w-full rounded-2xl border border-[#1b2823]/10 bg-[#eeeae1] p-3 lg:hidden">
        <summary className="cursor-pointer list-none rounded-xl px-3 py-2 text-sm font-semibold text-[#1b2823]">Menu</summary>
        <nav className="mt-2 space-y-1 border-t border-[#1b2823]/10 pt-3" aria-label="Navegação principal">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = activePath === item.href;

            return (
              <Link className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${active ? "bg-[#1b2823] font-medium text-white" : "text-[#1b2823]/60 hover:bg-white/70 hover:text-[#1b2823]"}`} href={item.href} key={item.label}>
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <form className="border-t border-[#1b2823]/10 pt-2" action={signOut}>
            <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#1b2823]/60 transition-colors hover:bg-[#b42318] hover:text-white" type="submit">
              <LogOut size={18} strokeWidth={1.8} />
              <span>Sair</span>
            </button>
          </form>
        </nav>
      </details>
    </>
  );
}
