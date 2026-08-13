import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBusinessForUser } from '@/services/business'
import { listVehiclesForBusiness } from '@/services/vehicles'
import { InventoryManager } from '@/components/dealer/InventoryManager'

export default async function InventoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const business = await getBusinessForUser(supabase, user.id)
  if (!business) redirect('/signup')

  const vehicles = await listVehiclesForBusiness(supabase, business.id)

  return <InventoryManager initialVehicles={vehicles} businessId={business.id} />
}
