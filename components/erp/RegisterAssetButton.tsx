"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Loader2,
  Building2,
  ShieldCheck,
  Zap
} from "lucide-react"
import { IndustrialModal } from "@/components/ui/IndustrialModal"
import { registerAsset, getAssetCategories } from "@/lib/actions/assets"
import { toast } from "sonner"

export function RegisterAssetButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      getAssetCategories().then(setCategories)
    }
  }, [isOpen])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        name: formData.get("name"),
        asset_tag: formData.get("asset_tag"),
        category_id: formData.get("category_id"),
        purchase_cost: Number(formData.get("purchase_cost")),
        purchase_date: formData.get("purchase_date"),
        location: formData.get("location"),
        status: "active"
      }
      await registerAsset(data)
      toast.success("Capital asset successfully provisioned.")
      setIsOpen(false)
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] shadow-brand-navy/10"
      >
        <Plus className="h-4 w-4 text-brand-blue-deep" /> Register Asset
      </button>

      <IndustrialModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Institutional Capital"
        subtitle="Asset Provisioning Protocol"
        icon={<ShieldCheck className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAdd} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Entity Specification</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Official Asset Designation</label>
                   <input name="name" required placeholder="e.g. Industrial Server Rack" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Industrial Asset Tag</label>
                      <input name="asset_tag" required placeholder="TAG-XXXX" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Asset Classification</label>
                      <select name="category_id" required className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                         <option value="">Select Category...</option>
                         {categories.map(cat => (
                           <option key={cat.id} value={cat.id}>{cat.name}</option>
                         ))}
                      </select>
                   </div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Financial Deployment</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Acquisition Cost (ZMW)</label>
                   <input name="purchase_cost" type="number" required placeholder="0.00" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Acquisition Date</label>
                   <input name="purchase_date" type="date" required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Physical Location</label>
                <input name="location" required placeholder="Fulfillment Center A, Slot 12" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
             </div>
           </div>

           <div className="pt-6">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Asset Registration"}
              </button>
           </div>
        </form>
      </IndustrialModal>
    </>
  )
}
