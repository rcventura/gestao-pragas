"use client";

import Link from "next/link";
import { useState } from "react";
import { updateOrganization } from "@/app/actions/clients";

export type EditableClient = {
  id: string;
  name: string;
  email: string | null;
  client_type: "individual" | "company";
  document: string | null;
  phone: string | null;
  postal_code: string | null;
  street: string | null;
  street_number: string | null;
  state: string | null;
  city: string | null;
  neighborhood: string | null;
  billing_amount: number | null;
  billing_due_day: number | null;
};

const inputClass = "mt-2 w-full rounded-xl border border-[#1b2823]/15 bg-[#f8f7f4] px-4 py-3 text-sm outline-none transition focus:border-[#b45432]";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCurrency(digits: string) {
  if (!digits) return "";
  const cents = digits.padStart(3, "0");
  const intPart = cents.slice(0, -2).replace(/^0+(?=\d)/, "");
  const decPart = cents.slice(-2);
  return `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decPart}`;
}

function currencyDigitsToDecimal(digits: string) {
  if (!digits) return "";
  const cents = digits.padStart(3, "0");
  return `${parseInt(cents.slice(0, -2), 10)}.${cents.slice(-2)}`;
}

function numberToCurrencyDigits(value: number | null) {
  if (value === null || value === undefined) return "";
  return Math.round(value * 100).toString();
}

export function EditClientForm({ client }: { client: EditableClient }) {
  const [clientType, setClientType] = useState(client.client_type);
  const [document, setDocument] = useState(client.document || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [postalCode, setPostalCode] = useState(client.postal_code || "");
  const [address, setAddress] = useState({
    street: client.street || "",
    neighborhood: client.neighborhood || "",
    city: client.city || "",
    state: client.state || "",
  });
  const [billingAmountDigits, setBillingAmountDigits] = useState(numberToCurrencyDigits(client.billing_amount));

  function maskDocument(value: string) {
    const digits = onlyDigits(value).slice(0, clientType === "individual" ? 11 : 14);
    if (clientType === "individual") return digits.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return digits.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }

  return (
    <form className="mt-8 rounded-2xl bg-white p-8 shadow-sm sm:p-10 lg:p-12" action={updateOrganization}>
      <input name="id" type="hidden" value={client.id} />
      <fieldset>
        <legend className="text-sm font-semibold">Tipo de cliente</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(["individual", "company"] as const).map((type) => (
            <label className={`cursor-pointer rounded-xl border px-4 py-3 text-sm ${clientType === type ? "border-[#1b2823] bg-[#e8efe4]" : "border-[#1b2823]/15"}`} key={type}>
              <input className="sr-only" name="client_type" type="radio" value={type} checked={clientType === type} onChange={() => { setClientType(type); setDocument(""); }} />
              {type === "individual" ? "Pessoa Física" : "Pessoa Jurídica"}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-medium">{clientType === "individual" ? "CPF" : "CNPJ"}<input className={inputClass} name="document" value={document} onChange={(event) => setDocument(maskDocument(event.target.value))} required /></label>
        <label className="block text-sm font-medium">{clientType === "individual" ? "Nome completo" : "Nome da empresa"}<input className={inputClass} name="name" defaultValue={client.name} required /></label>
        <label className="block text-sm font-medium">E-mail<input className={inputClass} name="email" defaultValue={client.email || ""} type="email" required /></label>
        <label className="block text-sm font-medium">Telefone<input className={inputClass} name="phone" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
      </div>
      <fieldset className="mt-8 border-t border-[#1b2823]/10 pt-7">
        <legend className="text-sm font-semibold">Endereço</legend>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm font-medium">CEP<input className={inputClass} name="postal_code" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} required /></label>
          <label className="block text-sm font-medium lg:col-span-3">Logradouro<input className={inputClass} name="street" value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} required /></label>
          <label className="block text-sm font-medium">Número<input className={inputClass} name="street_number" defaultValue={client.street_number || ""} required /></label>
          <label className="block text-sm font-medium">Estado<input className={inputClass} name="state" value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value.toUpperCase().slice(0, 2) })} maxLength={2} required /></label>
          <label className="block text-sm font-medium">Cidade<input className={inputClass} name="city" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} required /></label>
          <label className="block text-sm font-medium">Bairro<input className={inputClass} name="neighborhood" value={address.neighborhood} onChange={(event) => setAddress({ ...address, neighborhood: event.target.value })} required /></label>
        </div>
      </fieldset>
      <fieldset className="mt-8 border-t border-[#1b2823]/10 pt-7">
        <legend className="text-sm font-semibold">Mensalidade</legend>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Valor da mensalidade (R$)
            <input
              className={inputClass}
              value={maskCurrency(billingAmountDigits)}
              onChange={(event) => setBillingAmountDigits(onlyDigits(event.target.value).slice(0, 9))}
              placeholder="0,00"
              inputMode="decimal"
              type="text"
            />
            <input name="billing_amount" type="hidden" value={currencyDigitsToDecimal(billingAmountDigits)} />
          </label>
          <label className="block text-sm font-medium">
            Melhor dia para vencimento
            <input className={inputClass} name="billing_due_day" defaultValue={client.billing_due_day ?? ""} placeholder="Ex: 10" type="number" min="1" max="31" />
          </label>
        </div>
      </fieldset>
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#1b2823]/10 pt-6 sm:flex-row sm:justify-end">
        <Link className="rounded-xl border border-[#1b2823]/15 px-4 py-3 text-center text-sm font-medium text-[#1b2823]/65 hover:bg-[#f8f7f4]" href="/dashboard/clients">Cancelar</Link>
        <button className="cursor-pointer rounded-xl bg-[#1b2823] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2b3c35]" type="submit">Salvar alterações</button>
      </div>
    </form>
  );
}