'use client'
import { useMemo, useState, type FormEvent } from 'react'
import { Car, CarFront, Gauge, Hash, MapPin, Search, Sparkles } from 'lucide-react'
import { SurfaceCard } from '@/components/dealer/shared'
import type { PublicVehicle, Website } from '@/types'

type StyleTokens = { bg: string; cardBg: string; text: string; subtext: string; border: string; heroBg: string }

type SearchMode = 'sale' | 'rental'

const BODY_TYPE_OPTIONS: Array<{ value: PublicVehicle['bodyType']; label: string }> = [
  { value: 'sedan', label: 'Sedán' },
  { value: 'hatchback', label: 'Compacto' },
  { value: 'suv', label: 'Jeepeta' },
  { value: 'truck', label: 'Camioneta' },
  { value: 'coupe', label: 'Coupé/Sport' },
]

// Illustrative estimate only — not a real financing offer, no lender integration behind it.
const FINANCE_APR = 0.12
const FINANCE_TERMS_MONTHS = [12, 24, 36, 48, 60]

function distinct(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim())))).sort()
}

function formatPrice(vehicle: PublicVehicle, mode: SearchMode) {
  if (mode === 'rental') {
    return vehicle.rentalDailyRate != null ? `$${vehicle.rentalDailyRate.toLocaleString()}/día` : 'Consultar precio'
  }
  return vehicle.salePrice != null ? `$${vehicle.salePrice.toLocaleString()}` : 'Consultar precio'
}

