export type KnowledgeTemplateCategoryKey =
  | 'test-drives'
  | 'sales-inventory'
  | 'financing'
  | 'trade-ins'
  | 'rentals'
  | 'protection-plans'
  | 'service-maintenance'
  | 'delivery-pickup'
  | 'fleet-corporate'
  | 'hours-location'
  | 'new-customers'
  | 'privacy-data'

export type KnowledgeTemplateTone = 'teal' | 'emerald' | 'blue' | 'amber' | 'rose' | 'slate'

export type KnowledgeTemplateCategory = {
  key: 'all' | KnowledgeTemplateCategoryKey
  label: string
  tone: KnowledgeTemplateTone
}

export type KnowledgeTemplate = {
  key: string
  category: KnowledgeTemplateCategoryKey
  question: string
  answer: string
}

export const KNOWLEDGE_TEMPLATE_CATEGORIES: KnowledgeTemplateCategory[] = [
  { key: 'all', label: 'All Topics', tone: 'slate' },
  { key: 'test-drives', label: 'Test Drives & Bookings', tone: 'teal' },
  { key: 'sales-inventory', label: 'Sales & Inventory', tone: 'amber' },
  { key: 'financing', label: 'Financing & Payments', tone: 'blue' },
  { key: 'trade-ins', label: 'Trade-Ins', tone: 'rose' },
  { key: 'rentals', label: 'Rentals', tone: 'blue' },
  { key: 'protection-plans', label: 'Warranties & Protection', tone: 'teal' },
  { key: 'service-maintenance', label: 'Service & Maintenance', tone: 'emerald' },
  { key: 'delivery-pickup', label: 'Delivery & Pickup', tone: 'amber' },
  { key: 'fleet-corporate', label: 'Fleet & Corporate', tone: 'rose' },
  { key: 'hours-location', label: 'Hours & Location', tone: 'emerald' },
  { key: 'new-customers', label: 'New Customers', tone: 'amber' },
  { key: 'privacy-data', label: 'Privacy & Data', tone: 'slate' },
]

type TemplateSeed = {
  question: string
  answer: string
}

