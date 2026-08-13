import type { PublicVehicle, Vehicle } from '@/types'
import type { DbClient } from './_shared'

function toPublicVehicle(row: any): PublicVehicle {
  return {
    id: row.id,
    businessId: row.business_id,
    stockNumber: row.stock_number ?? null,
    vin: row.vin ?? null,
    make: row.make,
    model: row.model,
    trim: row.trim ?? null,
    year: row.year,
    bodyType: row.body_type ?? null,
    condition: row.condition,
    mileage: row.mileage ?? null,
    exteriorColor: row.exterior_color ?? null,
    interiorColor: row.interior_color ?? null,
    transmission: row.transmission ?? null,
    fuelType: row.fuel_type ?? null,
    listingType: row.listing_type,
    salePrice: row.sale_price ?? null,
    rentalDailyRate: row.rental_daily_rate ?? null,
    rentalWeeklyRate: row.rental_weekly_rate ?? null,
    currency: row.currency,
    status: row.status,
    description: row.description ?? null,
    features: row.features ?? [],
    photoUrls: row.photo_urls ?? [],
    location: row.location ?? null,
    isFeatured: row.is_featured ?? false,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Full internal shape — includes third-party ownership and commission
// fields. Only for dealer dashboard use (see toPublicVehicle for anything
// the AI agent or the public website reads).
function toVehicle(row: any): Vehicle {
  return {
    ...toPublicVehicle(row),
    ownershipType: row.ownership_type ?? 'dealer_owned',
    ownerName: row.owner_name ?? null,
    ownerContact: row.owner_contact ?? null,
    ownerIdNumber: row.owner_id_number ?? null,
    commissionPct: row.commission_pct ?? null,
  }
}

export type VehicleInput = {
  stockNumber?: string | null
  vin?: string | null
  make: string
  model: string
  trim?: string | null
  year: number
  bodyType?: Vehicle['bodyType']
  condition?: Vehicle['condition']
  mileage?: number | null
  exteriorColor?: string | null
  interiorColor?: string | null
  transmission?: Vehicle['transmission']
  fuelType?: Vehicle['fuelType']
  listingType?: Vehicle['listingType']
  salePrice?: number | null
  rentalDailyRate?: number | null
  rentalWeeklyRate?: number | null
  currency?: string
  status?: Vehicle['status']
  description?: string | null
  features?: string[]
  photoUrls?: string[]
  location?: string | null
  isFeatured?: boolean
  sortOrder?: number
  ownershipType?: Vehicle['ownershipType']
  ownerName?: string | null
  ownerContact?: string | null
  ownerIdNumber?: string | null
  commissionPct?: number | null
}

export async function listVehiclesForBusiness(supabase: DbClient, businessId: string) {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toVehicle)
}

// Feeds the public website (WebsiteContent.availableVehicles) — public-safe shape only.
export async function listAvailableVehicles(supabase: DbClient, businessId: string) {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('business_id', businessId)
    .in('status', ['available', 'reserved'])
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toPublicVehicle)
}

export async function searchVehicleInventory(
  supabase: DbClient,
  businessId: string,
  filters: {
    query?: string
    make?: string
    bodyType?: Vehicle['bodyType']
    listingType?: Vehicle['listingType']
    maxPrice?: number
    minYear?: number
  }
) {
  let request = supabase
    .from('vehicles')
    .select('*')
    .eq('business_id', businessId)
    .in('status', ['available', 'reserved'])

  if (filters.query?.trim()) {
    const trimmed = filters.query.trim()
    request = request.or(`make.ilike.%${trimmed}%,model.ilike.%${trimmed}%,trim.ilike.%${trimmed}%`)
  }
  if (filters.make) request = request.ilike('make', filters.make)
  if (filters.bodyType) request = request.eq('body_type', filters.bodyType)
  if (filters.listingType) request = request.in('listing_type', filters.listingType === 'both' ? ['sale', 'rental', 'both'] : [filters.listingType, 'both'])
  if (filters.maxPrice) request = request.lte('sale_price', filters.maxPrice)
  if (filters.minYear) request = request.gte('year', filters.minYear)

  const { data, error } = await request.order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(20)
  if (error) throw error
  return (data ?? []).map(toPublicVehicle)
}

