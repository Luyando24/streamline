import { Sidebar } from "@/components/dashboard/sidebar"
import { Bell, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // 1. Get Profile First (Isolated)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect("/onboarding")

  // 2. Get Organization Details (Isolated)
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.org_id)
    .single()

  const roleLabel = profile.role === 'owner' ? 'Org Owner' : profile.role === 'admin' ? 'Administrator' : 'Team Member'
  const initials = (profile.full_name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen bg-slate-50/80">
      {/* Sidebar */}
      <Sidebar userRole={profile.role || 'member'} />

      {/* Main Content */}
      <main className="flex-1 pl-64 transition-all">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 border-b bg-white/80 backdrop-blur-md px-8 flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-widest hidden sm:block">Organization</h2>
              <div className="h-4 w-px bg-slate-200 hidden sm:block" />
              <div className="font-bold text-brand-navy flex items-center gap-2">
                {organization?.name || "My Business"}
              </div>
            </div>
            
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <input 
                type="text" 
                placeholder="Search modules, invoices..." 
                className="w-full pl-10 pr-4 py-2 text-xs border rounded-full bg-slate-50/80/50 focus:outline-none focus:ring-1 focus:ring-brand-teal transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <Bell className="h-5 w-5 text-slate-700" />
              <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-brand-green-deep rounded-full border-2 border-white shadow-[0_0_5px_rgba(0,153,41,0.3)]" />
            </button>

            <div className="flex items-center gap-4 border-l pl-6">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-brand-navy">{profile.full_name}</span>
                <span className="text-[10px] text-slate-700 font-bold uppercase tracking-widest opacity-60">
                  {roleLabel}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-brand-green-pale flex items-center justify-center text-brand-green-deep font-black border-2 border-white shadow-sm ring-1 ring-slate-100">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  )
}

