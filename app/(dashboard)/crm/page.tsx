import { 
  Users, 
  Target, 
  TrendingUp, 
  Briefcase, 
  ArrowUpRight, 
  PhoneCall, 
  Mail, 
  Calendar,
  Zap,
  ChevronRight,
  Plus,
  BarChart3,
  Search,
  Filter,
  Sparkles,
  UserPlus
} from "lucide-react"
import Link from "next/link"
import { getCRMSummary, getLeads, getDeals } from "@/lib/actions/crm"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function CRMDashboardPage() {
  const summary = await getCRMSummary()
  const leads = await getLeads()
  const deals = await getDeals()

  const stats = [
    { label: "Active Revenue Pipeline", value: `K ${summary?.pipelineValue.toLocaleString()}`, icon: TrendingUp, color: "emerald", desc: "Total value of open deals" },
    { label: "Market Prospects", value: summary?.leadCount, icon: Target, color: "orange", desc: "Unqualified leads in funnel" },
    { label: "Onboarded Clients", value: summary?.clientCount, icon: Users, color: "blue", desc: "Confirmed commercial accounts" },
    { label: "Pipeline Confidence", value: `K ${summary?.weightedValue.toLocaleString()}`, icon: Zap, color: "purple", desc: "Risk-adjusted revenue forecast" }
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-deep bg-brand-green-pale w-fit px-3 py-1 rounded-full">
            <TrendingUp className="h-3 w-3" /> Growth Command Center
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Relationships</h1>
          <p className="text-slate-700 font-medium">Manage leads, track deals, and forecast organizational revenue.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/crm/pipeline" 
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm"
          >
            <Target className="h-4 w-4" /> Sales Funnel
          </Link>
          <Link 
            href="/crm/clients"
            className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4 text-brand-green-deep" /> New Client
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Deal Pipeline Summary */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
                 <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-brand-green-deep" /> Active Opportunities
                 </h2>
                 <div className="flex gap-2">
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-brand-navy transition-all"><Search className="h-4 w-4" /></button>
                 </div>
              </div>

              <div className="p-4">
                 {deals.length > 0 ? (
                    <div className="space-y-3">
                       {deals.slice(0, 5).map((deal: any) => (
                         <div key={deal.id} className="group p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-slate-50/80 rounded-2xl transition-all">
                            <div className="flex items-center gap-6">
                               <div className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-brand-navy font-black text-[10px] shadow-sm transition-all group-hover:scale-110">
                                  {deal.client.company_name[0]}
                               </div>
                               <div className="space-y-1">
                                  <h3 className="text-base font-black text-brand-navy leading-tight">{deal.title}</h3>
                                  <div className="flex items-center gap-3">
                                     <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{deal.client.company_name}</span>
                                     <span className="h-1 w-1 rounded-full bg-slate-200" />
                                     <span className="text-[10px] font-black text-brand-green-deep uppercase tracking-widest">{deal.stage.replace('_', ' ')}</span>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="flex items-center gap-12">
                               <div className="text-right">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Deal Value</span>
                                  <div className="text-xl font-black text-brand-navy">K {Number(deal.value).toLocaleString()}</div>
                               </div>
                               
                               <div className="text-right">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Forecast Close</span>
                                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                                    {new Date(deal.expected_close_date).toLocaleDateString('en-GB')}
                                  </div>
                               </div>

                               <Link href={`/crm/deals/${deal.id}`} className="p-2 text-slate-200 hover:text-brand-navy transition-all">
                                  <ChevronRight className="h-6 w-6" />
                                </Link>
                            </div>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                       <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                          <BarChart3 className="h-10 w-10" />
                       </div>
                       <p className="text-sm font-black text-brand-navy italic opacity-50">No active deals in the current pipeline.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar Activity Radar */}
        <div className="space-y-8">
           <div className="p-10 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mb-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-8">Interaction Radar</h3>
              
              <div className="space-y-8 mb-10">
                 <div className="flex items-center gap-5">
                    <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center">
                       <PhoneCall className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                       <div className="text-xs font-black">Call Logs</div>
                       <div className="text-[9px] font-bold opacity-40 uppercase tracking-widest">12 today</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-5">
                    <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center">
                       <Mail className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                       <div className="text-xs font-black">Email Track</div>
                       <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">45 outbound</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-5">
                    <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center">
                       <Calendar className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                       <div className="text-xs font-black">Meetings</div>
                       <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">3 scheduled</span>
                    </div>
                 </div>
              </div>

              <Link 
                href="/crm/interactions" 
                className="w-full py-5 bg-brand-green-deep rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-brand-green-deep-light shadow-xl transition-all shadow-brand-green-deep/20 active:scale-95 flex items-center justify-center gap-3"
              >
                Launch Interaction Log <Sparkles className="h-4 w-4" />
              </Link>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6 flex items-center gap-2">
                 <Target className="h-4 w-4 text-brand-green-deep" /> Conversion Pulse
              </h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-xs mb-2 text-slate-700 font-black">
                       <span>Qualified Leads</span>
                       <span className="text-brand-navy">32%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50/80 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-green-deep" style={{ width: '32%' }} />
                    </div>
                 </div>
                 <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic">
                    "Your lead-to-client conversion velocity has increased by 12% this month."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

