import type { Json } from './database'

export type PlanId = 'free' | 'starter' | 'pro' | 'enterprise'
export type BusinessOnboardingStep = 'created' | 'profile' | 'agent' | 'services' | 'billing' | 'done'
export type BusinessMemberRole = 'owner' | 'admin' | 'staff' | 'assistant'
export type BusinessType = 'new_car_dealer' | 'used_car_dealer' | 'rental_company' | 'fleet_leasing' | 'multi_brand'
export type AgentStatus = 'draft' | 'live' | 'paused'
export type ServicePriceType = 'fixed' | 'starting_at' | 'contact'
export type AppointmentType = 'test_drive' | 'sales_consultation' | 'service' | 'delivery' | 'trade_in_appraisal' | 'other'
export type AppointmentStatus = 'scheduled' | 'pending_confirmation' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type PaymentStatus = 'not_required' | 'pending' | 'partial' | 'paid' | 'cash' | 'refunded'
export type AppointmentSource = 'widget' | 'portal' | 'manual' | 'ai_call' | 'phone' | 'whatsapp'
export type ConversationChannel = 'widget_voice' | 'widget_chat' | 'phone' | 'whatsapp'
export type ConversationStatus = 'in_progress' | 'completed' | 'failed'
export type ConversationOutcome = 'booked_appointment' | 'qualified_lead' | 'no_action' | 'escalated'
export type Sentiment = 'positive' | 'neutral' | 'negative'
export type SupportTicketStatus = 'open' | 'pending' | 'resolved' | 'closed'
export type SupportSenderType = 'customer' | 'staff' | 'system'
export type NotificationCategory = 'appointment' | 'billing' | 'widget' | 'support' | 'inventory' | 'system'
export type BillingTransactionStatus = 'pending' | 'confirmed' | 'failed' | 'refunded'
export type BillingPaymentType = 'booking_deposit' | 'vehicle_deposit' | 'rental_payment' | 'full_payment' | 'subscription' | 'portal_topup'
export type WebsiteTemplate = 'serenity' | 'pulse' | 'clarity'

export type CustomerInterestType = 'purchase' | 'rental' | 'lease' | 'trade_in' | 'service' | 'undecided'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'test_drive_scheduled' | 'negotiating' | 'won' | 'lost'

export type VehicleBodyType = 'sedan' | 'suv' | 'truck' | 'van' | 'coupe' | 'convertible' | 'hatchback' | 'wagon' | 'other'
export type VehicleCondition = 'new' | 'used' | 'certified_pre_owned'
export type VehicleTransmission = 'automatic' | 'manual' | 'cvt'
export type VehicleFuelType = 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'plug_in_hybrid'
export type VehicleListingType = 'sale' | 'rental' | 'both'
export type VehicleStatus = 'available' | 'reserved' | 'sold' | 'rented' | 'in_service' | 'archived'

export type DealType = 'sale' | 'rental' | 'lease'
export type DealStatus = 'open' | 'negotiating' | 'won' | 'lost' | 'cancelled'

export interface Business {
  id: string
  ownerId: string
  name: string
  slug: string
  businessType: BusinessType | null
  description: string | null
  logoUrl: string | null
  phone: string | null
  contactEmail: string | null
  bookingEmail: string | null
  address: string | null
  website: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  timezone: string
  paymentWalletAddress: string | null
  paymentChainId: number | null
  paymentCurrency: string
  bookingDepositAmount: number | null
  onboardingStep: BusinessOnboardingStep
  createdAt: string
  updatedAt: string
}

export interface BusinessMember {
  id: string
  businessId: string
  userId: string
  role: BusinessMemberRole
  createdAt: string
  updatedAt: string
}

