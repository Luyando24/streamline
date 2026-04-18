"use client"

import { useState, useEffect } from "react"
import { 
  Briefcase, 
  Users, 
  UserPlus, 
  Plus, 
  ChevronRight, 
  Search, 
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Loader2,
  Building2,
  Clock,
  Mail,
  Phone,
  Target,
  FileText,
  Archive,
  MoreVertical,
  Activity,
  CheckCircle2,
  X,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { getRecruitmentStats, postJob, updateJob, deleteHrRecord } from "@/lib/actions/hr"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"

export default function HrRecruitmentPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [showAddJob, setShowAddJob] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showEditJob, setShowEditJob] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const data = await getRecruitmentStats()
      setJobs(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        title: formData.get("title"),
        department: formData.get("department"),
        description: formData.get("description"),
        requirements: formData.get("requirements"),
        status: 'open'
      }
      await postJob(data)
      toast.success("Industrial vacancy published and publicized.")
      setShowAddJob(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob) return
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        title: formData.get("title"),
        department: formData.get("department"),
        description: formData.get("description"),
        requirements: formData.get("requirements"),
        status: formData.get("status")
      }
      await updateJob(selectedJob.id, data)
      toast.success("Vacancy metrics updated.")
      setShowEditJob(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArchiveJob = async () => {
    if (!selectedJob) return
    if (!confirm("Are you sure you want to close this vacancy?")) return
    setIsSubmitting(true)
    try {
      await deleteHrRecord(selectedJob.id, 'hr_jobs')
      toast.success("Vacancy archived.")
      setShowEditJob(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicants_count?.[0]?.count || 0), 0)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue-deep bg-brand-blue-pale w-fit px-3 py-1 rounded-full">
            <Archive className="h-3 w-3" /> Talent Acquisition Hub
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Recruitment</h1>
          <p className="text-slate-700 font-medium tracking-tight">Govern the talent acquisition funnel, manage vacancies, and scale the workforce.</p>
        </div>

        <button 
          onClick={() => setShowAddJob(true)}
          className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 shadow-brand-navy/10"
        >
          <Plus className="h-4 w-4 text-brand-blue-deep" /> Publish Vacancy
        </button>
      </div>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-blue-deep/20 hover:shadow-xl transition-all duration-500 overflow-hidden relative">
            <div className="relative z-10">
               <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm">
                  <Briefcase className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Open Positions</p>
               <h3 className="text-2xl font-black text-brand-navy mb-2">{jobs.filter(j => j.status === 'open').length} <span className="text-slate-300 text-sm">Active</span></h3>
            </div>
         </div>
         <div className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-blue-deep/20 hover:shadow-xl transition-all duration-500 overflow-hidden relative">
            <div className="relative z-10">
               <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 shadow-sm">
                  <Users className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Talent Funnel</p>
               <h3 className="text-2xl font-black text-brand-navy mb-2">{totalApplicants} <span className="text-slate-300 text-sm">Applicants</span></h3>
            </div>
         </div>
         <div className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-blue-deep/20 hover:shadow-xl transition-all duration-500 overflow-hidden relative">
            <div className="relative z-10">
               <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
                  <CheckCircle2 className="h-6 w-6" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Hiring Velocity</p>
               <h3 className="text-2xl font-black text-brand-navy mb-2">High <span className="text-slate-300 text-sm">Priority</span></h3>
            </div>
         </div>
         <div className="group p-8 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 bg-brand-blue-deep rounded-full -mr-12 -mt-12 opacity-20" />
            <div className="relative z-10">
               <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                  <Zap className="h-6 w-6 text-brand-blue-deep" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue-pale mb-1">Scale Logic</p>
               <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Industrial</h3>
            </div>
         </div>
      </div>

      {/* Vacancy Deck */}
      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-navy flex items-center gap-3">
               <Briefcase className="h-5 w-5 text-brand-blue-deep" /> Vacancy Deck
            </h2>
         </div>

         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
               <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-brand-blue-deep" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Talent Pipelines...</p>
               </div>
            ) : jobs.length > 0 ? jobs.map((job) => (
               <div key={job.id} className="group p-10 bg-white border-2 border-slate-200 rounded-[40px] hover:border-brand-blue-deep/20 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                  <div className="relative z-10 space-y-8">
                     <div className="flex justify-between items-start">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border-2 border-slate-100 group-hover:bg-brand-navy group-hover:text-white transition-all shadow-sm">
                           <Briefcase className="h-7 w-7" />
                        </div>
                        <div className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2",
                          job.status === 'open' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"
                        )}>
                           {job.status}
                        </div>
                     </div>

                     <div className="space-y-2">
                        <h3 className="text-xl font-black text-brand-navy group-hover:text-brand-blue-deep transition-colors leading-tight">{job.title}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] flex items-center gap-2">
                           <Building2 className="h-3.5 w-3.5 opacity-50" /> {job.department}
                        </p>
                     </div>

                     <div className="space-y-3 pt-8 border-t border-slate-100 flex items-center justify-between">
                        <div>
                           <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Applications</div>
                           <div className="text-base font-black text-brand-navy">{job.applicants_count?.[0]?.count || 0} Pool</div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => { setSelectedJob(job); setShowEditJob(true); }}
                             className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-brand-navy hover:bg-slate-200 transition-all shadow-sm"
                           >
                              <MoreVertical className="h-4 w-4" />
                           </button>
                           <Link 
                            href={`/hr/recruitment/${job.id}`}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-navy text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95 shadow-brand-navy/10"
                           >
                              <ArrowUpRight className="h-5 w-5" />
                           </Link>
                         </div>
                     </div>
                  </div>
               </div>
            )) : (
               <div className="col-span-full py-40 border-2 border-dashed border-slate-200 rounded-[64px] flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-20 w-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200">
                     <Users className="h-10 w-10" />
                  </div>
                  <p className="text-sm font-black text-brand-navy italic opacity-50">No vacancies currently published.</p>
               </div>
            )}
         </div>
      </div>

      {/* Post Job Centered Modal */}
      <IndustrialModal
        isOpen={showAddJob}
        onClose={() => setShowAddJob(false)}
        title="Publish Vacancy"
        subtitle="Hiring Authorization"
        icon={<Target className="h-4 w-4" />}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handlePostJob} className="space-y-8">
           <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-4">Position Metrics</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Vacancy Title</label>
                   <input name="title" required placeholder="e.g. Senior Logistics Officer" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Department Registry</label>
                   <input name="department" required placeholder="e.g. Supply Chain, Engineering" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
              </div>
           </div>

           <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Position Description</label>
             <textarea name="description" required placeholder="Outline the organizational mission..." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm min-h-[150px] bg-slate-50" />
           </div>

           <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Technical Requirements</label>
             <textarea name="requirements" placeholder="Skills, certifications, experience..." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm min-h-[120px] bg-slate-50" />
           </div>

           <div className="pt-6">
             <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
             >
               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Vacancy Publication"}
             </button>
           </div>
        </form>
      </IndustrialModal>

      {/* Edit Job Centered Modal */}
      <IndustrialModal
        isOpen={showEditJob}
        onClose={() => setShowEditJob(false)}
        title="Edit Vacancy"
        subtitle="Industrial Metric Update"
        icon={<Briefcase className="h-4 w-4" />}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUpdateJob} className="space-y-8">
           <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-4">Position Metrics</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Vacancy Title</label>
                   <input name="title" defaultValue={selectedJob?.title} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Status</label>
                   <select name="status" defaultValue={selectedJob?.status} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50 appearance-none">
                      <option value="open">Open</option>
                      <option value="closed">Closed / Internal</option>
                      <option value="on_hold">On Hold</option>
                   </select>
                </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Department Registry</label>
                 <input name="department" defaultValue={selectedJob?.department} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50" />
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Position Description</label>
              <textarea name="description" defaultValue={selectedJob?.description} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm min-h-[120px] bg-slate-50" />
           </div>

           <div className="pt-6 space-y-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Update Publication"}
              </button>
              <button 
                type="button"
                onClick={handleArchiveJob}
                disabled={isSubmitting}
                className="w-full py-5 bg-white border-2 border-orange-200 text-orange-600 rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-50"
              >
                Archive / Close Vacancy
              </button>
           </div>
        </form>
      </IndustrialModal>
    </div>
  )
}
