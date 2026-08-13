import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBusinessForUser } from '@/services/business'
import { listBillingTransactions } from '@/services/billing'
import { listCustomersForBusiness } from '@/services/customers'
import { listAppointmentsForBusiness } from '@/services/appointments'
import { CustomersManager } from '@/components/dealer/CustomersManager'

export default async function CustomersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const business = await getBusinessForUser(supabase, user.id)
  if (!business) redirect('/signup')

  const [customers, appointments, billingTransactions] = await Promise.all([
    listCustomersForBusiness(supabase, business.id),
    listAppointmentsForBusiness(supabase, business.id, { limit: 200 }),
    listBillingTransactions(supabase, business.id, 500),
  ])

  return (
    <CustomersManager
      initialCustomers={customers}
      appointments={appointments}
      billingTransactions={billingTransactions}
      timezone={business.timezone}
      businessName={business.name}
      paymentCurrency={business.paymentCurrency}
    />
  )
}
