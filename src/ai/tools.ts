import type { AppointmentSource, Business, Customer, KnowledgeDocument, Service } from '@/types'
import { buildAppointmentConfirmationEmail } from '@/lib/email/appointmentConfirmation'
import { buildAppointmentStatusEmail } from '@/lib/email/appointmentStatus'
import { sendEmail } from '@/lib/resend'
import { createAppointment, cancelAppointment, confirmAppointment, getAvailableSlots, recordAppointmentPayment, rescheduleAppointment } from '@/services/appointments'
import { createSupportTicket } from '@/services/support'
import { findOrCreateCustomer, getCustomerByEmail } from '@/services/customers'
import { listActiveServices } from '@/services/services'
import { searchVehicleInventory, getVehicleById } from '@/services/vehicles'
import { listKnowledgeDocuments, searchKnowledgeDocuments } from '@/services/faqs'
import { getBusinessById } from '@/services/business'
import type { DbClient } from '@/services/_shared'

export interface RealtimeToolDefinition {
  type: 'function'
  name: string
  description: string
  parameters: Record<string, unknown>
}

export const dealerRealtimeTools: RealtimeToolDefinition[] = [
  {
    type: 'function',
    name: 'search_vehicle_inventory',
    description: 'Search the dealership vehicle inventory by make, body type, listing type (sale or rental), max price, or minimum year.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free text search across make, model, and trim.' },
        make: { type: 'string' },
        bodyType: { type: 'string', enum: ['sedan', 'suv', 'truck', 'van', 'coupe', 'convertible', 'hatchback', 'wagon', 'other'] },
        listingType: { type: 'string', enum: ['sale', 'rental', 'both'] },
        maxPrice: { type: 'number' },
        minYear: { type: 'integer' },
      },
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'get_vehicle_details',
    description: 'Get full details for a single vehicle by id, including price, mileage, features, and status.',
    parameters: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string' },
      },
      required: ['vehicleId'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'list_services',
    description: 'List active dealership services (financing, trade-ins, protection plans) with durations and pricing.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'get_available_slots',
    description: 'Get available appointment slots for a service (test drive, consultation, delivery, etc).',
    parameters: {
      type: 'object',
      properties: {
        serviceId: { type: 'string' },
        fromDate: { type: 'string' },
        daysAhead: { type: 'integer' },
      },
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'find_or_create_customer',
    description: 'Find an existing customer/lead or create a new customer record.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        interestType: { type: 'string', enum: ['purchase', 'rental', 'lease', 'trade_in', 'service', 'undecided'] },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'create_appointment',
    description: 'Create an appointment (test drive, sales consultation, delivery, trade-in appraisal, or service) after confirming vehicle/service and time.',
    parameters: {
      type: 'object',
      properties: {
        customerId: { type: 'string' },
        customerName: { type: 'string' },
        customerEmail: { type: 'string' },
        customerPhone: { type: 'string' },
        serviceId: { type: 'string' },
        vehicleId: { type: 'string' },
        appointmentType: { type: 'string', enum: ['test_drive', 'sales_consultation', 'service', 'delivery', 'trade_in_appraisal', 'other'] },
        scheduledAt: { type: 'string' },
        notes: { type: 'string' },
        source: { type: 'string' },
      },
      required: ['scheduledAt'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'confirm_appointment',
    description: 'Mark an appointment as confirmed.',
    parameters: {
      type: 'object',
      properties: {
        appointmentId: { type: 'string' },
      },
      required: ['appointmentId'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'reschedule_appointment',
    description: 'Reschedule an appointment to a new time.',
    parameters: {
      type: 'object',
      properties: {
        appointmentId: { type: 'string' },
        scheduledAt: { type: 'string' },
      },
      required: ['appointmentId', 'scheduledAt'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'cancel_appointment',
    description: 'Cancel an appointment and store the reason.',
    parameters: {
      type: 'object',
      properties: {
        appointmentId: { type: 'string' },
        reason: { type: 'string' },
      },
      required: ['appointmentId'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'search_faqs',
    description: 'Search the dealership knowledge base for an answer (financing, warranties, rentals, trade-ins, delivery).',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'create_support_ticket',
    description: 'Open a support ticket for a customer or staff follow-up.',
    parameters: {
      type: 'object',
      properties: {
        customerId: { type: 'string' },
        appointmentId: { type: 'string' },
        subject: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['subject'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'record_payment',
    description: 'Record a billing transaction (deposit, rental payment) and link it to an appointment if needed.',
    parameters: {
      type: 'object',
      properties: {
        appointmentId: { type: 'string' },
        customerId: { type: 'string' },
        amount: { type: 'number' },
        currency: { type: 'string' },
        chainId: { type: 'integer' },
        txHash: { type: 'string' },
        paymentType: { type: 'string' },
      },
      required: ['amount', 'currency', 'chainId', 'txHash'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'send_appointment_email',
    description: 'Send a booking confirmation or appointment status email to the customer.',
    parameters: {
      type: 'object',
      properties: {
        appointmentId: { type: 'string' },
        type: { type: 'string', enum: ['confirmation', 'status_update'] },
        subject: { type: 'string' },
        reason: { type: 'string' },
      },
      required: ['appointmentId', 'type'],
      additionalProperties: false,
    },
  },
]

export function buildDealerAssistantInstructions(opts: {
  business: Business
  services: Service[]
  faqs: KnowledgeDocument[]
  timezone?: string | null
}) {
  const serviceList = opts.services
    .map((service) => `- ${service.name} (${service.durationMinutes} min${service.price != null ? `, ${service.currency} ${service.price}` : ''})`)
    .join('\n')

  const faqList = opts.faqs
    .slice(0, 8)
    .map((faq) => `- ${faq.question || faq.title}: ${faq.answer || ''}`)
    .join('\n')

  return [
    `You are DriveIA, the AI mobility concierge for ${opts.business.name}.`,
    `Be warm, concise, and practical. Do not provide legal, safety, or mechanical advice beyond the knowledge base.`,
    `Your job is to help customers search live inventory, compare vehicles, book test drives, reserve rentals, request trade-in valuations, and understand financing, service, and protection options. Use search_vehicle_inventory and get_vehicle_details before recommending a specific vehicle — never invent inventory that has not been returned by those tools.`,
    `Always ask for the minimum required customer details and confirm date and time in the business timezone.`,
    `Business timezone: ${opts.timezone || opts.business.timezone || 'America/New_York'}.`,
    `Available services:\n${serviceList || '- No active services configured yet.'}`,
    `FAQs:\n${faqList || '- No FAQs configured yet.'}`,
    `If a request is unsafe, highly time-sensitive, or requires a human decision, advise the customer to contact the dealership or rental team immediately.`,
    `If a human handoff is needed, summarize the request clearly and mark the conversation as escalated.`,
  ].join('\n\n')
}

export function buildRealtimeSessionPayload(opts: {
  instructions: string
  voice?: string
  language?: string
}) {
  return {
    model: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime',
    voice: opts.voice || 'alloy',
    instructions: opts.instructions,
    input_audio_format: 'pcm16',
    output_audio_format: 'pcm16',
    turn_detection: {
      type: 'server_vad',
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500,
    },
    temperature: 0.4,
    modalities: ['text', 'audio'],
    language: opts.language || 'en',
    tools: dealerRealtimeTools,
  }
}

async function sendAppointmentEmailForTool(supabase: DbClient, appointmentId: string, type: 'confirmation' | 'status_update', reason?: string | null) {
  const { data: appointmentRow, error: appointmentError } = await supabase
    .from('appointments')
    .select('*, customers(*), services(*), vehicles(*), businesses(name, slug, booking_email)')
    .eq('id', appointmentId)
    .maybeSingle()
  if (appointmentError) throw appointmentError
  if (!appointmentRow) throw new Error('Appointment not found')

  const appointment: any = appointmentRow
  const customerEmail = appointment.customers?.email
  if (!customerEmail) throw new Error('Customer email not found')

  const businessName = appointment.businesses?.name || 'DriveIA'
  const vehicleLabel = appointment.vehicles ? `${appointment.vehicles.year} ${appointment.vehicles.make} ${appointment.vehicles.model}` : null
  const serviceName = appointment.services?.name || vehicleLabel || 'Appointment'
  const scheduledAt = new Date(appointment.scheduled_at).toLocaleString('en-US')
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/portal`

  const html =
    type === 'confirmation'
      ? buildAppointmentConfirmationEmail({
          customerName: appointment.customers?.name || 'Customer',
          businessName,
          serviceName,
          scheduledAt,
          portalUrl,
        })
      : buildAppointmentStatusEmail({
          customerName: appointment.customers?.name || 'Customer',
          businessName,
          serviceName,
          scheduledAt,
          status: appointment.status,
          reason,
        })

  const subject =
    type === 'confirmation'
      ? `Appointment confirmed - ${businessName}`
      : `Appointment update - ${businessName}`

  return sendEmail({
    to: customerEmail,
    subject,
    html,
  })
}

export async function executeRealtimeToolCall(
  supabase: DbClient,
  businessId: string,
  toolName: string,
  args: Record<string, unknown> = {},
  opts: { customerSource?: Customer['source']; appointmentSource?: AppointmentSource } = {}
) {
  switch (toolName) {
    case 'search_vehicle_inventory': {
      return {
        vehicles: await searchVehicleInventory(supabase, businessId, {
          query: typeof args.query === 'string' ? args.query : undefined,
          make: typeof args.make === 'string' ? args.make : undefined,
          bodyType: typeof args.bodyType === 'string' ? (args.bodyType as any) : undefined,
          listingType: typeof args.listingType === 'string' ? (args.listingType as any) : undefined,
          maxPrice: typeof args.maxPrice === 'number' ? args.maxPrice : undefined,
          minYear: typeof args.minYear === 'number' ? args.minYear : undefined,
        }),
      }
    }
    case 'get_vehicle_details': {
      return { vehicle: await getVehicleById(supabase, businessId, String(args.vehicleId)) }
    }
    case 'list_services': {
      return { services: await listActiveServices(supabase, businessId) }
    }
    case 'get_available_slots': {
      return {
        slots: await getAvailableSlots(supabase, businessId, {
          serviceId: typeof args.serviceId === 'string' ? args.serviceId : null,
          fromDate: typeof args.fromDate === 'string' ? new Date(args.fromDate) : undefined,
          daysAhead: typeof args.daysAhead === 'number' ? args.daysAhead : undefined,
        }),
      }
    }
    case 'find_or_create_customer': {
      const customer = await findOrCreateCustomer(supabase, businessId, {
        name: String(args.name || 'Unknown'),
        email: typeof args.email === 'string' ? args.email : null,
        phone: typeof args.phone === 'string' ? args.phone : null,
        source: opts.customerSource ?? 'ai_call',
        interestType: typeof args.interestType === 'string' ? (args.interestType as any) : undefined,
      })
      return { customer }
    }
    case 'create_appointment': {
      const customer =
        typeof args.customerId === 'string'
          ? null
          : await findOrCreateCustomer(supabase, businessId, {
              name: String(args.customerName || 'Unknown'),
              email: typeof args.customerEmail === 'string' ? args.customerEmail : null,
              phone: typeof args.customerPhone === 'string' ? args.customerPhone : null,
              source: opts.customerSource ?? 'ai_call',
            })

      const appointment = await createAppointment(supabase, businessId, {
        customerId: typeof args.customerId === 'string' ? args.customerId : customer?.id ?? null,
        agentId: typeof args.agentId === 'string' ? args.agentId : null,
        serviceId: typeof args.serviceId === 'string' ? args.serviceId : null,
        vehicleId: typeof args.vehicleId === 'string' ? args.vehicleId : null,
        appointmentType: typeof args.appointmentType === 'string' ? (args.appointmentType as any) : 'test_drive',
        scheduledAt: String(args.scheduledAt),
        source: (opts.appointmentSource ?? (typeof args.source === 'string' ? args.source : 'ai_call')) as AppointmentSource,
        notes: typeof args.notes === 'string' ? args.notes : null,
      })
      if ((customer?.email || typeof args.customerEmail === 'string') && appointment.id) {
        await sendAppointmentEmailForTool(supabase, appointment.id, 'confirmation')
      }
      return { appointment, customer }
    }
    case 'confirm_appointment': {
      const appointment = await confirmAppointment(supabase, businessId, String(args.appointmentId))
      return { appointment }
    }
    case 'reschedule_appointment': {
      const appointment = await rescheduleAppointment(supabase, businessId, String(args.appointmentId), String(args.scheduledAt))
      return { appointment }
    }
    case 'cancel_appointment': {
      const appointment = await cancelAppointment(supabase, businessId, String(args.appointmentId), typeof args.reason === 'string' ? args.reason : null)
      await sendAppointmentEmailForTool(supabase, appointment.id, 'status_update', typeof args.reason === 'string' ? args.reason : null)
      return { appointment }
    }
    case 'search_faqs': {
      const query = String(args.query || '')
      return { faqs: await searchKnowledgeDocuments(supabase, businessId, query) }
    }
    case 'create_support_ticket': {
      const ticket = await createSupportTicket(supabase, businessId, {
        customerId: typeof args.customerId === 'string' ? args.customerId : null,
        appointmentId: typeof args.appointmentId === 'string' ? args.appointmentId : null,
        subject: String(args.subject || 'Support request'),
        description: typeof args.description === 'string' ? args.description : null,
      })
      return { ticket }
    }
    case 'record_payment': {
      return {
        payment: await recordAppointmentPayment(supabase, businessId, String(args.appointmentId || ''), {
          amount: Number(args.amount),
          currency: String(args.currency || 'USDC'),
          chainId: Number(args.chainId || 137),
          txHash: String(args.txHash || ''),
          paymentType: typeof args.paymentType === 'string' ? (args.paymentType as any) : 'booking_deposit',
        }),
      }
    }
    case 'send_appointment_email': {
      const type = args.type === 'status_update' ? 'status_update' : 'confirmation'
      return { sent: await sendAppointmentEmailForTool(supabase, String(args.appointmentId), type, typeof args.reason === 'string' ? args.reason : null) }
    }
    default:
      throw new Error(`Unsupported realtime tool: ${toolName}`)
  }
}

export async function buildDealerRealtimeContext(supabase: DbClient, businessId: string) {
  const [business, services, faqs] = await Promise.all([
    getBusinessById(supabase, businessId),
    listActiveServices(supabase, businessId),
    listKnowledgeDocuments(supabase, businessId, true),
  ])

  if (!business) throw new Error('Business not found')

  return {
    business,
    services,
    faqs,
    instructions: buildDealerAssistantInstructions({ business, services, faqs }),
  }
}
