"use client"

import { useState, useMemo } from "react"
import { 
  Search, 
  Zap, 
  Check, 
  Plus, 
  Minus,
  X,
  Info, 
  ShoppingCart, 
  ArrowRight,
  Receipt,
  UserCheck,
  CalendarClock,
  Briefcase,
  Package,
  Truck,
  FileSearch,
  LineChart,
  Target,
  Users2,
  Clock,
  GraduationCap,
  FileSpreadsheet,
  BrainCircuit,
  Network,
  Layers,
  FileText,
  ClipboardList,
  BarChart4,
  LayoutDashboard,
  ShieldCheck,
  Sparkles
} from "lucide-react"
import { useModuleStore } from "@/lib/store/useModuleStore"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PaymentModal } from "@/components/dashboard/PaymentModal"
import { activateModules } from "@/lib/actions/modules"

const CATEGORIES = ["All", "Active", "Core", "Add-On", "Premium"]

const SUITES = [
  {
    id: "hris-bundle",
    name: "Full HRIS Suite",
    desc: "Payroll, Leave, Performance, Records, and Attendance.",
    price: 1200,
    moduleIds: ["payroll-management", "leave-management", "performance-management", "hris-suite", "time-attendance"],
    theme: "bg-blue-50 border-blue-100 text-blue-700",
    icon: UserCheck
  },
  {
    id: "erp-bundle",
    name: "ERP Suite",
    desc: "Finance, Procurement, Inventory, Assets, and Expenses.",
    price: 1800,
    moduleIds: ["finance-accounting", "procurement-management", "inventory-management", "asset-management", "expense-management"],
    theme: "bg-purple-50 border-purple-100 text-purple-700",
    icon: Package
  },
  {
    id: "business-bundle",
    name: "Full Business Suite",
    desc: "All Core and Add-on modules included. The maximum scale.",
    price: 3000,
    moduleIds: ["finance-accounting", "payroll-management", "leave-management", "performance-management", "procurement-management", "inventory-management", "fleet-management", "hris-suite", "crm", "bi-analytics"], // Simplified for start
    theme: "bg-emerald-50 border-emerald-100 text-emerald-700",
    icon: Sparkles
  }
]

const MODULES_DATA = [
  // CATEGORY A: CORE
  { id: "finance-accounting", name: "Finance & Accounting", category: "Core", price: 1200, desc: "General ledger, budgeting, ZRA compliance", icon: Receipt },
  { id: "payroll-management", name: "Payroll Management", category: "Core", price: 800, desc: "PAYE, NAPSA, NHIMA, payslip automation", icon: UserCheck },
  { id: "leave-management", name: "Leave Management", category: "Core", price: 400, desc: "Leave tracking, approvals, balances", icon: CalendarClock },
  { id: "performance-management", name: "Performance Management", category: "Core", price: 600, desc: "KPI tracking, appraisals, 360 feedback", icon: LineChart },
  { id: "procurement-management", name: "Procurement Management", category: "Core", price: 700, desc: "Requisitions, approvals, supplier tracking", icon: FileSearch },
  { id: "inventory-management", name: "Inventory Management", category: "Core", price: 700, desc: "Stock tracking, alerts, warehouse mgmt", icon: Package },
  { id: "fleet-management", name: "Fleet Management", category: "Core", price: 600, desc: "Fuel tracking, maintenance, vehicle usage", icon: Truck },

  // CATEGORY B: ADD-ONS
  { id: "hris-suite", name: "HRIS Full Suite", category: "Add-On", price: 1000, desc: "Employee records, onboarding, contracts", icon: Briefcase },
  { id: "project-management", name: "Project Management", category: "Add-On", price: 800, desc: "Task tracking, timelines, donor reporting", icon: Target },
  { id: "crm", name: "CRM", category: "Add-On", price: 900, desc: "Sales pipeline, customer tracking", icon: Users2 },
  { id: "asset-management", name: "Asset Management", category: "Add-On", price: 500, desc: "Fixed asset tracking, depreciation tracking", icon: Layers },
  { id: "document-management", name: "Document Management", category: "Add-On", price: 600, desc: "Secure cloud storage, version control", icon: FileText },
  { id: "compliance-audit", name: "Compliance & Audit", category: "Add-On", price: 700, desc: "Internal audits, compliance checklists", icon: ClipboardList },
  { id: "training-elearning", name: "E-learning & Training", category: "Add-On", price: 500, desc: "Staff training, onboarding programs", icon: GraduationCap },
  { id: "time-attendance", name: "Time & Attendance", category: "Add-On", price: 500, desc: "Biometric/remote clock-in, shift mgmt", icon: Clock },
  { id: "expense-management", name: "Expense Management", category: "Add-On", price: 500, desc: "Claims, approvals, reimbursements", icon: FileSpreadsheet },
  { id: "bi-analytics", name: "BI & Analytics Dashboard", category: "Add-On", price: 1000, desc: "Real-time insights, custom KPI dashboards", icon: BarChart4 },

  // CATEGORY C: PREMIUM
  { id: "ai-insights", name: "AI-Powered Insights", category: "Premium", price: 1500, desc: "Predictive analytics for cash flow & HR", icon: BrainCircuit },
  { id: "api-hub", name: "API Integration Hub", category: "Premium", price: 1200, desc: "Banks, mobile money, external platforms", icon: Zap },
  { id: "multi-entity", name: "Multi-Entity Management", category: "Premium", price: 1500, desc: "Multi-branch & location corporate mgmt", icon: Network },
]

