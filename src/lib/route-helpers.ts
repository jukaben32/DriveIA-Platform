import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getBusinessForUser } from '@/services/business'
import type { BusinessMemberRole } from '@/types'

export async function getServerSupabaseAndUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return { supabase, user }
}

export function getAdminSupabase() {
  return createAdminClient()
}

export async function getBusinessForCurrentUser(supabase: Awaited<ReturnType<typeof createServerClient>>, userId: string) {
  return getBusinessForUser(supabase, userId)
}

export async function getBusinessMembershipRole(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  businessId: string,
  userId: string
): Promise<BusinessMemberRole | null> {
  const result: any = await supabase
    .from('business_members')
    .select('role')
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .maybeSingle()
  const { data, error } = result

  if (error) {
    throw error
  }

  return (data?.role as BusinessMemberRole | undefined) ?? null
}

export function canManageBusiness(role: BusinessMemberRole | null) {
  return role === 'owner' || role === 'admin'
}
