"use client"

import { useState, useEffect, use } from "react"
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Filter, 
  FileText, 
  MoreVertical, 
  ChevronRight, 
  ShieldCheck, 
  Target, 
  Clock, 
  Mail, 
  Phone, 
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowUpRight,
  ExternalLink,
  MessageSquare,
  UserPlus
} from "lucide-react"
import Link from "next/link"
import { getApplicantsForJob, updateApplicantStatus } from "@/lib/actions/hr"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"

export default function JobApplicantPoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [applicants, setApplicants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setIsLoading(true)
    try {
      const data = await getApplicantsForJob(id)
      setApplicants(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateApplicantStatus(applicantId, newStatus)
      toast.success(`Applicant transitioned to ${newStatus}.`)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const filtered = applicants.filter(a => {
    const matchesSearch = a.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          a.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusColors: any = {
    applied: "bg-blue-50 text-blue-600 border-blue-100",
    screening: "bg-purple-50 text-purple-600 border-purple-100",
    interview: "bg-orange-50 text-orange-600 border-orange-100",
    offer: "bg-cyan-50 text-cyan-600 border-cyan-100",
    hired: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100"
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link 
            href="/hr/recruitment" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Vacancies
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-brand-navy">Talent Pipeline</h1>
            <p className="text-slate-700 font-medium tracking-tight">Manage applicants and maintain hiring governance for this vacancy.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-white border-2 border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm">
             <Users className="h-4 w-4 text-brand-green-deep" />
             <span className="text-[11px] font-black uppercase tracking-widest text-brand-navy">{applicants.length} Total Applied</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name or contact..." 
            className="w-full pl-14 pr-6 py-5 rounded-2xl border-2 border-slate-200 focus:border-brand-navy focus:outline-none font-bold text-sm bg-white shadow-sm transition-all"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-8 py-5 rounded-2xl border-2 border-slate-200 focus:border-brand-navy focus:outline-none font-bold text-sm bg-white shadow-sm appearance-none cursor-pointer"
        >
          <option value="all">Global Funnel</option>
          <option value="applied">Applied</option>
          <option value="screening">Screening</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer Sent</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="py-40 flex flex-col items-center justify-center space-y-4 bg-white border-2 border-slate-200 rounded-[40px]">
              <Loader2 className="h-12 w-12 animate-spin text-brand-green-deep" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Talent Matrix...</p>
            </div>
          ) : filtered.length > 0 ? filtered.map((a) => (
            <div 
              key={a.id} 
              onClick={() => setSelectedApplicant(a)}
              className={cn(
                "group p-8 bg-white border-2 rounded-[32px] transition-all duration-500 cursor-pointer flex items-center justify-between gap-6",
                selectedApplicant?.id === a.id ? "border-brand-navy shadow-xl scale-[1.01]" : "border-slate-200 hover:border-brand-green-deep/20 hover:shadow-lg"
              )}
            >
              <div className="flex items-center gap-8">
                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-2xl text-brand-navy border-2 border-slate-100 group-hover:bg-brand-navy group-hover:text-white transition-all shadow-sm">
                  {a.full_name[0]}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-brand-navy leading-tight">{a.full_name}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {a.email}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>Applied {new Date(a.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2",
                  statusColors[a.status] || "bg-slate-50 text-slate-400 border-slate-200"
                )}>
                  {a.status}
                </div>
                <ChevronRight className={cn("h-6 w-6 transition-all", selectedApplicant?.id === a.id ? "text-brand-navy translate-x-1" : "text-slate-200")} />
              </div>
            </div>
          )) : (
            <div className="py-48 border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <Users className="h-12 w-12 text-slate-300" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">No candidates matching the current focus.</p>
            </div>
          )}
        </div>

        {/* Detail Sidebar */}
        <div className="space-y-8">
          {selectedApplicant ? (
            <div className="p-10 bg-white border-2 border-brand-navy rounded-[40px] shadow-2xl relative overflow-hidden animate-in slide-in-from-right-4 duration-500">
              <div className="absolute top-0 right-0 h-32 w-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-40" />
              
              <div className="relative z-10 space-y-10">
                <div className="space-y-4 text-center">
                  <div className="h-24 w-24 rounded-[32px] bg-brand-navy text-white flex items-center justify-center text-4xl font-black mx-auto shadow-xl">
                    {selectedApplicant.full_name[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-brand-navy">{selectedApplicant.full_name}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{selectedApplicant.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-4">Contact Coordination</h3>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Phone className="h-4 w-4 text-brand-navy opacity-40" />
                    <span className="text-sm font-black text-brand-navy tracking-widest">{selectedApplicant.phone || "UNSPECIFIED"}</span>
                  </div>
                  <a 
                    href={selectedApplicant.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-brand-green-pale text-brand-green-deep rounded-2xl border border-brand-green-deep/20 hover:bg-brand-green-deep hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Digital Resume</span>
                    </div>
                    <ExternalLink className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                  </a>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Action Control</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['screening', 'interview', 'offer', 'hired', 'rejected'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedApplicant.id, st)}
                        disabled={isUpdating}
                        className={cn(
                          "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                          selectedApplicant.status === st ? "bg-brand-navy text-white border-brand-navy" : "bg-white text-slate-600 border-slate-100 hover:border-slate-200"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  
                  {selectedApplicant.status === 'hired' && (
                    <Link 
                      href={`/hr/directory?onboard=true&name=${encodeURIComponent(selectedApplicant.full_name)}&email=${encodeURIComponent(selectedApplicant.email)}&phone=${encodeURIComponent(selectedApplicant.phone || '')}`}
                      className="w-full py-5 bg-brand-green-deep text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-brand-green-deep-light transition-all shadow-xl shadow-brand-green-deep/10"
                    >
                      <UserPlus className="h-4 w-4" /> Initialize Onboarding
                    </Link>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Decision Notes</h3>
                  <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 min-h-[120px] relative">
                    <MessageSquare className="absolute top-6 right-6 h-4 w-4 opacity-10" />
                    <p className="text-[11px] font-medium text-slate-700 leading-relaxed italic">
                      {selectedApplicant.notes || "No evaluation notes recorded yet."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[40px] text-center flex flex-col items-center justify-center space-y-4 min-h-[500px]">
              <div className="h-20 w-20 rounded-[32px] bg-white flex items-center justify-center text-slate-200 border-2 border-slate-100 shadow-sm">
                <Target className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selection Required</p>
                <p className="text-xs text-slate-500 font-medium px-10 leading-relaxed mt-2">Select a candidate profile to perform audits, transition funnel state, or view credentials.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
