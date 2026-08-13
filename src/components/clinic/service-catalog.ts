import type { ServicePriceType } from '@/types'

export type ServiceCatalogCategoryKey =
  | 'all'
  | 'sales-inventory'
  | 'test-drives'
  | 'rentals'
  | 'financing'
  | 'trade-ins'
  | 'fleet-corporate'
  | 'service-maintenance'
  | 'protection-plans'

export type ServiceCatalogTemplate = {
  key: string
  category: ServiceCatalogCategoryKey
  name: string
  description: string
  durationMinutes: number
  priceType: ServicePriceType
  price?: number | null
  priceMin?: number | null
  priceMax?: number | null
}

export const SERVICE_CATALOG_CATEGORIES: Array<{ key: 'all' | ServiceCatalogCategoryKey; label: string }> = [
  { key: 'all', label: 'All Services' },
  { key: 'sales-inventory', label: 'Sales & Inventory' },
  { key: 'test-drives', label: 'Test Drives' },
  { key: 'rentals', label: 'Rentals' },
  { key: 'financing', label: 'Financing' },
  { key: 'trade-ins', label: 'Trade-Ins' },
  { key: 'fleet-corporate', label: 'Fleet & Corporate' },
  { key: 'service-maintenance', label: 'Service & Maintenance' },
  { key: 'protection-plans', label: 'Protection Plans' },
]

const SALES_INVENTORY: ServiceCatalogTemplate[] = [
  {
    key: 'new-vehicle-consultation',
    category: 'sales-inventory',
    name: 'New Vehicle Consultation',
    description: 'Walk through trims, features, and availability to help the customer choose the right new vehicle.',
    durationMinutes: 30,
    priceType: 'contact',
  },
  {
    key: 'used-vehicle-walkthrough',
    category: 'sales-inventory',
    name: 'Used Vehicle Walkthrough',
    description: 'Review pre-owned inventory, mileage, history, and condition with a guided sales consultation.',
    durationMinutes: 25,
    priceType: 'contact',
  },
  {
    key: 'inventory-comparison',
    category: 'sales-inventory',
    name: 'Inventory Comparison',
    description: 'Compare two or three vehicles side by side based on budget, size, and feature priorities.',
    durationMinutes: 20,
    priceType: 'fixed',
    price: 39,
  },
  {
    key: 'vehicle-hold-request',
    category: 'sales-inventory',
    name: 'Vehicle Hold Request',
    description: 'Reserve a vehicle for a short period while the buyer finalizes their decision.',
    durationMinutes: 10,
    priceType: 'fixed',
    price: 25,
  },
]

const TEST_DRIVES: ServiceCatalogTemplate[] = [
  {
    key: 'test-drive-booking',
    category: 'test-drives',
    name: 'Test Drive Booking',
    description: 'Schedule a test drive, confirm the model, and prepare the vehicle for arrival.',
    durationMinutes: 20,
    priceType: 'fixed',
    price: 49,
  },
  {
    key: 'weekend-test-drive',
    category: 'test-drives',
    name: 'Weekend Test Drive',
    description: 'Book a weekend slot for customers who need more time to compare vehicles.',
    durationMinutes: 20,
    priceType: 'fixed',
    price: 59,
  },
  {
    key: 'overnight-demo-request',
    category: 'test-drives',
    name: 'Overnight Demo Request',
    description: 'Request an overnight demo for approved shoppers who want a longer hands-on experience.',
    durationMinutes: 15,
    priceType: 'contact',
  },
  {
    key: 'route-planning',
    category: 'test-drives',
    name: 'Demo Route Planning',
    description: 'Plan the best route for a test drive based on highway, city, or mixed driving needs.',
    durationMinutes: 15,
    priceType: 'fixed',
    price: 19,
  },
]

const RENTALS: ServiceCatalogTemplate[] = [
  {
    key: 'daily-rental',
    category: 'rentals',
    name: 'Daily Rental',
    description: 'Reserve a vehicle for a single day with pickup and return details confirmed in advance.',
    durationMinutes: 20,
    priceType: 'starting_at',
    price: 89,
  },
  {
    key: 'weekly-rental',
    category: 'rentals',
    name: 'Weekly Rental',
    description: 'Book a one-week rental with mileage and insurance preferences captured upfront.',
    durationMinutes: 25,
    priceType: 'starting_at',
    price: 399,
  },
  {
    key: 'airport-pickup-rental',
    category: 'rentals',
    name: 'Airport Pickup Rental',
    description: 'Coordinate airport pickup or delivery for travelers who need a vehicle on arrival.',
    durationMinutes: 20,
    priceType: 'starting_at',
    price: 119,
  },
  {
    key: 'long-term-rental',
    category: 'rentals',
    name: 'Long-Term Rental',
    description: 'Arrange a monthly or multi-week rental for business or personal mobility needs.',
    durationMinutes: 30,
    priceType: 'contact',
  },
]

const FINANCING: ServiceCatalogTemplate[] = [
  {
    key: 'finance-prequalification',
    category: 'financing',
    name: 'Finance Pre-Qualification',
    description: 'Collect the core details needed to estimate approval options and monthly payments.',
    durationMinutes: 20,
    priceType: 'fixed',
    price: 0,
  },
  {
    key: 'lease-quote-review',
    category: 'financing',
    name: 'Lease Quote Review',
    description: 'Review lease terms, monthly payment expectations, and mileage preferences.',
    durationMinutes: 20,
    priceType: 'fixed',
    price: 0,
  },
  {
    key: 'payment-estimate',
    category: 'financing',
    name: 'Monthly Payment Estimate',
    description: 'Run a rough estimate for buyers comparing down payment, term length, and rate scenarios.',
    durationMinutes: 15,
    priceType: 'fixed',
    price: 0,
  },
  {
    key: 'credit-application-intake',
    category: 'financing',
    name: 'Credit Application Intake',
    description: 'Capture the information needed to start a credit application for a purchase or lease.',
    durationMinutes: 20,
    priceType: 'contact',
  },
]

