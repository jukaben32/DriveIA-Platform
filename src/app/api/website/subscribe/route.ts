import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiError, json, readJson } from '@/lib/api'
import { websiteSubscriberSchema } from '@/validations'
import { getPublicBusinessProfile } from '@/services/business'
import { getWebsiteBySlug, createWebsiteSubscriber } from '@/services/websites'
import type { PublicBusinessProfile } from '@/types'

const subscribeSchema = websiteSubscriberSchema.extend({
  businessSlug: z.string().optional(),
  websiteSlug: z.string().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await readJson(request)
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    return apiError('Invalid subscriber payload', 422, { issues: parsed.error.flatten() })
  }

  const admin = createAdminClient()

  let business: PublicBusinessProfile | null = null
  if (parsed.data.businessSlug) {
    business = await getPublicBusinessProfile(admin, parsed.data.businessSlug)
  } else if (parsed.data.websiteSlug) {
    const website = await getWebsiteBySlug(admin, parsed.data.websiteSlug)
    if (website) {
      business = await getPublicBusinessProfile(admin, website.businessId)
    }
  }

  if (!business) {
    return apiError('Business not found', 404)
  }

  const subscriber = await createWebsiteSubscriber(admin, business.id, {
    email: parsed.data.email,
    name: parsed.data.name ?? null,
    source: parsed.data.source || 'website',
  })

  return json({ subscriber }, { status: 201 })
}
