"use client"

import { useState, useEffect } from "react"
import { 
  TrendingUp, 
  Award, 
  Target, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter,
  ArrowUpRight,
  MoreVertical,
  Layers,
  Sparkles,
  Zap,
  LayoutDashboard,
  TimerReset,
  GraduationCap,
  Users,
  Activity,
  AlertCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { getAppraisals, updateAppraisal, deleteHrRecord } from "@/lib/actions/hr"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"
import { toast } from "sonner"

export default function PerformanceAppraisalsPage() {
  const [appraisals, setAppraisals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInitiate, setShowInitiate] = useState(false)
  const [selectedAppraisal, setSelectedAppraisal] = useState<any>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const data = await getAppraisals()
      setAppraisals(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateAppraisal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppraisal) return
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        rating: parseInt(formData.get("rating") as string),
        feedback: formData.get("feedback"),
        goals: formData.get("goals"),
        status: formData.get("status")
      }
      await updateAppraisal(selectedAppraisal.id, data)
      toast.success("Audit records synchronized.")
      setShowEdit(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAppraisal = async () => {
    if (!selectedAppraisal) return
    if (!confirm("Are you sure you want to purge this audit record?")) return
    setIsSubmitting(true)
    try {
      await deleteHrRecord(selectedAppraisal.id, 'hr_appraisals')
      toast.success("Audit record purged.")
      setShowEdit(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const avgRating = appraisals.length > 0
    ? (appraisals.reduce((acc, a) => acc + a.rating, 0) / appraisals.length).toFixed(1)
    : "0.0"

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue-deep bg-brand-blue-pale w-fit px-3 py-1 rounded-full">
            <Zap className="h-3 w-3" /> Professional Growth Audit
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Appraisals</h1>
          <p className="text-slate-700 font-medium tracking-tight">Govern organizational talent performance, ratings, and growth metrics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowInitiate(true)}
            className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 shadow-brand-navy/10"
          >
            <Plus className="h-4 w-4 text-brand-blue-deep" /> Initiate Cycle
          </button>
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-blue-deep/20 hover:shadow-xl transition-all duration-500 overflow-hidden relative">
            <div className="relative z-10">
               <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
                  <TrendingUp className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Average Integrity</p>
               <h3 className="text-2xl font-black text-brand-navy mb-2">{avgRating} <span className="text-slate-300 text-sm">/ 5.0</span></h3>
            </div>
         </div>
         <div className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-blue-deep/20 hover:shadow-xl transition-all duration-500 overflow-hidden relative">
            <div className="relative z-10">
               <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm">
                  <Activity className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Audit Coverage</p>
               <h3 className="text-2xl font-black text-brand-navy mb-2">{appraisals.length} <span className="text-slate-300 text-sm">Audits</span></h3>
            </div>
         </div>
         <div className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-blue-deep/20 hover:shadow-xl transition-all duration-500 overflow-hidden relative">
            <div className="relative z-10">
               <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 shadow-sm">
                  <AlertCircle className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Pending Sync</p>
               <h3 className="text-2xl font-black text-brand-navy mb-2">0 <span className="text-slate-300 text-sm">Due</span></h3>
            </div>
         </div>
         <div className="group p-8 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-brand-blue-deep rounded-full -mr-12 -mt-12 opacity-20" />
            <div className="relative z-10">
               <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                  <ShieldCheck className="h-6 w-6 text-brand-blue-deep" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue-pale mb-1">System Status</p>
               <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Governance</h3>
            </div>
         </div>
      </div>

      {/* Main Audit Ledger */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
         <div className="p-8 border-b border-slate-200 flex flex-wrap items-center justify-between gap-6 bg-slate-50/80">
            <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
               <Award className="h-6 w-6 text-brand-blue-deep" /> Growth Audit Ledger
            </h2>
            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="Filter by talent..." className="pl-11 pr-5 py-2.5 text-xs border-2 border-slate-200 rounded-xl focus:border-brand-blue-deep focus:outline-none bg-white font-bold w-64" />
               </div>
            </div>
         </div>

         <div className="p-4">
            {isLoading ? (
               <div className="py-32 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-brand-blue-deep" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Decrypting Talent Audits...</p>
               </div>
            ) : appraisals.length > 0 ? (
               <div className="grid gap-2">
                  {appraisals.map((rev) => (
                     <div key={rev.id} className="group p-8 flex flex-wrap items-center justify-between gap-8 hover:bg-slate-50/80 rounded-2xl transition-all border-b-2 border-transparent hover:border-brand-blue-deep/20">
                        <div className="flex items-center gap-8">
                           <div className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center font-black text-xl text-brand-navy shadow-sm group-hover:bg-brand-navy group-hover:text-white transition-all">
                              {rev.rating}<span className="text-[10px] opacity-40">/5</span>
                           </div>
                           <div className="space-y-1">
                              <h3 className="text-lg font-black text-brand-navy leading-tight">{rev.employee?.profile?.full_name}</h3>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-black text-brand-blue-deep uppercase tracking-widest">{new Date(rev.period_start).getFullYear()} Cycle</span>
                                 <span className="h-1 w-1 rounded-full bg-slate-300" />
                                 <span className="text-[10px] font-bold text-slate-400 italic">Reviewed by {rev.reviewer?.full_name}</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-14">
                           <div className="text-right hidden lg:block max-w-xs">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Feedback Summary</span>
                              <div className="text-[10px] font-bold text-slate-700 italic truncate italic">"{rev.feedback}"</div>
                           </div>
                           
                           <div className="flex items-center gap-3">
                              <div className={cn(
                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2",
                                rev.status === 'published' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"
                              )}>
                                 {rev.status}
                              </div>
                              <button 
                                onClick={() => { setSelectedAppraisal(rev); setShowEdit(true); }}
                                className="p-2 text-slate-300 hover:text-brand-navy transition-all"
                              >
                                 <MoreVertical className="h-5 w-5" />
                              </button>
                              <Link href={`/hr/directory/${rev.employee_id}`} className="p-2 text-slate-300 hover:text-brand-navy transition-all">
                                 <ChevronRight className="h-6 w-6" />
                              </Link>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-20 w-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200">
                     <Target className="h-10 w-10" />
                  </div>
                  <p className="text-sm font-black text-brand-navy italic opacity-50">No talent audits currently recorded.</p>
               </div>
            )}
         </div>
      </div>

      {/* Initiation Centered Modal */}
      <IndustrialModal
        isOpen={showInitiate}
        onClose={() => setShowInitiate(false)}
        title="Initiate Audit Cycle"
        subtitle="Performance Authorization"
        icon={<Target className="h-4 w-4" />}
        maxWidth="max-w-xl"
      >
        <div className="space-y-8">
           <div className="p-8 bg-brand-blue-pale/30 border-2 border-brand-blue-deep/20 rounded-3xl">
              <div className="flex items-center gap-3 text-brand-blue-deep font-black uppercase tracking-widest text-[10px] mb-2">
                 <AlertCircle className="h-4 w-4" /> Industrial Governance Note
              </div>
              <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                 Initiating a cycle will authorize managers to begin documenting professional growth audits for their reporting lines.
              </p>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Cycle Title</label>
                 <input placeholder="e.g. FY26 Q1 Annual Performance Growth" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Start Date</label>
                    <input type="date" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 cursor-pointer" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Deadline</label>
                    <input type="date" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 cursor-pointer" />
                 </div>
              </div>
           </div>

           <div className="pt-10">
              <button 
                onClick={() => {
                   toast.success("Industrial Audit Cycle Authorized.")
                   setShowInitiate(false)
                }}
                className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-95"
              >
                Authorize Cycle Publication
              </button>
           </div>
        </div>
      </IndustrialModal>

      {/* Edit Audit Centered Modal */}
      <IndustrialModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Audit Record"
        subtitle="Growth Metric Integrity"
        icon={<Award className="h-4 w-4" />}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpdateAppraisal} className="space-y-8">
           <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-4">Audit Parameters</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Performance Rating</label>
                   <select name="rating" defaultValue={selectedAppraisal?.rating} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50 appearance-none">
                      {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} Stars</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Audit Status</label>
                   <select name="status" defaultValue={selectedAppraisal?.status} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50 appearance-none">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                   </select>
                </div>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Qualitative Feedback</label>
              <textarea name="feedback" defaultValue={selectedAppraisal?.feedback} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm min-h-[120px] bg-slate-50" />
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Future Growth Goals</label>
              <textarea name="goals" defaultValue={selectedAppraisal?.goals} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm min-h-[100px] bg-slate-50" />
           </div>

           <div className="pt-6 space-y-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Audit Update"}
              </button>
              <button 
                type="button"
                onClick={handleDeleteAppraisal}
                disabled={isSubmitting}
                className="w-full py-5 bg-white border-2 border-orange-200 text-orange-600 rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-50"
              >
                Purge Audit Record
              </button>
           </div>
        </form>
      </IndustrialModal>
    </div>
  )
}
