import { 
  Truck, 
  MapPin, 
  Fuel, 
  Wrench, 
  BarChart3, 
  ShieldCheck, 
  Plus, 
  ArrowUpRight, 
  Navigation,
  History,
  Clock,
  Zap,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Archive,
  ArrowDownToLine,
  Activity,
  User,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { getFleetSummary, getVehicles } from "@/lib/actions/fleet"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function FleetDashboardPage() {
  const summary = await getFleetSummary()
  const vehicles = await getVehicles()

  const stats = [
    { label: "Operational Units", value: summary?.fleetCount, icon: Truck, color: "blue", desc: "Total registered fleet" },
    { label: "Active Trips", value: summary?.activeCount, icon: Navigation, color: "emerald", desc: "Units currently in transit" },
    { label: "Fleet Mileage", value: `${(summary?.totalFleetMileage! / 1000).toFixed(1)}k km`, icon: Activity, color: "purple", desc: "Aggregate distance traveled" },
    { label: "Fuel Burn (MTD)", value: `K ${summary?.totalFuelSpend.toLocaleString()}`, icon: Fuel, color: "orange", desc: "Month-to-date fuel spend" }
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700 overflow-x-hidden pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-deep bg-brand-green-pale w-fit px-3 py-1 rounded-full">
            <ShieldCheck className="h-3 w-3" /> Industrial Mobility Governance
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Fleet</h1>
          <p className="text-slate-700 font-medium tracking-tight">Govern logistics, track efficiency, and monitor organizational mobility.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/fleet/trips" 
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm"
          >
            <History className="h-4 w-4" /> Trip Logbook
          </Link>
          <button className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10">
            <Plus className="h-4 w-4 text-brand-green-deep" /> Provision Vehicle
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-green-deep/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative">
              <div 
                className={cn(
                  "absolute top-0 right-0 h-24 w-24 rounded-full -mr-12 -mt-12 opacity-5 transition-transform group-hover:scale-150 duration-700",
                  s.color === 'emerald' ? "bg-emerald-500" : s.color === 'orange' ? "bg-orange-500" : s.color === 'blue' ? "bg-blue-500" : "bg-purple-500"
                )}
              />
              <div className="relative z-10">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-sm",
                  s.color === 'emerald' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" :
                  s.color === 'blue' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
                  s.color === 'orange' ? "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white" :
                  "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">{s.label}</p>
                <h3 className="text-2xl font-black text-brand-navy mb-2">{s.value}</h3>
                <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{s.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-10 px-4">
        {/* Fleet Unit Deck Overview */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
                 <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                    <Truck className="h-5 w-5 text-brand-green-deep" /> Active Unit Deck
                 </h2>
                 <button className="text-[10px] font-black uppercase tracking-widest text-brand-green-deep flex items-center gap-2 hover:gap-3 transition-all">
                    Full Inventory <ChevronRight className="h-3 w-3" />
                 </button>
              </div>

              <div className="p-4 grid sm:grid-cols-2 gap-4">
                 {vehicles.length > 0 ? vehicles.map((v: any) => (
                    <div key={v.id} className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-green-deep/20 hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                       <div className="relative z-10 space-y-6">
                          <div className="flex justify-between items-start">
                             <div className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-brand-navy group-hover:text-white transition-all">
                                <Truck className="h-7 w-7" />
                             </div>
                             <div className={cn(
                               "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                               v.status === 'available' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                               v.status === 'active' ? "bg-blue-50 text-blue-600 border-blue-100" :
                               "bg-slate-50/80 text-slate-600 border-slate-200"
                             )}>
                                {v.status}
                             </div>
                          </div>

                          <div>
                             <h3 className="text-lg font-black text-brand-navy mb-1 group-hover:text-brand-green-deep transition-colors">{v.plate_number}</h3>
                             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="h-3.5 w-3.5 opacity-50" /> {v.model}
                             </p>
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                             <div className="space-y-1">
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Mileage</div>
                                <div className="text-sm font-black text-brand-navy">{Number(v.current_mileage).toLocaleString()} km</div>
                             </div>
                             <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50/80 text-slate-300 hover:text-brand-navy hover:bg-slate-100 transition-all">
                                <BarChart3 className="h-4 w-4" />
                             </button>
                          </div>
                       </div>
                    </div>
                 )) : (
                    <div className="col-span-2 py-24 flex flex-col items-center justify-center text-center space-y-6">
                       <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                          <Truck className="h-10 w-10" />
                       </div>
                       <p className="text-sm font-black text-brand-navy italic opacity-50">Zero operational units provisioned.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar Logistics Radar */}
        <div className="space-y-8 animate-in slide-in-from-right duration-700">
           <div className="p-10 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-8">Mobility Intelligence</h3>
              
              <div className="space-y-10 mb-10 border-l-2 border-white/5 pl-8 ml-2">
                 <div className="relative">
                    <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-brand-green-deep shadow-[0_0_10px_rgba(34,197,94,1)]" />
                    <div className="text-[11px] font-black uppercase tracking-widest">Fleet Readiness</div>
                    <div className="text-[10px] opacity-40 mt-1">84% of units ready for deployment</div>
                 </div>
                 <div className="relative">
                    <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-orange-400" />
                    <div className="text-[11px] font-black uppercase tracking-widest">Pending Services</div>
                    <div className="text-[10px] opacity-40 mt-1">2 units approaching 5,000km threshold</div>
                 </div>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                 <Fuel className="h-4 w-4 text-brand-green-deep" />
                 <span className="text-[10px] font-bold opacity-60">Avg. 8.4L / 100km fleet efficiency</span>
              </div>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2">
                 <AlertTriangle className="h-4 w-4 text-brand-green-deep" /> Maintenance Intel
              </h3>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <div className="text-xs font-black text-brand-navy mb-1">Preventative Alert</div>
                    <div className="text-[10px] text-slate-700 font-medium italic">"Isuzu D-Max ABC-102 has logged 4,892km since last major service."</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

