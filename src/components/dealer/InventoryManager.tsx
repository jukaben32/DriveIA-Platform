'use client'

import { useMemo, useState, type FormEvent } from 'react'
import {
  CarFront,
  Gauge,
  Loader2,
  PencilLine,
  Plus,
  Search,
  Star,
  Trash2,
  Warehouse,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Vehicle, VehicleBodyType, VehicleCondition, VehicleFuelType, VehicleListingType, VehicleStatus, VehicleTransmission } from '@/types'
import { createVehicle, deleteVehicle, updateVehicle } from '@/services/vehicles'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import { MetricCard, SectionEyebrow, SectionHeading, SurfaceCard } from '@/components/dealer/shared'

type ToastState = { id: string; title: string; message?: string; tone: 'teal' | 'emerald' | 'blue' | 'amber' | 'rose' | 'slate' }

const BODY_TYPES: VehicleBodyType[] = ['sedan', 'suv', 'truck', 'van', 'coupe', 'convertible', 'hatchback', 'wagon', 'other']
const CONDITIONS: VehicleCondition[] = ['new', 'used', 'certified_pre_owned']
const TRANSMISSIONS: VehicleTransmission[] = ['automatic', 'manual', 'cvt']
const FUEL_TYPES: VehicleFuelType[] = ['gasoline', 'diesel', 'hybrid', 'electric', 'plug_in_hybrid']
const LISTING_TYPES: VehicleListingType[] = ['sale', 'rental', 'both']
const STATUSES: VehicleStatus[] = ['available', 'reserved', 'sold', 'rented', 'in_service', 'archived']

const STATUS_LABEL: Record<VehicleStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  rented: 'Rented',
  in_service: 'In service',
  archived: 'Archived',
}

const STATUS_TONE: Record<VehicleStatus, 'teal' | 'emerald' | 'blue' | 'amber' | 'rose' | 'slate'> = {
  available: 'emerald',
  reserved: 'amber',
  sold: 'slate',
  rented: 'blue',
  in_service: 'rose',
  archived: 'slate',
}

