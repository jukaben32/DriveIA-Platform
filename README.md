# DriveIA Platform

DriveIA is a mobility SaaS starter for vehicle dealers and rent car businesses. It keeps the same AI-first dashboard structure used in the reference projects, but rebrands the product for automotive workflows.

## What it supports

- AI voice agents for sales and rental inquiries
- WhatsApp automation through Evolution API
- Website builder for public business pages
- Customer, lead, reservation, and follow-up workflows
- Supabase-backed multi-tenant business data

## Tech Stack

- Next.js
- Supabase
- LLM-powered assistants
- Tailwind CSS
- TypeScript

## Local Development

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Fill in the Supabase and AI credentials.
4. Run the app with `npm run dev`.

## Environment

The project expects environment variables for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_FROM_EMAIL`
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`

## Notes

This repo is being adapted from the healthcare starter into a reusable automotive platform. The main goal is to keep the dashboard, WhatsApp, and website builder patterns intact while changing the product identity and language to DriveIA.
