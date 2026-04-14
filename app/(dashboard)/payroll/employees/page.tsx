"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Search, 
  Filter, 
  ArrowLeft,
  ChevronRight,
  UserPlus,
  Banknote,
  CreditCard,
  ShieldCheck,
  Building2,
  X,
  Target,
  Sparkles,
  Loader2,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { getEmployeePayrollProfiles, updateEmployeePayrollProfile } from "@/lib/actions/payroll"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function EmployeePayrollPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    setIsLoading(true)
    try {
      const data = await getEmployeePayrollProfiles()
      setEmployees(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        basic_salary: parseFloat(formData.get("basic_salary") as string) || 0,
        bank_name: formData.get("bank_name"),
        account_no: formData.get("account_no"),
        tpin: formData.get("tpin"),
        napsa_no: formData.get("napsa_no"),
        nhima_no: formData.get("nhima_no"),
        nrc_no: formData.get("nrc_no"),
        is_active: formData.get("is_active") === "on"
      }

      await updateEmployeePayrollProfile(selectedProfile.profile_id, data)
      toast.success("Employee payroll profile updated")
      setSelectedProfile(null)
      fetchEmployees()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const filtered = employees.filter(e => 
    e.profiles.full_name.toLowerCase().includes(search.toLowerCase()) || 
    e.profiles.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/payroll" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Payroll
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Employee Registry</h1>
          <p className="text-slate-500 font-medium">Configure compensation and statutory identifiers for your team.</p>
        </div>
      </div>

      {/* Registry Controls */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white border-2 border-slate-100 rounded-[32px] shadow-sm">
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-green-deep transition-colors" />
              <input 
                type="text" 
                placeholder="Search staff..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 pr-5 py-2.5 text-xs border-2 border-slate-50 rounded-xl focus:border-brand-green-deep focus:outline-none bg-slate-50 lg:w-[300px] font-bold transition-all"
              />
           </div>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
           Total <span className="text-brand-navy">{employees.length}</span> Staff Registered
        </div>
      </div>

      {/* Employee Grid/List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="h-8 w-8 animate-spin text-brand-green-deep" />
             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing team Data...</p>
          </div>
        ) : filtered.map((e) => (
          <div key={e.profile_id} className="group p-6 bg-white border-2 border-slate-100 rounded-[32px] hover:border-brand-green-deep/20 hover:shadow-lg transition-all flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
               <div className="h-14 w-14 rounded-[22px] bg-slate-50 flex items-center justify-center text-brand-navy font-black text-xs shadow-inner">
                  {e.profiles.full_name.split(' ').map((n: string) => n[0]).join('')}
               </div>
               <div>
                  <h3 className="text-base font-black text-brand-navy">{e.profiles.full_name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.profiles.email}</p>
               </div>
            </div>

            <div className="flex items-center gap-12">
               <div className="hidden lg:block text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-0.5">Basic Salary</span>
                  <div className="text-sm font-black text-brand-navy">
                    {e.employee_profiles?.basic_salary ? `ZMW ${Number(e.employee_profiles.basic_salary).toLocaleString()}` : "Not Set"}
                  </div>
               </div>
               <button 
                onClick={() => setSelectedProfile(e)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl group-hover:bg-brand-navy group-hover:text-white transition-all shadow-sm active:scale-95"
               >
                 Manage Registry <ChevronRight className="h-3 w-3" />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Panel for Management */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-brand-navy/20 backdrop-blur-sm animate-in fade-in duration-500" onClick={() => setSelectedProfile(null)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col p-10 overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between mb-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green-deep">
                   <Target className="h-4 w-4" /> Employee Configuration
                </div>
                <h2 className="text-2xl font-black text-brand-navy">{selectedProfile.profiles.full_name}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedProfile.profiles.email}</p>
              </div>
              <button 
                onClick={() => setSelectedProfile(null)}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-brand-navy hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8 flex-1">
              {/* Financial Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-50 pb-2">Compensation</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Monthly Basic Salary (ZMW)</label>
                    <div className="relative">
                      <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        name="basic_salary"
                        type="number" 
                        step="0.01"
                        defaultValue={selectedProfile.employee_profiles?.basic_salary || 0}
                        className="w-full pl-11 pr-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-green-deep focus:outline-none font-black text-sm transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-50 pb-2">Statutory Identifiers</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">ZRA TPIN</label>
                      <input name="tpin" defaultValue={selectedProfile.employee_profiles?.tpin || ""} className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-brand-green-deep focus:outline-none font-bold text-xs" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">NAPSA Number</label>
                      <input name="napsa_no" defaultValue={selectedProfile.employee_profiles?.napsa_no || ""} className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-brand-green-deep focus:outline-none font-bold text-xs" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">NHIMA Number</label>
                      <input name="nhima_no" defaultValue={selectedProfile.employee_profiles?.nhima_no || ""} className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-brand-green-deep focus:outline-none font-bold text-xs" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">NRC Number</label>
                      <input name="nrc_no" defaultValue={selectedProfile.employee_profiles?.nrc_no || ""} className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-brand-green-deep focus:outline-none font-bold text-xs" />
                   </div>
                </div>
              </div>

              {/* Banking Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-50 pb-2">Banking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Bank Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                        <input name="bank_name" defaultValue={selectedProfile.employee_profiles?.bank_name || ""} className="w-full pl-10 pr-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-brand-green-deep focus:outline-none font-bold text-xs" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Account Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                        <input name="account_no" defaultValue={selectedProfile.employee_profiles?.account_no || ""} className="w-full pl-10 pr-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-brand-green-deep focus:outline-none font-bold text-xs" />
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" name="is_active" defaultChecked={selectedProfile.employee_profiles?.is_active ?? true} id="is_active" className="h-5 w-5 rounded border-slate-200 text-brand-green-deep focus:ring-brand-green-deep" />
                <label htmlFor="is_active" className="text-xs font-bold text-brand-navy">Active on Payroll</label>
              </div>

              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full py-5 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] mt-auto disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Save Configuration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
