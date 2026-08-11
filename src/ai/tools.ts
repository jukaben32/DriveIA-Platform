import type { AppointmentSource, Business, ClinicService, KnowledgeDocument, Patient } from '@/types'
import { buildAppointmentConfirmationEmail } from '@/lib/email/appointmentConfirmation'
import { buildAppointmentStatusEmail } from '@/lib/email/appointmentStatus'
import { sendEmail } from '@/lib/resend'
import { createAppointment, cancelAppointment, confirmAppointment, getAvailableSlots, recordAppointmentPayment, rescheduleAppointment } from '@/services/appointments'
import { createNotification } from '@/services/notifications'
import { createSupportTicket } from '@/services/support'
import { findOrCreatePatient, getPatientByEmail, searchPatients } from '@/services/patients'
import { listActiveClinicServices } from '@/services/services'
import { listKnowledgeDocuments, searchKnowledgeDocuments } from '@/services/faqs'
import { getBusinessById } from '@/services/business'
import type { DbClient } from '@/services/_shared'

export interface RealtimeToolDefinition {
  type: 'function'
  name: string
  description: string
  parameters: Record<string, unknown>
}

export const clinicRealtimeTools: RealtimeToolDefinition[] = [
  {
    type: 'function',
    name: 'list_clinic_services',
    description: 'List active clinic services with durations and pricing.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'get_available_slots',
    description: 'Get available appointment slots for a service.',
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
    name: 'find_or_create_patient',
    description: 'Find an existing patient or create a new patient record.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'create_appointment',
    description: 'Create a clinic appointment after confirming service and time.',
    parameters: {
      type: 'object',
      properties: {
        patientId: { type: 'string' },
        patientName: { type: 'string' },
        patientEmail: { type: 'string' },
        patientPhone: { type: 'string' },
        serviceId: { type: 'string' },
        scheduledAt: { type: 'string' },
        notes: { type: 'string' },
        source: { type: 'string' },
      },
      required: ['serviceId', 'scheduledAt'],
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
    description: 'Search the clinic knowledge base for an answer.',
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
    description: 'Open a support ticket for a patient or staff follow-up.',
    parameters: {
      type: 'object',
      properties: {
        patientId: { type: 'string' },
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
    description: 'Record a billing transaction and link it to an appointment if needed.',
    parameters: {
      type: 'object',
      properties: {
        appointmentId: { type: 'string' },
        patientId: { type: 'string' },
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
    description: 'Send a booking confirmation or appointment status email to the patient.',
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

export function buildClinicAssistantInstructions(opts: {
  business: Business
  services: ClinicService[]
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
    `You are Clara, the AI medical receptionist for ${opts.business.name}.`,
    `Be warm, concise, and calm. Do not diagnose or provide emergency medical advice.`,
    `Your job is to help patients book, reschedule, cancel, and understand clinic services.`,
    `Always ask for the minimum required patient details and confirm date and time in the clinic timezone.`,
    `Clinic timezone: ${opts.timezone || opts.business.timezone || 'America/New_York'}.`,
    `Clinic services:\n${serviceList || '- No active services configured yet.'}`,
    `FAQs:\n${faqList || '- No FAQs configured yet.'}`,
    `If symptoms sound urgent, advise the caller to seek emergency care or contact local emergency services immediately.`,
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
    tools: clinicRealtimeTools,
  }
}

async function sendAppointmentEmailForTool(supabase: DbClient, appointmentId: string, type: 'confirmation' | 'status_update', reason?: string | null) {
  const { data: appointmentRow, error: appointmentError } = await supabase
    .from('appointments')
    .select('*, patients(*), clinic_services(*), businesses(name, slug, booking_email)')
    .eq('id', appointmentId)
    .maybeSingle()
  if (appointmentError) throw appointmentError
  if (!appointmentRow) throw new Error('Appointment not found')

  const appointment: any = appointmentRow
  const patientEmail = appointment.patients?.email
  if (!patientEmail) throw new Error('Patient email not found')

  const businessName = appointment.businesses?.name || 'Clinic'
  const serviceName = appointment.clinic_services?.name || 'Appointment'
  const scheduledAt = new Date(appointment.scheduled_at).toLocaleString('en-US')
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/portal`

  const html =
    type === 'confirmation'
      ? buildAppointmentConfirmationEmail({
          patientName: appointment.patients?.name || 'Patient',
          businessName,
          serviceName,
          scheduledAt,
          portalUrl,
        })
      : buildAppointmentStatusEmail({
          patientName: appointment.patients?.name || 'Patient',
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
    to: patientEmail,
    subject,
    html,
  })
}

export async function executeRealtimeToolCall(
  supabase: DbClient,
  businessId: string,
  toolName: string,
  args: Record<string, unknown> = {},
  opts: { patientSource?: Patient['source']; appointmentSource?: AppointmentSource } = {}
) {
  switch (toolName) {
    case 'list_clinic_services': {
      return { services: await listActiveClinicServices(supabase, businessId) }
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
    case 'find_or_create_patient': {
      const patient = await findOrCreatePatient(supabase, businessId, {
        name: String(args.name || 'Unknown'),
        email: typeof args.email === 'string' ? args.email : null,
        phone: typeof args.phone === 'string' ? args.phone : null,
        source: opts.patientSource ?? 'ai_call',
      })
      return { patient }
    }
    case 'create_appointment': {
      const patient =
        typeof args.patientId === 'string'
          ? null
          : await findOrCreatePatient(supabase, businessId, {
              name: String(args.patientName || 'Unknown'),
              email: typeof args.patientEmail === 'string' ? args.patientEmail : null,
              phone: typeof args.patientPhone === 'string' ? args.patientPhone : null,
              source: opts.patientSource ?? 'ai_call',
            })

      const appointment = await createAppointment(supabase, businessId, {
        patientId: typeof args.patientId === 'string' ? args.patientId : patient?.id ?? null,
        agentId: typeof args.agentId === 'string' ? args.agentId : null,
        serviceId: typeof args.serviceId === 'string' ? args.serviceId : null,
        scheduledAt: String(args.scheduledAt),
        source: (opts.appointmentSource ?? (typeof args.source === 'string' ? args.source : 'ai_call')) as AppointmentSource,
        notes: typeof args.notes === 'string' ? args.notes : null,
      })
      if ((patient?.email || typeof args.patientEmail === 'string') && appointment.id) {
        await sendAppointmentEmailForTool(supabase, appointment.id, 'confirmation')
      }
      return { appointment, patient }
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
        patientId: typeof args.patientId === 'string' ? args.patientId : null,
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

export async function buildClinicRealtimeContext(supabase: DbClient, businessId: string) {
  const [business, services, faqs] = await Promise.all([
    getBusinessById(supabase, businessId),
    listActiveClinicServices(supabase, businessId),
    listKnowledgeDocuments(supabase, businessId, true),
  ])

  if (!business) throw new Error('Business not found')

  return {
    business,
    services,
    faqs,
    instructions: buildClinicAssistantInstructions({ business, services, faqs }),
  }
}
