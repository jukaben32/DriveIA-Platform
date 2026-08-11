import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function toTitleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function formatCurrency(amount: number | null | undefined, currency = 'USD') {
  if (amount == null || Number.isNaN(amount)) return ''
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  } catch {
    const formatted =
      amount === 0
        ? '0.00'
        : new Intl.NumberFormat('en-US', {
            minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
          }).format(amount)
    return `${formatted} ${currency}`
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

// Supabase/Postgrest errors are plain objects ({ message, code, details,
// hint }), not `Error` instances — `err instanceof Error` misses them and
// falls back to a useless "Unknown error". This reads `.message` off
// anything that has one before giving up.
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  if (typeof err === 'string') return err
  return 'Unknown error'
}