export function VehicleFinder({
  vehicles,
  highlightedVehicles,
  website,
  style,
}: {
  vehicles: PublicVehicle[]
  highlightedVehicles: PublicVehicle[]
  website: Website
  style: StyleTokens
}) {
  const [mode, setMode] = useState<SearchMode>('sale')
  const [condition, setCondition] = useState<'all' | PublicVehicle['condition']>('all')
  const [bodyType, setBodyType] = useState<'all' | PublicVehicle['bodyType']>('all')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [yearMin, setYearMin] = useState('')
  const [yearMax, setYearMax] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [location, setLocation] = useState('')
  const [stockCode, setStockCode] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const rentalAvailable = useMemo(() => vehicles.some((v) => v.listingType === 'rental' || v.listingType === 'both'), [vehicles])
  const makes = useMemo(() => distinct(vehicles.map((v) => v.make)), [vehicles])
  const models = useMemo(
    () => distinct(vehicles.filter((v) => !make || v.make === make).map((v) => v.model)),
    [vehicles, make]
  )
  const locations = useMemo(() => distinct(vehicles.map((v) => v.location)), [vehicles])

  const spotlightCandidates = useMemo(() => {
    if (highlightedVehicles.length > 0) return highlightedVehicles.slice(0, 5)
    const featured = vehicles.filter((v) => v.isFeatured)
    return (featured.length > 0 ? featured : vehicles).slice(0, 5)
  }, [vehicles, highlightedVehicles])
  const [spotlightId, setSpotlightId] = useState<string | null>(null)
  const spotlight = spotlightCandidates.find((v) => v.id === spotlightId) ?? spotlightCandidates[0] ?? null

  const results = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (mode === 'sale' && vehicle.listingType === 'rental') return false
      if (mode === 'rental' && vehicle.listingType === 'sale') return false
      if (condition !== 'all' && vehicle.condition !== condition) return false
      if (bodyType !== 'all' && vehicle.bodyType !== bodyType) return false
      if (make && vehicle.make !== make) return false
      if (model && vehicle.model !== model) return false
      if (yearMin && vehicle.year < Number(yearMin)) return false
      if (yearMax && vehicle.year > Number(yearMax)) return false
      const price = mode === 'rental' ? vehicle.rentalDailyRate : vehicle.salePrice
      if (priceMin && (price == null || price < Number(priceMin))) return false
      if (priceMax && (price == null || price > Number(priceMax))) return false
      if (location && vehicle.location !== location) return false
      if (stockCode.trim() && !(vehicle.stockNumber ?? '').toLowerCase().includes(stockCode.trim().toLowerCase())) return false
      return true
    })
  }, [vehicles, mode, condition, bodyType, make, model, yearMin, yearMax, priceMin, priceMax, location, stockCode])

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    setHasSearched(true)
  }

  function handleBodyTypeClick(value: 'all' | PublicVehicle['bodyType']) {
    setBodyType(value)
    setHasSearched(true)
  }

  function handleReset() {
    setCondition('all')
    setBodyType('all')
    setMake('')
    setModel('')
    setYearMin('')
    setYearMax('')
    setPriceMin('')
    setPriceMax('')
    setLocation('')
    setStockCode('')
    setHasSearched(false)
  }

  const [financeValue, setFinanceValue] = useState('')
  const [financeTermMonths, setFinanceTermMonths] = useState(60)
  const monthlyPayment = useMemo(() => {
    const principal = Number(financeValue)
    if (!principal || principal <= 0) return null
    const monthlyRate = FINANCE_APR / 12
    const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -financeTermMonths))
    return Number.isFinite(payment) ? payment : null
  }, [financeValue, financeTermMonths])

  if (vehicles.length === 0) return null

  const inputClass = 'w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2'
  const inputStyle = { borderColor: style.border, backgroundColor: style.cardBg, color: style.text }

  return (
    <div id="inventory" className="px-4 py-14 sm:px-6 lg:px-8" style={{ backgroundColor: style.bg }}>
      <div className="mx-auto max-w-7xl">
        {rentalAvailable ? (
          <div className="mb-6 inline-flex rounded-full border p-1" style={{ borderColor: style.border }}>
            {(['sale', 'rental'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setMode(option)
                  setHasSearched(true)
                }}
                className="rounded-full px-4 py-2 text-sm font-semibold transition"
                style={
                  mode === option
                    ? { background: `linear-gradient(135deg, ${website.primaryColor}, ${website.secondaryColor})`, color: '#fff' }
                    : { color: style.subtext }
                }
              >
                {option === 'sale' ? 'Comprar' : 'Alquilar'}
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr_1fr]">
          <SurfaceCard className="p-6" style={{ backgroundColor: style.cardBg, borderColor: style.border }}>
            <h3 className="text-lg font-bold tracking-[-0.02em]">¡Busca tu Carro!</h3>
            <form className="mt-4 grid gap-3" onSubmit={handleSearch}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: style.subtext }}>
                  Estado
                </label>
                <select className={`${inputClass} mt-1`} style={inputStyle} value={condition} onChange={(e) => setCondition(e.target.value as typeof condition)}>
                  <option value="all">Nuevo/Usado</option>
                  <option value="new">Nuevo</option>
                  <option value="used">Usado</option>
                  <option value="certified_pre_owned">Certificado</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: style.subtext }}>
                  Marca
                </label>
                <select
                  className={`${inputClass} mt-1`}
                  style={inputStyle}
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value)
                    setModel('')
                  }}
                >
                  <option value="">Todas las Marcas</option>
                  {makes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: style.subtext }}>
                  Modelo
                </label>
                <select className={`${inputClass} mt-1`} style={inputStyle} value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="">Todos los Modelos</option>
                  {models.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: style.subtext }}>
                  Año
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Desde" className={inputClass} style={inputStyle} value={yearMin} onChange={(e) => setYearMin(e.target.value)} />
                  <input type="number" placeholder="Hasta" className={inputClass} style={inputStyle} value={yearMax} onChange={(e) => setYearMax(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: style.subtext }}>
                  Precio
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Desde" className={inputClass} style={inputStyle} value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                  <input type="number" placeholder="Hasta" className={inputClass} style={inputStyle} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
                </div>
              </div>

              {locations.length > 0 ? (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: style.subtext }}>
                    Lugar
                  </label>
                  <select className={`${inputClass} mt-1`} style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)}>
                    <option value="">Todas las Ubicaciones</option>
                    {locations.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="flex items-center gap-2 pt-1">
                <Hash className="h-4 w-4 shrink-0" style={{ color: style.subtext }} />
                <input
                  placeholder="Buscar por código de stock"
                  className={inputClass}
                  style={inputStyle}
                  value={stockCode}
                  onChange={(e) => setStockCode(e.target.value)}
                />
              </div>

              <div className="mt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${website.primaryColor}, ${website.secondaryColor})` }}
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </button>
                {hasSearched ? (
                  <button type="button" onClick={handleReset} className="text-sm font-semibold" style={{ color: style.subtext }}>
                    Limpiar
                  </button>
                ) : null}
              </div>
            </form>
          </SurfaceCard>

          <SurfaceCard className="p-6" style={{ backgroundColor: style.cardBg, borderColor: style.border }}>
            <h3 className="text-lg font-bold tracking-[-0.02em]">Tipos</h3>
            <div className="mt-4 grid gap-2">
              {BODY_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleBodyTypeClick(option.value)}
                  className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition"
                  style={
                    bodyType === option.value
                      ? { borderColor: website.primaryColor, backgroundColor: `${website.primaryColor}12`, color: website.primaryColor }
                      : { borderColor: style.border, color: style.text }
                  }
                >
                  <CarFront className="h-4 w-4 shrink-0" />
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleBodyTypeClick('all')}
                className="mt-1 text-sm font-semibold"
                style={{ color: website.primaryColor }}
              >
                Ver Todos »
              </button>
            </div>
          </SurfaceCard>

          <SurfaceCard className="overflow-hidden p-0" style={{ backgroundColor: style.cardBg, borderColor: style.border }}>
            <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: style.border }}>
              <Sparkles className="h-4 w-4" style={{ color: website.primaryColor }} />
              <h3 className="text-sm font-bold uppercase tracking-[0.14em]">Destacados</h3>
            </div>
            {spotlight ? (
              <div className="grid grid-cols-[80px_1fr] gap-3 p-4">
                <div className="flex flex-col gap-2">
                  {spotlightCandidates.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => setSpotlightId(vehicle.id)}
                      className="h-14 w-full overflow-hidden rounded-lg border-2 transition"
                      style={{ borderColor: spotlight.id === vehicle.id ? website.primaryColor : 'transparent' }}
                    >
                      {vehicle.photoUrls[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={vehicle.photoUrls[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center" style={{ backgroundColor: style.bg }}>
                          <Car className="h-4 w-4 opacity-40" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="overflow-hidden rounded-xl border" style={{ borderColor: style.border }}>
                  <div className="relative h-32 w-full" style={{ backgroundColor: style.bg }}>
                    {spotlight.photoUrls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={spotlight.photoUrls[0]} alt={`${spotlight.year} ${spotlight.make} ${spotlight.model}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <Car className="h-8 w-8 opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="truncate text-sm font-bold">
                      {spotlight.year} {spotlight.make} {spotlight.model}
                    </div>
                    <div className="mt-0.5 text-sm font-black" style={{ color: website.primaryColor }}>
                      {formatPrice(spotlight, spotlight.listingType === 'rental' ? 'rental' : 'sale')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="p-5 text-sm" style={{ color: style.subtext }}>
                Aún no hay vehículos destacados.
              </p>
            )}
          </SurfaceCard>
        </div>

        {hasSearched ? (
          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-[-0.02em]">
                {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
              </h3>
            </div>
            {results.length === 0 ? (
              <SurfaceCard className="p-8 text-center" style={{ backgroundColor: style.cardBg, borderColor: style.border }}>
                <p style={{ color: style.subtext }}>No encontramos vehículos con esos filtros. Intenta ajustar la búsqueda.</p>
              </SurfaceCard>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {results.map((vehicle) => (
                  <SurfaceCard key={vehicle.id} className="overflow-hidden p-0" style={{ backgroundColor: style.cardBg, borderColor: style.border }}>
                    <div className="flex h-44 items-center justify-center border-b" style={{ borderColor: style.border, backgroundColor: style.bg }}>
                      {vehicle.photoUrls[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={vehicle.photoUrls[0]} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="h-full w-full object-cover" />
                      ) : (
                        <Car className="h-10 w-10 opacity-30" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-bold tracking-[-0.02em]">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h4>
                          {vehicle.trim ? (
                            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: style.subtext }}>
                              {vehicle.trim}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                          style={{ borderColor: style.border, color: website.primaryColor }}
                        >
                          {vehicle.condition === 'new' ? 'Nuevo' : vehicle.condition === 'certified_pre_owned' ? 'Certificado' : 'Usado'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-sm" style={{ color: style.subtext }}>
                        <span className="inline-flex items-center gap-1.5">
                          <Gauge className="h-4 w-4" />
                          {vehicle.mileage != null ? `${vehicle.mileage.toLocaleString()} mi` : 'Millaje a consultar'}
                        </span>
                        {vehicle.location ? (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {vehicle.location}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-lg font-black" style={{ color: website.primaryColor }}>
                          {formatPrice(vehicle, mode)}
                        </span>
                        <a
                          href="#contact"
                          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-white"
                          style={{ background: `linear-gradient(135deg, ${website.primaryColor}, ${website.secondaryColor})` }}
                        >
                          {website.ctaPrimaryText}
                        </a>
                      </div>
                    </div>
                  </SurfaceCard>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <SurfaceCard className="p-6" style={{ backgroundColor: style.cardBg, borderColor: style.border }}>
            <h3 className="text-lg font-bold tracking-[-0.02em]">Financia tu Carro</h3>
            <p className="mt-2 text-sm" style={{ color: style.subtext }}>
              Calcula tu cuota estimada completando el valor del vehículo y el plazo de financiamiento.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="number"
                placeholder="Valor del vehículo"
                className={inputClass}
                style={inputStyle}
                value={financeValue}
                onChange={(e) => setFinanceValue(e.target.value)}
              />
              <select
                className={inputClass}
                style={inputStyle}
                value={financeTermMonths}
                onChange={(e) => setFinanceTermMonths(Number(e.target.value))}
              >
                {FINANCE_TERMS_MONTHS.map((months) => (
                  <option key={months} value={months}>
                    {months / 12} años / {months} meses
                  </option>
                ))}
              </select>
            </div>
            {monthlyPayment != null ? (
              <div className="mt-4 rounded-xl border px-4 py-3" style={{ borderColor: website.primaryColor, backgroundColor: `${website.primaryColor}10` }}>
                <div className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: style.subtext }}>
                  Cuota mensual estimada
                </div>
                <div className="mt-1 text-2xl font-black" style={{ color: website.primaryColor }}>
                  ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mes
                </div>
                <div className="mt-1 text-xs" style={{ color: style.subtext }}>
                  Estimado con tasa referencial de {(FINANCE_APR * 100).toFixed(0)}% anual. La tasa final la define tu entidad financiera.
                </div>
              </div>
            ) : null}
          </SurfaceCard>

          <SurfaceCard className="p-6" style={{ backgroundColor: style.cardBg, borderColor: style.border }}>
            <h3 className="text-lg font-bold tracking-[-0.02em]">Vende tu Carro</h3>
            <p className="mt-2 text-sm" style={{ color: style.subtext }}>
              ¿Tienes un vehículo que quieres vender o poner en consignación? Contáctanos y te ayudamos a publicarlo.
            </p>
            <a
              href="#contact"
              className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${website.primaryColor}, ${website.secondaryColor})` }}
            >
              Publica tu vehículo »
            </a>
          </SurfaceCard>
        </div>
      </div>
    </div>
  )
}
