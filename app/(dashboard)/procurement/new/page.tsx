"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  X,
  FileText,
  Building2,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Search,
  Zap,
  Loader2,
  Banknote,
  LayoutGrid
} from "lucide-react"
import Link from "next/link"
import { getVendors, submitRequisition } from "@/lib/actions/procurement"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ReqItem {
  description: string
  quantity: string
  unit_price: string
}

export default function NewRequisitionPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [vendorId, setVendorId] = useState("")
  const [type, setType] = useState<"goods" | "service">("goods")
  const [items, setItems] = useState<ReqItem[]>([
    { description: "", quantity: "", unit_price: "" }
  ])

  useEffect(() => {
    getVendors().then(setVendors)
  }, [])

  const addItem = () => {
    setItems([...items, { description: "", quantity: "", unit_price: "" }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof ReqItem, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const total = items.reduce((acc, item) => {
    return acc + (parseFloat(item.quantity) * parseFloat(item.unit_price) || 0)
  }, 0)

  const handlePost = async () => {
    if (!title || !vendorId) {
      toast.error("Please provide a title and select a vendor.")
      return
    }

    if (items.some(i => !i.description || !i.quantity || !i.unit_price)) {
      toast.error("Please fill in all line item details.")
      return
    }

    setIsSubmitting(true)
    try {
      await submitRequisition({
        title,
        vendor_id: vendorId,
        items: items.map(i => ({
          description: i.description,
          quantity: parseFloat(i.quantity),
          unit_price: parseFloat(i.unit_price)
        }))
      })
      toast.success("Purchase requisition submitted for approval.")
      
      // Reset
      setTitle("")
      setVendorId("")
      setItems([{ description: "", quantity: "", unit_price: "" }])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link 
            href="/procurement" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Procurement
          </Link>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-brand-blue-pale flex items-center justify-center text-brand-blue-deep">
                <ShoppingBag className="h-5 w-5" />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-brand-navy">New Purchase Requisition</h1>
          </div>
          <p className="text-slate-600 text-xs font-bold font-medium pl-14">Initiate a formal request for goods or services.</p>
        </div>

        <div className="px-6 py-3 rounded-2xl bg-white border-2 border-slate-200 flex items-center gap-6 shadow-sm">
          <div className="text-right border-r border-slate-200 pr-6">
             <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-0.5">Estimated Total</div>
             <div className="text-xl font-black text-brand-navy">K {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
             <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Awaiting Draft</span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
        <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-10 border-b border-slate-200 flex flex-wrap gap-8 bg-slate-50/80/30">
            <div className="space-y-2 flex-[2] min-w-[300px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Requisition Title / Purpose</label>
              <input 
                type="text" 
                placeholder="e.g. Quarterly Office Stationery Supplies"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 pl-1">Preferred Supplier</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <select 
                  value={vendorId}
                  onChange={e => setVendorId(e.target.value)}
                  className="w-full pl-11 pr-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm transition-all appearance-none bg-white shadow-sm"
                >
                  <option value="">Select Vendor...</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2">
                 <LayoutGrid className="h-4 w-4" /> Line Items
              </h3>
              <div className="flex gap-2">
                 <button 
                  onClick={() => setType('goods')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    type === 'goods' ? "bg-brand-navy text-white" : "text-slate-600 hover:text-brand-navy"
                  )}
                 >Goods</button>
                 <button 
                  onClick={() => setType('service')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    type === 'service' ? "bg-brand-navy text-white" : "text-slate-600 hover:text-brand-navy"
                  )}
                 >Services</button>
              </div>
            </div>

            <div className="space-y-4">
               {items.map((item, i) => (
                 <div key={i} className="grid grid-cols-[1fr_100px_140px_48px] gap-6 group animate-in fade-in slide-in-from-left-2 duration-300 items-start">
                    <div className="space-y-1.5">
                       <input 
                        placeholder="Item description..."
                        value={item.description}
                        onChange={e => updateItem(i, 'description', e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-bold text-sm transition-all bg-white shadow-sm"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <input 
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', e.target.value)}
                        className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-black text-sm transition-all text-center shadow-sm"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">K</span>
                          <input 
                            type="number"
                            step="0.01"
                            placeholder="Unit Price"
                            value={item.unit_price}
                            onChange={e => updateItem(i, 'unit_price', e.target.value)}
                            className="w-full pl-8 pr-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-brand-blue-deep focus:outline-none font-black text-sm transition-all shadow-sm"
                          />
                       </div>
                    </div>
                    <button 
                      onClick={() => removeItem(i)}
                      className="h-12 w-12 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all mt-1"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                 </div>
               ))}

               <button 
                onClick={addItem}
                className="flex items-center gap-3 px-8 py-5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-600 hover:text-brand-blue-deep hover:border-brand-blue-deep/30 transition-all font-black text-[10px] uppercase tracking-widest w-full justify-center mt-4 group"
               >
                 <Plus className="h-5 w-5 group-hover:scale-125 transition-transform" /> Add Purchase Line
               </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8 animate-in slide-in-from-right duration-700 delay-200">
           <div className="p-10 bg-brand-navy rounded-2xl text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-blue-deep rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-700" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-blue-pale mb-8">Governance Rules</h3>
              
              <ul className="space-y-5 text-[11px] font-medium leading-relaxed mb-10 text-slate-300">
                 <li className="flex gap-4">
                   <div className="h-2 w-2 rounded-full bg-brand-blue-deep mt-1 shadow-[0_0_10px_rgba(34,197,94,1)]" />
                   Requisitions over K10,000 require Director approval (L3).
                 </li>
                 <li className="flex gap-4">
                   <div className="h-2 w-2 rounded-full bg-brand-blue-deep mt-1" />
                   Approved requisitions will instantly generate a formal Purchase Order.
                 </li>
                 <li className="flex gap-4">
                   <div className="h-2 w-2 rounded-full bg-brand-blue-deep mt-1" />
                   Vendors MUST have a valid TPIN on file before payment.
                 </li>
              </ul>

              <button 
                disabled={isSubmitting}
                onClick={handlePost}
                className="w-full flex items-center justify-center gap-3 py-5 bg-brand-blue-deep rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-brand-blue-deep-light shadow-2xl shadow-brand-blue-deep/20 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Zap className="h-4 w-4" /> Submit for Approval</>}
              </button>
           </div>

           <div className="p-8 bg-brand-blue-pale/50 border-2 border-brand-blue-deep/10 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-brand-blue-deep font-black text-[10px] uppercase tracking-widest">
                 <Sparkles className="h-4 w-4" /> Audit Complience
              </div>
              <p className="text-[10px] font-medium text-slate-700 leading-relaxed italic">
                 "Every requisition is timestamped and tracked through your defined corporate hierarchy."
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}

