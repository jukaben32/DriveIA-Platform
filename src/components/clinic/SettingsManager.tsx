'use client'

import { useState } from 'react'
import { Check, Trash2, Plus } from 'lucide-react'
import type { Business, BusinessAvailability } from '@/types'
import { DAYS_OF_WEEK } from '@/constants'
import { createClient } from '@/lib/supabase/client'
import { updateBusiness, upsertBusinessAvailability, addClosedDate, removeClosedDate } from '@/services/business'
import { SectionEyebrow, SectionHeading, SurfaceCard, StatusBadge } from '@/components/clinic/shared'

type ClosedDateRow = { id: string; blocked_date: string; reason: string | null }

function defaultDay(dayOfWeek: number): BusinessAvailability {
  return {
    id: '',
    businessId: '',
    dayOfWeek,
    isActive: dayOfWeek >= 1 && dayOfWeek <= 5,
    openTime: '09:00',
    closeTime: '17:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    slotMinutes: 30,
    createdAt: '',
    updatedAt: '',
  }
}

export function SettingsManager({
  business,
  initialAvailability,
  initialClosedDates,
}: {
  business: Business
  initialAvailability: BusinessAvailability[]
  initialClosedDates: ClosedDateRow[]
}) {
  const [businessForm, setBusinessForm] = useState({ name: business.name, timezone: business.timezone, paymentCurrency: business.paymentCurrency })
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [businessSaved, setBusinessSaved] = useState(false)

  const [availability, setAvailability] = useState<BusinessAvailability[]>(() =>
    DAYS_OF_WEEK.map((_, dayOfWeek) => initialAvailability.find((a) => a.dayOfWeek === dayOfWeek) ?? defaultDay(dayOfWeek))
  )
  const [savingDay, setSavingDay] = useState<number | null>(null)

  const [closedDates, setClosedDates] = useState(initialClosedDates)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')

  async function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault()
    setBusinessSaved(false)
    setSavingBusiness(true)
    try {
      const supabase = createClient()
      await updateBusiness(supabase, business.id, businessForm)
      setBusinessSaved(true)
    } finally {
      setSavingBusiness(false)
    }
  }

  async function handleSaveDay(day: BusinessAvailability) {
    setSavingDay(day.dayOfWeek)
    try {
      const supabase = createClient()
      const updated = await upsertBusinessAvailability(supabase, business.id, {
        dayOfWeek: day.dayOfWeek,
        isActive: day.isActive,
        openTime: day.openTime,
        closeTime: day.closeTime,
        breakStart: day.breakStart,
        breakEnd: day.breakEnd,
        slotMinutes: day.slotMinutes,
      })
      setAvailability((prev) => prev.map((d) => (d.dayOfWeek === day.dayOfWeek ? updated : d)))
    } finally {
      setSavingDay(null)
    }
  }

  function patchDay(dayOfWeek: number, patch: Partial<BusinessAvailability>) {
    setAvailability((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)))
  }

  async function handleAddClosedDate(e: React.FormEvent) {
    e.preventDefault()
    if (!newDate) return
    const supabase = createClient()
    const created = await addClosedDate(supabase, business.id, { blockedDate: newDate, reason: newReason.trim() || null })
    setClosedDates((prev) => [created as ClosedDateRow, ...prev.filter((d) => d.blocked_date !== newDate)])
    setNewDate('')
    setNewReason('')
  }

  async function handleRemoveClosedDate(blockedDate: string) {
    const supabase = createClient()
    await removeClosedDate(supabase, business.id, blockedDate)
    setClosedDates((prev) => prev.filter((d) => d.blocked_date !== blockedDate))
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={<SectionEyebrow>Settings</SectionEyebrow>}
        title="Set clinic hours and blocked dates"
        description="The assistant checks these rules before showing slots so the widget always reflects the real availability."
      />

      <SurfaceCard className="p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Clinic details</div>
        <form onSubmit={handleSaveBusiness} className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-strong)]">Clinic name</label>
            <input value={businessForm.name} onChange={(e) => setBusinessForm((f) => ({ ...f, name: e.target.value }))} className="input-field w-full" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-strong)]">Timezone</label>
            <input value={businessForm.timezone} onChange={(e) => setBusinessForm((f) => ({ ...f, timezone: e.target.value }))} className="input-field w-full" placeholder="America/New_York" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-strong)]">Currency</label>
            <input value={businessForm.paymentCurrency} onChange={(e) => setBusinessForm((f) => ({ ...f, paymentCurrency: e.target.value }))} className="input-field w-full" />
          </div>
          <div className="sm:col-span-3 flex items-center gap-3">
            <button type="submit" disabled={savingBusiness} className="btn-primary">
              {savingBusiness ? 'Saving…' : 'Save clinic details'}
            </button>
            {businessSaved && <span className="text-sm font-medium" style={{ color: 'var(--brand-strong)' }}>Saved.</span>}
          </div>
        </form>
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <SurfaceCard className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Weekly schedule</div>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--text-strong)]">Open hours and breaks</h2>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {availability.map((day) => (
              <div key={day.dayOfWeek} className="border border-[var(--border-soft)] bg-[var(--panel-soft)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => patchDay(day.dayOfWeek, { isActive: !day.isActive })}
                      className="grid h-10 w-10 place-items-center text-white"
                      style={{ background: day.isActive ? 'var(--brand)' : 'var(--text-muted)' }}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-strong)]">{DAYS_OF_WEEK[day.dayOfWeek]}</div>
                      {day.isActive ? (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                          <input type="time" value={day.openTime} onChange={(e) => patchDay(day.dayOfWeek, { openTime: e.target.value })} className="input-field !w-auto !py-1 !text-xs" />
                          <span>–</span>
                          <input type="time" value={day.closeTime} onChange={(e) => patchDay(day.dayOfWeek, { closeTime: e.target.value })} className="input-field !w-auto !py-1 !text-xs" />
                          <span>break</span>
                          <input type="time" value={day.breakStart ?? ''} onChange={(e) => patchDay(day.dayOfWeek, { breakStart: e.target.value || null })} className="input-field !w-auto !py-1 !text-xs" />
                          <span>–</span>
                          <input type="time" value={day.breakEnd ?? ''} onChange={(e) => patchDay(day.dayOfWeek, { breakEnd: e.target.value || null })} className="input-field !w-auto !py-1 !text-xs" />
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-[var(--text-muted)]">Closed</div>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={() => void handleSaveDay(day)} disabled={savingDay === day.dayOfWeek} className="btn-secondary !px-4 !py-2 !text-xs">
                    {savingDay === day.dayOfWeek ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Blocked dates</div>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--text-strong)]">Holiday and closure management</h2>
            </div>
            <StatusBadge tone={closedDates.length > 0 ? 'rose' : 'slate'}>{closedDates.length} blocked</StatusBadge>
          </div>
          <div className="mt-6 border border-[var(--border-soft)] bg-[var(--panel-soft)] p-5">
            <form onSubmit={handleAddClosedDate} className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr_auto]">
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="input-field w-full" required />
              <input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="Reason (optional)" className="input-field w-full" />
              <button type="submit" className="btn-primary !px-4">
                <Plus className="h-4 w-4" />
                Block date
              </button>
            </form>
            <div className="mt-6 space-y-2">
              {closedDates.length === 0 && (
                <div className="border border-dashed border-[var(--border-soft)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--text-muted)]">
                  No dates blocked. Add a holiday or clinic closure above.
                </div>
              )}
              {closedDates.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 border border-[var(--border-soft)] bg-[var(--panel)] px-4 py-3">
                  <div>
                    <div className="text-sm font-bold text-[var(--text-strong)]">{d.blocked_date}</div>
                    {d.reason && <div className="text-xs text-[var(--text-muted)]">{d.reason}</div>}
                  </div>
                  <button type="button" onClick={() => void handleRemoveClosedDate(d.blocked_date)} className="text-[var(--coral)]" aria-label="Remove blocked date">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}
