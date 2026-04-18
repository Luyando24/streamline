"use client"

import { useState, useEffect, use } from "react"
import { 
  Users, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Loader2,
  Calendar,
  CreditCard,
  Building2,
  MapPin,
  X,
  Sparkles,
  ArrowUpRight,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Archive,
  GraduationCap,
  Award,
  FileText,
  Clock,
  Plus,
  Target,
  FileUp,
  History,
  TrendingUp,
  MoreVertical
} from "lucide-react"
import Link from "next/link"
import { getEmployeeFullDetails, uploadHrDocument, submitAppraisal } from "@/lib/actions/hr"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"
import { LayoutDashboard } from "lucide-react"

export default function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [employee, setEmployee] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showDocUpload, setShowDocUpload] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setIsLoading(true)
    try {
      const data = await getEmployeeFullDetails(id)
      setEmployee(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        employee_id: id,
        document_type: formData.get("document_type"),
        file_url: formData.get("file_url"),
        expiry_date: formData.get("expiry_date") || null,
        notes: formData.get("notes")
      }
      await uploadHrDocument(data)
      toast.success("Credential successfully secured in the personnel vault.")
      setShowDocUpload(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        employee_id: id,
        period_start: formData.get("period_start"),
        period_end: formData.get("period_end"),
        rating: Number(formData.get("rating")),
        feedback: formData.get("feedback"),
        goals: formData.get("goals"),
        status: 'published'
      }
      await submitAppraisal(data)
      toast.success("Performance audit published and archived.")
      setShowReviewForm(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6">
         <Loader2 className="h-12 w-12 animate-spin text-brand-green-deep" />
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Decrypting Personnel 360 Data...</p>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Career Overview", icon: LayoutDashboard },
    { id: "vault", label: "Credential Vault", icon: ShieldCheck },
    { id: "growth", label: "Growth History", icon: TrendingUp },
    { id: "skills", label: "Skill Density", icon: GraduationCap }
  ]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
      {/* Header Profile Card */}
      <div className="relative group">
         <div className="absolute inset-0 bg-brand-navy rounded-[32px] overflow-hidden translate-y-1 translate-x-1 opacity-10 group-hover:translate-y-2 group-hover:translate-x-2 transition-transform" />
         <div className="relative bg-white border-2 border-slate-200 rounded-[32px] p-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-10 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-10">
               <div className="h-32 w-32 rounded-[40px] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-4xl font-black text-brand-navy">
                  {employee?.profile?.avatar_url ? (
                    <img src={employee.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    employee?.profile?.full_name?.[0]
                  )}
               </div>
               <div className="space-y-4 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                     <h1 className="text-4xl font-black text-brand-navy tracking-tight">{employee?.profile?.full_name}</h1>
                     <span className={cn(
                       "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2",
                       employee?.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                     )}>
                       {employee?.status}
                     </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                     <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Building2 className="h-4 w-4 text-brand-green-deep opacity-50" /> {employee?.department}
                     </div>
                     <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Mail className="h-4 w-4 text-brand-green-deep opacity-50" /> {employee?.profile?.email}
                     </div>
                     <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Briefcase className="h-4 w-4 text-brand-green-deep opacity-50" /> {employee?.contract_type}
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button 
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-brand-navy/10"
               >
                 <TrendingUp className="h-4 w-4 text-brand-green-deep" /> New Review
               </button>
               <button className="h-14 w-14 rounded-2xl border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-navy hover:border-brand-navy transition-all">
                  <MoreVertical className="h-6 w-6" />
               </button>
            </div>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-2 bg-slate-100/50 border-2 border-slate-200 rounded-2xl w-fit">
         {tabs.map(t => {
           const Icon = t.icon
           return (
             <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === t.id ? "bg-white text-brand-navy shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-brand-navy hover:bg-white/50"
              )}
             >
               <Icon className={cn("h-4 w-4", activeTab === t.id ? "text-brand-green-deep" : "opacity-40")} />
               {t.label}
             </button>
           )
         })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
         {activeTab === "overview" && (
           <div className="grid lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
              <div className="lg:col-span-2 space-y-10">
                 <div className="p-10 bg-white border-2 border-slate-200 rounded-[32px] space-y-10">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-navy flex items-center gap-3">
                       <Zap className="h-5 w-5 text-brand-green-deep" /> Industrial Profile
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-10">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Join Date</label>
                          <div className="text-base font-black text-brand-navy">{new Date(employee.join_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">NRC Number</label>
                          <div className="text-base font-black text-brand-navy tracking-widest">{employee.nrc_number || "NOT RECORDED"}</div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Reporting Line</label>
                          <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-[10px] text-brand-navy border border-slate-200">
                                {employee.manager?.full_name?.[0] || "?"}
                             </div>
                             <div className="text-sm font-black text-brand-navy">{employee.manager?.full_name || "Self-Managed (Root)"}</div>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contract Logic</label>
                          <div className="text-sm font-black text-brand-navy uppercase tracking-widest flex items-center gap-2">
                             <ShieldCheck className="h-4 w-4 text-brand-green-deep" /> {employee.contract_type} Personnel
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-10">
                 <div className="p-10 bg-brand-navy rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-brand-green-deep rounded-full -mr-12 -mt-12 opacity-20" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-green-pale mb-6">Engagement metrics</h3>
                    <div className="space-y-6">
                       <div className="flex justify-between items-end">
                          <div className="text-[9px] font-black uppercase tracking-widest opacity-60">Tenure Velocity</div>
                          <div className="text-xl font-black">2.4 Years</div>
                       </div>
                       <div className="flex justify-between items-end">
                          <div className="text-[9px] font-black uppercase tracking-widest opacity-60">Review cycle</div>
                          <div className="text-xl font-black text-brand-green-deep">On Track</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
         )}

         {activeTab === "vault" && (
           <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-brand-green-deep" /> Secure Personnel Vault
                 </h2>
                 <button 
                  onClick={() => setShowDocUpload(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-navy hover:border-brand-green-deep transition-all"
                 >
                   <Plus className="h-4 w-4 text-brand-green-deep" /> Secure New Document
                 </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {employee.documents?.length > 0 ? employee.documents.map((doc: any) => (
                   <div key={doc.id} className="group p-8 bg-white border-2 border-slate-200 rounded-[32px] hover:border-brand-green-deep/20 hover:shadow-xl transition-all duration-500">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-brand-navy group-hover:text-white transition-all">
                         <FileText className="h-7 w-7" />
                      </div>
                      <h3 className="text-sm font-black text-brand-navy uppercase tracking-widest mb-2">{doc.document_type}</h3>
                      <p className="text-[10px] text-slate-500 font-bold mb-6 italic">{doc.notes || "Official organizational record."}</p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Captured: {new Date(doc.created_at).toLocaleDateString()}
                         </div>
                         <button className="p-2 text-brand-green-deep hover:text-brand-navy transition-all">
                            <ArrowUpRight className="h-5 w-5" />
                         </button>
                      </div>
                   </div>
                 )) : (
                   <div className="col-span-full py-40 border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                      <Archive className="h-12 w-12 text-slate-300" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vault is currently clear.</p>
                   </div>
                 )}
              </div>
           </div>
         )}

         {activeTab === "growth" && (
           <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                 <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-brand-green-deep" /> Talent Growth Log
                 </h2>
                 <button 
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-navy hover:border-brand-green-deep transition-all"
                 >
                   <Award className="h-4 w-4 text-brand-green-deep" /> Perform Audit
                 </button>
              </div>

              <div className="space-y-4">
                 {employee.appraisals?.length > 0 ? employee.appraisals.map((rev: any) => (
                   <div key={rev.id} className="p-10 bg-white border-2 border-slate-200 rounded-[40px] flex flex-col md:flex-row items-start justify-between gap-10 hover:shadow-xl transition-all duration-500 group">
                      <div className="space-y-6 flex-1">
                         <div className="flex items-center gap-10">
                            <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center font-black text-2xl text-brand-green-deep border-2 border-slate-100 shadow-sm transition-all group-hover:scale-110">
                               {rev.rating}<span className="text-[10px] opacity-40">/5</span>
                            </div>
                            <div>
                               <h3 className="text-lg font-black text-brand-navy">Annual performance audit</h3>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                  {new Date(rev.period_start).getFullYear()} cycle — Reviewed by {rev.reviewer?.full_name}
                               </p>
                            </div>
                         </div>
                         <div className="space-y-4 max-w-2xl pl-4 border-l-4 border-slate-100 group-hover:border-brand-green-deep transition-colors">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{rev.feedback}"</p>
                            <div className="flex items-center gap-3">
                               <Target className="h-4 w-4 text-brand-navy opacity-40" />
                               <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Growth Goals: {rev.goals || "Steady state maintenance."}</span>
                            </div>
                         </div>
                      </div>
                      <div className="pt-2">
                         <div className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5" /> Published 
                         </div>
                      </div>
                   </div>
                 )) : (
                   <div className="py-40 border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                      <TrendingUp className="h-12 w-12 text-slate-300" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Zero performance audits recorded.</p>
                   </div>
                 )}
              </div>
           </div>
         )}
      </div>

      {/* Document Upload Centered Modal */}
      <IndustrialModal
        isOpen={showDocUpload}
        onClose={() => setShowDocUpload(false)}
        title="Credential Storage"
        subtitle="Personnel Vault Security"
        icon={<ShieldCheck className="h-4 w-4" />}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUploadDoc} className="space-y-10">
           <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-4">Document Logic</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Document Registry Type</label>
                   <select name="document_type" required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm bg-slate-50 shadow-sm appearance-none">
                      <option value="NRC / ID">NRC / ID</option>
                      <option value="Employment Contract">Employment Contract</option>
                      <option value="Professional Certificate">Professional Certificate</option>
                      <option value="Academic Record">Academic Record</option>
                      <option value="Medical Clearance">Medical Clearance</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Secure File URL</label>
                   <input name="file_url" required placeholder="Cloud archive link..." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Expiry Audit Date (Optional)</label>
                 <input name="expiry_date" type="date" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 cursor-pointer" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Internal Log Notes</label>
                 <textarea name="notes" placeholder="Official metadata..." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm min-h-[120px] bg-slate-50" />
              </div>
           </div>

           <div className="pt-6">
             <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
             >
               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Vault Deposit"}
             </button>
           </div>
        </form>
      </IndustrialModal>

      {/* Appraisal Centered Modal */}
      <IndustrialModal
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        title="Perform Review"
        subtitle="Talent Development Audit"
        icon={<TrendingUp className="h-4 w-4" />}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitReview} className="space-y-8">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Audit Start</label>
                 <input name="period_start" type="date" required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 cursor-pointer" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Audit End</label>
                 <input name="period_end" type="date" required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 cursor-pointer" />
              </div>
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Industrial Rating (1-5)</label>
             <select name="rating" required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm bg-slate-50 shadow-sm appearance-none">
                <option value="5">5 — Exceptional Mobility</option>
                <option value="4">4 — High Performance</option>
                <option value="3">3 — Operational Parity</option>
                <option value="2">2 — Gap Detected</option>
                <option value="1">1 — Critical Failure</option>
             </select>
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Operational Feedback</label>
             <textarea name="feedback" required placeholder="Professional assessment..." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm min-h-[150px] bg-slate-50" />
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">Target Growth Goals</label>
             <input name="goals" placeholder="Next cycle targets..." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
           </div>

           <div className="pt-6">
             <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
             >
               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Publish Talent Audit"}
             </button>
           </div>
        </form>
      </IndustrialModal>
    </div>
  )
}
