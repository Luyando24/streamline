import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter, 
  Users, 
  Sparkles,
  Info,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

async function getAbsences() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  )

  const { data: profile } = await supabase.from('profiles').select('org_id').single()
  
  const { data: absences } = await supabase
    .from('leave_requests')
    .select(`
      *,
      leave_types (name, color),
      profiles!leave_requests_employee_id_fkey (full_name)
    `)
    .eq('org_id', profile?.org_id)
    .eq('status', 'approved')
    .order('start_date', { ascending: true })

  return absences || []
}

export default async function AbsenceCalendarPage() {
  const absences = await getAbsences()

  // Group by month for a clean timeline view (Industrial standard for simple calendars)
  const grouped = absences.reduce((acc: any, a: any) => {
    const month = new Date(a.start_date).toLocaleString('default', { month: 'long', year: 'numeric' })
    if (!acc[month]) acc[month] = []
    acc[month].push(a)
    return acc
  }, {})

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/leave" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Time & Absence
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Absence Calendar</h1>
          <p className="text-slate-700 font-medium">Global timeline of approved team time-off.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm">
             <Filter className="h-4 w-4" /> Filter Team
          </button>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
             <button className="p-2 bg-white rounded-xl shadow-sm"><ChevronLeft className="h-4 w-4 text-brand-navy" /></button>
             <button className="p-2 bg-white rounded-xl shadow-sm"><ChevronRight className="h-4 w-4 text-brand-navy" /></button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-12">
        {/* Timeline View */}
        <div className="space-y-16">
           {Object.keys(grouped).length > 0 ? Object.entries(grouped).map(([month, items]: any) => (
             <div key={month} className="space-y-8">
                <div className="flex items-center gap-6">
                   <h2 className="text-xl font-black text-brand-navy shrink-0">{month}</h2>
                   <div className="h-px w-full bg-slate-100" />
                </div>

                <div className="grid gap-4">
                   {items.map((a: any) => (
                     <div key={a.id} className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-green-deep/20 hover:shadow-xl transition-all duration-500 flex items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                           <div className="flex flex-col items-center justify-center p-3 bg-slate-50/80 border border-slate-200 rounded-[20px] w-20 shadow-inner group-hover:bg-brand-navy group-hover:text-white transition-colors duration-500">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                 {new Date(a.start_date).toLocaleString('default', { month: 'short' })}
                              </span>
                              <span className="text-xl font-black">{new Date(a.start_date).getDate()}</span>
                           </div>
                           
                           <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                 <span className="text-base font-black text-brand-navy">{a.profiles.full_name}</span>
                                 <span 
                                   className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest"
                                   style={{ backgroundColor: `${a.leave_types.color}15`, color: a.leave_types.color }}
                                 >
                                    {a.leave_types.name}
                                 </span>
                              </div>
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2">
                                 <CalendarIcon className="h-3 w-3" /> {new Date(a.start_date).toLocaleDateString()} — {new Date(a.end_date).toLocaleDateString()}
                                 <span className="h-1 w-1 rounded-full bg-slate-300" />
                                 {Number(a.days_count)} Working Days
                              </p>
                           </div>
                        </div>

                        <div className="flex -space-x-3">
                           {[1,2,3].map(i => (
                             <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100" />
                           ))}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )) : (
             <div className="py-40 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                   <CalendarIcon className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-brand-navy">Quiet Period</h3>
                   <p className="text-sm font-medium text-slate-600">No upcoming absences scheduled for this period.</p>
                </div>
             </div>
           )}
        </div>

        {/* Sidebar Mini-Stats */}
        <div className="space-y-8">
           <div className="p-8 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mt-16 opacity-20" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-8">Capacity Radar</h3>
              
              <div className="space-y-8">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold">
                       <span className="opacity-60">Current Availability</span>
                       <span className="text-brand-green-deep">94%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-green-deep" style={{ width: '94%' }} />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold">
                       <span className="opacity-60">Peak Absence Risk</span>
                       <span className="text-orange-400">Low</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: '12%' }} />
                    </div>
                 </div>
              </div>

              <div className="mt-10 p-5 bg-white/5 rounded-[24px] border border-white/10 flex items-start gap-3">
                 <Sparkles className="h-4 w-4 text-brand-green-deep mt-0.5" />
                 <p className="text-[10px] font-medium opacity-60 leading-relaxed">Intelligence based on all approved leave through June 2026.</p>
              </div>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6 flex items-center gap-2">
                 <Users className="h-4 w-4" /> Team Breakdown
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Engineering</span>
                    <span className="text-brand-navy">1 Away</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Marketing</span>
                    <span className="text-brand-navy">0 Away</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>HR & Admin</span>
                    <span className="text-brand-navy">1 Away</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