// Used only by the AI agent's get_vehicle_details tool — public-safe shape only.
export async function getVehicleById(supabase: DbClient, businessId: string, vehicleId: string) {
  const { data, error } = await supabase.from('vehicles').select('*').eq('business_id', businessId).eq('id', vehicleId).maybeSingle()
  if (error) throw error
  return data ? toPublicVehicle(data) : null
}

export async function createVehicle(supabase: DbClient, businessId: string, input: VehicleInput) {
  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      business_id: businessId,
      stock_number: input.stockNumber ?? null,
      vin: input.vin ?? null,
      make: input.make,
      model: input.model,
      trim: input.trim ?? null,
      year: input.year,
      body_type: input.bodyType ?? null,
      condition: input.condition ?? 'used',
      mileage: input.mileage ?? null,
      exterior_color: input.exteriorColor ?? null,
      interior_color: input.interiorColor ?? null,
      transmission: input.transmission ?? null,
      fuel_type: input.fuelType ?? null,
      listing_type: input.listingType ?? 'sale',
      sale_price: input.salePrice ?? null,
      rental_daily_rate: input.rentalDailyRate ?? null,
      rental_weekly_rate: input.rentalWeeklyRate ?? null,
      currency: input.currency ?? 'USDC',
      status: input.status ?? 'available',
      description: input.description ?? null,
      features: input.features ?? [],
      photo_urls: input.photoUrls ?? [],
      location: input.location ?? null,
      is_featured: input.isFeatured ?? false,
      sort_order: input.sortOrder ?? 0,
      ownership_type: input.ownershipType ?? 'dealer_owned',
      owner_name: input.ownerName ?? null,
      owner_contact: input.ownerContact ?? null,
      owner_id_number: input.ownerIdNumber ?? null,
      commission_pct: input.commissionPct ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  return toVehicle(data)
}

export async function updateVehicle(supabase: DbClient, businessId: string, vehicleId: string, patch: Partial<Vehicle>) {
  const { data, error } = await supabase
    .from('vehicles')
    .update({
      stock_number: patch.stockNumber,
      vin: patch.vin,
      make: patch.make,
      model: patch.model,
      trim: patch.trim,
      year: patch.year,
      body_type: patch.bodyType,
      condition: patch.condition,
      mileage: patch.mileage,
      exterior_color: patch.exteriorColor,
      interior_color: patch.interiorColor,
      transmission: patch.transmission,
      fuel_type: patch.fuelType,
      listing_type: patch.listingType,
      sale_price: patch.salePrice,
      rental_daily_rate: patch.rentalDailyRate,
      rental_weekly_rate: patch.rentalWeeklyRate,
      currency: patch.currency,
      status: patch.status,
      description: patch.description,
      features: patch.features,
      photo_urls: patch.photoUrls,
      location: patch.location,
      is_featured: patch.isFeatured,
      sort_order: patch.sortOrder,
      ownership_type: patch.ownershipType,
      owner_name: patch.ownerName,
      owner_contact: patch.ownerContact,
      owner_id_number: patch.ownerIdNumber,
      commission_pct: patch.commissionPct,
    })
    .eq('business_id', businessId)
    .eq('id', vehicleId)
    .select('*')
    .single()
  if (error) throw error
  return toVehicle(data)
}

export async function setVehicleStatus(supabase: DbClient, businessId: string, vehicleId: string, status: Vehicle['status']) {
  return updateVehicle(supabase, businessId, vehicleId, { status })
}

export async function deleteVehicle(supabase: DbClient, businessId: string, vehicleId: string) {
  const { error } = await supabase.from('vehicles').delete().eq('business_id', businessId).eq('id', vehicleId)
  if (error) throw error
  return true
}

export async function getInventoryCounts(supabase: DbClient, businessId: string) {
  const { data, error } = await supabase.from('vehicles').select('status').eq('business_id', businessId)
  if (error) throw error
  const rows = data ?? []
  return {
    total: rows.length,
    available: rows.filter((r: any) => r.status === 'available').length,
    reserved: rows.filter((r: any) => r.status === 'reserved').length,
    sold: rows.filter((r: any) => r.status === 'sold').length,
    rented: rows.filter((r: any) => r.status === 'rented').length,
    inService: rows.filter((r: any) => r.status === 'in_service').length,
  }
}
