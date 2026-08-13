import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiError, json, readJson } from '@/lib/api'
import { resolveRealtimeDealerContext } from '@/lib/realtime'
import { dealerRealtimeTools } from '@/ai/tools'
import { findOrCreateCustomer } from '@/services/customers'
import { createConversation, linkConversationToAppointment } from '@/services/conversations'
import { realtimeSessionSchema } from '@/validations'

const connectSchema = realtimeSessionSchema.extend({
  customerName: z.string().max(120).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().max(40).optional(),
  appointmentId: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await readJson(request)
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  const parsed = connectSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Invalid realtime connect payload', 422, { issues: parsed.error.flatten() })
  }

  const admin = createAdminClient()

  try {
    const context = await resolveRealtimeDealerContext(admin, {
      businessSlug: parsed.data.businessSlug,
      widgetSlug: parsed.data.widgetSlug ?? null,
      language: parsed.data.language ?? 'en',
    })

    const hasCustomerDetails = Boolean(parsed.data.customerName || parsed.data.customerEmail || parsed.data.customerPhone)
    let customer = null
    let conversation = null

    if (hasCustomerDetails || parsed.data.appointmentId) {
      customer = await findOrCreateCustomer(admin, context.business.id, {
        name: parsed.data.customerName || 'Unknown customer',
        email: parsed.data.customerEmail ?? null,
        phone: parsed.data.customerPhone ?? null,
        source: 'widget_chat',
      })

      conversation = await createConversation(admin, context.business.id, {
        customerId: customer.id,
        appointmentId: parsed.data.appointmentId ?? null,
        channel: parsed.data.mode === 'chat' ? 'widget_chat' : 'widget_voice',
        status: 'in_progress',
      })

      if (parsed.data.appointmentId) {
        conversation = await linkConversationToAppointment(admin, context.business.id, conversation.id, parsed.data.appointmentId)
      }
    }

    return json({
      business: context.business,
      widget: context.widget,
      instructions: context.context.instructions,
      session: context.session,
      tools: dealerRealtimeTools,
      customer,
      conversation,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to connect realtime session'
    return apiError(message, 404)
  }
}
