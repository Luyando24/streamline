import { 
  Users, 
  Briefcase, 
  UserPlus, 
  Award, 
  BarChart3, 
  ShieldCheck, 
  Plus, 
  ArrowUpRight, 
  LayoutGrid,
  Archive,
  MoreVertical,
  Layers,
  LayoutDashboard,
  Timer,
  TimerReset,
  Sparkles,
  Zap,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  Building2,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { getHrSummary, getEmployees } from "@/lib/actions/hr"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function HrDashboardPage() {
  const summary = await getHrSummary()
  const employees = await getEmployees()

  const stats = [
    { label: "Total Headcount", value: summary?.totalHeadcount, icon: Users, color: "blue", desc: "Registered team members" },
    { label: "Active Talent", value: summary?.activeCount, icon: UserPlus, color: "emerald", desc: "Currently operational staff" },
    { label: "Open Vacancies", value: summary?.openVacancies, icon: Briefcase, color: "purple", desc: "Active job postings" },
    { label: "Talent Pipeline", value: summary?.totalApplicants, icon: TrendingUp, color: "orange", desc: "New candidate applications" }
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-700 overflow-x-hidden pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue-deep bg-brand-blue-pale w-fit px-3 py-1 rounded-full">
            <ShieldCheck className="h-3 w-3" /> Human Capital Governance
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">HR Suite</h1>
          <p className="text-slate-700 font-medium tracking-tight">Govern the workforce lifecycle, monitor talent development, and scale the organization.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/hr/org-chart" 
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm"
          >
            <Layers className="h-4 w-4" /> Visual Org Chart
          </Link>
          <Link 
            href="/hr/directory?onboard=true"
            className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10"
          >
            <UserPlus className="h-4 w-4 text-brand-blue-deep" /> Onboard Talent
          </Link>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="px-4 flex items-center gap-2 p-2 bg-slate-100/50 border-2 border-slate-200 rounded-2xl w-fit">
         {[
           { label: "Personnel Directory", href: "/hr/directory", icon: Archive },
           { label: "Recruitment Hub", href: "/hr/recruitment", icon: Briefcase },
           { label: "Appraisals Hub", href: "/hr/appraisals", icon: Award },
           { label: "Visual Hierarchy", href: "/hr/org-chart", icon: Layers }
         ].map((item) => {
           const Icon = item.icon
           return (
             <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy hover:bg-white transition-all hover:shadow-sm"
             >
               <Icon className="h-4 w-4 text-brand-blue-deep opacity-40 group-hover:opacity-100" />
               {item.label}
             </Link>
           )
         })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {stats.map((s) => {
          const Icon = s.icon
          const isRecruitment = s.label.includes('Vacancy') || s.label.includes('Pipeline')
          const CardContent = (
            <div className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-blue-deep/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative h-full">
              <div 
                className={cn(
                  "absolute top-0 right-0 h-24 w-24 rounded-full -mr-12 -mt-12 opacity-5 transition-transform group-hover:scale-150 duration-700",
                  s.color === 'emerald' ? "bg-emerald-500" : s.color === 'orange' ? "bg-orange-500" : s.color === 'blue' ? "bg-blue-500" : "bg-purple-500"
                )}
              />
              <div className="relative z-10 text-left">
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

          if (isRecruitment) {
            return (
              <Link key={s.label} href="/hr/recruitment">
                {CardContent}
              </Link>
            )
          }

          return <div key={s.label}>{CardContent}</div>
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-10 px-4">
        {/* Personnel Registry Overview */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
                 <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                    <Archive className="h-5 w-5 text-brand-blue-deep" /> Personnel Registry
                 </h2>
                 <Link href="/hr/directory" className="text-[10px] font-black uppercase tracking-widest text-brand-blue-deep flex items-center gap-2 hover:gap-3 transition-all">
                    Full Directory <ChevronRight className="h-3 w-3" />
                 </Link>
              </div>

              <div className="p-4">
                 {employees.length > 0 ? (
                   <div className="space-y-2">
                      {employees.slice(0, 8).map((emp: any) => (
                        <div key={emp.id} className="group p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-slate-50/80 rounded-2xl transition-all">
                           <div className="flex items-center gap-6">
                              <div className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-brand-navy text-lg font-black shadow-sm group-hover:scale-110 transition-all overflow-hidden bg-slate-100">
                                 {emp.profile?.avatar_url ? (
                                    <img src={emp.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                                 ) : (
                                    emp.profile?.full_name?.[0] || '?'
                                 )}
                              </div>
                              <div className="space-y-1">
                                 <h3 className="text-base font-black text-brand-navy leading-tight">{emp.profile?.full_name}</h3>
                                 <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{emp.department || "Unassigned"}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                                    <span className={cn(
                                       "text-[10px] font-black uppercase tracking-widest",
                                       emp.status === 'active' ? "text-brand-blue-deep" : "text-orange-600"
                                    )}>
                                       {emp.status}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-12">
                              <div className="text-right hidden sm:block">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Join Date</span>
                                 <div className="text-xs font-black text-brand-navy">{new Date(emp.join_date).toLocaleDateString('en-GB')}</div>
                              </div>
                              
                              <div className="text-right hidden lg:block">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Contract</span>
                                 <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{emp.contract_type}</div>
                              </div>

                              <Link href={`/hr/directory/${emp.id}`} className="p-2 text-slate-200 hover:text-brand-navy transition-all">
                                 <ChevronRight className="h-6 w-6" />
                              </Link>
                           </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                         <Users className="h-10 w-10" />
                      </div>
                      <p className="text-sm font-black text-brand-navy italic opacity-50">Personnel database is currently clear.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar Workforce Radar */}
        <div className="space-y-8 animate-in slide-in-from-right duration-700">
           <div className="p-10 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-blue-deep rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue-pale mb-8">Talent Readiness</h3>
              
              <div className="space-y-10 mb-10 border-l-2 border-white/5 pl-8 ml-2">
                 <div className="relative">
                    <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-brand-blue-deep shadow-[0_0_10px_rgba(34,197,94,1)]" />
                    <div className="text-[11px] font-black uppercase tracking-widest">Retention index</div>
                    <div className="text-[10px] opacity-40 mt-1">94% employee satisfaction rate</div>
                 </div>
                 <div className="relative">
                    <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white/20" />
                    <div className="text-[11px] font-black uppercase tracking-widest">Up-skilling reach</div>
                    <div className="text-[10px] opacity-40 mt-1">12 training certifications pending</div>
                 </div>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                 <Zap className="h-4 w-4 text-brand-blue-deep" />
                 <span className="text-[10px] font-bold opacity-60">System HR Governance Active</span>
              </div>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2">
                 <Sparkles className="h-4 w-4 text-brand-blue-deep" /> Culture Intel
              </h3>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <div className="text-xs font-black text-brand-navy mb-1">Talent Spotlight</div>
                    <div className="text-[10px] text-slate-700 font-medium italic">"3 members from Engineering are due for their annual performance review this cycle."</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

