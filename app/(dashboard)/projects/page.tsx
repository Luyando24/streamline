import { 
  Briefcase, 
  Target, 
  Clock, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  Calendar, 
  BarChart3,
  Zap,
  ChevronRight,
  Plus,
  Sparkles,
  LayoutGrid,
  Archive,
  MoreVertical,
  Layers,
  LayoutDashboard,
  Timer,
  TimerReset
} from "lucide-react"
import Link from "next/link"
import { getProjectSummary, getProjects } from "@/lib/actions/projects"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function ProjectDashboardPage() {
  const summary = await getProjectSummary()
  const projects = await getProjects()

  const stats = [
    { label: "Active Engagements", value: summary?.activeProjects, icon: Briefcase, color: "emerald", desc: "Currently running projects" },
    { label: "Billable Utilization", value: `${summary?.totalBillable} hrs`, icon: Timer, color: "blue", desc: "Revenue-generating time" },
    { label: "Internal/Admin Time", value: `${summary?.totalNonBillable} hrs`, icon: TimerReset, color: "orange", desc: "Non-billable effort" },
    { label: "Portfolio Budget", value: `K ${summary?.totalBudget.toLocaleString()}`, icon: BarChart3, color: "purple", desc: "Total value of projects" }
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700 overflow-x-hidden pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-deep bg-brand-green-pale w-fit px-3 py-1 rounded-full">
            <Zap className="h-3 w-3" /> Professional Service Delivery
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Projects</h1>
          <p className="text-slate-700 font-medium tracking-tight">Govern service delivery, track billable velocity, and monitor project health.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/projects/timesheets" 
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm"
          >
            <Clock className="h-4 w-4" /> Weekly Timesheets
          </Link>
          <button className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10">
            <Plus className="h-4 w-4 text-brand-green-deep" /> Provision Project
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
        {/* Active Project Grid Overview */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
                 <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                    <Target className="h-5 w-5 text-brand-green-deep" /> Active Workflows
                 </h2>
                 <Link href="/projects/kanban" className="text-[10px] font-black uppercase tracking-widest text-brand-green-deep flex items-center gap-2 hover:gap-3 transition-all">
                    Visual Pipeline <ChevronRight className="h-3 w-3" />
                 </Link>
              </div>

              <div className="p-4">
                 {projects.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                       {projects.map((project: any) => (
                         <div key={project.id} className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-green-deep/20 hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-24 w-24 bg-slate-50/80 rounded-full -mr-12 -mt-12 group-hover:bg-brand-green-pale transition-colors duration-500" />
                            <div className="relative z-10 space-y-6">
                               <div className="flex justify-between items-start">
                                  <div className="h-12 w-12 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-brand-navy group-hover:text-white transition-all">
                                     <Briefcase className="h-5 w-5" />
                                  </div>
                                  <div className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    project.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50/80 text-slate-600 border-slate-200"
                                  )}>
                                     {project.status}
                                  </div>
                               </div>

                               <div>
                                  <h3 className="text-base font-black text-brand-navy mb-1 group-hover:text-brand-green-deep transition-colors line-clamp-1">{project.title}</h3>
                                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                     <Users className="h-3.5 w-3.5 opacity-50" /> {project.client?.company_name || "Internal"}
                                  </p>
                               </div>

                               <div className="space-y-4 pt-6 border-t border-slate-200">
                                  <div className="flex justify-between items-end">
                                     <div className="space-y-1">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Budget Usage</div>
                                        <div className="text-xs font-black text-brand-navy">K {Number(project.budget).toLocaleString()}</div>
                                     </div>
                                     <div className="text-[10px] font-black text-brand-green-deep">32%</div>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-50/80 rounded-full overflow-hidden">
                                     <div className="h-full bg-brand-green-deep" style={{ width: '32%' }} />
                                  </div>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-1000">
                       <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                          <Archive className="h-10 w-10" />
                       </div>
                       <div className="space-y-1">
                         <p className="text-sm font-black text-brand-navy italic opacity-50">Empty hangar. No active projects provisioned.</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar Delivery Radar */}
        <div className="space-y-8 animate-in slide-in-from-right duration-700">
           <div className="p-10 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-8">Delivery Efficiency</h3>
              
              <div className="space-y-10 mb-10 border-l-2 border-white/5 pl-8 ml-2">
                 <div className="relative">
                    <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-brand-green-deep shadow-[0_0_10px_rgba(34,197,94,1)]" />
                    <div className="text-[11px] font-black uppercase tracking-widest">Billable velocity</div>
                    <div className="text-[10px] opacity-40 mt-1">Increasing at 52 billable hrs / wk</div>
                 </div>
                 <div className="relative">
                    <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white/20" />
                    <div className="text-[11px] font-black uppercase tracking-widest">Milestone integrity</div>
                    <div className="text-[10px] opacity-40 mt-1">94% of tasks completed on schedule</div>
                 </div>
              </div>

              <Link href="/projects/timesheets" className="w-full py-5 bg-white/5 border border-white/10 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 shadow-xl transition-all flex items-center justify-center gap-3">
                Log Professional Session <Sparkles className="h-4 w-4 text-brand-green-deep" />
              </Link>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2">
                 <Timer className="h-4 w-4 text-brand-green-deep" /> Burn Intensity
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between group cursor-pointer p-1">
                    <span className="text-xs font-bold text-slate-600 group-hover:text-brand-navy transition-colors">Total Portfolio Burn</span>
                    <span className="text-[10px] font-black text-brand-navy">ZMW 12.4k</span>
                 </div>
                 <div className="pt-4 border-t border-slate-200">
                    <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic">
                       "Average team capacity utilization is currently at 78% for this billing cycle."
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

