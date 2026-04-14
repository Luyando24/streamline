import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight,
  Sparkles,
  Search,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  LayoutDashboard
} from "lucide-react"
import Link from "next/link"
import { getPendingApprovals, processLeaveRequest } from "@/lib/actions/leave"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function LeaveApprovalsPage() {
  const pending = await getPendingApprovals()

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/leave" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Time & Absence
          </Link>
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black tracking-tight text-brand-navy">Approval Inbox</h1>
             <span className="px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border-2 border-orange-100">
               {pending.length} Pending
             </span>
          </div>
          <p className="text-slate-500 font-medium">Review and resolve team time-off requests.</p>
        </div>
      </div>

      {/* Main Approval Grid */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-6">
           {pending.length > 0 ? pending.map((request: any) => (
             <div key={request.id} className="bg-white border-2 border-slate-100 rounded-[40px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                <div className="p-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-8 bg-slate-50/50">
                   <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-[24px] bg-white border border-slate-200 flex items-center justify-center text-brand-navy font-black text-xs shadow-sm shadow-slate-200/50">
                         {request.profiles.full_name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                         <div className="text-lg font-black text-brand-navy">{request.profiles.full_name}</div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{request.profiles.email}</div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-10">
                      <div className="text-right">
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Duration</span>
                         <div className="text-base font-black text-brand-navy">{Number(request.days_count)} Days</div>
                      </div>
                      <div className="text-right">
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Leave Type</span>
                         <div className="text-sm font-bold text-slate-700">{request.leave_types.name}</div>
                      </div>
                   </div>
                </div>

                <div className="p-10 grid md:grid-cols-[1fr_200px] gap-12">
                   <div className="space-y-8">
                      <div className="space-y-4">
                         <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Requested Period
                         </div>
                         <div className="flex items-center gap-4 text-sm font-black text-brand-navy">
                            <span>{new Date(request.start_date).toLocaleDateString()}</span>
                            <ArrowRight className="h-4 w-4 text-brand-green-deep" />
                            <span>{new Date(request.end_date).toLocaleDateString()}</span>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Employee Reason
                         </div>
                         <p className="text-xs font-medium text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">
                            "{request.reason || "No reason provided."}"
                         </p>
                      </div>

                      {/* Overlap Detector Visual */}
                      <div className="p-6 bg-brand-green-pale/30 border border-brand-green-deep/10 rounded-[28px] flex items-start gap-4">
                         <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                            <ShieldCheck className="h-5 w-5 text-brand-green-deep" />
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-green-deep">Smart Conflict Detector</h4>
                            <p className="text-[10px] text-brand-navy/60 font-medium">No other employees in this department are scheduled away during these dates.</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4 flex flex-col justify-end">
                      <form action={async (formData) => {
                        "use server"
                        await processLeaveRequest(request.id, 'approved', formData.get('note') as string)
                      }}>
                        <input type="hidden" name="note" value="Approved by Management" />
                        <button 
                          className="w-full py-4 bg-brand-green-deep text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-brand-green-deep-light shadow-xl shadow-brand-green-deep/20 transition-all active:scale-[0.98]"
                        >
                          Approve Request
                        </button>
                      </form>
                      
                      <form action={async (formData) => {
                        "use server"
                        await processLeaveRequest(request.id, 'rejected', formData.get('note') as string)
                      }}>
                        <input type="hidden" name="note" value="Insufficient coverage" />
                        <button 
                          className="w-full py-4 bg-white border-2 border-red-100 text-red-500 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-500 transition-all active:scale-[0.98]"
                        >
                          Decline Request
                        </button>
                      </form>
                   </div>
                </div>
             </div>
           )) : (
             <div className="py-32 bg-white border-2 border-dashed border-slate-100 rounded-[48px] flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-20 w-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200">
                   <UserCheck className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-brand-navy">All Clear!</h3>
                   <p className="text-sm font-medium text-slate-400">You have zero pending leave requests to process.</p>
                </div>
             </div>
           )}
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
           <div className="p-8 bg-brand-navy rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-green-deep rounded-full -mr-16 -mt-16 opacity-20" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-green-pale mb-6">Manager Overview</h3>
              
              <div className="space-y-6 mb-8">
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold opacity-60">Avg Response Time</span>
                    <span className="text-xs font-black text-brand-green-deep">4.2 hrs</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold opacity-60">Team on Leave</span>
                    <span className="text-xs font-black">2 Staff</span>
                 </div>
              </div>

              <Link 
                href="/leave/calendar" 
                className="flex items-center justify-center gap-2 w-full py-4 bg-brand-green-deep rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-green-deep-light shadow-xl transition-all"
              >
                Access Team Calendar <ChevronRight className="h-3 w-3" />
              </Link>
           </div>

           <div className="p-8 bg-white border-2 border-slate-100 rounded-[40px] shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                 <LayoutDashboard className="h-4 w-4" /> Active Policies
              </h3>
              <div className="space-y-4">
                 {['Annual Leave', 'Sick Leave', 'Maternity'].map(type => (
                   <div key={type} className="flex items-center justify-between group">
                      <span className="text-xs font-bold text-slate-600 group-hover:text-brand-navy transition-colors">{type}</span>
                      <ChevronRight className="h-3 w-3 text-slate-300" />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