function labelize(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function emptyForm(): VehicleFormState {
  return {
    stockNumber: '',
    vin: '',
    make: '',
    model: '',
    trim: '',
    year: new Date().getFullYear().toString(),
    bodyType: 'sedan',
    condition: 'used',
    mileage: '',
    exteriorColor: '',
    interiorColor: '',
    transmission: 'automatic',
    fuelType: 'gasoline',
    listingType: 'sale',
    salePrice: '',
    rentalDailyRate: '',
    status: 'available',
    description: '',
    features: '',
    photoUrls: '',
    isFeatured: false,
  }
}

function toForm(vehicle: Vehicle): VehicleFormState {
  return {
    stockNumber: vehicle.stockNumber ?? '',
    vin: vehicle.vin ?? '',
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim ?? '',
    year: String(vehicle.year),
    bodyType: vehicle.bodyType ?? 'sedan',
    condition: vehicle.condition,
    mileage: vehicle.mileage != null ? String(vehicle.mileage) : '',
    exteriorColor: vehicle.exteriorColor ?? '',
    interiorColor: vehicle.interiorColor ?? '',
    transmission: vehicle.transmission ?? 'automatic',
    fuelType: vehicle.fuelType ?? 'gasoline',
    listingType: vehicle.listingType,
    salePrice: vehicle.salePrice != null ? String(vehicle.salePrice) : '',
    rentalDailyRate: vehicle.rentalDailyRate != null ? String(vehicle.rentalDailyRate) : '',
    status: vehicle.status,
    description: vehicle.description ?? '',
    features: vehicle.features.join(', '),
    photoUrls: vehicle.photoUrls.join('\n'),
    isFeatured: vehicle.isFeatured,
  }
}

type VehicleFormState = {
  stockNumber: string
  vin: string
  make: string
  model: string
  trim: string
  year: string
  bodyType: VehicleBodyType
  condition: VehicleCondition
  mileage: string
  exteriorColor: string
  interiorColor: string
  transmission: VehicleTransmission
  fuelType: VehicleFuelType
  listingType: VehicleListingType
  salePrice: string
  rentalDailyRate: string
  status: VehicleStatus
  description: string
  features: string
  photoUrls: string
  isFeatured: boolean
}

export function InventoryManager({ initialVehicles, businessId }: { initialVehicles: Vehicle[]; businessId: string }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [form, setForm] = useState<VehicleFormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const supabase = useMemo(() => createClient(), [])

  function showToast(title: string, message?: string, tone: ToastState['tone'] = 'emerald') {
    const id = crypto.randomUUID()
    setToast({ id, title, message, tone })
    setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 3200)
  }

  const stats = useMemo(() => {
    const counts = { total: vehicles.length, available: 0, reserved: 0, sold: 0, rented: 0 }
    for (const vehicle of vehicles) {
      if (vehicle.status === 'available') counts.available += 1
      if (vehicle.status === 'reserved') counts.reserved += 1
      if (vehicle.status === 'sold') counts.sold += 1
      if (vehicle.status === 'rented') counts.rented += 1
    }
    return counts
  }, [vehicles])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return vehicles.filter((vehicle) => {
      if (statusFilter !== 'all' && vehicle.status !== statusFilter) return false
      if (!normalized) return true
      const haystack = `${vehicle.make} ${vehicle.model} ${vehicle.trim ?? ''} ${vehicle.stockNumber ?? ''} ${vehicle.vin ?? ''}`.toLowerCase()
      return haystack.includes(normalized)
    })
  }, [vehicles, query, statusFilter])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(vehicle: Vehicle) {
    setEditing(vehicle)
    setForm(toForm(vehicle))
    setModalOpen(true)
  }

  function patch(p: Partial<VehicleFormState>) {
    setForm((current) => ({ ...current, ...p }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.make.trim() || !form.model.trim()) {
      showToast('Missing details', 'Make and model are required.', 'amber')
      return
    }

    setSaving(true)
    try {
      const payload = {
        stockNumber: form.stockNumber.trim() || null,
        vin: form.vin.trim() || null,
        make: form.make.trim(),
        model: form.model.trim(),
        trim: form.trim.trim() || null,
        year: Number(form.year) || new Date().getFullYear(),
        bodyType: form.bodyType,
        condition: form.condition,
        mileage: form.mileage ? Number(form.mileage) : null,
        exteriorColor: form.exteriorColor.trim() || null,
        interiorColor: form.interiorColor.trim() || null,
        transmission: form.transmission,
        fuelType: form.fuelType,
        listingType: form.listingType,
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        rentalDailyRate: form.rentalDailyRate ? Number(form.rentalDailyRate) : null,
        status: form.status,
        description: form.description.trim() || null,
        features: form.features
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        photoUrls: form.photoUrls
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        isFeatured: form.isFeatured,
      }

      if (editing) {
        const updated = await updateVehicle(supabase, businessId, editing.id, payload)
        setVehicles((current) => current.map((item) => (item.id === updated.id ? updated : item)))
        showToast('Vehicle updated', `${updated.year} ${updated.make} ${updated.model} saved.`)
      } else {
        const created = await createVehicle(supabase, businessId, payload)
        setVehicles((current) => [created, ...current])
        showToast('Vehicle added', `${created.year} ${created.make} ${created.model} is now in inventory.`)
      }
      setModalOpen(false)
    } catch (error) {
      showToast('Something went wrong', error instanceof Error ? error.message : 'Could not save the vehicle.', 'rose')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(vehicle: Vehicle) {
    if (!window.confirm(`Remove ${vehicle.year} ${vehicle.make} ${vehicle.model} from inventory?`)) return
    try {
      await deleteVehicle(supabase, businessId, vehicle.id)
      setVehicles((current) => current.filter((item) => item.id !== vehicle.id))
      showToast('Vehicle removed', undefined, 'slate')
    } catch (error) {
      showToast('Could not remove vehicle', error instanceof Error ? error.message : undefined, 'rose')
    }
  }

  async function handleStatusChange(vehicle: Vehicle, status: VehicleStatus) {
    try {
      const updated = await updateVehicle(supabase, businessId, vehicle.id, { status })
      setVehicles((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch (error) {
      showToast('Could not update status', error instanceof Error ? error.message : undefined, 'rose')
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={<SectionEyebrow>Inventory</SectionEyebrow>}
        title="Vehicle inventory"
        description="Track every vehicle for sale or rental — pricing, condition, mileage, and live status — and feature the best ones on your public site."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add vehicle
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total inventory" value={String(stats.total)} icon={Warehouse} tone="teal" />
        <MetricCard label="Available" value={String(stats.available)} icon={CarFront} tone="emerald" />
        <MetricCard label="Reserved" value={String(stats.reserved)} icon={Gauge} tone="amber" />
        <MetricCard label="Sold / rented" value={String(stats.sold + stats.rented)} icon={Star} tone="blue" />
      </div>

      <SurfaceCard className="p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by make, model, trim, stock #, or VIN..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | 'all')}
            className="input-field w-auto"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </div>
      </SurfaceCard>

      {filtered.length === 0 ? (
        <SurfaceCard className="p-10 text-center">
          <CarFront className="mx-auto h-10 w-10 opacity-30" />
          <p className="mt-4 text-sm font-semibold text-[var(--text-strong)]">
            {vehicles.length === 0 ? 'No vehicles yet' : 'No vehicles match this search'}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {vehicles.length === 0 ? 'Add your first vehicle to start building your inventory.' : 'Try a different search term or status filter.'}
          </p>
          {vehicles.length === 0 ? (
            <Button className="mt-5" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add vehicle
            </Button>
          ) : null}
        </SurfaceCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((vehicle) => {
            const photo = vehicle.photoUrls[0] ?? null
            const price =
              vehicle.salePrice != null
                ? `$${vehicle.salePrice.toLocaleString()}`
                : vehicle.rentalDailyRate != null
                ? `$${vehicle.rentalDailyRate.toLocaleString()}/day`
                : 'Contact for price'

            return (
              <SurfaceCard key={vehicle.id} className="overflow-hidden p-0">
                <div className="flex h-36 items-center justify-center border-b border-[var(--border-soft)] bg-[var(--panel-soft)]">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="h-full w-full object-cover" />
                  ) : (
                    <CarFront className="h-10 w-10 opacity-30" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-[var(--text-strong)]">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{vehicle.trim || labelize(vehicle.bodyType ?? 'other')}</div>
                    </div>
                    {vehicle.isFeatured ? (
                      <span title="Featured on website" className="shrink-0 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge tone={STATUS_TONE[vehicle.status]}>{STATUS_LABEL[vehicle.status]}</Badge>
                    <Badge tone="slate">{labelize(vehicle.condition)}</Badge>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <Gauge className="h-3.5 w-3.5" />
                    {vehicle.mileage != null ? `${vehicle.mileage.toLocaleString()} mi` : 'Mileage n/a'}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-base font-black text-[var(--brand-strong)]">{price}</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={vehicle.status}
                        onChange={(e) => void handleStatusChange(vehicle, e.target.value as VehicleStatus)}
                        className="rounded-full border border-[var(--border-soft)] bg-white px-2 py-1.5 text-[11px] font-semibold text-[var(--text-muted)]"
                        title="Change status"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABEL[status]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => openEdit(vehicle)}
                        className="rounded-full border border-[var(--border-soft)] p-2 text-[var(--text-muted)] hover:text-[var(--text-strong)]"
                        aria-label="Edit vehicle"
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(vehicle)}
                        className="rounded-full border border-[var(--border-soft)] p-2 text-[var(--coral)]"
                        aria-label="Remove vehicle"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </SurfaceCard>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit vehicle' : 'Add vehicle'}
        description="These details power the dashboard, the AI agent's inventory search, and the public website."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Make" value={form.make} onChange={(e) => patch({ make: e.target.value })} placeholder="Toyota" required />
            <Input label="Model" value={form.model} onChange={(e) => patch({ model: e.target.value })} placeholder="RAV4" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="Year" type="number" value={form.year} onChange={(e) => patch({ year: e.target.value })} required />
            <Input label="Trim" value={form.trim} onChange={(e) => patch({ trim: e.target.value })} placeholder="XLE" />
            <Select label="Body type" value={form.bodyType} onChange={(e) => patch({ bodyType: e.target.value as VehicleBodyType })}>
              {BODY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {labelize(type)}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Condition" value={form.condition} onChange={(e) => patch({ condition: e.target.value as VehicleCondition })}>
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {labelize(condition)}
                </option>
              ))}
            </Select>
            <Input label="Mileage" type="number" value={form.mileage} onChange={(e) => patch({ mileage: e.target.value })} placeholder="24000" />
            <Select label="Transmission" value={form.transmission} onChange={(e) => patch({ transmission: e.target.value as VehicleTransmission })}>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>
                  {labelize(t)}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Fuel type" value={form.fuelType} onChange={(e) => patch({ fuelType: e.target.value as VehicleFuelType })}>
              {FUEL_TYPES.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {labelize(fuel)}
                </option>
              ))}
            </Select>
            <Input label="Exterior color" value={form.exteriorColor} onChange={(e) => patch({ exteriorColor: e.target.value })} />
            <Input label="Interior color" value={form.interiorColor} onChange={(e) => patch({ interiorColor: e.target.value })} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Listing type" value={form.listingType} onChange={(e) => patch({ listingType: e.target.value as VehicleListingType })}>
              {LISTING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {labelize(type)}
                </option>
              ))}
            </Select>
            <Input label="Sale price" type="number" value={form.salePrice} onChange={(e) => patch({ salePrice: e.target.value })} placeholder="24999" />
            <Input label="Rental daily rate" type="number" value={form.rentalDailyRate} onChange={(e) => patch({ rentalDailyRate: e.target.value })} placeholder="79" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Stock number" value={form.stockNumber} onChange={(e) => patch({ stockNumber: e.target.value })} />
            <Input label="VIN" value={form.vin} onChange={(e) => patch({ vin: e.target.value })} />
          </div>

          <Select label="Status" value={form.status} onChange={(e) => patch({ status: e.target.value as VehicleStatus })}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </Select>

          <label className="block space-y-2">
            <div className="text-sm font-semibold text-[var(--text-strong)]">Description</div>
            <textarea
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              className="input-field w-full"
              rows={3}
              placeholder="Clean Carfax, one owner, backup camera, adaptive cruise control..."
            />
          </label>

          <Input
            label="Features"
            hint="Comma-separated (e.g. Backup camera, Heated seats, Apple CarPlay)"
            value={form.features}
            onChange={(e) => patch({ features: e.target.value })}
          />

          <label className="block space-y-2">
            <div className="text-sm font-semibold text-[var(--text-strong)]">Photo URLs</div>
            <textarea
              value={form.photoUrls}
              onChange={(e) => patch({ photoUrls: e.target.value })}
              className="input-field w-full"
              rows={3}
              placeholder="One URL per line. The first one is used as the cover photo."
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-strong)]">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => patch({ isFeatured: e.target.checked })} className="h-4 w-4 rounded border-[var(--border-soft)]" />
            Feature on public website
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? 'Save changes' : 'Add vehicle'}
            </Button>
          </div>
        </form>
      </Modal>

      {toast ? (
        <div className={cn('fixed bottom-6 right-6 z-50 w-full max-w-sm')}>
          <Toast title={toast.title} message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
        </div>
      ) : null}
    </div>
  )
}