export default function MarketplacePage() {
  const { 
    activeModuleIds, 
    cartItemIds, 
    toggleModule, 
    toggleCartItem, 
    addSuiteToCart,
    checkoutCart,
    billingCycle, 
    setBillingCycle, 
    userTier 
  } = useModuleStore()
  
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const filteredModules = useMemo(() => {
    return MODULES_DATA.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase())
      const isActive = activeModuleIds.includes(m.id)
      
      if (activeCategory === "Active") return isActive && matchesSearch
      if (activeCategory === "All") return matchesSearch
      return m.category === activeCategory && matchesSearch
    })
  }, [activeCategory, search, activeModuleIds])

  const cartItems = useMemo(() => {
    return cartItemIds.map(id => MODULES_DATA.find(m => m.id === id)).filter(Boolean) as any[]
  }, [cartItemIds])

  const currentMonthlyTotal = useMemo(() => {
    const tierPrice = userTier === 'small' ? 300 : userTier === 'medium' ? 800 : 0
    const modulesPrice = activeModuleIds.reduce((acc, id) => {
      const mod = MODULES_DATA.find(m => m.id === id)
      return acc + (mod?.price || 0)
    }, 0)
    return tierPrice + modulesPrice
  }, [activeModuleIds, userTier])

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price, 0)
  }, [cartItems])

  const grandTotal = useMemo(() => {
    let total = currentMonthlyTotal + cartTotal
    if (billingCycle === 'annual') total = total * 10 * 0.8
    return total
  }, [currentMonthlyTotal, cartTotal, billingCycle])

  const handleToggle = (module: any) => {
    const isActive = activeModuleIds.includes(module.id)
    const isInCart = cartItemIds.includes(module.id)

    if (isActive) {
      // In a real app, this might trigger a cancelation modal
      toggleModule(module.id)
      toast.info(`${module.name} deactivated`)
    } else {
      toggleCartItem(module.id)
      if (!isInCart) {
        toast.success(`${module.name} added to cart`)
      } else {
        toast.info(`${module.name} removed from cart`)
      }
    }
  }

  const handleAddSuite = (suite: any) => {
    const isSuiteFullyActive = suite.moduleIds.every((id: string) => activeModuleIds.includes(id))
    if (isSuiteFullyActive) {
      toast.info(`${suite.name} is already live!`)
      return
    }
    
    addSuiteToCart(suite.moduleIds)
    toast.success(`${suite.name} added to checkout queue`)
  }

  const onPaymentSuccess = async () => {
    const { error } = await activateModules(cartItemIds)
    if (error) {
      toast.error(error)
      return
    }
    checkoutCart()
    toast.success("All items activated successfully!")
  }

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">
      <div className="space-y-10">
        {/* Header content... same as before */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-green-deep bg-brand-green-pale w-fit px-3 py-1 rounded-full">
            <Sparkles className="h-3 w-3" /> Marketplace
          </div>
          <h1 className="text-4xl font-black tracking-tight text-brand-navy">Power up your Business</h1>
          <p className="text-slate-700 font-medium">Select the precision tools your business needs to excel. Scaling made simple.</p>
        </div>

        {/* Filter Bar content... same as before */}
        <div className="flex flex-wrap items-center justify-between gap-6 py-4 border-b border-slate-200">
          <div className="flex bg-slate-50/80 rounded-2xl p-1.5 border border-slate-200/50">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-2 text-xs font-black rounded-xl transition-all",
                  activeCategory === cat 
                    ? "bg-white text-brand-green-deep shadow-sm ring-1 ring-slate-100" 
                    : "text-slate-700 hover:text-brand-navy"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-brand-green-deep transition-colors" />
            <input 
              type="text" 
              placeholder="Find a module..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-5 py-3 text-sm border-2 border-slate-200 rounded-2xl focus:border-brand-green-deep focus:outline-none bg-white lg:w-[300px] font-medium transition-all"
            />
          </div>
        </div>

        {/* Recommended Suites */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-3">
            <Zap className="h-4 w-4 text-brand-green-deep" /> Recommended Ecosystems
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {SUITES.map(suite => {
              const Icon = suite.icon
              const isFullyActive = suite.moduleIds.every((id: string) => activeModuleIds.includes(id))
              const isSomeInCart = suite.moduleIds.some((id: string) => cartItemIds.includes(id)) && !isFullyActive
              const allInCartOrActive = suite.moduleIds.every((id: string) => activeModuleIds.includes(id) || cartItemIds.includes(id))

              return (
                <div key={suite.id} className={cn(
                  "p-5 rounded-[28px] border-2 flex flex-col items-start gap-4 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group",
                  suite.theme,
                  isFullyActive && "opacity-75 grayscale-[0.5]"
                )}>
                  <div className="absolute top-0 right-0 h-16 w-16 bg-white/20 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />
                  <div className="h-12 w-12 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    {isFullyActive ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-black text-sm mb-1 flex items-center gap-2">
                       {suite.name}
                       {isFullyActive && <Check className="h-3 w-3" />}
                    </h3>
                    <p className="text-[10px] font-medium opacity-70 leading-relaxed">{suite.desc}</p>
                  </div>
                  <div className="mt-auto w-full pt-2">
                    <div className="flex items-baseline gap-1 mb-3">
                       <span className="text-xs font-black">ZMW {suite.price}</span>
                       <span className="text-[9px] opacity-60">/mo</span>
                    </div>
                    <button 
                      onClick={() => handleAddSuite(suite)}
                      disabled={isFullyActive || allInCartOrActive}
                      className={cn(
                        "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all",
                        isFullyActive 
                          ? "bg-slate-200 text-slate-700 cursor-not-allowed" 
                          : allInCartOrActive
                          ? "bg-brand-navy text-white"
                          : "bg-white text-slate-700 hover:text-brand-navy hover:shadow-md"
                      )}
                    >
                      {isFullyActive ? "Already Live" : allInCartOrActive ? "In Checkout" : "Instant Setup"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
          {filteredModules.map(module => {
            const isActive = activeModuleIds.includes(module.id)
            const isInCart = cartItemIds.includes(module.id)
            const Icon = module.icon || LayoutDashboard
            
            return (
              <div 
                key={module.id} 
                className={cn(
                  "group relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-500",
                  isActive ? "bg-brand-green-pale/30 border-brand-green-deep/10 shadow-sm" : 
                  isInCart ? "bg-brand-green-pale border-brand-green-deep/20 shadow-md ring-1 ring-brand-green-deep/10" :
                  "bg-white border-slate-200 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1"
                )}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                    isActive || isInCart ? "bg-brand-green-deep text-white scale-110 shadow-lg shadow-brand-green-deep/20" : "bg-slate-50/80 text-slate-600 group-hover:bg-brand-green-pale group-hover:text-brand-green-deep"
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  {/* Category Badge - Now at top right */}
                  <span className={cn(
                    "text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-wider transition-all duration-500",
                    module.category === 'Core' ? "bg-blue-50 text-blue-600" : module.category === 'Premium' ? "bg-purple-50 text-purple-600" : "bg-slate-50/80 text-slate-700"
                  )}>
                    {module.category}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-black text-brand-navy">{module.name}</h4>
                  {isActive && <span className="text-[8px] font-black uppercase text-brand-green-deep bg-white border border-brand-green-deep/20 px-1.5 py-0.5 rounded">Active</span>}
                  {isInCart && <span className="text-[8px] font-black uppercase text-white bg-brand-green-deep px-1.5 py-0.5 rounded animate-pulse">In Cart</span>}
                </div>
                
                <p className="text-sm text-slate-700 line-clamp-2 min-h-[40px] mb-6 font-medium leading-relaxed">
                  {module.desc}
                </p>
                
                <div className="mt-auto pt-5 border-t border-slate-200/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest block mb-0.5">Price</span>
                    <div className="text-lg font-black text-brand-green-deep">ZMW {module.price.toLocaleString()}</div>
                  </div>

                  {/* Action Button - Now at bottom right */}
                  <button 
                    onClick={() => handleToggle(module)}
                    className={cn(
                      "relative group/btn flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden",
                      isActive 
                        ? "bg-white border-2 border-brand-green-deep text-brand-green-deep hover:bg-red-50 hover:border-red-500 hover:text-red-500" 
                        : isInCart 
                        ? "bg-brand-navy text-white shadow-lg" 
                        : "bg-brand-green-deep text-white hover:bg-brand-green-pale hover:text-brand-green-deep hover:shadow-lg hover:-translate-y-0.5"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isActive ? "Deactivate" : isInCart ? "Remove" : "Activate"}
                      {!isActive && !isInCart && <Plus className="h-3 w-3 transition-transform group-hover/btn:rotate-90" />}
                      {isInCart && <Minus className="h-3 w-3" />}
                    </span>
                    {!isActive && !isInCart && (
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sticky Cart Sidebar */}
      <div className="sticky top-24 space-y-8 self-start h-fit">
        <div className="rounded-2xl bg-white border-2 border-slate-200 p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-brand-green-pale rounded-full -mr-16 -mt-16 opacity-50" />
          
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-3">
               <ShoppingCart className="h-4 w-4 text-brand-green-deep" /> Summary
            </h3>
            {cartItems.length > 0 && (
              <span className="bg-brand-green-deep text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg shadow-brand-green-deep/20">
                {cartItems.length} NEW
              </span>
            )}
          </div>
          
          <div className="flex bg-slate-50/80 rounded-2xl p-1 mb-10 border border-slate-200">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                billingCycle === 'monthly' ? "bg-white text-brand-navy shadow-sm" : "text-slate-600 hover:text-slate-600"
              )}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('annual')}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5",
                billingCycle === 'annual' ? "bg-brand-green-deep text-white shadow-lg" : "text-slate-600 hover:text-slate-600"
              )}
            >
              Annual <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded">-20%</span>
            </button>
          </div>

          <div className="space-y-6 mb-10 text-sm">
            {/* Active Subscription Section */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Current Monthly</span>
                <span className="font-bold text-brand-navy">ZMW {currentMonthlyTotal.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-slate-600 font-medium">Business Tier + {activeModuleIds.length} Tools</p>
            </div>

            {/* Cart Items Section */}
            {cartItems.length > 0 && (
              <div className="animate-in slide-in-from-right duration-300">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-green-deep block mb-3">Adding to Cart</span>
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs group">
                      <div className="flex items-center gap-2">
                         <div className="h-1 w-1 rounded-full bg-brand-green-deep" />
                         <span className="text-slate-600 font-bold">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-navy">ZMW {item.price}</span>
                        <button onClick={() => toggleCartItem(item.id)} className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-50 rounded-md transition-all">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-6 border-t-2 border-dashed border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Total Investment</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-brand-navy">ZMW {grandTotal.toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-600 uppercase">/ {billingCycle === 'annual' ? 'yr' : 'mo'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-[24px] p-5 border border-slate-200 mb-8">
             <div className="flex items-start gap-4">
               <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                 <ShieldCheck className="h-4 w-4 text-brand-green-deep" />
               </div>
               <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                 Pay once for activations. Subscription updates automatically on the 1st.
               </p>
             </div>
          </div>

          <button 
            disabled={cartItemIds.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 rounded-[24px] bg-brand-navy py-5 text-sm font-black text-white hover:bg-brand-navy/90 hover:scale-[1.02] transition-all shadow-2xl disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
             Pay & Activate <ArrowRight className="h-5 w-5 text-brand-green-deep" />
          </button>
          
          {cartItemIds.length === 0 && (
            <p className="text-[10px] text-center mt-4 text-slate-600 font-medium italic">Add modules to checkout</p>
          )}
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={onPaymentSuccess}
        items={cartItems.length > 0 ? cartItems.map(i => ({ name: i.name, price: i.price })) : []}
        total={cartTotal}
        billingCycle={billingCycle}
      />
    </div>
  )
}

