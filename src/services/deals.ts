import type { Deal, DealWithRelations } from '@/types'
import type { DbClient } from './_shared'

function toDeal(row: any): Deal {
  return {
    id: row.id,
    businessId: row.business_id,
    customerId: row.customer_id ?? null,
    vehicleId: row.vehicle_id ?? null,
    agentId: row.agent_id ?? null,
    appointmentId: row.appointment_id ?? null,
    dealType: row.deal_type,
    status: row.status,
    agreedPrice: row.agreed_price ?? null,
    downPayment: row.down_payment ?? null,
    financingNeeded: row.financing_needed ?? false,
    tradeInDescription: row.trade_in_description ?? null,
    tradeInValue: row.trade_in_value ?? null,
    rentalStartDate: row.rental_start_date ?? null,
    rentalEndDate: row.rental_end_date ?? null,
    depositAmount: row.deposit_amount ?? null,
    currency: row.currency,
    notes: row.notes ?? null,
    closedAt: row.closed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const DEAL_SELECT = '*, customer:customers(*), vehicle:vehicles(*)'

function toDealWithRelations(row: any): DealWithRelations {
  return {
    ...toDeal(row),
    customer: row.customer
      ? {
          id: row.customer.id,
          businessId: row.customer.business_id,
          authUserId: row.customer.auth_user_id ?? null,
          name: row.customer.name,
          phone: row.customer.phone ?? null,
          email: row.customer.email ?? null,
          dateOfBirth: row.customer.date_of_birth ?? null,
          driversLicenseNumber: row.customer.drivers_license_number ?? null,
          notes: row.customer.notes ?? null,
          interestType: row.customer.interest_type ?? 'undecided',
          budgetMin: row.customer.budget_min ?? null,
          budgetMax: row.customer.budget_max ?? null,
          preferredVehicleType: row.customer.preferred_vehicle_type ?? null,
          leadStatus: row.customer.lead_status ?? 'new',
          source: row.customer.source,
          createdAt: row.customer.created_at,
          updatedAt: row.customer.updated_at,
        }
      : null,
    vehicle: row.vehicle
      ? {
          id: row.vehicle.id,
          businessId: row.vehicle.business_id,
          stockNumber: row.vehicle.stock_number ?? null,
          vin: row.vehicle.vin ?? null,
          make: row.vehicle.make,
          model: row.vehicle.model,
          trim: row.vehicle.trim ?? null,
          year: row.vehicle.year,
          bodyType: row.vehicle.body_type ?? null,
          condition: row.vehicle.condition,
          mileage: row.vehicle.mileage ?? null,
          exteriorColor: row.vehicle.exterior_color ?? null,
          interiorColor: row.vehicle.interior_color ?? null,
          transmission: row.vehicle.transmission ?? null,
          fuelType: row.vehicle.fuel_type ?? null,
          listingType: row.vehicle.listing_type,
          salePrice: row.vehicle.sale_price ?? null,
          rentalDailyRate: row.vehicle.rental_daily_rate ?? null,
          rentalWeeklyRate: row.vehicle.rental_weekly_rate ?? null,
          currency: row.vehicle.currency,
          status: row.vehicle.status,
          description: row.vehicle.description ?? null,
          features: row.vehicle.features ?? [],
          photoUrls: row.vehicle.photo_urls ?? [],
          location: row.vehicle.location ?? null,
          isFeatured: row.vehicle.is_featured ?? false,
          sortOrder: row.vehicle.sort_order ?? 0,
          ownershipType: row.vehicle.ownership_type ?? 'dealer_owned',
          ownerName: row.vehicle.owner_name ?? null,
          ownerContact: row.vehicle.owner_contact ?? null,
          ownerIdNumber: row.vehicle.owner_id_number ?? null,
          commissionPct: row.vehicle.commission_pct ?? null,
          createdAt: row.vehicle.created_at,
          updatedAt: row.vehicle.updated_at,
        }
      : null,
  }
}

export async function listDealsForBusiness(supabase: DbClient, businessId: string) {
  const { data, error } = await supabase
    .from('deals')
    .select(DEAL_SELECT)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toDealWithRelations)
}

export async function listOpenDeals(supabase: DbClient, businessId: string) {
  const { data, error } = await supabase
    .from('deals')
    .select(DEAL_SELECT)
    .eq('business_id', businessId)
    .in('status', ['open', 'negotiating'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toDealWithRelations)
}

export async function getDealById(supabase: DbClient, businessId: string, dealId: string) {
  const { data, error } = await supabase.from('deals').select(DEAL_SELECT).eq('business_id', businessId).eq('id', dealId).maybeSingle()
  if (error) throw error
  return data ? toDealWithRelations(data) : null
}

export async function createDeal(
  supabase: DbClient,
  businessId: string,
  input: {
    customerId?: string | null
    vehicleId?: string | null
    agentId?: string | null
    appointmentId?: string | null
    dealType?: Deal['dealType']
    status?: Deal['status']
    agreedPrice?: number | null
    downPayment?: number | null
    financingNeeded?: boolean
    tradeInDescription?: string | null
    tradeInValue?: number | null
    rentalStartDate?: string | null
    rentalEndDate?: string | null
    depositAmount?: number | null
    currency?: string
    notes?: string | null
  }
) {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      business_id: businessId,
      customer_id: input.customerId ?? null,
      vehicle_id: input.vehicleId ?? null,
      agent_id: input.agentId ?? null,
      appointment_id: input.appointmentId ?? null,
      deal_type: input.dealType ?? 'sale',
      status: input.status ?? 'open',
      agreed_price: input.agreedPrice ?? null,
      down_payment: input.downPayment ?? null,
      financing_needed: input.financingNeeded ?? false,
      trade_in_description: input.tradeInDescription ?? null,
      trade_in_value: input.tradeInValue ?? null,
      rental_start_date: input.rentalStartDate ?? null,
      rental_end_date: input.rentalEndDate ?? null,
      deposit_amount: input.depositAmount ?? null,
      currency: input.currency ?? 'USDC',
      notes: input.notes ?? null,
    })
    .select(DEAL_SELECT)
    .single()
  if (error) throw error
  return toDealWithRelations(data)
}

export async function updateDealStatus(supabase: DbClient, businessId: string, dealId: string, status: Deal['status']) {
  const { data, error } = await supabase
    .from('deals')
    .update({
      status,
      closed_at: status === 'won' || status === 'lost' || status === 'cancelled' ? new Date().toISOString() : null,
    })
    .eq('business_id', businessId)
    .eq('id', dealId)
    .select(DEAL_SELECT)
    .single()
  if (error) throw error
  return toDealWithRelations(data)
}

export async function updateDeal(supabase: DbClient, businessId: string, dealId: string, patch: Partial<Deal>) {
  const { data, error } = await supabase
    .from('deals')
    .update({
      customer_id: patch.customerId,
      vehicle_id: patch.vehicleId,
      agent_id: patch.agentId,
      deal_type: patch.dealType,
      status: patch.status,
      agreed_price: patch.agreedPrice,
      down_payment: patch.downPayment,
      financing_needed: patch.financingNeeded,
      trade_in_description: patch.tradeInDescription,
      trade_in_value: patch.tradeInValue,
      rental_start_date: patch.rentalStartDate,
      rental_end_date: patch.rentalEndDate,
      deposit_amount: patch.depositAmount,
      notes: patch.notes,
    })
    .eq('business_id', businessId)
    .eq('id', dealId)
    .select(DEAL_SELECT)
    .single()
  if (error) throw error
  return toDealWithRelations(data)
}
