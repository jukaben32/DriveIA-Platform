import { createAdminClient } from '@/lib/supabase/admin'
import { apiError, json, readJson } from '@/lib/api'
import { portalRecordPaymentSchema } from '@/validations'
import { getPublicBusinessProfile } from '@/services/business'
import { getAppointmentPublic } from '@/services/appointments'
import { recordBillingTransaction } from '@/services/billing'
import { recordAppointmentPayment } from '@/services/appointments'
import { createNotification } from '@/services/notifications'
import type { PublicBusinessProfile } from '@/types'

export async function POST(request: Request) {
  const url = new URL(request.url)
  const businessSlug = url.searchParams.get('businessSlug') || undefined
  const admin = createAdminClient()

  let body: unknown
  try {
    body = await readJson(request)
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  const parsed = portalRecordPaymentSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Invalid payment payload', 422, { issues: parsed.error.flatten() })
  }

  let business: PublicBusinessProfile | null = businessSlug ? await getPublicBusinessProfile(admin, businessSlug) : null
  let appointment: Awaited<ReturnType<typeof getAppointmentPublic>> | null = null

  if (!business && parsed.data.appointmentId) {
    appointment = await getAppointmentPublic(admin, parsed.data.appointmentId)
    business = appointment?.business ?? null
  }

  if (!business) {
    return apiError('Business not found', 404)
  }

  const paymentType = parsed.data.paymentType || (parsed.data.appointmentId ? 'booking_deposit' : 'portal_topup')
  const status = parsed.data.status || 'confirmed'

  const payment = parsed.data.appointmentId
    ? await recordAppointmentPayment(admin, business.id, parsed.data.appointmentId, {
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        chainId: parsed.data.chainId,
        txHash: parsed.data.txHash,
        status,
        paymentType,
        metadata: parsed.data.metadata ?? null,
      })
    : await recordBillingTransaction(admin, business.id, {
        appointmentId: null,
        patientId: parsed.data.patientId ?? null,
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        chainId: parsed.data.chainId,
        txHash: parsed.data.txHash,
        status,
        paymentType,
        metadata: parsed.data.metadata ?? null,
      })

  await createNotification(admin, business.id, {
    category: 'billing',
    title: 'Payment recorded',
    message: `Payment recorded for ${parsed.data.appointmentId ? `appointment ${parsed.data.appointmentId}` : 'portal account'}.`,
    data: {
      appointmentId: parsed.data.appointmentId ?? null,
      patientId: parsed.data.patientId ?? null,
      txHash: parsed.data.txHash,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
    },
  })

  return json({
    business,
    appointment: appointment ?? null,
    payment,
  })
}
