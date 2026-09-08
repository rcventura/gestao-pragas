"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";

function getValue(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function createSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .concat("-", Date.now().toString(36));
}

export async function createOrganization(formData: FormData) {
  const { supabase } = await requireRole(["super_admin"]);
  const name = getValue(formData, "name");
  const email = getValue(formData, "email").toLowerCase();
  const clientType = getValue(formData, "client_type");
  const document = getValue(formData, "document");
  const phone = getValue(formData, "phone");
  const postalCode = getValue(formData, "postal_code");
  const street = getValue(formData, "street");
  const streetNumber = getValue(formData, "street_number");
  const state = getValue(formData, "state").toUpperCase();
  const city = getValue(formData, "city");
  const neighborhood = getValue(formData, "neighborhood");

  if (name.length > 160 || email.length > 320 || document.length > 32 || phone.length > 32 || postalCode.length > 16 || street.length > 160 || streetNumber.length > 32 || state.length !== 2 || city.length > 120 || neighborhood.length > 120) {
    redirect(`/dashboard/clients/new?error=${encodeURIComponent("Revise os dados informados.")}`);
  }

  if (!name || !email || !clientType || !document || !phone || !postalCode || !street || !streetNumber || !state || !city || !neighborhood || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[A-Z]{2}$/.test(state)) {
    redirect(`/dashboard/clients/new?error=${encodeURIComponent("Preencha todos os campos obrigatórios.")}`);
  }

  if (clientType !== "individual" && clientType !== "company") {
    redirect(`/dashboard/clients/new?error=${encodeURIComponent("Selecione um tipo de cliente válido.")}`);
  }

  const { error } = await supabase.from("organizations").insert({
    name,
    email,
    slug: createSlug(name),
    active: true,
    client_type: clientType,
    document,
    phone,
    postal_code: postalCode,
    street,
    street_number: streetNumber,
    state,
    city,
    neighborhood,
  });

  if (error) {
    redirect(`/dashboard/clients/new?error=${encodeURIComponent("Não foi possível cadastrar este cliente.")}`);
  }

  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients?success=${encodeURIComponent("Cliente cadastrado com sucesso.")}`);
}
