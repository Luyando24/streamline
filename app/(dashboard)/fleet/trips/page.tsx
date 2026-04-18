"use client"

import { useState, useEffect } from "react"
import { 
  Navigation, 
  Plus, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Loader2,
  Calendar,
  Fuel,
  Activity,
  X,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  History,
  User,
  MoreVertical
} from "lucide-react"
import Link from "next/link"
import { getTripLogs, startTrip, completeTrip, logFuelFillUp, getVehicles } from "@/lib/actions/fleet"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"

export default function TripLogbookPage() {
  const [trips, setTrips] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [showFuel, setShowFuel] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [tripData, vehicleData] = await Promise.all([
        getTripLogs(),
        getVehicles()
      ])
      setTrips(tripData)
      setVehicles(vehicleData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        vehicle_id: formData.get("vehicle_id") as string,
        purpose: formData.get("purpose") as string,
        destination: formData.get("destination") as string,
        start_mileage: Number(formData.get("start_mileage"))
      }

      await startTrip(data)
      toast.success("Mobility session authorized and logged.")
      setShowAdd(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        vehicle_id: formData.get("vehicle_id") as string,
        liters: Number(formData.get("liters")),
        cost: Number(formData.get("cost")),
        mileage_at_fill: Number(formData.get("mileage_at_fill")),
        fuel_card_no: formData.get("fuel_card_no") as string
      }

      await logFuelFillUp(data)
      toast.success("Fuel fill-up recorded and posted to ledger.")
      setShowFuel(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteTrip = async (id: string, currentMileage: string) => {
    const endMileage = prompt(`Enter end mileage for trip (Current: ${currentMileage}km):`)
    if (!endMileage) return

    toast.promise(
      completeTrip(id, Number(endMileage)),
      {
        loading: "Closing trip log...",
        success: () => {
          fetchData()
          return "Trip successfully completed and mileage updated."
        },
        error: "Failed to close trip log."
      }
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <Link 
            href="/fleet" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Mobility Command
          </Link>
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center shadow-lg">
                <Navigation className="h-6 w-6" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight text-brand-navy">Trip Logbook</h1>
                <p className="text-slate-700 font-medium tracking-tight">Govern vehicle utilization, driver accountability, and mileage logs.</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFuel(true)}
            className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-brand-navy rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-brand-blue-deep transition-all shadow-sm"
          >
            <Fuel className="h-4 w-4 text-brand-blue-deep" /> Record Fuel
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10"
          >
            <Plus className="h-4 w-4 text-brand-blue-deep" /> Authorize Trip
          </button>
        </div>
      </div>

      {/* Trip Registry */}
      <div className="px-4">
        <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
              <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                 <History className="h-5 w-5 text-brand-blue-deep" /> Mobility History
              </h2>
           </div>

           <div className="p-4">
              {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4">
                   <Loader2 className="h-10 w-10 animate-spin text-brand-blue-deep" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Synchronizing Logistics Logbook...</p>
                </div>
              ) : trips.length > 0 ? (
                <div className="space-y-2">
                   {trips.map((trip) => (
                     <div key={trip.id} className="group p-8 flex flex-wrap items-center justify-between gap-8 hover:bg-slate-50/80 rounded-2xl transition-all">
                        <div className="flex items-center gap-8">
                           <div className={cn(
                             "h-16 w-16 rounded-[24px] flex items-center justify-center text-brand-navy font-black text-lg shadow-sm transition-all group-hover:scale-110",
                             trip.status === 'active' ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-100" : "bg-slate-50/80 border-2 border-slate-200"
                           )}>
                              <Navigation className={cn("h-7 w-7", trip.status === 'active' && "animate-pulse")} />
                           </div>
                           <div className="space-y-1">
                              <h3 className="text-xl font-black text-brand-navy leading-tight">{trip.vehicle?.plate_number}</h3>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{new Date(trip.start_time).toLocaleString()}</span>
                                 <span className="h-1 w-1 rounded-full bg-slate-300" />
                                 <span className="text-[10px] font-black text-brand-blue-deep uppercase tracking-widest">{trip.purpose}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-14">
                           <div className="text-right">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Route</span>
                              <div className="text-[11px] font-black text-brand-navy uppercase flex items-center justify-end gap-2">
                                <MapPin className="h-3.5 w-3.5 opacity-30" /> {trip.destination || "Inland Route"}
                              </div>
                           </div>
                           
                           <div className="text-right hidden lg:block">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Driver</span>
                              <div className="text-[10px] font-black text-slate-600 uppercase italic flex items-center justify-end gap-2">
                                <User className="h-3.5 w-3.5" /> {trip.driver?.full_name}
                              </div>
                           </div>

                           <div className="flex items-center gap-3">
                              {trip.status === 'active' ? (
                                <button 
                                  onClick={() => handleCompleteTrip(trip.id, trip.start_mileage)}
                                  className="px-6 py-3 bg-brand-navy text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-brand-navy/10"
                                >
                                  Close Trip
                                </button>
                              ) : (
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                  {trip.end_mileage - trip.start_mileage} km logged
                                </div>
                              )}
                              <button className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-200 hover:text-brand-navy transition-all">
                                 <MoreVertical className="h-5 w-5" />
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="py-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
                   <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                      <Navigation className="h-10 w-10" />
                   </div>
                   <p className="text-sm font-black text-brand-navy italic opacity-50">Logbook empty. No trips recorded.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Authorize Trip Centered Modal */}
      <IndustrialModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Trip Initiation"
        subtitle="Logistics Authorization"
        icon={<ShieldCheck className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleStartTrip} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Operational Unit</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Target Vehicle</label>
                   <select name="vehicle_id" required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                      <option value="">Select unit from deck</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number} — {v.model}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Starting Mileage (km)</label>
                   <input name="start_mileage" type="number" required placeholder="Checking odometer..." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Mission Coordinates</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Logistics Purpose</label>
                   <input name="purpose" required placeholder="e.g. Client Delivery, Site Visit" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Destination Node</label>
                   <input name="destination" required placeholder="e.g. Lusaka East, Copperbelt" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
           </div>

           <div className="pt-6">
             <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1"
             >
               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Deployment"}
             </button>
           </div>
        </form>
      </IndustrialModal>

      {/* Record Fuel Centered Modal */}
      <IndustrialModal
        isOpen={showFuel}
        onClose={() => setShowFuel(false)}
        title="Fuel Log"
        subtitle="Energy Replenishment"
        icon={<Fuel className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleLogFuel} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Fill-up Metrics</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Operational Unit</label>
                   <select name="vehicle_id" required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                      <option value="">Select unit from deck</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number} — {v.model}</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Volume (Liters)</label>
                      <input name="liters" type="number" step="0.01" required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Total Cost (K)</label>
                      <input name="cost" type="number" step="0.01" required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Mileage at Fill-up (km)</label>
                 <input name="mileage_at_fill" type="number" required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Fuel Card / ID</label>
                 <input name="fuel_card_no" placeholder="e.g. PumaCard 4492" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
              </div>
           </div>

           <div className="pt-6">
             <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1"
             >
               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Ledger Posting"}
             </button>
           </div>
        </form>
      </IndustrialModal>
    </div>
  )
}