const TEMPLATE_SEEDS: Record<KnowledgeTemplateCategoryKey, TemplateSeed[]> = {
  'test-drives': [
    {
      question: 'How do I schedule a test drive?',
      answer: 'You can book by phone, through the website widget, or with the AI assistant. We will confirm the vehicle, time, and pickup location.',
    },
    {
      question: 'Can I book a test drive online?',
      answer: 'Yes. Use the website widget or portal to request a time and we will follow up with a confirmation.',
    },
    {
      question: "What do I need to bring for a test drive?",
      answer: "Please bring a valid driver's license and, if financing is being discussed, proof of insurance.",
    },
    {
      question: 'Can I reschedule my appointment?',
      answer: 'Yes. Contact us as early as possible and we will move you to the next available slot.',
    },
    {
      question: 'Can I cancel an appointment?',
      answer: 'Yes. You can cancel through the portal or by calling the dealership before the visit starts.',
    },
    {
      question: 'Do you offer same-day test drives?',
      answer: 'Same-day openings are available when the schedule allows, especially for vehicles currently on the lot.',
    },
    {
      question: 'Can someone bring the vehicle to me?',
      answer: 'Depending on availability, we can arrange an at-home or at-work test drive for select inventory.',
    },
  ],
  'sales-inventory': [
    {
      question: 'Is this vehicle still available?',
      answer: 'Inventory updates in real time. Ask the assistant to check current availability, or contact us to confirm before you visit.',
    },
    {
      question: 'Do you have new and used vehicles?',
      answer: 'Yes. Our inventory includes new, used, and certified pre-owned vehicles across multiple makes and models.',
    },
    {
      question: 'Can you help me compare vehicles?',
      answer: 'Absolutely. Tell us your budget, must-have features, and use case and we will suggest two or three good matches.',
    },
    {
      question: 'Can you hold a vehicle for me?',
      answer: 'Yes, for a short period while you finalize your decision. A small deposit may be required to hold a vehicle.',
    },
    {
      question: 'Do you offer a vehicle history report?',
      answer: 'Yes. A vehicle history report is available on request for any used or certified pre-owned vehicle.',
    },
  ],
  financing: [
    {
      question: 'Do you offer financing?',
      answer: 'Yes. We work with multiple lenders to find competitive rates based on your credit profile and down payment.',
    },
    {
      question: 'What if my credit is not perfect?',
      answer: 'We work with a range of lending partners and can review options even if your credit history is limited or imperfect.',
    },
    {
      question: 'What is a typical down payment?',
      answer: 'Down payments vary by vehicle and financing program. We can walk through the numbers before you commit to anything.',
    },
    {
      question: 'Can I pay online?',
      answer: 'Yes. You can pay deposits and installments securely through the customer portal.',
    },
    {
      question: 'Do you offer lease options?',
      answer: 'Select vehicles are available for lease. Ask about current lease specials and terms.',
    },
    {
      question: 'How do I get pre-approved?',
      answer: 'You can start a pre-approval request through the portal or with our team, usually with a response within one business day.',
    },
  ],
  'trade-ins': [
    {
      question: 'Do you accept trade-ins?',
      answer: 'Yes. Share your vehicle year, make, model, mileage, and condition and we will provide an estimated trade-in value.',
    },
    {
      question: 'How is my trade-in value calculated?',
      answer: 'We consider market data, mileage, condition, and current demand. A final offer is confirmed after a brief in-person inspection.',
    },
    {
      question: 'Can I trade in a vehicle I still owe money on?',
      answer: "Yes. We can factor in your remaining loan balance as part of the trade-in and financing conversation.",
    },
    {
      question: 'Do I have to buy a vehicle to trade mine in?',
      answer: 'No. We can also make an offer to purchase your vehicle outright, even if you are not buying from us.',
    },
  ],
  rentals: [
    {
      question: 'What documents do I need to rent a vehicle?',
      answer: "A valid driver's license, a major credit card, and proof of insurance (or our optional rental coverage) are required.",
    },
    {
      question: 'What is included in the rental price?',
      answer: 'Rates typically include a daily mileage allowance; taxes, fees, and optional coverage are shown before you confirm.',
    },
    {
      question: 'Can I extend my rental?',
      answer: 'Yes, subject to availability. Contact us before your return time to extend your reservation.',
    },
    {
      question: 'Is there a minimum rental age?',
      answer: 'Most rentals require drivers to be at least 21, with a possible young-driver fee under 25. Policies vary by vehicle class.',
    },
    {
      question: 'Can I pick up and drop off at different locations?',
      answer: 'One-way rentals may be available for select vehicle classes and locations; ask us to confirm for your dates.',
    },
  ],
  'protection-plans': [
    {
      question: 'What warranty comes with a new vehicle?',
      answer: "New vehicles include the manufacturer's warranty. We can walk through exact coverage terms and mileage limits.",
    },
    {
      question: 'Do used vehicles come with a warranty?',
      answer: 'Certified pre-owned vehicles include extended coverage. Standard used vehicles may qualify for optional protection plans.',
    },
    {
      question: 'What does a protection plan cover?',
      answer: 'Plans can cover mechanical breakdown, tire and wheel damage, or paint and interior protection, depending on the package.',
    },
    {
      question: 'Can I add a protection plan after purchase?',
      answer: 'In most cases yes, within a limited window after delivery. Ask us about current eligibility.',
    },
  ],
  'service-maintenance': [
    {
      question: 'Do you have a service department?',
      answer: 'Yes. We handle routine maintenance, inspections, and repairs for most makes and models.',
    },
    {
      question: 'Can I schedule a service appointment online?',
      answer: 'Yes. Use the website widget or portal to request a service slot and we will confirm availability.',
    },
    {
      question: 'Do you offer a loaner vehicle during service?',
      answer: 'Loaner vehicles may be available for longer repairs, subject to availability. Ask when you schedule your appointment.',
    },
    {
      question: 'How often should I service my vehicle?',
      answer: 'This depends on the manufacturer schedule and your mileage. We can confirm the recommended interval for your specific vehicle.',
    },
  ],
  'delivery-pickup': [
    {
      question: 'Can you deliver the vehicle to my home?',
      answer: 'Yes, home delivery is available in most service areas for both purchases and rentals. Delivery windows depend on your location.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Local delivery is typically same-day or next-day once financing and paperwork are finalized.',
    },
    {
      question: 'Can I pick up outside business hours?',
      answer: 'After-hours pickup may be available by appointment. Let us know your preferred time and we will do our best to accommodate it.',
    },
  ],
  'fleet-corporate': [
    {
      question: 'Do you work with businesses on fleet purchases?',
      answer: 'Yes. We support fleet and corporate accounts with volume pricing, flexible financing, and dedicated support.',
    },
    {
      question: 'Can we rent multiple vehicles for a project or event?',
      answer: 'Yes. Multi-vehicle rentals are available with corporate billing options for qualifying accounts.',
    },
    {
      question: 'Do you offer maintenance plans for fleet vehicles?',
      answer: 'Yes. We can set up scheduled maintenance plans to keep fleet vehicles on the road with minimal downtime.',
    },
  ],
  'hours-location': [
    {
      question: 'What are your hours?',
      answer: 'Our hours are listed in the portal and on the website, and can vary by department (sales, service, and rentals).',
    },
    {
      question: 'Where are you located?',
      answer: 'You can find our address, directions, and maps link in the dealership profile and footer contact section.',
    },
    {
      question: 'Is parking available?',
      answer: 'Yes. We offer customer parking on-site, and our team can share directions when you call.',
    },
    {
      question: 'Are you open on weekends?',
      answer: 'Weekend availability depends on department and location. Check the posted hours or ask our team.',
    },
  ],
  'new-customers': [
    {
      question: 'Are you accepting new customers?',
      answer: 'Yes. We welcome new customers and can help you find the right vehicle, financing option, or rental for your needs.',
    },
    {
      question: 'What should I bring to my first visit?',
      answer: "Please bring a valid driver's license, proof of income if financing, and your current vehicle if you plan to trade it in.",
    },
    {
      question: 'How do I get started?',
      answer: 'Tell us what you are looking for — budget, vehicle type, purchase or rental — and we will guide you from there.',
    },
    {
      question: 'Can I browse inventory before contacting you?',
      answer: 'Yes. Featured inventory is available on our website, and the AI assistant can search the full catalog for you.',
    },
  ],
  'privacy-data': [
    {
      question: 'Is my information protected?',
      answer: 'Yes. We protect customer data using industry-standard security and privacy controls.',
    },
    {
      question: 'Can you share my information with third parties?',
      answer: 'Only with your permission, or as required by law for financing and registration processes.',
    },
    {
      question: 'How do I request a copy of my records?',
      answer: 'You can request a copy of your customer or transaction records through the portal or by contacting our team directly.',
    },
  ],
}

export const KNOWLEDGE_TEMPLATE_BANK: KnowledgeTemplate[] = (Object.entries(TEMPLATE_SEEDS) as Array<
  [KnowledgeTemplateCategoryKey, TemplateSeed[]]
>).flatMap(([category, items]) =>
  items.map((item, index) => ({
    key: `${category}-${index + 1}`,
    category,
    question: item.question,
    answer: item.answer,
  })),
)

export function getKnowledgeTemplateCategoryLabel(categoryKey: KnowledgeTemplateCategoryKey | 'all') {
  return KNOWLEDGE_TEMPLATE_CATEGORIES.find((category) => category.key === categoryKey)?.label ?? 'All Topics'
}

export function getKnowledgeTemplateCategoryTone(categoryKey: KnowledgeTemplateCategoryKey | 'all'): KnowledgeTemplateTone {
  return KNOWLEDGE_TEMPLATE_CATEGORIES.find((category) => category.key === categoryKey)?.tone ?? 'slate'
}
