import type {
  Business,
  Website,
  WebsiteContent,
  WebsiteFaq,
  WebsiteHighlight,
  WebsiteService,
  WebsiteTeamMember,
  WebsiteTestimonial,
  WebsiteVehicleHighlight,
} from '@/types'
import { slugify } from '@/lib/utils'
import type { DbClient } from './_shared'
import type { SaveWebsiteContentInput, WebsiteInput } from '@/validations'

function toWebsite(row: any): Website {
  return {
    id: row.id,
    businessId: row.business_id,
    agentId: row.agent_id ?? null,
    slug: row.slug,
    template: row.template,
    published: row.published,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    font: row.font,
    siteTitle: row.site_title,
    siteDescription: row.site_description,
    heroHeadline: row.hero_headline ?? null,
    heroSubheadline: row.hero_subheadline ?? null,
    heroImageUrl: row.hero_image_url ?? null,
    ctaPrimaryText: row.cta_primary_text,
    ctaSecondaryText: row.cta_secondary_text,
    aboutTitle: row.about_title,
    aboutStory: row.about_story ?? null,
    aboutPhotoUrl: row.about_photo_url ?? null,
    footerTagline: row.footer_tagline ?? null,
    footerCopyright: row.footer_copyright ?? null,
    contactPhone: row.contact_phone ?? null,
    contactEmail: row.contact_email ?? null,
    contactAddress: row.contact_address ?? null,
    contactHours: row.contact_hours ?? null,
    contactMapsUrl: row.contact_maps_url ?? null,
    yearsExperience: row.years_experience ?? null,
    customersServed: row.customers_served ?? null,
    satisfactionPct: row.satisfaction_pct ?? null,
    trustBadges: row.trust_badges ?? [],
    featuredServiceIds: row.featured_service_ids ?? [],
    featuredVehicleIds: row.featured_vehicle_ids ?? [],
    socialYoutube: row.social_youtube ?? null,
    socialFacebook: row.social_facebook ?? null,
    socialInstagram: row.social_instagram ?? null,
    socialTiktok: row.social_tiktok ?? null,
    socialLinkedin: row.social_linkedin ?? null,
    socialPinterest: row.social_pinterest ?? null,
    socialTwitter: row.social_twitter ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toService(row: any): WebsiteService {
  return {
    id: row.id,
    businessId: row.business_id,
    icon: row.icon,
    name: row.name,
    description: row.description ?? null,
    duration: row.duration ?? null,
    price: row.price ?? null,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toTeamMember(row: any): WebsiteTeamMember {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    role: row.role,
    bio: row.bio ?? null,
    photoUrl: row.photo_url ?? null,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toTestimonial(row: any): WebsiteTestimonial {
  return {
    id: row.id,
    businessId: row.business_id,
    quote: row.quote,
    authorName: row.author_name,
    authorRole: row.author_role ?? null,
    rating: row.rating,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toHighlight(row: any): WebsiteHighlight {
  return {
    id: row.id,
    businessId: row.business_id,
    label: row.label,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  }
}

function toFaq(row: any): WebsiteFaq {
  return {
    id: row.id,
    businessId: row.business_id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  }
}

function toVehicleHighlight(row: any): WebsiteVehicleHighlight {
  return {
    id: row.id,
    businessId: row.business_id,
    vehicleId: row.vehicle_id,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    vehicle: row.vehicles
      ? {
          id: row.vehicles.id,
          businessId: row.vehicles.business_id,
          stockNumber: row.vehicles.stock_number ?? null,
          vin: row.vehicles.vin ?? null,
          make: row.vehicles.make,
          model: row.vehicles.model,
          trim: row.vehicles.trim ?? null,
          year: row.vehicles.year,
          bodyType: row.vehicles.body_type ?? null,
          condition: row.vehicles.condition,
          mileage: row.vehicles.mileage ?? null,
          exteriorColor: row.vehicles.exterior_color ?? null,
          interiorColor: row.vehicles.interior_color ?? null,
          transmission: row.vehicles.transmission ?? null,
          fuelType: row.vehicles.fuel_type ?? null,
          listingType: row.vehicles.listing_type,
          salePrice: row.vehicles.sale_price ?? null,
          rentalDailyRate: row.vehicles.rental_daily_rate ?? null,
          rentalWeeklyRate: row.vehicles.rental_weekly_rate ?? null,
          currency: row.vehicles.currency,
          status: row.vehicles.status,
          description: row.vehicles.description ?? null,
          features: row.vehicles.features ?? [],
          photoUrls: row.vehicles.photo_urls ?? [],
          location: row.vehicles.location ?? null,
          isFeatured: row.vehicles.is_featured ?? false,
          sortOrder: row.vehicles.sort_order ?? 0,
          createdAt: row.vehicles.created_at,
          updatedAt: row.vehicles.updated_at,
        }
      : null,
  }
}

function currentOrFallbackSlug(input: WebsiteInput, current?: Website | null) {
  return slugify(input.slug || current?.slug || input.siteTitle)
}

function buildWebsiteRow(input: WebsiteInput, businessId: string, current?: Website | null) {
  return {
    business_id: businessId,
    agent_id: input.agentId ?? current?.agentId ?? null,
    slug: currentOrFallbackSlug(input, current),
    template: input.template ?? current?.template ?? 'serenity',
    published: input.published ?? current?.published ?? false,
    primary_color: input.primaryColor ?? current?.primaryColor ?? '#0f766e',
    secondary_color: input.secondaryColor ?? current?.secondaryColor ?? '#0ea5e9',
    font: input.font ?? current?.font ?? 'Inter',
    site_title: input.siteTitle,
    site_description: input.siteDescription,
    hero_headline: input.heroHeadline ?? current?.heroHeadline ?? null,
    hero_subheadline: input.heroSubheadline ?? current?.heroSubheadline ?? null,
    hero_image_url: input.heroImageUrl ?? current?.heroImageUrl ?? null,
    cta_primary_text: input.ctaPrimaryText ?? current?.ctaPrimaryText ?? 'Schedule Test Drive',
    cta_secondary_text: input.ctaSecondaryText ?? current?.ctaSecondaryText ?? 'View Inventory',
    about_title: input.aboutTitle ?? current?.aboutTitle ?? 'About Us',
    about_story: input.aboutStory ?? current?.aboutStory ?? null,
    about_photo_url: input.aboutPhotoUrl ?? current?.aboutPhotoUrl ?? null,
    footer_tagline: input.footerTagline ?? current?.footerTagline ?? null,
    footer_copyright: input.footerCopyright ?? current?.footerCopyright ?? null,
    contact_phone: input.contactPhone ?? current?.contactPhone ?? null,
    contact_email: input.contactEmail ?? current?.contactEmail ?? null,
    contact_address: input.contactAddress ?? current?.contactAddress ?? null,
    contact_hours: input.contactHours ?? current?.contactHours ?? null,
    contact_maps_url: input.contactMapsUrl ?? current?.contactMapsUrl ?? null,
    years_experience: input.yearsExperience ?? current?.yearsExperience ?? null,
    customers_served: input.customersServed ?? current?.customersServed ?? null,
    satisfaction_pct: input.satisfactionPct ?? current?.satisfactionPct ?? null,
    trust_badges: input.trustBadges ?? current?.trustBadges ?? [],
    featured_service_ids: input.featuredServiceIds ?? current?.featuredServiceIds ?? [],
    featured_vehicle_ids: input.featuredVehicleIds ?? current?.featuredVehicleIds ?? [],
    social_youtube: input.socialYoutube ?? current?.socialYoutube ?? null,
    social_facebook: input.socialFacebook ?? current?.socialFacebook ?? null,
    social_instagram: input.socialInstagram ?? current?.socialInstagram ?? null,
    social_tiktok: input.socialTiktok ?? current?.socialTiktok ?? null,
    social_linkedin: input.socialLinkedin ?? current?.socialLinkedin ?? null,
    social_pinterest: input.socialPinterest ?? current?.socialPinterest ?? null,
    social_twitter: input.socialTwitter ?? current?.socialTwitter ?? null,
  }
}

async function getWebsiteRowByBusinessId(supabase: DbClient, businessId: string) {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false })
    .limit(1)
  if (error) throw error
  return data?.[0] ? toWebsite(data[0]) : null
}

async function getWebsiteRowBySlug(supabase: DbClient, slug: string) {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('slug', slug)
    .order('updated_at', { ascending: false })
    .limit(1)
  if (error) throw error
  return data?.[0] ? toWebsite(data[0]) : null
}

async function getWebsiteRowById(supabase: DbClient, businessId: string, websiteId: string) {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', websiteId)
    .maybeSingle()
  if (error) throw error
  return data ? toWebsite(data) : null
}

export async function getWebsiteByBusinessId(supabase: DbClient, businessId: string) {
  return getWebsiteRowByBusinessId(supabase, businessId)
}

export async function getWebsiteBySlug(supabase: DbClient, slug: string) {
  return getWebsiteRowBySlug(supabase, slug)
}

export async function checkWebsiteSlugAvailability(supabase: DbClient, slug: string) {
  const { count, error } = await supabase.from('websites').select('id', { count: 'exact', head: true }).eq('slug', slug)
  if (error) throw error
  return (count ?? 0) === 0
}

export async function getOrCreateWebsiteForBusiness(
  supabase: DbClient,
  business: Pick<Business, 'id' | 'slug' | 'name' | 'description' | 'phone' | 'contactEmail' | 'address'>
) {
  const existing = await getWebsiteRowByBusinessId(supabase, business.id)
  if (existing) return existing

  const { data, error } = await supabase
    .from('websites')
    .insert({
      business_id: business.id,
      slug: slugify(business.slug),
      template: 'serenity',
      published: false,
      primary_color: '#0f766e',
      secondary_color: '#0ea5e9',
      font: 'Inter',
      site_title: business.name,
      site_description: business.description || `Website for ${business.name}.`,
      hero_headline: business.name,
      hero_subheadline: business.description || 'Browse inventory and schedule a test drive in minutes.',
      cta_primary_text: 'Schedule Test Drive',
      cta_secondary_text: 'View Inventory',
      about_title: 'About the dealership',
      about_story: business.description ?? null,
      footer_tagline: 'Powered by DriveIA',
      footer_copyright: `Copyright ${new Date().getFullYear()} ${business.name}`,
      contact_phone: business.phone ?? null,
      contact_email: business.contactEmail ?? null,
      contact_address: business.address ?? null,
      contact_hours: 'Mon - Sat, 9:00 AM - 6:00 PM',
      trust_badges: [],
      featured_service_ids: [],
      featured_vehicle_ids: [],
    })
    .select('*')
    .single()

  if (error) throw error
  return toWebsite(data)
}

export async function createOrUpdateWebsite(
  supabase: DbClient,
  businessId: string,
  input: {
    slug?: string
    agentId?: string | null
    template?: Website['template']
    published?: boolean
    primaryColor?: string
    secondaryColor?: string
    font?: string
    siteTitle: string
    siteDescription: string
    heroHeadline?: string | null
    heroSubheadline?: string | null
    heroImageUrl?: string | null
    ctaPrimaryText?: string
    ctaSecondaryText?: string
    aboutTitle?: string
    aboutStory?: string | null
    aboutPhotoUrl?: string | null
    footerTagline?: string | null
    footerCopyright?: string | null
    contactPhone?: string | null
    contactEmail?: string | null
    contactAddress?: string | null
    contactHours?: string | null
    contactMapsUrl?: string | null
    yearsExperience?: number | null
    customersServed?: number | null
    satisfactionPct?: number | null
    trustBadges?: string[]
    featuredServiceIds?: string[]
    featuredVehicleIds?: string[]
    socialYoutube?: string | null
    socialFacebook?: string | null
    socialInstagram?: string | null
    socialTiktok?: string | null
    socialLinkedin?: string | null
    socialPinterest?: string | null
    socialTwitter?: string | null
  }
) {
  const current = await getWebsiteRowByBusinessId(supabase, businessId)
  const nextSlug = currentOrFallbackSlug(
    {
      slug: input.slug,
      agentId: input.agentId ?? current?.agentId ?? null,
      template: input.template ?? current?.template ?? 'serenity',
      published: input.published ?? current?.published ?? false,
      primaryColor: input.primaryColor ?? current?.primaryColor ?? '#0f766e',
      secondaryColor: input.secondaryColor ?? current?.secondaryColor ?? '#0ea5e9',
      font: input.font ?? current?.font ?? 'Inter',
      siteTitle: input.siteTitle,
      siteDescription: input.siteDescription,
      heroHeadline: input.heroHeadline ?? current?.heroHeadline ?? null,
      heroSubheadline: input.heroSubheadline ?? current?.heroSubheadline ?? null,
      heroImageUrl: input.heroImageUrl ?? current?.heroImageUrl ?? null,
      ctaPrimaryText: input.ctaPrimaryText ?? current?.ctaPrimaryText ?? 'Schedule Test Drive',
      ctaSecondaryText: input.ctaSecondaryText ?? current?.ctaSecondaryText ?? 'View Inventory',
      aboutTitle: input.aboutTitle ?? current?.aboutTitle ?? 'About Us',
      aboutStory: input.aboutStory ?? current?.aboutStory ?? null,
      aboutPhotoUrl: input.aboutPhotoUrl ?? current?.aboutPhotoUrl ?? null,
      footerTagline: input.footerTagline ?? current?.footerTagline ?? null,
      footerCopyright: input.footerCopyright ?? current?.footerCopyright ?? null,
      contactPhone: input.contactPhone ?? current?.contactPhone ?? null,
      contactEmail: input.contactEmail ?? current?.contactEmail ?? null,
      contactAddress: input.contactAddress ?? current?.contactAddress ?? null,
      contactHours: input.contactHours ?? current?.contactHours ?? null,
      contactMapsUrl: input.contactMapsUrl ?? current?.contactMapsUrl ?? null,
      yearsExperience: input.yearsExperience ?? current?.yearsExperience ?? null,
      customersServed: input.customersServed ?? current?.customersServed ?? null,
      satisfactionPct: input.satisfactionPct ?? current?.satisfactionPct ?? null,
      trustBadges: input.trustBadges ?? current?.trustBadges ?? [],
      featuredServiceIds: input.featuredServiceIds ?? current?.featuredServiceIds ?? [],
      featuredVehicleIds: input.featuredVehicleIds ?? current?.featuredVehicleIds ?? [],
      socialYoutube: input.socialYoutube ?? current?.socialYoutube ?? null,
      socialFacebook: input.socialFacebook ?? current?.socialFacebook ?? null,
      socialInstagram: input.socialInstagram ?? current?.socialInstagram ?? null,
      socialTiktok: input.socialTiktok ?? current?.socialTiktok ?? null,
      socialLinkedin: input.socialLinkedin ?? current?.socialLinkedin ?? null,
      socialPinterest: input.socialPinterest ?? current?.socialPinterest ?? null,
      socialTwitter: input.socialTwitter ?? current?.socialTwitter ?? null,
    },
    current
  )

  if (current && nextSlug !== current.slug) {
    const available = await checkWebsiteSlugAvailability(supabase, nextSlug)
    if (!available) {
      throw new Error('Website slug is already in use')
    }
  }

  const row = buildWebsiteRow(input, businessId, current)
  row.slug = nextSlug

  if (current) {
    const { data, error } = await supabase.from('websites').update(row).eq('id', current.id).select('*').single()
    if (error) throw error
    return toWebsite(data)
  }

  const { data, error } = await supabase.from('websites').insert(row).select('*').single()
  if (error) throw error
  return toWebsite(data)
}

export async function updateWebsite(supabase: DbClient, businessId: string, websiteId: string, patch: Partial<Website>) {
  const current = (websiteId ? await getWebsiteRowById(supabase, businessId, websiteId) : null) ?? (await getWebsiteRowByBusinessId(supabase, businessId))
  if (!current) {
    throw new Error('Website not found')
  }

  const merged: WebsiteInput = {
    slug: patch.slug ?? current.slug,
    agentId: patch.agentId ?? current.agentId,
    template: patch.template ?? current.template,
    published: patch.published ?? current.published,
    primaryColor: patch.primaryColor ?? current.primaryColor,
    secondaryColor: patch.secondaryColor ?? current.secondaryColor,
    font: patch.font ?? current.font,
    siteTitle: patch.siteTitle ?? current.siteTitle,
    siteDescription: patch.siteDescription ?? current.siteDescription,
    heroHeadline: patch.heroHeadline ?? current.heroHeadline,
    heroSubheadline: patch.heroSubheadline ?? current.heroSubheadline,
    heroImageUrl: patch.heroImageUrl ?? current.heroImageUrl,
    ctaPrimaryText: patch.ctaPrimaryText ?? current.ctaPrimaryText,
    ctaSecondaryText: patch.ctaSecondaryText ?? current.ctaSecondaryText,
    aboutTitle: patch.aboutTitle ?? current.aboutTitle,
    aboutStory: patch.aboutStory ?? current.aboutStory,
    aboutPhotoUrl: patch.aboutPhotoUrl ?? current.aboutPhotoUrl,
    footerTagline: patch.footerTagline ?? current.footerTagline,
    footerCopyright: patch.footerCopyright ?? current.footerCopyright,
    contactPhone: patch.contactPhone ?? current.contactPhone,
    contactEmail: patch.contactEmail ?? current.contactEmail,
    contactAddress: patch.contactAddress ?? current.contactAddress,
    contactHours: patch.contactHours ?? current.contactHours,
    contactMapsUrl: patch.contactMapsUrl ?? current.contactMapsUrl,
    yearsExperience: patch.yearsExperience ?? current.yearsExperience,
    customersServed: patch.customersServed ?? current.customersServed,
    satisfactionPct: patch.satisfactionPct ?? current.satisfactionPct,
    trustBadges: patch.trustBadges ?? current.trustBadges,
    featuredServiceIds: patch.featuredServiceIds ?? current.featuredServiceIds,
    featuredVehicleIds: patch.featuredVehicleIds ?? current.featuredVehicleIds,
    socialYoutube: patch.socialYoutube ?? current.socialYoutube,
    socialFacebook: patch.socialFacebook ?? current.socialFacebook,
    socialInstagram: patch.socialInstagram ?? current.socialInstagram,
    socialTiktok: patch.socialTiktok ?? current.socialTiktok,
    socialLinkedin: patch.socialLinkedin ?? current.socialLinkedin,
    socialPinterest: patch.socialPinterest ?? current.socialPinterest,
    socialTwitter: patch.socialTwitter ?? current.socialTwitter,
  }

  return createOrUpdateWebsite(supabase, businessId, merged)
}

export async function publishWebsite(supabase: DbClient, businessId: string, websiteId: string, published = true) {
  const current = (websiteId ? await getWebsiteRowById(supabase, businessId, websiteId) : null) ?? (await getWebsiteRowByBusinessId(supabase, businessId))
  if (!current) {
    throw new Error('Website not found')
  }
  return updateWebsite(supabase, businessId, websiteId, { published })
}

async function replaceList<T>(
  supabase: DbClient,
  table: 'website_services' | 'website_team_members' | 'website_testimonials' | 'website_highlights' | 'website_faqs',
  businessId: string,
  items: T[],
  toRow: (item: T, index: number) => Record<string, unknown>
) {
  const { error: deleteError } = await supabase.from(table).delete().eq('business_id', businessId)
  if (deleteError) throw deleteError

  if (items.length === 0) return

  const rows = items.map((item, index) => ({
    business_id: businessId,
    ...toRow(item, index),
  }))

  const { error: insertError } = await supabase.from(table).insert(rows)
  if (insertError) throw insertError
}

async function replaceVehicleHighlights(supabase: DbClient, businessId: string, vehicleIds: string[]) {
  const { error: deleteError } = await supabase.from('website_vehicle_highlights').delete().eq('business_id', businessId)
  if (deleteError) throw deleteError

  if (vehicleIds.length === 0) return

  const rows = vehicleIds.map((vehicleId, index) => ({
    business_id: businessId,
    vehicle_id: vehicleId,
    sort_order: index,
  }))

  const { error: insertError } = await supabase.from('website_vehicle_highlights').insert(rows)
  if (insertError) throw insertError
}

export async function getWebsiteContentForBusiness(supabase: DbClient, businessId: string): Promise<WebsiteContent> {
  const website = await getWebsiteRowByBusinessId(supabase, businessId)
  if (!website) {
    throw new Error('Website not found')
  }

  const [{ data: services }, { data: teamMembers }, { data: testimonials }, { data: highlights }, { data: faqs }, { data: vehicleHighlights }] =
    await Promise.all([
      supabase.from('website_services').select('*').eq('business_id', businessId).order('sort_order', { ascending: true }),
      supabase.from('website_team_members').select('*').eq('business_id', businessId).order('sort_order', { ascending: true }),
      supabase.from('website_testimonials').select('*').eq('business_id', businessId).order('sort_order', { ascending: true }),
      supabase.from('website_highlights').select('*').eq('business_id', businessId).order('sort_order', { ascending: true }),
      supabase.from('website_faqs').select('*').eq('business_id', businessId).order('sort_order', { ascending: true }),
      supabase.from('website_vehicle_highlights').select('*, vehicles(*)').eq('business_id', businessId).order('sort_order', { ascending: true }),
    ])

  return {
    website,
    services: (services ?? []).map(toService),
    teamMembers: (teamMembers ?? []).map(toTeamMember),
    testimonials: (testimonials ?? []).map(toTestimonial),
    highlights: (highlights ?? []).map(toHighlight),
    faqs: (faqs ?? []).map(toFaq),
    vehicleHighlights: (vehicleHighlights ?? []).map(toVehicleHighlight),
  }
}

export async function getPublishedWebsiteContentBySlug(supabase: DbClient, slug: string): Promise<WebsiteContent | null> {
  const website = await getWebsiteRowBySlug(supabase, slug)
  if (!website || !website.published) return null
  return getWebsiteContentForBusiness(supabase, website.businessId)
}

export async function saveWebsiteContent(
  supabase: DbClient,
  businessId: string,
  input: SaveWebsiteContentInput
): Promise<WebsiteContent> {
  await createOrUpdateWebsite(supabase, businessId, input.website)

  await replaceList(supabase, 'website_services', businessId, input.services, (item, index) => ({
    icon: item.icon,
    name: item.name,
    description: item.description ?? null,
    duration: item.duration ?? null,
    price: item.price ?? null,
    sort_order: index,
  }))

  await replaceList(supabase, 'website_team_members', businessId, input.teamMembers, (item, index) => ({
    name: item.name,
    role: item.role,
    bio: item.bio ?? null,
    photo_url: item.photoUrl ?? null,
    sort_order: index,
  }))

  await replaceList(supabase, 'website_testimonials', businessId, input.testimonials, (item, index) => ({
    quote: item.quote,
    author_name: item.authorName,
    author_role: item.authorRole ?? null,
    rating: item.rating,
    sort_order: index,
  }))

  await replaceList(supabase, 'website_highlights', businessId, input.highlights, (item, index) => ({
    label: item.label,
    sort_order: index,
  }))

  await replaceList(supabase, 'website_faqs', businessId, input.faqs, (item, index) => ({
    question: item.question,
    answer: item.answer,
    sort_order: index,
  }))

  if (input.featuredVehicleIds) {
    await replaceVehicleHighlights(supabase, businessId, input.featuredVehicleIds)
  }

  return getWebsiteContentForBusiness(supabase, businessId)
}

export async function createWebsiteSubscriber(
  supabase: DbClient,
  businessId: string,
  input: {
    email: string
    name?: string | null
    source?: string
  }
) {
  const result: any = await supabase
    .from('website_subscribers')
    .insert({
      business_id: businessId,
      email: input.email,
      name: input.name ?? null,
      source: input.source ?? 'website',
    })
    .select('*')
    .single()
  const { data, error } = result
  if (error) throw error
  return {
    id: data.id,
    businessId: data.business_id,
    email: data.email,
    name: data.name ?? null,
    source: data.source,
    createdAt: data.created_at,
  }
}