const TRADE_INS: ServiceCatalogTemplate[] = [
  {
    key: 'trade-in-appraisal',
    category: 'trade-ins',
    name: 'Trade-In Appraisal',
    description: 'Evaluate year, make, model, mileage, and condition to estimate a trade-in value.',
    durationMinutes: 20,
    priceType: 'fixed',
    price: 39,
  },
  {
    key: 'instant-cash-offer',
    category: 'trade-ins',
    name: 'Instant Cash Offer',
    description: 'Provide a fast cash-offer workflow for customers who want to sell their vehicle outright.',
    durationMinutes: 15,
    priceType: 'contact',
  },
  {
    key: 'payoff-review',
    category: 'trade-ins',
    name: 'Payoff Review',
    description: 'Review outstanding loan balance and equity position before a trade or sale.',
    durationMinutes: 15,
    priceType: 'fixed',
    price: 0,
  },
  {
    key: 'sell-your-car-consultation',
    category: 'trade-ins',
    name: 'Sell Your Car Consultation',
    description: 'Guide a customer through the steps to sell their current vehicle to the dealer.',
    durationMinutes: 20,
    priceType: 'contact',
  },
]

const FLEET_CORPORATE: ServiceCatalogTemplate[] = [
  {
    key: 'fleet-consultation',
    category: 'fleet-corporate',
    name: 'Fleet Consultation',
    description: 'Discuss business fleet needs, recurring orders, and preferred vehicle classes.',
    durationMinutes: 30,
    priceType: 'contact',
  },
  {
    key: 'corporate-account-setup',
    category: 'fleet-corporate',
    name: 'Corporate Account Setup',
    description: 'Set up a business account with recurring booking, billing, and fleet preferences.',
    durationMinutes: 25,
    priceType: 'contact',
  },
  {
    key: 'multi-vehicle-quote',
    category: 'fleet-corporate',
    name: 'Multi-Vehicle Quote',
    description: 'Create pricing for multiple purchases or rentals under one company request.',
    durationMinutes: 20,
    priceType: 'contact',
  },
  {
    key: 'subscription-mobility-plan',
    category: 'fleet-corporate',
    name: 'Subscription Mobility Plan',
    description: 'Coordinate a recurring mobility plan for a company or frequent driver.',
    durationMinutes: 30,
    priceType: 'contact',
  },
]

const SERVICE_MAINTENANCE: ServiceCatalogTemplate[] = [
  {
    key: 'service-appointment',
    category: 'service-maintenance',
    name: 'Service Appointment',
    description: 'Book a maintenance visit for a vehicle that needs attention from the service department.',
    durationMinutes: 20,
    priceType: 'fixed',
    price: 0,
  },
  {
    key: 'oil-change',
    category: 'service-maintenance',
    name: 'Oil Change',
    description: 'Schedule routine oil and filter service for a vehicle.',
    durationMinutes: 15,
    priceType: 'starting_at',
    price: 59,
  },
  {
    key: 'tire-rotation',
    category: 'service-maintenance',
    name: 'Tire Rotation',
    description: 'Rotate tires and inspect tread wear for even vehicle maintenance.',
    durationMinutes: 15,
    priceType: 'starting_at',
    price: 35,
  },
  {
    key: 'diagnostics-checkup',
    category: 'service-maintenance',
    name: 'Diagnostics Checkup',
    description: 'Run a vehicle diagnostic review for warning lights, noise, or drivability concerns.',
    durationMinutes: 25,
    priceType: 'starting_at',
    price: 89,
  },
  {
    key: 'pickup-delivery',
    category: 'service-maintenance',
    name: 'Pickup & Delivery',
    description: 'Arrange collection and return of a vehicle for service appointments.',
    durationMinutes: 15,
    priceType: 'contact',
  },
]

const PROTECTION_PLANS: ServiceCatalogTemplate[] = [
  {
    key: 'extended-warranty',
    category: 'protection-plans',
    name: 'Extended Warranty Review',
    description: 'Explain extended warranty coverage, limits, and add-on options clearly.',
    durationMinutes: 20,
    priceType: 'contact',
  },
  {
    key: 'roadside-assistance',
    category: 'protection-plans',
    name: 'Roadside Assistance Plan',
    description: 'Review towing, lockout, battery, and roadside coverage options.',
    durationMinutes: 15,
    priceType: 'fixed',
    price: 49,
  },
  {
    key: 'gap-coverage-review',
    category: 'protection-plans',
    name: 'GAP Coverage Review',
    description: 'Explain gap coverage and how it protects financing in a total loss scenario.',
    durationMinutes: 15,
    priceType: 'contact',
  },
  {
    key: 'vehicle-insurance-guidance',
    category: 'protection-plans',
    name: 'Vehicle Insurance Guidance',
    description: 'Help the customer understand insurance and protection options before purchase or rental.',
    durationMinutes: 20,
    priceType: 'contact',
  },
]

export const SERVICE_CATALOG_TEMPLATES: ServiceCatalogTemplate[] = [
  ...SALES_INVENTORY,
  ...TEST_DRIVES,
  ...RENTALS,
  ...FINANCING,
  ...TRADE_INS,
  ...FLEET_CORPORATE,
  ...SERVICE_MAINTENANCE,
  ...PROTECTION_PLANS,
]
