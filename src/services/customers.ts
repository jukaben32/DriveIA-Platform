import type { Customer } from '@/types'
import type { DbClient } from './_shared'

function toCustomer(row: any): Customer {
  return {
    id: row.id,
    businessId: row.business_id,
    authUserId: row.auth_user_id ?? null,
    name: row.name,
    phone: row.phone ?? null,
    email: row.email ?? null,
    dateOfBirth: row.date_of_birth ?? null,
    driversLicenseNumber: row.drivers_license_number ?? null,
    notes: row.notes ?? null,
    interestType: row.interest_type ?? 'undecided',
    budgetMin: row.budget_min ?? null,
    budgetMax: row.budget_max ?? null,
    preferredVehicleType: row.preferred_vehicle_type ?? null,
    leadStatus: row.lead_status ?? 'new',
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listCustomersForBusiness(supabase: DbClient, businessId: string) {
  const { data, error } = await supabase.from('customers').select('*').eq('business_id', businessId).order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toCustomer)
}

export async function searchCustomers(supabase: DbClient, businessId: string, query: string) {
  const trimmed = query.trim()
  if (!trimmed) return listCustomersForBusiness(supabase, businessId)

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .or(`name.ilike.%${trimmed}%,email.ilike.%${trimmed}%,phone.ilike.%${trimmed}%`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toCustomer)
}

export async function getCustomerById(supabase: DbClient, businessId: string, customerId: string) {
  const { data, error } = await supabase.from('customers').select('*').eq('business_id', businessId).eq('id', customerId).maybeSingle()
  if (error) throw error
  return data ? toCustomer(data) : null
}

export async function getCustomerByEmail(supabase: DbClient, businessId: string, email: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .ilike('email', email)
    .maybeSingle()
  if (error) throw error
  return data ? toCustomer(data) : null
}

export async function getCustomerByPhone(supabase: DbClient, businessId: string, phone: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .eq('phone', phone)
    .maybeSingle()
  if (error) throw error
  return data ? toCustomer(data) : null
}

export async function createCustomer(
  supabase: DbClient,
  businessId: string,
  input: {
    name: string
    email?: string | null
    phone?: string | null
    dateOfBirth?: string | null
    driversLicenseNumber?: string | null
    notes?: string | null
    interestType?: Customer['interestType']
    budgetMin?: number | null
    budgetMax?: number | null
    preferredVehicleType?: string | null
    leadStatus?: Customer['leadStatus']
    source?: Customer['source']
    authUserId?: string | null
  }
) {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      business_id: businessId,
      auth_user_id: input.authUserId ?? null,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      date_of_birth: input.dateOfBirth ?? null,
      drivers_license_number: input.driversLicenseNumber ?? null,
      notes: input.notes ?? null,
      interest_type: input.interestType ?? 'undecided',
      budget_min: input.budgetMin ?? null,
      budget_max: input.budgetMax ?? null,
      preferred_vehicle_type: input.preferredVehicleType ?? null,
      lead_status: input.leadStatus ?? 'new',
      source: input.source ?? 'manual',
    })
    .select('*')
    .single()
  if (error) throw error
  return toCustomer(data)
}

export async function updateCustomer(supabase: DbClient, businessId: string, customerId: string, patch: Partial<Customer>) {
  const { data, error } = await supabase
    .from('customers')
    .update({
      auth_user_id: patch.authUserId,
      name: patch.name,
      phone: patch.phone,
      email: patch.email,
      date_of_birth: patch.dateOfBirth,
      drivers_license_number: patch.driversLicenseNumber,
      notes: patch.notes,
      interest_type: patch.interestType,
      budget_min: patch.budgetMin,
      budget_max: patch.budgetMax,
      preferred_vehicle_type: patch.preferredVehicleType,
      lead_status: patch.leadStatus,
      source: patch.source,
    })
    .eq('business_id', businessId)
    .eq('id', customerId)
    .select('*')
    .single()
  if (error) throw error
  return toCustomer(data)
}

export async function findOrCreateCustomer(
  supabase: DbClient,
  businessId: string,
  input: {
    name: string
    email?: string | null
    phone?: string | null
    authUserId?: string | null
    source?: Customer['source']
    notes?: string | null
    interestType?: Customer['interestType']
  }
) {
  const authUserId = input.authUserId ?? null

  let existing: Customer | null = null
  if (authUserId) {
    existing = await getCustomerByAuthUserId(supabase, businessId, authUserId)
  }
  if (!existing && input.email) {
    existing = await getCustomerByEmail(supabase, businessId, input.email)
  }
  if (!existing && input.phone) {
    existing = await getCustomerByPhone(supabase, businessId, input.phone)
  }

  if (existing) {
    return updateCustomer(supabase, businessId, existing.id, {
      ...existing,
      name: input.name || existing.name,
      email: input.email ?? existing.email,
      phone: input.phone ?? existing.phone,
      authUserId: authUserId ?? existing.authUserId,
      source: input.source ?? existing.source,
      notes: input.notes ?? existing.notes,
      interestType: input.interestType ?? existing.interestType,
    })
  }

  return createCustomer(supabase, businessId, {
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    authUserId,
    source: input.source ?? 'manual',
    notes: input.notes ?? null,
    interestType: input.interestType ?? 'undecided',
  })
}

export async function getCustomerByAuthUserId(supabase: DbClient, businessId: string, authUserId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  if (error) throw error
  return data ? toCustomer(data) : null
}

export async function setCustomerLeadStatus(supabase: DbClient, businessId: string, customerId: string, leadStatus: Customer['leadStatus']) {
  return updateCustomer(supabase, businessId, customerId, { leadStatus })
}
