import { 
  Package, 
  Warehouse, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Boxes,
  Zap,
  ChevronRight,
  Sparkles,
  Layers,
  Archive,
  ArrowRightLeft
} from "lucide-react"
import Link from "next/link"
import { getInventoryStats, getInventoryItems } from "@/lib/actions/inventory"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function InventoryDashboardPage() {
  const stats = await getInventoryStats()
  const items = await getInventoryItems()

  const summaryCards = [
    { label: "Inventory Asset Value", value: `ZMW ${stats?.totalValue.toLocaleString()}`, icon: BarChart3, color: "emerald", desc: "Total value on hand" },
    { label: "Active SKUs", value: stats?.totalItems, icon: Layers, color: "blue", desc: "Registered products" },
    { label: "Reorder Radar", value: stats?.lowStockCount, icon: AlertTriangle, color: stats?.lowStockCount! > 0 ? "orange" : "emerald", desc: "Items below threshold" },
    { label: "Warehouse Nodes", value: "3", icon: Warehouse, color: "purple", desc: "Global fulfillment sites" }
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-deep bg-brand-green-pale w-fit px-3 py-1 rounded-full">
            <Zap className="h-3 w-3" /> Commercial Logistics
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Inventory</h1>
          <p className="text-slate-700 font-medium">Real-time stock tracking, multi-node fulfillment, and valuation.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/inventory/warehouses" 
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm"
          >
            <Warehouse className="h-4 w-4" /> Warehouses
          </Link>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
            <Plus className="h-4 w-4 text-brand-green-deep" /> Register SKU
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((s) => {
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

      <div className="grid lg:grid-cols-3 gap-10">
        {/* SKU Master Registry */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
                 <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                    <Boxes className="h-5 w-5 text-brand-green-deep" /> SKU Master List
                 </h2>
                 <div className="flex gap-2">
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-brand-navy transition-all"><Search className="h-4 w-4" /></button>
                 </div>
              </div>

              <div className="p-4">
                 {items.length > 0 ? (
                   <div className="space-y-2">
                      {items.map((item: any) => {
                         const totalStock = item.stock_levels?.reduce((acc: any, s: any) => acc + Number(s.quantity), 0) || 0
                         const isLow = totalStock <= Number(item.reorder_level || 0)

                         return (
                           <div key={item.id} className="group p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-slate-50/80 rounded-2xl transition-all">
                              <div className="flex items-center gap-6">
                                 <div className={cn(
                                   "h-14 w-14 rounded-2xl flex items-center justify-center text-brand-navy font-black text-[10px] shadow-sm transition-all group-hover:scale-110",
                                   isLow ? "bg-orange-50 border-2 border-orange-100 text-orange-600" : "bg-white border-2 border-slate-200"
                                 )}>
                                    {item.sku.substring(0, 3)}
                                 </div>
                                 <div className="space-y-1">
                                    <h3 className="text-base font-black text-brand-navy leading-tight">{item.name}</h3>
                                    <div className="flex items-center gap-3">
                                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{item.sku}</span>
                                       <span className="h-1 w-1 rounded-full bg-slate-200" />
                                       <span className="text-[10px] font-black text-brand-green-deep uppercase tracking-widest">{item.category || "General"}</span>
                                    </div>
                                 </div>
                              </div>
                              
                              <div className="flex items-center gap-12">
                                 <div className="text-right">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Global Stock</span>
                                    <div className={cn(
                                      "text-xl font-black",
                                      isLow ? "text-orange-600" : "text-brand-navy"
                                    )}>
                                      {totalStock} <span className="text-[10px] uppercase font-bold text-slate-600 opacity-60 ml-0.5">{item.unit}</span>
                                    </div>
                                 </div>
                                 
                                 <div className="text-right hidden sm:block">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Valuation (Avg)</span>
                                    <div className="text-sm font-black text-brand-navy italic">
                                      K {item.stock_levels?.[0]?.avg_cost?.toLocaleString() || "0"}
                                    </div>
                                 </div>

                                 <Link href={`/inventory/items/${item.id}`} className="p-2 text-slate-200 hover:text-brand-navy transition-all">
                                    <ChevronRight className="h-6 w-6" />
                                 </Link>
                              </div>
                           </div>
                         )
                      })}
                   </div>
                 ) : (
                   <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-1000">
                      <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                         <Archive className="h-10 w-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-brand-navy italic opacity-50">Empty hangar. No SKUs registered.</p>
                        <button className="text-[10px] font-black uppercase tracking-widest text-brand-green-deep flex items-center gap-2 hover:gap-3 transition-all justify-center mx-auto mt-4">
                           Onboard Your First Product <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar Mini-Ops */}
        <div className="space-y-8">
           <div className="p-10 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-8">Stock Movements</h3>
              
              <div className="space-y-8 mb-10">
                 <div className="flex items-center gap-5">
                    <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">
                       <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                       <div className="text-xs font-black">Stock Inbound</div>
                       <div className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Mark goods as received</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-5">
                    <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">
                       <ArrowDownLeft className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                       <div className="text-xs font-black">Dispatch Stock</div>
                       <div className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Inventory release</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-5">
                    <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">
                       <ArrowRightLeft className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                       <div className="text-xs font-black">Site Transfer</div>
                       <div className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Inter-warehouse logistics</div>
                    </div>
                 </div>
              </div>

              <button className="w-full py-5 bg-brand-green-deep rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-brand-green-deep-light shadow-xl transition-all shadow-brand-green-deep/20 active:scale-95 group">
                <span className="flex items-center justify-center gap-3">Register Movement <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" /></span>
              </button>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6 flex items-center gap-2">
                 <History className="h-4 w-4 text-brand-green-deep" /> Warehouse Nodes
              </h3>
              <div className="space-y-4">
                 {['Lusaka Main', 'Copperbelt Site', 'Transit Hub'].map(hub => (
                   <div key={hub} className="flex items-center justify-between group cursor-pointer p-1">
                      <span className="text-xs font-bold text-slate-600 group-hover:text-brand-navy transition-colors">{hub}</span>
                      <ChevronRight className="h-3 w-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

