import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBusinessForUser } from '@/services/business'
import { listConversationsForBusiness } from '@/services/conversations'
import { listCustomersForBusiness } from '@/services/customers'
import { ConversationsManager } from '@/components/dealer/ConversationsManager'

export default async function ConversationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const business = await getBusinessForUser(supabase, user.id)
  if (!business) redirect('/signup')

  const [conversations, customers] = await Promise.all([
    listConversationsForBusiness(supabase, business.id, 50),
    listCustomersForBusiness(supabase, business.id),
  ])

  return (
    <ConversationsManager
      initialConversations={conversations}
      customers={customers}
      timezone={business.timezone}
      businessName={business.name}
    />
  )
}
