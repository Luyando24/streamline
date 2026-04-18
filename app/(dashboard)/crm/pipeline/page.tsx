import { 
  ArrowLeft, 
  ChevronRight, 
  Target, 
  Plus, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users,
  Sparkles,
  Zap,
  Target as TargetIcon,
  Search,
  Filter,
  ArrowUpRight,
  MoreVertical,
  Layers,
  LayoutDashboard
} from "lucide-react"
import Link from "next/link"
import { getDeals } from "@/lib/actions/crm"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function PipelineBoardPage() {
  const deals = await getDeals()

  const STAGES = [
    { id: 'prospecting', name: 'Prospecting', color: '#94a3b8' },
    { id: 'qualification', name: 'Qualification', color: '#6366f1' },
    { id: 'proposal', name: 'Proposal', color: '#f59e0b' },
    { id: 'negotiation', name: 'Negotiation', color: '#ec4899' },
    { id: 'closed_won', name: 'Closed Won', color: '#22c55e' }
  ]

  const stageGroups = STAGES.map(stage => ({
    ...stage,
    deals: deals.filter(d => d.stage === stage.id),
    totalValue: deals.filter(d => d.stage === stage.id).reduce((acc, d) => acc + Number(d.value), 0)
  }))

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <Link 
            href="/crm" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Growth Board
          </Link>
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-brand-blue-deep text-white flex items-center justify-center shadow-lg shadow-brand-blue-deep/20">
                <TargetIcon className="h-6 w-6" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight text-brand-navy">Sales Funnel</h1>
                <p className="text-slate-700 font-medium tracking-tight">Visualize your active revenue pipeline and deal velocity.</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm">
             <Filter className="h-4 w-4" /> Filter Funnel
          </button>
          <button className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10">
            <Plus className="h-4 w-4 text-brand-blue-deep" /> Launch Opportunity
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-8 px-4 custom-scrollbar min-h-[70vh]">
        {stageGroups.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80 space-y-6">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
                   <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-navy">{stage.name}</h2>
                   <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{stage.deals.length}</span>
                </div>
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">K {stage.totalValue.toLocaleString()}</div>
             </div>

             <div className={cn(
               "space-y-4 min-h-[500px] border-2 border-dashed border-slate-200 rounded-2xl p-4 transition-all duration-500",
               stage.id === 'closed_won' ? "bg-emerald-50/10 border-emerald-100" : "bg-slate-50/80/20"
             )}>
                {stage.deals.length > 0 ? stage.deals.map((deal) => (
                  <div key={deal.id} className="p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                     <div className="flex justify-between items-start mb-6">
                        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 bg-slate-50/80 px-2 py-0.5 rounded">
                           PO #{deal.id.substring(0, 4)}
                        </div>
                        <button className="text-slate-200 hover:text-brand-navy transition-all"><MoreVertical className="h-4 w-4" /></button>
                     </div>

                     <h3 className="text-sm font-black text-brand-navy leading-tight mb-2 group-hover:text-brand-blue-deep transition-colors line-clamp-2">
                        {deal.title}
                     </h3>
                     
                     <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5 mb-6">
                        <Users className="h-3.5 w-3.5 opacity-50" /> {deal.client.company_name}
                     </div>

                     <div className="flex items-end justify-between border-t border-slate-200 pt-6">
                        <div>
                           <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Value</div>
                           <div className="text-sm font-black text-brand-navy">K {Number(deal.value).toLocaleString()}</div>
                        </div>
                        <div className="flex -space-x-2">
                           <div className="h-7 w-7 rounded-full bg-brand-blue-deep border-2 border-white flex items-center justify-center text-white text-[9px] font-black">
                              {(deal.probability || 0)}%
                           </div>
                           <div className="h-7 w-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-600">
                              <Plus className="h-3 w-3" />
                           </div>
                        </div>
                     </div>
                  </div>
                )) : (
                  <div className="h-40 flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-30">
                     <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                        <Layers className="h-5 w-5" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest">Staging Node Clear</p>
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>

      {/* Pipeline Summary Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-fit bg-brand-navy text-white px-10 py-6 rounded-2xl shadow-2xl shadow-brand-navy/20 flex items-center gap-16 backdrop-blur-xl border border-white/10 z-50">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center">
               <TrendingUp className="h-5 w-5 text-brand-blue-deep" />
            </div>
            <div>
               <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Weighted Forecast</div>
               <div className="text-lg font-black tracking-tight text-brand-blue-deep">K 452,000</div>
            </div>
         </div>
         <div className="h-10 w-px bg-white/10" />
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center">
               <Sparkles className="h-5 w-5 text-brand-blue-deep" />
            </div>
            <div>
               <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Conversion Rate</div>
               <div className="text-lg font-black tracking-tight">14.2%</div>
            </div>
         </div>
         <button className="flex items-center gap-2 px-6 py-3 bg-brand-blue-deep rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue-deep-light transition-all shadow-lg active:scale-95">
           Export Report <ChevronRight className="h-3 w-3" />
         </button>
      </div>
    </div>
  )
}

