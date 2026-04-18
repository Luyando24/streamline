"use client"

import { useState, useEffect } from "react"
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  ArrowLeft,
  ChevronRight,
  Mail,
  Phone,
  Banknote,
  CreditCard,
  Target,
  X,
  Sparkles,
  Loader2,
  MoreVertical,
  ShieldCheck,
  MapPin,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { getVendors, createVendor, updateVendor, deleteProcurementRecord } from "@/lib/actions/procurement"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"

export default function VendorRegistryPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVendors()
  }, [])

  async function fetchVendors() {
    setIsLoading(true)
    try {
      const data = await getVendors()
      setVendors(data)
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
        name: formData.get("name"),
        contact_person: formData.get("contact_person"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        tpin: formData.get("tpin"),
        bank_name: formData.get("bank_name"),
        bank_account_no: formData.get("bank_account_no"),
        address: formData.get("address")
      }

      await createVendor(data)
      toast.success("Vendor successfully registered.")
      setShowAdd(false)
      fetchVendors()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVendor) return
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        name: formData.get("name"),
        contact_person: formData.get("contact_person"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        tpin: formData.get("tpin"),
        bank_name: formData.get("bank_name"),
        bank_account_no: formData.get("bank_account_no"),
        address: formData.get("address")
      }
      await updateVendor(selectedVendor.id, data)
      toast.success("Vendor credentials synchronized.")
      setShowEdit(false)
      fetchVendors()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this supplier? Existing procurement records will be preserved for audit.")) return
    setIsSubmitting(true)
    try {
      await deleteProcurementRecord(id, 'vendors')
      toast.success("Vendor archived.")
      fetchVendors()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.contact_person?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Link 
            href="/procurement" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Procurement
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Supplier Registry</h1>
          <p className="text-slate-700 font-medium">Manage your network of pre-approved industrial vendors.</p>
        </div>

        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 text-brand-green-deep" /> Register New Vendor
        </button>
      </div>

      {/* Registry Controls */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-brand-green-deep transition-colors" />
              <input 
                type="text" 
                placeholder="Search vendors..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 pr-5 py-2.5 text-xs border-2 border-slate-200 rounded-xl focus:border-brand-green-deep focus:outline-none bg-slate-50/80 lg:w-[300px] font-bold transition-all"
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-white transition-all">
             <Filter className="h-4 w-4" /> All Categories
           </button>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
           Active Suppliers: <span className="text-brand-navy">{vendors.length}</span>
        </div>
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="h-10 w-10 animate-spin text-brand-green-deep" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Synchronizing Supplier Database...</p>
          </div>
        ) : filtered.length > 0 ? filtered.map((v) => (
          <div key={v.id} className="group p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-green-deep/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 h-32 w-32 bg-slate-50/80 rounded-full -mr-16 -mt-16 group-hover:bg-brand-green-pale transition-colors duration-500" />
            
            <div className="relative z-10 space-y-6">
               <div className="flex justify-between items-start">
                  <div className="h-14 w-14 rounded-2xl bg-brand-navy text-white flex items-center justify-center text-lg font-black shadow-lg shadow-brand-navy/10 group-hover:scale-110 group-hover:bg-brand-green-deep transition-all duration-500">
                     {v.name[0]}
                  </div>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => { setSelectedVendor(v); setShowEdit(true); }}
                       className="h-10 w-10 rounded-xl bg-white/10 group-hover:bg-brand-navy flex items-center justify-center text-slate-400 group-hover:text-white transition-all shadow-sm"
                     >
                        <MoreVertical className="h-4 w-4" />
                     </button>
                      <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                         Verified
                      </div>
                   </div>
               </div>

               <div>
                  <h3 className="text-xl font-black text-brand-navy mb-1 group-hover:text-brand-green-deep transition-colors">{v.name}</h3>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                     <Target className="h-3.5 w-3.5 text-slate-300" /> {v.contact_person || "Multiple Contacts"}
                  </p>
               </div>

               <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-700">
                     <Mail className="h-4 w-4 text-slate-300" /> {v.email || "N/A"}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-700">
                     <CreditCard className="h-4 w-4 text-slate-300" /> TPIN: {v.tpin || "No Tax ID"}
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Supplier Rating</div>
                  <div className="flex gap-1">
                     {[1,2,3,4,5].map(i => (
                       <div key={i} className="h-1.5 w-1.5 rounded-full bg-brand-green-deep" />
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
             <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
                <Building2 className="h-10 w-10" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-black text-brand-navy italic opacity-60">No suppliers registered in your database.</p>
             </div>
          </div>
        )}
      </div>

      {/* Add Vendor Centered Modal */}
      <IndustrialModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Supplier Registration"
        subtitle="Onboard New Supplier"
        icon={<ShieldCheck className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAdd} className="space-y-10">
          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Corporate Identity</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Registered Business Name</label>
                   <input name="name" required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Primary Contact Person</label>
                      <input name="contact_person" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Tax TPIN</label>
                       <input name="tpin" required pattern="[0-9]{10}" placeholder="1XXXXXXXXX" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                    </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Contact & Logistics</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Email Address</label>
                   <input name="email" type="email" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Phone Number</label>
                   <input name="phone" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Business Address</label>
                <textarea name="address" rows={2} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm resize-none bg-slate-50" />
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Banking & Disbursement</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Institution Name</label>
                   <input name="bank_name" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Account Number</label>
                   <input name="bank_account_no" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
          </div>

          <div className="pt-6">
             <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
             >
               {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Complete Onboarding"}
             </button>
          </div>
        </form>
      </IndustrialModal>

      {/* Edit Vendor Centered Modal */}
      <IndustrialModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Supplier Maintenance"
        subtitle="Update Corporate Credentials"
        icon={<Building2 className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdate} className="space-y-10">
          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Corporate Identity</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Registered Business Name</label>
                   <input name="name" defaultValue={selectedVendor?.name} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Primary Contact Person</label>
                      <input name="contact_person" defaultValue={selectedVendor?.contact_person} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Tax TPIN</label>
                      <input name="tpin" defaultValue={selectedVendor?.tpin} required pattern="[0-9]{10}" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Contact & Logistics</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Email Address</label>
                   <input name="email" type="email" defaultValue={selectedVendor?.email} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Phone Number</label>
                   <input name="phone" defaultValue={selectedVendor?.phone} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Business Address</label>
                <textarea name="address" defaultValue={selectedVendor?.address} rows={2} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm resize-none bg-slate-50" />
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Banking & Disbursement</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Institution Name</label>
                   <input name="bank_name" defaultValue={selectedVendor?.bank_name} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Account Number</label>
                   <input name="bank_account_no" defaultValue={selectedVendor?.bank_account_no} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
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
              onClick={() => handleDelete(selectedVendor.id)}
              disabled={isSubmitting}
              className="w-full py-5 bg-white border-2 border-orange-200 text-orange-600 rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-50 transition-all active:scale-[0.98] disabled:opacity-50"
             >
               Deactivate Supplier Relations
             </button>
          </div>
        </form>
      </IndustrialModal>
    </div>
  )
}
