import { 
  Building2, 
  Truck, 
  Monitor, 
  Wrench, 
  BarChart3, 
  ShieldCheck, 
  Plus, 
  ArrowUpRight, 
  AlertCircle,
  History,
  Clock,
  Zap,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Archive,
  ArrowDownToLine
} from "lucide-react"
import Link from "next/link"
import { getAssetSummary, getFixedAssets } from "@/lib/actions/assets"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AssetDashboardPage() {
  const summary = await getAssetSummary()
  const assets = await getFixedAssets()

  const stats = [
    { label: "Net Book Value", value: `K ${summary?.netBookValue.toLocaleString()}`, icon: BarChart3, color: "emerald", desc: "Current value of all capital" },
    { label: "Capitalized Items", value: summary?.assetCount, icon: Archive, color: "blue", desc: "Total registered assets" },
    { label: "In Maintenance", value: summary?.maintenanceCount, icon: Wrench, color: summary?.maintenanceCount! > 0 ? "orange" : "emerald", desc: "Items currently being serviced" },
    { label: "Acquisition Cost", value: `K ${summary?.totalCost.toLocaleString()}`, icon: ArrowDownToLine, color: "purple", desc: "Total historical investment" }
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-deep bg-brand-green-pale w-fit px-3 py-1 rounded-full">
            <ShieldCheck className="h-3 w-3" /> Physical Capital Governance
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Fixed Assets</h1>
          <p className="text-slate-700 font-medium tracking-tight">Manage lifecycle, track depreciation, and monitor equipment health.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/assets/maintenance" 
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm"
          >
            <History className="h-4 w-4" /> Service Logs
          </Link>
          <button className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10">
            <Plus className="h-4 w-4 text-brand-green-deep" /> Register Asset
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
        {/* Asset Master Registry Overview */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
                 <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                    <LayoutGrid className="h-5 w-5 text-brand-green-deep" /> Capital Registry
                 </h2>
                 <div className="flex gap-2">
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-brand-navy transition-all"><SearchIcon className="h-4 w-4" /></button>
                 </div>
              </div>

              <div className="p-4">
                 {assets.length > 0 ? (
                   <div className="space-y-2">
                      {assets.slice(0, 8).map((asset: any) => (
                        <div key={asset.id} className="group p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-slate-50/80 rounded-2xl transition-all">
                           <div className="flex items-center gap-6">
                              <div className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-brand-navy text-lg font-black shadow-sm group-hover:scale-110 transition-all">
                                 {asset.name[0]}
                              </div>
                              <div className="space-y-1">
                                 <h3 className="text-base font-black text-brand-navy leading-tight">{asset.name}</h3>
                                 <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{asset.asset_tag}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                                    <span className={cn(
                                       "text-[10px] font-black uppercase tracking-widest",
                                       asset.status === 'active' ? "text-brand-green-deep" : "text-orange-600"
                                    )}>
                                       {asset.status}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-12">
                              <div className="text-right">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Book Value</span>
                                 <div className="text-xl font-black text-brand-navy">K {Number(asset.current_value || asset.purchase_cost).toLocaleString()}</div>
                              </div>
                              
                              <div className="text-right hidden sm:block">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Custodian</span>
                                 <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic flex items-center justify-end gap-2">
                                   <UserIcon className="h-3 w-3" /> {asset.custodian?.full_name || "Unassigned"}
                                 </div>
                              </div>

                              <Link href={`/assets/${asset.id}`} className="p-2 text-slate-200 hover:text-brand-navy transition-all">
                                 <ChevronRight className="h-6 w-6" />
                              </Link>
                           </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                         <Building2 className="h-10 w-10" />
                      </div>
                      <p className="text-sm font-black text-brand-navy italic opacity-50">Zero capitalized assets registered.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar Lifecycle Radar */}
        <div className="space-y-8 animate-in slide-in-from-right duration-700">
           <div className="p-10 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-8">Asset Liquidity</h3>
              
              <div className="space-y-10 mb-10 border-l-2 border-white/5 pl-8 ml-2">
                 <div className="relative">
                    <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                    <div className="text-[11px] font-black uppercase tracking-widest">Active Utilization</div>
                    <div className="text-[10px] opacity-40 mt-1">92% of fleet currently operational</div>
                 </div>
                 <div className="relative">
                    <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-orange-400" />
                    <div className="text-[11px] font-black uppercase tracking-widest">Service Backlog</div>
                    <div className="text-[10px] opacity-40 mt-1">3 units pending annual inspection</div>
                 </div>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                 <Zap className="h-4 w-4 text-brand-green-deep" />
                 <span className="text-[10px] font-bold opacity-60">System Auto-Depreciation Active</span>
              </div>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2">
                 <Sparkles className="h-4 w-4 text-brand-green-deep" /> Condition Intel
              </h3>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <div className="text-xs font-black text-brand-navy mb-1">Upcoming Replacement</div>
                    <div className="text-[10px] text-slate-700 font-medium italic">"Server Rack #002 is approaching year 5 of useful life. Valuation: K12k."</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function SearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

