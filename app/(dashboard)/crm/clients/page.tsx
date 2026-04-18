"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  ArrowLeft,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  MoreVertical,
  X,
  Target,
  Sparkles,
  Loader2,
  ShieldCheck,
  CreditCard,
  MapPin,
  ExternalLink,
  PhoneCall,
  History,
  Briefcase
} from "lucide-react"
import Link from "next/link"
import { getClients, createClient, updateClient, deleteCrmRecord } from "@/lib/actions/crm"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"

export default function ClientRegistryPage() {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setIsLoading(true)
    try {
      const data = await getClients()
      setClients(data)
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
        company_name: formData.get("company_name"),
        contact_person: formData.get("contact_person"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        tpin: formData.get("tpin"),
        address: formData.get("address"),
        industry: formData.get("industry")
      }

      await createClient(data)
      toast.success("Client successfully onboarded to registry.")
      setShowAdd(false)
      fetchClients()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        company_name: formData.get("company_name"),
        contact_person: formData.get("contact_person"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        tpin: formData.get("tpin"),
        address: formData.get("address"),
        industry: formData.get("industry")
      }
      await updateClient(selectedClient.id, data)
      toast.success("Client record synchronized.")
      setShowEdit(false)
      fetchClients()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to archive this client record? Historical deals will be preserved.")) return
    setIsSubmitting(true)
    try {
      await deleteCrmRecord(id, 'crm_clients')
      toast.success("Client record archived.")
      fetchClients()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = clients.filter(c => 
    c.company_name.toLowerCase().includes(search.toLowerCase()) || 
    c.contact_person?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/crm" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Growth Command
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Client Assets</h1>
          <p className="text-slate-700 font-medium">Manage your institutional account relationships and business history.</p>
        </div>

        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] shadow-brand-navy/10"
        >
          <Plus className="h-4 w-4 text-brand-green-deep" /> Onboard New Client
        </button>
      </div>

      {/* Registry Controls */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-brand-green-deep transition-colors" />
              <input 
                type="text" 
                placeholder="Find customer..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 pr-5 py-2.5 text-xs border-2 border-slate-200 rounded-xl focus:border-brand-green-deep focus:outline-none bg-slate-50/80 lg:w-[300px] font-bold transition-all"
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-white transition-all">
             <Filter className="h-4 w-4" /> All Industries
           </button>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
           Retained Accounts: <span className="text-brand-navy">{clients.length}</span>
        </div>
      </div>

      {/* Client List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="h-10 w-10 animate-spin text-brand-green-deep" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Synchronizing Relationship Data...</p>
          </div>
        ) : filtered.length > 0 ? filtered.map((c) => (
          <div key={c.id} className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-green-deep/20 hover:shadow-2xl transition-all duration-500 overflow-hidden relative flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-8">
               <div className="h-16 w-16 rounded-[24px] bg-white border-2 border-slate-200 text-brand-navy flex items-center justify-center text-lg font-black shadow-sm group-hover:scale-110 group-hover:bg-brand-navy group-hover:text-white transition-all duration-500">
                  {c.company_name[0]}
               </div>
               
               <div className="space-y-1">
                  <div className="flex items-center gap-3">
                     <h3 className="text-xl font-black text-brand-navy group-hover:text-brand-green-deep transition-colors">{c.company_name}</h3>
                     <span className="px-3 py-0.5 rounded-full bg-slate-50/80 text-slate-600 text-[9px] font-black uppercase tracking-widest border border-slate-200">
                        {c.industry || "General"}
                     </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                     <Target className="h-3.5 w-3.5 text-slate-300" /> {c.contact_person} 
                     <span className="h-1 w-1 rounded-full bg-slate-300" />
                     {c.email}
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-14">
               <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Lifetime Deals</span>
                  <div className="text-base font-black text-brand-navy flex items-center justify-end gap-2">
                     <Briefcase className="h-4 w-4 text-brand-green-deep opacity-40" /> {c.deals?.length || 0}
                  </div>
               </div>
               
               <div className="text-right hidden sm:block">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Relationship Health</span>
                  <div className="flex gap-1">
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className="h-1.5 w-1.5 rounded-full bg-brand-green-deep" />
                     ))}
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setSelectedClient(c); setShowEdit(true); }}
                    className="h-12 w-12 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-300 hover:text-brand-navy hover:shadow-lg transition-all"
                  >
                     <MoreVertical className="h-5 w-5" />
                  </button>
                  <Link href={`/crm/clients/${c.id}`} className="h-12 w-12 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-300 hover:text-brand-navy hover:shadow-lg transition-all">
                     <ChevronRight className="h-5 w-5" />
                  </Link>
               </div>
            </div>
          </div>
        )) : (
          <div className="py-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
             <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                <Users className="h-10 w-10" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-black text-brand-navy italic opacity-50">No client relationships have been onboarded yet.</p>
             </div>
          </div>
        )}
      </div>

      {/* Add Client Centered Modal */}
      <IndustrialModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Account Set-up"
        subtitle="Professional Onboarding"
        icon={<ShieldCheck className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAdd} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Corporate Identity</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Entity / Company Name</label>
                   <input name="company_name" required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Primary Representative</label>
                      <input name="contact_person" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Industry Sector</label>
                      <select name="industry" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                         <option value="Tech">Technology</option>
                         <option value="Mining">Mining & Industrial</option>
                         <option value="Retail">Retail & Trade</option>
                         <option value="Agri">Agriculture</option>
                      </select>
                   </div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Connectivity</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Email Coordinates</label>
                   <input name="email" type="email" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Direct Phone</label>
                   <input name="phone" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Billing Infrastructure</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">ZRA TPIN (Tax Identifier)</label>
                   <input name="tpin" required pattern="[0-9]{10}" placeholder="1XXXXXXXXX" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   <p className="text-[9px] font-black text-slate-400 mt-1 pl-1 italic">10-digit numeric pattern required.</p>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Headquarters Address</label>
                   <textarea name="address" rows={2} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm resize-none bg-slate-50" />
                </div>
             </div>
           </div>

           <div className="pt-6">
             <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
             >
               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Onboarding"}
             </button>
           </div>
        </form>
      </IndustrialModal>

      {/* Edit Client Centered Modal */}
      <IndustrialModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Update Record"
        subtitle="Account Maintenance"
        icon={<Briefcase className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdate} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Corporate Identity</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Entity / Company Name</label>
                   <input name="company_name" defaultValue={selectedClient?.company_name} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Primary Representative</label>
                      <input name="contact_person" defaultValue={selectedClient?.contact_person} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Industry Sector</label>
                      <select name="industry" defaultValue={selectedClient?.industry} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                         <option value="Tech">Technology</option>
                         <option value="Mining">Mining & Industrial</option>
                         <option value="Retail">Retail & Trade</option>
                         <option value="Agri">Agriculture</option>
                      </select>
                   </div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Connectivity</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Email Coordinates</label>
                   <input name="email" type="email" defaultValue={selectedClient?.email} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Direct Phone</label>
                   <input name="phone" defaultValue={selectedClient?.phone} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Billing Infrastructure</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">ZRA TPIN (Tax Identifier)</label>
                   <input name="tpin" required pattern="[0-9]{10}" defaultValue={selectedClient?.tpin} placeholder="1XXXXXXXXX" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Headquarters Address</label>
                   <textarea name="address" rows={2} defaultValue={selectedClient?.address} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm resize-none bg-slate-50" />
                </div>
             </div>
           </div>

           <div className="pt-6 space-y-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Synchronization"}
              </button>
              <button 
                type="button"
                onClick={() => handleDelete(selectedClient.id)}
                disabled={isSubmitting}
                className="w-full py-5 bg-white border-2 border-orange-200 text-orange-600 rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Archive Institutional Account
              </button>
           </div>
        </form>
      </IndustrialModal>
    </div>
  )
}
