import { 
  Warehouse, 
  MapPin, 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  AlertCircle,
  Truck,
  Box,
  LayoutGrid,
  Zap,
  Sparkles,
  ShieldCheck,
  Building2,
  Phone,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { getWarehouses } from "@/lib/actions/inventory"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function WarehouseRegistryPage() {
  const warehouses = await getWarehouses()

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/inventory" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Inventory
          </Link>
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center shadow-lg">
                <Warehouse className="h-6 w-6" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight text-brand-navy">Node Network</h1>
                <p className="text-slate-700 font-medium">Manage your multi-site fulfillment and storage infrastructure.</p>
             </div>
          </div>
        </div>

        <button className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10">
          <Plus className="h-4 w-4 text-brand-green-deep" /> Provision New Facility
        </button>
      </div>

      {/* Network Overview */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-6">
           {warehouses.length > 0 ? (
             <div className="grid sm:grid-cols-2 gap-6">
                {warehouses.map((w) => (
                  <div key={w.id} className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-green-deep/20 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                     <div className="absolute top-0 right-0 h-32 w-32 bg-slate-50/80 rounded-full -mr-16 -mt-16 group-hover:bg-brand-green-pale transition-colors duration-500" />
                     
                     <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                           <div className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-brand-navy group-hover:text-white transition-all duration-500">
                              <Building2 className="h-6 w-6" />
                           </div>
                           <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                              Active
                           </div>
                        </div>

                        <div>
                           <h3 className="text-xl font-black text-brand-navy mb-1 group-hover:text-brand-green-deep transition-colors">{w.name}</h3>
                           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-300" /> {w.location_info || "Regional Logistics Center"}
                           </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                           <div className="space-y-1">
                              <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Storage Load</div>
                              <div className="text-xs font-black text-brand-navy">72% Full</div>
                           </div>
                           <div className="space-y-1 text-right">
                              <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Daily Volume</div>
                              <div className="text-xs font-black text-brand-navy">High</div>
                           </div>
                        </div>

                        <button className="flex items-center justify-center gap-2 w-full py-4 bg-slate-50/80 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-brand-navy hover:text-white transition-all">
                           Inspect Inventory <ChevronRight className="h-3 w-3" />
                        </button>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="py-40 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-24 w-24 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                   <Warehouse className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-brand-navy">Logical Network Offline</h3>
                   <p className="text-sm font-medium text-slate-600">No warehouses have been provisioned for your organization.</p>
                </div>
             </div>
           )}
        </div>

        {/* Global Logistics Sidebar */}
        <div className="space-y-8">
           <div className="p-10 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-8">Supply Chain Risk</h3>
              
              <div className="space-y-8 mb-10">
                 <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center">
                       <Truck className="h-4 w-4 text-brand-green-deep" />
                    </div>
                    <div>
                       <div className="text-[11px] font-black uppercase tracking-widest">In-Transit Status</div>
                       <p className="text-[10px] opacity-60 leading-relaxed mt-1">2 inter-site transfers are currently moving between Lusaka and Copperbelt.</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center">
                       <ShieldCheck className="h-4 w-4 text-brand-green-deep" />
                    </div>
                    <div>
                       <div className="text-[11px] font-black uppercase tracking-widest">Insurance Audit</div>
                       <p className="text-[10px] opacity-60 leading-relaxed mt-1">All facilities meet standard industrial safety and security protocols.</p>
                    </div>
                 </div>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                 <Zap className="h-4 w-4 text-brand-green-deep" />
                 <span className="text-[10px] font-bold opacity-60">Real-time Node Monitoring Active</span>
              </div>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2">
                 <LayoutGrid className="h-4 w-4" /> Transit Overview
              </h3>
              <div className="space-y-5">
                 <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="text-[11px] font-bold text-slate-600">Pending Goods Receipt</div>
                    <span className="text-[10px] font-black text-brand-navy">3 Units</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-slate-600">Outgoing Shipments</div>
                    <span className="text-[10px] font-black text-brand-navy">12 Units</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

