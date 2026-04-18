import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  BarChart3,
  CalendarClock,
  Info,
  History,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { getLeaveStats } from "@/lib/actions/leave"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function LeavePortalPage() {
  const stats = await getLeaveStats()
  
  const balances = stats?.balances || []
  const requests = stats?.requests || []

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-deep bg-brand-green-pale w-fit px-3 py-1 rounded-full">
            <CalendarClock className="h-3 w-3" /> Self-Service Portal
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Time & Absence</h1>
          <p className="text-slate-700 font-medium">Manage your leave requests and track your availability.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/leave/calendar" 
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:text-brand-navy hover:border-slate-300 transition-all shadow-sm"
          >
            <Calendar className="h-4 w-4" /> Absence Calendar
          </Link>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
            <Plus className="h-4 w-4 text-brand-green-deep" /> Request Leave
          </button>
        </div>
      </div>

      {/* Balance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {balances.length > 0 ? balances.map((b: any) => (
          <div key={b.id} className="group relative p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-green-deep/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">
            <div 
              className="absolute top-0 right-0 h-24 w-24 rounded-full -mr-12 -mt-12 opacity-10 transition-transform group-hover:scale-150 duration-700"
              style={{ backgroundColor: b.leave_types.color || '#22c55e' }}
            />
            
            <div className="relative z-10">
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.leave_types.color || '#22c55e' }} />
                  {b.leave_types.name}
               </div>
               <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-4xl font-black text-brand-navy">{Number(b.remaining_days)}</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Days Left</span>
               </div>
               <div className="h-1.5 w-full bg-slate-50/80 rounded-full overflow-hidden mt-6">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${(Number(b.remaining_days) / b.leave_types.base_days) * 100}%`,
                      backgroundColor: b.leave_types.color || '#22c55e'
                    }} 
                  />
               </div>
               <p className="text-[10px] text-slate-600 font-bold mt-4">
                  {b.leave_types.base_days} Days Annual Entitlement
               </p>
            </div>
          </div>
        )) : (
          <div className="lg:col-span-4 p-8 bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
             <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-slate-300">
                <Info className="h-8 w-8" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-black text-brand-navy">No balances found</p>
                <p className="text-[11px] text-slate-600 font-medium">Your leave entitlement has not been initialized for {new Date().getFullYear()}.</p>
             </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Recent Requests */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
                 <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                    <History className="h-5 w-5 text-brand-green-deep" /> Recent Requests
                 </h2>
                 <button className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors">View All History</button>
              </div>

              <div className="p-4">
                 {requests.length > 0 ? (
                   <div className="space-y-2">
                      {requests.map((r: any) => (
                        <div key={r.id} className="group p-5 flex items-center justify-between gap-6 hover:bg-slate-50/80 rounded-2xl transition-all">
                           <div className="flex items-center gap-6">
                              <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
                                r.status === 'approved' ? "bg-emerald-500" : r.status === 'rejected' ? "bg-red-500" : "bg-orange-400"
                              )}>
                                 {r.status === 'approved' ? <CheckCircle2 className="h-6 w-6" /> : r.status === 'rejected' ? <XCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                              </div>
                              <div>
                                 <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-black text-brand-navy">{r.leave_types.name}</span>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-widest">{Number(r.days_count)} Days</span>
                                 </div>
                                 <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                    {new Date(r.start_date).toLocaleDateString()} — {new Date(r.end_date).toLocaleDateString()}
                                 </div>
                              </div>
                           </div>
                           
                           <div className="text-right">
                              <div className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em] mb-1 px-3 py-1 rounded-full w-fit ml-auto",
                                r.status === 'approved' ? "bg-emerald-50 text-emerald-600" : r.status === 'rejected' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                              )}>
                                 {r.status}
                              </div>
                              <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Submitted {new Date(r.created_at).toLocaleDateString()}</div>
                           </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                         <BarChart3 className="h-8 w-8" />
                      </div>
                      <p className="text-[11px] text-slate-600 font-bold italic">No leave requests found in your history.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Info & Guide Sidebar */}
        <div className="space-y-8">
           <div className="p-10 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mb-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-8">Leave Guidelines</h3>
              
              <div className="space-y-8">
                 <div className="flex gap-5">
                    <div className="h-8 w-8 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center">
                       <AlertCircle className="h-4 w-4 text-brand-green-deep" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black uppercase tracking-widest">Advance Notice</h4>
                       <p className="text-[10px] font-medium opacity-60 leading-relaxed">Requests for annual leave should be submitted at least 5 working days in advance.</p>
                    </div>
                 </div>

                 <div className="flex gap-5">
                    <div className="h-8 w-8 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center">
                       <CheckCircle2 className="h-4 w-4 text-brand-green-deep" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black uppercase tracking-widest">Sick Leave</h4>
                       <p className="text-[10px] font-medium opacity-60 leading-relaxed">Ensure a medical certificate is uploaded for sick leave exceeding 2 consecutive days.</p>
                    </div>
                 </div>
              </div>

              <button className="w-full mt-10 py-4 bg-brand-green-deep rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-green-deep-light shadow-xl transition-all shadow-brand-green-deep/20 active:scale-95">
                 Download Policy PDF
              </button>
           </div>

           <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6">Holiday Calendar</h3>
              <div className="space-y-5">
                 <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                       <div className="text-xs font-black text-brand-navy">Labour Day</div>
                       <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">May 1, 2026</div>
                    </div>
                    <span className="text-[9px] font-black text-brand-green-deep bg-brand-green-pale px-2 py-0.5 rounded">PUBLIC</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div>
                       <div className="text-xs font-black text-brand-navy">Africa Day</div>
                       <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">May 25, 2026</div>
                    </div>
                    <span className="text-[9px] font-black text-brand-green-deep bg-brand-green-pale px-2 py-0.5 rounded">PUBLIC</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

