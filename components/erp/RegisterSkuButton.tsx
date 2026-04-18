"use client"

import { useState } from "react"
import { 
  Plus, 
  Loader2,
  Package,
  Zap,
  ShieldCheck
} from "lucide-react"
import { IndustrialModal } from "@/components/ui/IndustrialModal"
import { createInventoryItem } from "@/lib/actions/inventory"
import { toast } from "sonner"

export function RegisterSkuButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const data = {
        name: formData.get("name"),
        sku: formData.get("sku"),
        category: formData.get("category"),
        unit: formData.get("unit"),
        reorder_level: Number(formData.get("reorder_level")),
        description: formData.get("description")
      }
      await createInventoryItem(data)
      toast.success("New SKU established in master registry.")
      setIsOpen(false)
      window.location.reload() // Refresh to see changes
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
        className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
      >
        <Plus className="h-4 w-4 text-brand-blue-deep" /> Register SKU
      </button>

      <IndustrialModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Asset Provisioning"
        subtitle="SKU Master Registration"
        icon={<ShieldCheck className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAdd} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Technical Identity</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Product Designation / Name</label>
                   <input name="name" required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Master SKU / Code</label>
                      <input name="sku" required placeholder="e.g. PRD-001" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Product Category</label>
                      <select name="category" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50 appearance-none">
                         <option value="Consumer Goods">Consumer Goods</option>
                         <option value="Industrial">Industrial Equipment</option>
                         <option value="IT">IT & Electronics</option>
                         <option value="Raw">Raw Materials</option>
                      </select>
                   </div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Inventory Governance</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Unit of Measure</label>
                   <input name="unit" placeholder="KG, PCS, LTR" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Reorder threshold</label>
                   <input name="reorder_level" type="number" defaultValue={10} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Product Description</label>
                <textarea name="description" rows={2} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm shadow-sm resize-none bg-slate-50" />
             </div>
           </div>

           <div className="pt-6">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Catalogue Entry"}
              </button>
           </div>
        </form>
      </IndustrialModal>
    </>
  )
}
