"use client";

import { useState } from "react";
import { createOrganization } from "@/app/actions/clients";
import Link from "next/link";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskDocument(value: string, type: "individual" | "company") {
  const digits = onlyDigits(value).slice(0, type === "individual" ? 11 : 14);
  if (type === "individual") {
    return digits.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length > 10) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
}

function maskPostalCode(value: string) {
  return onlyDigits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

const inputClass = "mt-2 w-full rounded-xl border border-[#1b2823]/15 bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b45432]";

export function NewClientForm() {
  const [clientType, setClientType] = useState<"individual" | "company">("company");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loadingPostalCode, setLoadingPostalCode] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState("");
  const [address, setAddress] = useState({ street: "", neighborhood: "", city: "", state: "" });

  async function lookupPostalCode(value: string) {
    const digits = onlyDigits(value);
    setPostalCode(value);
    setPostalCodeError("");
    if (digits.length !== 8) return;
    setLoadingPostalCode(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await response.json();
      if (data.erro) {
        setPostalCodeError("CEP não encontrado.");
        return;
      }
      setAddress({ street: data.logradouro || "", neighborhood: data.bairro || "", city: data.localidade || "", state: data.uf || "" });
    } catch {
      setPostalCodeError("Não foi possível consultar o CEP.");
    } finally {
      setLoadingPostalCode(false);
    }
  }

  return (
    <form className="mt-8 rounded-2xl bg-white p-8 shadow-sm sm:p-10 lg:p-12" action={createOrganization}>
      <fieldset>
        <legend className="text-sm font-semibold">Tipo de cliente</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className={`cursor-pointer rounded-xl border px-4 py-3 text-sm ${clientType === "individual" ? "border-[#1b2823] bg-[#e8efe4]" : "border-[#1b2823]/15"}`}>
            <input className="sr-only" name="client_type" type="radio" value="individual" checked={clientType === "individual"} onChange={() => { setClientType("individual"); setDocument(""); }} />
            Pessoa Física
          </label>
          <label className={`cursor-pointer rounded-xl border px-4 py-3 text-sm ${clientType === "company" ? "border-[#1b2823] bg-[#e8efe4]" : "border-[#1b2823]/15"}`}>
            <input className="sr-only" name="client_type" type="radio" value="company" checked={clientType === "company"} onChange={() => { setClientType("company"); setDocument(""); }} />
            Pessoa Jurídica
          </label>
        </div>
      </fieldset>
      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          {clientType === "individual" ? "CPF" : "CNPJ"}
          <input className={inputClass} name="document" value={document} onChange={(event) => setDocument(maskDocument(event.target.value, clientType))} placeholder={clientType === "individual" ? "000.000.000-00" : "00.000.000/0000-00"} inputMode="numeric" required />
        </label>
        <label className="block text-sm font-medium">
          {clientType === "individual" ? "Nome completo" : "Nome da empresa"}
          <input className={inputClass} name="name" placeholder={clientType === "individual" ? "Nome completo" : "Empresa Exemplo Ltda."} required />
        </label>
        <label className="block text-sm font-medium">
          E-mail
          <input className={inputClass} name="email" placeholder="contato@empresa.com" type="email" required />
        </label>
        <label className="block text-sm font-medium">
          Telefone
          <input className={inputClass} name="phone" value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} placeholder="(00) 00000-0000" inputMode="tel" required />
        </label>
      </div>
      <fieldset className="mt-8 border-t border-[#1b2823]/10 pt-7">
        <legend className="text-sm font-semibold">Endereço</legend>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm font-medium lg:col-span-1">
            CEP
            <input className={inputClass} name="postal_code" value={maskPostalCode(postalCode)} onChange={(event) => lookupPostalCode(maskPostalCode(event.target.value))} placeholder="00000-000" inputMode="numeric" required />
            {loadingPostalCode && <span className="mt-1 block text-xs text-[#1b2823]/50">Consultando CEP...</span>}
            {postalCodeError && <span className="mt-1 block text-xs text-[#8d3822]">{postalCodeError}</span>}
          </label>
          <label className="block text-sm font-medium lg:col-span-3">
            Logradouro
            <input className={inputClass} name="street" value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} required />
          </label>
          <label className="block text-sm font-medium">
            Número
            <input className={inputClass} name="street_number" placeholder="000" required />
          </label>
          <label className="block text-sm font-medium">
            Estado
            <input className={inputClass} name="state" value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value.toUpperCase().slice(0, 2) })} placeholder="UF" maxLength={2} required />
          </label>
          <label className="block text-sm font-medium">
            Cidade
            <input className={inputClass} name="city" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} required />
          </label>
          <label className="block text-sm font-medium">
            Bairro
            <input className={inputClass} name="neighborhood" value={address.neighborhood} onChange={(event) => setAddress({ ...address, neighborhood: event.target.value })} required />
          </label>
        </div>
      </fieldset>
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#1b2823]/10 pt-6 sm:flex-row sm:justify-end">
        <Link className="rounded-xl border border-[#1b2823]/15 px-4 py-3 text-center text-sm font-medium text-[#1b2823]/65 hover:bg-[#f8f7f4]" href="/dashboard/clients">Cancelar</Link>
        <button className="cursor-pointer rounded-xl bg-[#1b2823] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2b3c35]" type="submit">Cadastrar cliente</button>
      </div>
    </form>
  );
}