import type { DbClient } from './_shared'
import type { WhatsappConnection } from '@/types'
import {
  evolutionCreateInstance,
  evolutionDeleteInstance,
  evolutionGetConnectionState,
  evolutionGetQrCode,
  evolutionSendText,
  evolutionSetWebhook,
} from '@/lib/evolutionApi'

export async function getWhatsappConnection(supabase: DbClient, businessId: string): Promise<WhatsappConnection | null> {
  const { data, error } = await supabase.from('whatsapp_connections').select('*').eq('business_id', businessId).maybeSingle()
  if (error) throw error
  return data ?? null
}

function buildInstanceName(businessId: string) {
  return `clara-medical-${businessId}`
}

export async function connectWhatsapp(
  supabase: DbClient,
  businessId: string,
  agentId: string | null,
  appUrl: string
): Promise<{ connection: WhatsappConnection; qrCode: string | null }> {
  const instanceName = buildInstanceName(businessId)
  const { instanceToken } = await evolutionCreateInstance(instanceName)
  if (!instanceToken) throw new Error('Evolution API did not return an instance token')

  const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/whatsapp/webhook/${businessId}`
  await evolutionSetWebhook(instanceName, instanceToken, webhookUrl)
  const qrCode = await evolutionGetQrCode(instanceName, instanceToken)

  const { data, error } = await supabase
    .from('whatsapp_connections')
    .upsert(
      {
        business_id: businessId,
        agent_id: agentId,
        provider: 'evolution',
        instance_name: instanceName,
        instance_token: instanceToken,
        phone_number: null,
        status: 'connecting',
        is_enabled: true,
      },
      { onConflict: 'business_id' }
    )
    .select('*')
    .single()

  if (error) throw error
  return { connection: data, qrCode }
}

export async function refreshWhatsappStatus(supabase: DbClient, connection: WhatsappConnection): Promise<WhatsappConnection> {
  if (!connection.instance_token) return connection

  const state = await evolutionGetConnectionState(connection.instance_name, connection.instance_token)
  const nextStatus = state === 'open' ? 'connected' : state === 'connecting' ? 'connecting' : 'disconnected'
  if (nextStatus === connection.status) return connection

  const { data, error } = await supabase
    .from('whatsapp_connections')
    .update({ status: nextStatus })
    .eq('id', connection.id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateWhatsappConnection(
  supabase: DbClient,
  businessId: string,
  patch: { agentId?: string | null; isEnabled?: boolean }
): Promise<WhatsappConnection> {
  const updatePayload: Record<string, unknown> = {}
  if (patch.agentId !== undefined) updatePayload.agent_id = patch.agentId
  if (patch.isEnabled !== undefined) updatePayload.is_enabled = patch.isEnabled

  const { data, error } = await supabase
    .from('whatsapp_connections')
    .update(updatePayload)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function disconnectWhatsapp(supabase: DbClient, connection: WhatsappConnection): Promise<void> {
  await evolutionDeleteInstance(connection.instance_name)
  const { error } = await supabase.from('whatsapp_connections').delete().eq('id', connection.id)
  if (error) throw error
}

export async function sendWhatsappMessage(connection: WhatsappConnection, toNumber: string, text: string) {
  if (!connection.instance_token) {
    throw new Error('WhatsApp connection has no instance token')
  }

  await evolutionSendText(connection.instance_name, connection.instance_token, toNumber, text)
}
