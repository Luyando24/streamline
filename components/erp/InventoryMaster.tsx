"use client"

import { useState } from "react"
import { 
  Boxes, 
  Search, 
  ChevronRight, 
  Archive, 
  ArrowUpRight, 
  MoreVertical,
  Package,
  Layers,
  Zap,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { IndustrialModal } from "@/components/ui/IndustrialModal"
import { updateInventoryItem, deleteInventoryRecord } from "@/lib/actions/inventory"
import { toast } from "sonner"

export function InventoryMaster({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState("")
  const [showEdit, setShowEdit] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.sku.toLowerCase().includes(search.toLowerCase())
  )

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
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
      await updateInventoryItem(selectedItem.id, data)
      toast.success("SKU specifications synchronized.")
      setShowEdit(false)
      // Refresh local state (simplified)
      setItems(items.map(i => i.id === selectedItem.id ? { ...i, ...data } : i))
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this SKU from the active registry?")) return
    setIsSubmitting(true)
    try {
      await deleteInventoryRecord(id, 'inventory_items')
      toast.success("SKU archived.")
      setItems(items.filter(i => i.id !== id))
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/80/50">
        <h2 className="text-lg font-black text-brand-navy flex items-center gap-3">
          <Boxes className="h-5 w-5 text-brand-green-deep" /> SKU Master List
        </h2>
        <div className="flex gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-brand-green-deep transition-colors" />
            <input 
              type="text" 
              placeholder="Find SKU..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-[10px] border border-slate-200 rounded-xl focus:outline-none focus:border-brand-green-deep w-48 font-bold transition-all bg-white"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((item: any) => {
              const totalStock = item.stock_levels?.reduce((acc: any, s: any) => acc + Number(s.quantity), 0) || 0
              const isLow = totalStock <= Number(item.reorder_level || 0)

              return (
                <div key={item.id} className="group p-6 flex flex-wrap items-center justify-between gap-6 hover:bg-slate-50/80 rounded-2xl transition-all">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center text-brand-navy font-black text-[10px] shadow-sm transition-all group-hover:scale-110",
                      isLow ? "bg-orange-50 border-2 border-orange-100 text-orange-600" : "bg-white border-2 border-slate-200"
                    )}>
                      {item.sku.substring(0, 3)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-brand-navy leading-tight">{item.name}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{item.sku}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-black text-brand-green-deep uppercase tracking-widest">{item.category || "General"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Global Stock</span>
                      <div className={cn(
                        "text-xl font-black",
                        isLow ? "text-orange-600" : "text-brand-navy"
                      )}>
                        {totalStock} <span className="text-[10px] uppercase font-bold text-slate-600 opacity-60 ml-0.5">{item.unit}</span>
                      </div>
                    </div>
                    
                    <div className="text-right hidden sm:block">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">Valuation (Avg)</span>
                      <div className="text-sm font-black text-brand-navy italic">
                        K {Number(item.stock_levels?.[0]?.avg_cost || 0).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => { setSelectedItem(item); setShowEdit(true); }}
                        className="p-3 bg-slate-50/80 rounded-xl text-slate-300 hover:text-brand-navy hover:shadow-md transition-all"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      <Link href={`/inventory/items/${item.id}`} className="p-3 bg-slate-50/80 rounded-xl text-slate-300 hover:text-brand-navy hover:shadow-md transition-all">
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-1000">
            <div className="h-20 w-20 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-200">
              <Archive className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-brand-navy italic opacity-50">Empty hangar. No SKUs registered.</p>
            </div>
          </div>
        )}
      </div>

      <IndustrialModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="SKU Modification"
        subtitle="Catalogue Maintenance"
        icon={<Package className="h-4 w-4" />}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdate} className="space-y-10">
           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Technical Specifications</h3>
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Product Designation / Name</label>
                   <input name="name" defaultValue={selectedItem?.name} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Master SKU / Code</label>
                      <input name="sku" defaultValue={selectedItem?.sku} required className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Product Category</label>
                      <input name="category" defaultValue={selectedItem?.category} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                   </div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-100 pb-3">Control & Metrics</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Unit of Measure</label>
                   <input name="unit" defaultValue={selectedItem?.unit} placeholder="e.g. KG, PCS, LTR" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Critical Reorder Level</label>
                   <input name="reorder_level" type="number" defaultValue={selectedItem?.reorder_level} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm bg-slate-50" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Technical Notes / Description</label>
                <textarea name="description" rows={2} defaultValue={selectedItem?.description} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-green-deep focus:outline-none font-bold text-sm shadow-sm resize-none bg-slate-50" />
             </div>
           </div>

           <div className="pt-6 space-y-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-navy text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-brand-navy/10 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Catalogue Update"}
              </button>
              <button 
                type="button"
                onClick={() => handleDelete(selectedItem.id)}
                disabled={isSubmitting}
                className="w-full py-5 bg-white border-2 border-orange-200 text-orange-600 rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Decommission SKU
              </button>
           </div>
        </form>
      </IndustrialModal>
    </div>
  )
}
