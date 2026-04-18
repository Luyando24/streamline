"use client"

import { useState, useEffect } from "react"
import { 
  Clock, 
  Plus, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Loader2,
  Calendar,
  Timer,
  TimerReset,
  X,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  History,
  Target
} from "lucide-react"
import Link from "next/link"
import { getTimesheets, logTimeEntry, getProjects, getProjectTasks } from "@/lib/actions/projects"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"

export default function TimesheetHubPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const [entryData, projData, taskData] = await Promise.all([
        getTimesheets(),
        getProjects(),
        getProjectTasks()
      ])
      setEntries(entryData)
      setProjects(projData)
      setTasks(taskData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        project_id: formData.get("project_id") as string,
        task_id: formData.get("task_id") as string || undefined,
        hours: Number(formData.get("hours")),
        date: formData.get("date") as string,
        notes: formData.get("notes") as string,
        is_billable: formData.get("is_billable") === "on"
      }

      await logTimeEntry(data)
      toast.success("Time session successfully recorded and attributed.")
      setShowAdd(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const billableTotal = entries.filter(e => e.is_billable).reduce((acc, e) => acc + Number(e.hours), 0)
  const nonBillableTotal = entries.filter(e => !e.is_billable).reduce((acc, e) => acc + Number(e.hours), 0)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <Link 
            href="/projects" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Delivery Hub
          </Link>
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center shadow-lg">
                <Timer className="h-6 w-6" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight text-brand-navy">Time Ledger</h1>
                <p className="text-slate-700 font-medium tracking-tight">Govern professional sessions and audit organizational billable velocity.</p>
             </div>
          </div>
        </div>

        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10"
        >
          <Plus className="h-4 w-4 text-brand-blue-deep" /> Log New Session
        </button>
      </div>

      {/* Analytics Mini-Grid */}
      <div className="grid sm:grid-cols-3 gap-6 px-4">
         <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-50 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
            <div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Billable Hours</div>
               <div className="text-2xl font-black text-brand-navy">{billableTotal} <span className="text-[10px] text-emerald-500">Revenue</span></div>
            </div>
            <Zap className="h-6 w-6 text-emerald-500 opacity-20 relative z-10" />
         </div>
         <div className="p-8 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 h-16 w-16 bg-orange-50 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500" />
            <div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Non-Billable</div>
               <div className="text-2xl font-black text-brand-navy">{nonBillableTotal} <span className="text-[10px] text-orange-500">Admin</span></div>
            </div>
            <History className="h-6 w-6 text-orange-500 opacity-20 relative z-10" />
         </div>
         <div className="p-8 bg-brand-navy rounded-2xl flex items-center justify-between text-white group overflow-hidden relative">
            <div className="absolute top-0 right-0 h-16 w-16 bg-brand-blue-deep rounded-full -mr-8 -mt-8 opacity-20 group-hover:scale-150 transition-transform duration-700" />
            <div>
               <div className="text-[10px] font-black uppercase tracking-widest text-brand-blue-pale mb-1">Efficiency Node</div>
               <div className="text-2xl font-black text-brand-blue-deep">94.2% <span className="text-[10px] text-white/40">Utilization</span></div>
            </div>
            <Sparkles className="h-6 w-6 text-brand-blue-deep opacity-40 relative z-10" />
         </div>
      </div>

      {/* Timesheet Registry */}
      <div className="px-4">
        <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
              <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                 <History className="h-5 w-5 text-brand-blue-deep" /> Session Inventory
              </h2>
              <div className="flex gap-2">
                 <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600">
                    <Calendar className="h-3.5 w-3.5" /> This Billing Cycle
                 </button>
              </div>
           </div>

           <div className="p-4">
              {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4">
                   <Loader2 className="h-10 w-10 animate-spin text-brand-blue-deep" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Synchronizing Timesheet Ledger...</p>
                </div>
              ) : entries.length > 0 ? (
                <div className="space-y-2">
                   {entries.map((e) => (
                     <div key={e.id} className="group p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-slate-50/80 rounded-2xl transition-all">
                        <div className="flex items-center gap-8">
                           <div className={cn(
                             "h-14 w-14 rounded-2xl flex items-center justify-center text-brand-navy font-black text-lg shadow-sm transition-all group-hover:scale-110",
                             e.is_billable ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-100" : "bg-slate-50/80 border-2 border-slate-200"
                           )}>
                              {e.hours}
                           </div>
                           <div className="space-y-1">
                              <h3 className="text-base font-black text-brand-navy leading-tight">{e.project?.title}</h3>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{new Date(e.date).toLocaleDateString()}</span>
                                 <span className="h-1 w-1 rounded-full bg-slate-300" />
                                 <span className="text-[10px] font-black text-brand-blue-deep uppercase tracking-widest">{e.task?.title || "Project Session"}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-14">
                           <div className="hidden lg:block max-w-[300px]">
                              <p className="text-[10px] text-slate-600 font-medium italic line-clamp-2 leading-relaxed">
                                {e.notes || "Professional deliverable session logged by team."}
                              </p>
                           </div>
                           
                           <div className="text-right">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Status</span>
                              <div className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                e.status === 'approved' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50/80 text-slate-600"
                              )}>
                                {e.status}
                              </div>
                           </div>

                           <button className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-200 hover:text-brand-navy hover:shadow-lg transition-all">
                              <MoreVertical className="h-5 w-5" />
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="py-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
                   <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                      <Clock className="h-10 w-10" />
                   </div>
                   <p className="text-sm font-black text-brand-navy italic opacity-50">No professional sessions recorded in this cycle.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Log Time Centered Modal */}
      <IndustrialModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Session Log"
        subtitle="Professional Attributed Time"
        icon={<ShieldCheck className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAdd} className="space-y-12">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Destination Project</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Target Project</label>
                   <select name="project_id" required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                      <option value="">Select organizational workflow</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Deliverable Link (Optional)</label>
                   <select name="task_id" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                      <option value="">Link to specific Kanban task</option>
                      {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                   </select>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Session Metrics</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Session Date</label>
                   <input name="date" type="date" required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Session Duration (Hrs)</label>
                   <input name="hours" type="number" step="0.25" required placeholder="e.g. 1.25" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
             <div className="flex items-center gap-3 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                <input type="checkbox" name="is_billable" defaultChecked className="h-5 w-5 rounded border-slate-200 text-brand-navy focus:ring-brand-navy" />
                <div>
                   <div className="text-xs font-black text-brand-navy">Billable Session</div>
                   <div className="text-[10px] text-slate-600 font-medium">Attributed to project budget and client invoicing.</div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Activity Narrative</h3>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Description of Work</label>
                <textarea name="notes" rows={4} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm resize-none bg-slate-50 placeholder:text-slate-300" placeholder="Detail the professional value delivered in this session..." />
             </div>
           </div>

           <div className="pt-6">
             <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
             >
               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Time Entry"}
             </button>
           </div>
        </form>
      </IndustrialModal>
    </div>
  )
}

function MoreVertical(props: any) {
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
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  )
}

