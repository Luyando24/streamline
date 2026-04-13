"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { 
  LayoutDashboard, 
  Layers, 
  CreditCard, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  Sparkles,
  Receipt,
  UserCheck,
  CalendarClock,
  Briefcase,
  Package,
  Truck,
  FileSearch,
  BookOpen,
  LineChart,
  BarChart4
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useModuleStore } from "@/lib/store/useModuleStore"

// Static items that are always visible
const STATIC_NAV = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Marketplace", href: "/modules", icon: Layers },
]

// Mapping of module IDs to their navigation items
const MODULE_NAV_MAP: Record<string, any> = {
  'finance-accounting': { name: "Accounting", href: "/accounting", icon: Receipt },
  'payroll-management': { name: "Payroll", href: "/payroll", icon: UserCheck },
  'leave-management': { name: "Leave Mgmt", href: "/leave", icon: CalendarClock },
  'hris-suite': { name: "HR Suite", href: "/hr", icon: Briefcase },
  'procurement-management': { name: "Procurement", href: "/procurement", icon: FileSearch },
  'inventory-management': { name: "Inventory", href: "/inventory", icon: Package },
  'fleet-management': { name: "Fleet Mgmt", href: "/fleet", icon: Truck },
  'bi-analytics': { name: "Analytics", href: "/analytics", icon: LineChart },
  'api-hub': { name: "API Hub", href: "/api-hub", icon: BarChart4 },
}

// Administrative items visible to certain roles
const ADMIN_NAV = [
  { name: "Team", href: "/team", icon: Users },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  const { activeModuleIds } = useModuleStore()
  const isAuthorized = ['owner', 'admin'].includes(userRole)

  // Build the dynamic navigation list
  const navItems = [
    ...STATIC_NAV,
    // Add active modules
    ...activeModuleIds
      .map(id => MODULE_NAV_MAP[id])
      .filter(item => {
        if (!item) return false
        // Sensitivity filtering for standard members
        if (userRole === 'member' && (item.href === '/accounting' || item.href === '/payroll')) return false
        return true
      }),
    // Add admin items only if authorized
    ...(isAuthorized ? ADMIN_NAV : [])
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-transparent text-slate-900 transition-transform">
      <div className="flex h-full flex-col px-3 py-4">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-deep p-1.5 shadow-lg shadow-brand-green-deep/20">
            <Image 
              src="/logo.png" 
              alt="Streamline" 
              width={32} 
              height={32} 
              className="brightness-0 invert"
            />
          </div>
          <span className="text-xl font-black tracking-tighter text-brand-navy">Streamline</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 custom-scrollbar overflow-y-auto pr-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold transition-all",
                  isActive 
                    ? "bg-brand-green-pale text-brand-green-deep shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-brand-navy"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-brand-green-deep" : "text-slate-400 group-hover:text-brand-green-deep"
                  )} />
                  {item.name}
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-brand-green-deep" />}
              </Link>
            )
          })}
        </nav>

        {/* Pro / Trial Status */}
        <div className="mt-auto px-2 pb-4">
          <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-navy">
              <Sparkles className="h-3.5 w-3.5 text-brand-green-deep" /> 22 Days Left
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4 font-bold">
              Your organization is currently on a premium trial.
            </p>
            <Link 
              href="/billing" 
              className="block w-full rounded-xl bg-brand-green-deep py-2.5 text-center text-[11px] font-black text-white hover:bg-brand-green-deep-light transition-all shadow-[0_4px_12px_-2px_rgba(34,197,94,0.3)]"
            >
              UPGRADE NOW
            </Link>
          </div>
        </div>

        {/* User Footer */}
        <div className="mt-4 border-t border-slate-200 pt-4 px-2">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-brand-navy transition-all">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
