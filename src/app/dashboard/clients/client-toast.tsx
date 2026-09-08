"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type ClientToastProps = {
  message?: string;
  type: "success" | "error";
};

export function ClientToast({ message, type }: ClientToastProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => {
      router.replace(pathname, { scroll: false });
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, [message, pathname, router]);

  if (!message) return null;

  return (
    <div className={`fixed right-5 top-5 z-50 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${type === "success" ? "border-[#9ac7a9] bg-[#e8f4eb] text-[#2f6b4f]" : "border-[#e6a39a] bg-[#fcecea] text-[#b94b3b]"}`} role="status">
      <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button className="cursor-pointer opacity-60 transition-opacity hover:opacity-100" onClick={() => router.replace(pathname, { scroll: false })} type="button" aria-label="Fechar mensagem">
        <X size={16} />
      </button>
    </div>
  );
}