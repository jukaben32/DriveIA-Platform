# DriveIA Platform

DriveIA is an AI-first SaaS platform for vehicle dealers and rental businesses. Every dealership gets a multi-tenant workspace with live inventory, an AI sales/rental assistant (voice, chat, and WhatsApp), a booking engine for test drives and service, a lead/CRM pipeline, and a public marketing website — all backed by Supabase.

## What it supports

- **Vehicle inventory** — full CRUD for sale and rental listings (make, model, year, condition, mileage, pricing, photos, status) with a live availability feed the AI agent can search
- **AI voice and chat agents** — configurable assistants that search inventory, answer FAQs, and book appointments, powered by OpenAI Realtime and Chat Completions
- **WhatsApp automation** — the same AI assistant answers on WhatsApp through Evolution API
- **Bookings** — test drives, sales consultations, trade-in appraisals, deliveries, and service appointments, with availability rules and reminder emails
- **Customers & leads** — a lead pipeline (new → contacted → qualified → negotiating → won/lost) with budget, interest type, and license details
- **Deals** — track sales and rental agreements from open to won/lost, including trade-ins and financing
- **Website builder** — a public, brandable dealership site with a featured-inventory section, services, team, testimonials, highlights, and FAQs
- **Widget** — an embeddable chat/voice widget for any external site
- **Billing** — on-chain (USDC/Polygon) deposits and payments tied to appointments and deals
- **Customer portal** — self-serve appointment and support access for customers

## Tech Stack

- Next.js (App Router)
- Supabase (Postgres, Auth, RLS)
- OpenAI (Realtime + Chat Completions)
- Tailwind CSS
- TypeScript
- Zustand, React Query, Zod

## Local Development

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`.
3. Fill in the Supabase and AI credentials.
4. Apply `supabase/schema.sql` to your Supabase project.
5. Run the app with `npm run dev`.

## Environment

The project expects environment variables for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL`
- `EVOLUTION_API_URL` / `EVOLUTION_API_KEY` (WhatsApp)

See `.env.example` for the full list.

## Data model

`supabase/schema.sql` is the single source of truth for the schema. Core tables: `businesses`, `ai_agents`, `services`, `customers`, `vehicles`, `deals`, `appointments`, `conversations`, `websites` (+ content tables), `widgets`, `knowledge_documents`, `support_tickets`, `billing_transactions`. Every table is scoped to a `business_id` and protected by row-level security.