export interface BusinessSubscription {
  id: string
  businessId: string
  plan: PlanId
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
  websiteBuilderEnabled: boolean
  billingEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface AiAgent {
  id: string
  businessId: string
  name: string
  title: string | null
  specialty: string | null
  voice: string
  personality: string
  sensitivity: number
  greetingMessage: string
  systemPrompt: string
  assignedServiceIds?: string[]
  templateKey?: string | null
  status: AgentStatus
  language: string
  callsHandled: number
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  businessId: string
  name: string
  description: string | null
  durationMinutes: number
  priceType: ServicePriceType
  price: number | null
  priceMin: number | null
  priceMax: number | null
  currency: string
  active: boolean
  color: string | null
  instructions: string | null
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  businessId: string
  authUserId: string | null
  name: string
  phone: string | null
  email: string | null
  dateOfBirth: string | null
  driversLicenseNumber: string | null
  notes: string | null
  interestType: CustomerInterestType
  budgetMin: number | null
  budgetMax: number | null
  preferredVehicleType: string | null
  leadStatus: LeadStatus
  source: 'ai_call' | 'widget_chat' | 'manual' | 'portal' | 'website_form' | 'whatsapp'
  createdAt: string
  updatedAt: string
}

export interface Vehicle {
  id: string
  businessId: string
  stockNumber: string | null
  vin: string | null
  make: string
  model: string
  trim: string | null
  year: number
  bodyType: VehicleBodyType | null
  condition: VehicleCondition
  mileage: number | null
  exteriorColor: string | null
  interiorColor: string | null
  transmission: VehicleTransmission | null
  fuelType: VehicleFuelType | null
  listingType: VehicleListingType
  salePrice: number | null
  rentalDailyRate: number | null
  rentalWeeklyRate: number | null
  currency: string
  status: VehicleStatus
  description: string | null
  features: string[]
  photoUrls: string[]
  location: string | null
  isFeatured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  businessId: string
  customerId: string | null
  vehicleId: string | null
  agentId: string | null
  appointmentId: string | null
  dealType: DealType
  status: DealStatus
  agreedPrice: number | null
  downPayment: number | null
  financingNeeded: boolean
  tradeInDescription: string | null
  tradeInValue: number | null
  rentalStartDate: string | null
  rentalEndDate: string | null
  depositAmount: number | null
  currency: string
  notes: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DealWithRelations extends Deal {
  customer?: Customer | null
  vehicle?: Vehicle | null
}

export interface Appointment {
  id: string
  businessId: string
  customerId: string | null
  agentId: string | null
  serviceId: string | null
  vehicleId: string | null
  conversationId: string | null
  appointmentType: AppointmentType
  scheduledAt: string
  status: AppointmentStatus
  source: AppointmentSource
  notes: string | null
  rescheduledFrom: string | null
  requestedScheduledAt: string | null
  rescheduleRequestedAt: string | null
  confirmedAt: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  cancelledBy: 'customer' | 'business' | 'system' | null
  paymentStatus: PaymentStatus
  paymentAmount: number | null
  paymentCurrency: string
  paymentChainId: number | null
  paymentTxHash: string | null
  reminderSentAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AppointmentWithRelations extends Appointment {
  customer?: Customer | null
  service?: Service | null
  vehicle?: Vehicle | null
  agent?: AiAgent | null
}

export interface BusinessAvailability {
  id: string
  businessId: string
  dayOfWeek: number
  isActive: boolean
  openTime: string
  closeTime: string
  breakStart: string | null
  breakEnd: string | null
  slotMinutes: number
  createdAt: string
  updatedAt: string
}

export interface ClosedDate {
  id: string
  businessId: string
  blockedDate: string
  reason: string | null
  createdAt: string
}

export interface Conversation {
  id: string
  businessId: string
  agentId: string | null
  customerId: string | null
  appointmentId: string | null
  channel: ConversationChannel
  status: ConversationStatus
  outcome: ConversationOutcome | null
  sentiment: Sentiment | null
  durationSeconds: number
  transcriptSummary: string | null
  startedAt: string
  endedAt: string | null
  createdAt: string
}

export interface ConversationMessage {
  id: string
  conversationId: string
  businessId: string
  role: 'agent' | 'caller' | 'system'
  content: string
  createdAt: string
}

export interface KnowledgeDocument {
  id: string
  businessId: string
  title: string
  question: string | null
  answer: string | null
  category: string | null
  catalogKey: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Widget {
  id: string
  businessId: string
  agentId: string | null
  name: string
  slug: string
  enabled: boolean
  position: string
  theme: string
  primaryColor: string
  secondaryColor: string
  tone: string
  welcomeMessage: string
  allowedOrigins: string[]
  slotDuration: number
  showBranding: boolean
  impressions: number
  interactions: number
  createdAt: string
  updatedAt: string
}

export interface Website {
  id: string
  businessId: string
  agentId: string | null
  slug: string
  template: WebsiteTemplate
  published: boolean
  primaryColor: string
  secondaryColor: string
  font: string
  siteTitle: string
  siteDescription: string
  heroHeadline: string | null
  heroSubheadline: string | null
  heroImageUrl: string | null
  ctaPrimaryText: string
  ctaSecondaryText: string
  aboutTitle: string
  aboutStory: string | null
  aboutPhotoUrl: string | null
  footerTagline: string | null
  footerCopyright: string | null
  contactPhone: string | null
  contactEmail: string | null
  contactAddress: string | null
  contactHours: string | null
  contactMapsUrl: string | null
  yearsExperience: number | null
  customersServed: number | null
  satisfactionPct: number | null
  trustBadges: string[]
  featuredServiceIds: string[]
  featuredVehicleIds: string[]
  socialYoutube: string | null
  socialFacebook: string | null
  socialInstagram: string | null
  socialTiktok: string | null
  socialLinkedin: string | null
  socialPinterest: string | null
  socialTwitter: string | null
  createdAt: string
  updatedAt: string
}

export interface WhatsappConnection {
  id: string
  business_id: string
  agent_id: string | null
  provider: 'evolution'
  instance_name: string
  instance_token: string | null
  phone_number: string | null
  status: 'disconnected' | 'connecting' | 'connected'
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export interface WebsiteService {
  id: string
  businessId: string
  icon: string
  name: string
  description: string | null
  duration: string | null
  price: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface WebsiteTeamMember {
  id: string
  businessId: string
  name: string
  role: string
  bio: string | null
  photoUrl: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface WebsiteTestimonial {
  id: string
  businessId: string
  quote: string
  authorName: string
  authorRole: string | null
  rating: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface WebsiteHighlight {
  id: string
  businessId: string
  label: string
  sortOrder: number
  createdAt: string
}

export interface WebsiteVehicleHighlight {
  id: string
  businessId: string
  vehicleId: string
  sortOrder: number
  createdAt: string
  vehicle?: Vehicle | null
}

export interface WebsiteFaq {
  id: string
  businessId: string
  question: string
  answer: string
  sortOrder: number
  createdAt: string
}

export interface WebsiteContent {
  website: Website
  services: WebsiteService[]
  teamMembers: WebsiteTeamMember[]
  testimonials: WebsiteTestimonial[]
  highlights: WebsiteHighlight[]
  faqs: WebsiteFaq[]
  vehicleHighlights: WebsiteVehicleHighlight[]
}

export interface WebsiteSubscriber {
  id: string
  businessId: string
  email: string
  name: string | null
  source: string
  createdAt: string
}

export interface SupportTicket {
  id: string
  businessId: string
  customerId: string | null
  appointmentId: string | null
  subject: string
  description: string | null
  status: SupportTicketStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
  customer?: {
    name: string
    email: string | null
    phone: string | null
  } | null
  appointment?: {
    id: string
    scheduledAt: string
    status: AppointmentStatus
  } | null
}

export interface SupportMessage {
  id: string
  ticketId: string
  businessId: string
  senderType: SupportSenderType
  content: string
  createdAt: string
}

export interface Notification {
  id: string
  businessId: string
  category: NotificationCategory
  title: string
  message: string
  data: Json | null
  readAt: string | null
  createdAt: string
}

export interface BillingTransaction {
  id: string
  businessId: string
  appointmentId: string | null
  customerId: string | null
  amount: number
  currency: string
  chainId: number
  txHash: string
  status: BillingTransactionStatus
  paymentType: BillingPaymentType
  metadata: Json | null
  createdAt: string
  updatedAt: string
}

export interface DashboardAnalytics {
  appointmentsToday: number
  upcomingAppointments: number
  totalCustomers: number
  cancelledAppointments: number
  completedAppointments: number
  noShowAppointments: number
  unreadNotifications: number
  activeAgents: number
  activeServices: number
  totalConversations: number
  bookedConversations: number
  callbacksRequested: number
  vehiclesInStock: number
  vehiclesReserved: number
  dealsWonThisMonth: number
}

export interface PortalContext {
  business: Business
  customer: Customer | null
}

export interface WidgetConfig extends Widget {
  businessName: string
  businessSlug: string
  agentName: string | null
  agentVoice: string | null
}

export interface AvailableSlot {
  date: string
  startAt: string
  endAt: string
  label: string
  dayOfWeek: number
}

export interface PublicBusinessProfile {
  id: string
  name: string
  slug: string
  businessType: BusinessType | null
  description: string | null
  logoUrl: string | null
  phone: string | null
  bookingEmail: string | null
  timezone: string
  address: string | null
  website: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  paymentWalletAddress: string | null
  paymentChainId: number | null
  paymentCurrency: string
}
