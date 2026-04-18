"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
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
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Archive,
  GraduationCap
} from "lucide-react"
import Link from "next/link"
import { getEmployees, onboardEmployee } from "@/lib/actions/hr"
import { getTeamMembers } from "@/lib/actions/team"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { IndustrialModal } from "@/components/ui/IndustrialModal"

export default function HrDirectoryPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [selectedProfileData, setSelectedProfileData] = useState<any>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    fetchData()
    fetchTeam()
    if (searchParams.get('onboard') === 'true') {
      setShowAdd(true)
    }
  }, [searchParams])

  async function fetchTeam() {
    const data = await getTeamMembers()
    setTeamMembers(data)
  }

  async function fetchData() {
    setIsLoading(true)
    try {
      const data = await getEmployees()
      setEmployees(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        profile_id: formData.get("profile_id"),
        nrc_number: formData.get("nrc_number"),
        date_of_birth: formData.get("date_of_birth"),
        join_date: formData.get("join_date"),
        contract_type: formData.get("contract_type"),
        department: formData.get("department"),
        manager_id: formData.get("manager_id") || undefined
      }

      await onboardEmployee(data)
      toast.success("Personnel file successfully created and archived.")
      setShowAdd(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = employees.filter(e => 
    e.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    e.department?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <Link 
            href="/hr" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to HR Command
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Directory</h1>
          <p className="text-slate-700 font-medium tracking-tight">Industrial Personnel Files and Digital Workforce Directory.</p>
        </div>

        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10"
        >
          <UserPlus className="h-4 w-4 text-brand-blue-deep" /> Onboard New Employee
        </button>
      </div>

      {/* Directory Controls */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm mx-4">
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <input 
                type="text" 
                placeholder="Find by name or department..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 pr-5 py-2.5 text-xs border-2 border-slate-200 rounded-xl focus:border-brand-blue-deep focus:outline-none bg-slate-50/80 lg:w-[350px] font-bold"
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700">
             <Filter className="h-4 w-4" /> All Departments
           </button>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
           Active Personnel: <span className="text-brand-navy">{employees.length}</span>
        </div>
      </div>

      {/* Employee List */}
      <div className="grid gap-4 px-4">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="h-10 w-10 animate-spin text-brand-blue-deep" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Synchronizing Workforce Database...</p>
          </div>
        ) : filtered.length > 0 ? (
           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((e) => (
                <div key={e.id} className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-blue-deep/20 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                   <div className="absolute top-0 right-0 h-24 w-24 bg-slate-50/80 rounded-full -mr-12 -mt-12 group-hover:bg-brand-blue-pale transition-colors duration-500" />
                   
                   <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                         <div className="h-20 w-20 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-2xl font-black text-brand-navy">
                            {e.profile?.avatar_url ? (
                               <img src={e.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                               e.profile?.full_name?.[0]
                            )}
                         </div>
                         <div className={cn(
                           "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                           e.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50/80 text-slate-600 border-slate-200"
                         )}>
                            {e.status}
                         </div>
                      </div>

                      <div>
                         <h3 className="text-xl font-black text-brand-navy group-hover:text-brand-blue-deep transition-colors">{e.profile?.full_name}</h3>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            <Building2 className="h-3.5 w-3.5 opacity-50" /> {e.department || "No Department"}
                         </div>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-slate-200">
                         <div className="flex items-center gap-3 text-xs font-medium text-slate-700">
                            <Mail className="h-3.5 w-3.5 opacity-50" /> {e.profile?.email}
                         </div>
                         <div className="flex items-center gap-3 text-xs font-medium text-slate-700">
                            <Briefcase className="h-3.5 w-3.5 opacity-50" /> {e.contract_type}
                         </div>
                         <div className="flex items-center gap-3 text-xs font-medium text-slate-700">
                            <Calendar className="h-3.5 w-3.5 opacity-50" /> Joined {new Date(e.join_date).toLocaleDateString('en-GB')}
                         </div>
                      </div>

                      <Link href={`/hr/directory/${e.id}`} className="w-full py-4 bg-slate-50/80 group-hover:bg-brand-navy group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                        Personnel File <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                   </div>
                </div>
              ))}
           </div>
        ) : (
          <div className="py-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
             <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                <Users className="h-10 w-10" />
             </div>
             <p className="text-sm font-black text-brand-navy italic opacity-50">Zero employees matching criteria.</p>
          </div>
        )}
      </div>

      {/* Onboard Employee Centered Modal */}
      <IndustrialModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Digital Record"
        subtitle="Personnel Onboarding"
        icon={<ShieldCheck className="h-4 w-4" />}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleOnboard} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Identity Coordinates</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Target Individual (Talent Search)</label>
                   <select 
                      name="profile_id" 
                      required 
                      onChange={(e) => {
                         const member = teamMembers.find(m => m.id === e.target.value)
                         setSelectedProfileData(member)
                      }}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50 shadow-sm appearance-none"
                    >
                      <option value="">Select a profile...</option>
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name} ({m.email})</option>
                      ))}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">NRC Number</label>
                       <input 
                         name="nrc_number" 
                         required
                         pattern="[0-9]{6}/[0-9]{2}/[0-9]{1}"
                         defaultValue={selectedProfileData?.nrc_number || ""}
                         placeholder="123456/78/1" 
                         className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm" 
                       />
                       <p className="text-[9px] font-black text-slate-400 mt-1 pl-1 italic">Industrial Standard: xxxxxx/yy/z</p>
                      {selectedProfileData?.nrc_number && (
                         <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest pl-1 flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> Source: Industrial Profile</p>
                       )}
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Date of Birth</label>
                      <input 
                        name="date_of_birth" 
                        type="date" 
                        defaultValue={selectedProfileData?.date_of_birth || ""}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm cursor-pointer" 
                      />
                      {selectedProfileData?.date_of_birth && (
                         <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest pl-1 flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> Source: Identity Coordination</p>
                       )}
                   </div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Employment Logic</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Department</label>
                   <input name="department" required placeholder="Engineering, Sales, etc." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Contract Type</label>
                   <select name="contract_type" required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-white appearance-none">
                      <option value="permanent">Permanent</option>
                      <option value="contract">Fixed Term Contract</option>
                      <option value="intern">Internship</option>
                      <option value="casual">Casual</option>
                   </select>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Join Date</label>
                   <input name="join_date" type="date" required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm cursor-pointer" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Manager (Reporting Line)</label>
                   <select name="manager_id" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm bg-slate-50 shadow-sm appearance-none">
                      <option value="">No manager (Root)</option>
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                   </select>
                </div>
             </div>
           </div>

           <div className="pt-6">
             <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
             >
               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Personnel File"}
             </button>
           </div>
        </form>
      </IndustrialModal>
    </div>
  )
}

