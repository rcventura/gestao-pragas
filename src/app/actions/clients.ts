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

function getOrganizationValues(formData: FormData) {
  return {
    name: getValue(formData, "name"),
    email: getValue(formData, "email").toLowerCase(),
    clientType: getValue(formData, "client_type"),
    document: getValue(formData, "document"),
    phone: getValue(formData, "phone"),
    postalCode: getValue(formData, "postal_code"),
    street: getValue(formData, "street"),
    streetNumber: getValue(formData, "street_number"),
    state: getValue(formData, "state").toUpperCase(),
    city: getValue(formData, "city"),
    neighborhood: getValue(formData, "neighborhood"),
  };
}

function validateOrganizationValues(values: ReturnType<typeof getOrganizationValues>) {
  const { name, email, clientType, document, phone, postalCode, street, streetNumber, state, city, neighborhood } = values;
  const tooLong = name.length > 160 || email.length > 320 || document.length > 32 || phone.length > 32 || postalCode.length > 16 || street.length > 160 || streetNumber.length > 32 || city.length > 120 || neighborhood.length > 120;

  if (tooLong || !name || !email || !clientType || !document || !phone || !postalCode || !street || !streetNumber || !state || !city || !neighborhood || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[A-Z]{2}$/.test(state)) {
    return "Preencha os dados obrigatórios corretamente.";
  }

  if (clientType !== "individual" && clientType !== "company") {
    return "Selecione um tipo de cliente válido.";
  }

  return null;
}

export async function createOrganization(formData: FormData) {
  const { supabase } = await requireRole(["super_admin"]);
  const values = getOrganizationValues(formData);
  const validationError = validateOrganizationValues(values);
  if (validationError) redirect(`/dashboard/clients/new?error=${encodeURIComponent(validationError)}`);

  const { error } = await supabase.from("organizations").insert({
    name: values.name,
    email: values.email,
    slug: createSlug(values.name),
    active: true,
    client_type: values.clientType,
    document: values.document,
    phone: values.phone,
    postal_code: values.postalCode,
    street: values.street,
    street_number: values.streetNumber,
    state: values.state,
    city: values.city,
    neighborhood: values.neighborhood,
  });

  if (error) {
    redirect(`/dashboard/clients/new?error=${encodeURIComponent("Não foi possível cadastrar este cliente.")}`);
  }

  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients?success=${encodeURIComponent("Cliente cadastrado com sucesso.")}`);
}

export async function updateOrganization(formData: FormData) {
  const { supabase } = await requireRole(["super_admin"]);
  const id = getValue(formData, "id");
  const values = getOrganizationValues(formData);
  const validationError = validateOrganizationValues(values);

  if (!id || validationError) {
    redirect(`/dashboard/clients/${encodeURIComponent(id)}/edit?error=${encodeURIComponent(validationError || "Cliente inválido.")}`);
  }

  const { error } = await supabase.rpc("update_organization_for_admin", {
    target_id: id,
    target_name: values.name,
    target_email: values.email,
    target_client_type: values.clientType,
    target_document: values.document,
    target_phone: values.phone,
    target_postal_code: values.postalCode,
    target_street: values.street,
    target_street_number: values.streetNumber,
    target_state: values.state,
    target_city: values.city,
    target_neighborhood: values.neighborhood,
  });

  if (error) {
    redirect(`/dashboard/clients/${encodeURIComponent(id)}/edit?error=${encodeURIComponent("Não foi possível atualizar este cliente.")}`);
  }

  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients?success=${encodeURIComponent("Cliente atualizado com sucesso.")}`);
}

export async function deactivateOrganization(formData: FormData) {
  const { supabase } = await requireRole(["super_admin"]);
  const id = getValue(formData, "id");
  const reason = getValue(formData, "reason");

  if (!id || !reason || reason.length > 500) {
    redirect(`/dashboard/clients?error=${encodeURIComponent("Informe um motivo válido para a inativação.")}`);
  }

  const { error } = await supabase.rpc("deactivate_organization_for_admin", {
    target_id: id,
    target_reason: reason,
  });

  if (error) {
    redirect(`/dashboard/clients?error=${encodeURIComponent("Não foi possível inativar este cliente.")}`);
  }

  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients?success=${encodeURIComponent("Cliente inativado com sucesso.")}`);
}

export async function activateOrganization(formData: FormData) {
  const { supabase } = await requireRole(["super_admin"]);
  const id = getValue(formData, "id");

  if (!id) {
    redirect(`/dashboard/clients?error=${encodeURIComponent("Cliente inválido.")}`);
  }

  const { error } = await supabase.rpc("activate_organization_for_admin", { target_id: id });

  if (error) {
    redirect(`/dashboard/clients?status=inactive&error=${encodeURIComponent("Não foi possível ativar este cliente.")}`);
  }

  revalidatePath("/dashboard/clients");
  redirect(`/dashboard/clients?status=inactive&success=${encodeURIComponent("Cliente ativado com sucesso.")}`);
}
