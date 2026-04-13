import { 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Wallet,
  CalendarDays,
  TrendingUp,
  ChevronRight,
  BarChart3,
  Shield
} from "lucide-react"
import Link from "next/link"
import { getDashboardData } from "@/lib/actions/dashboard"
import { seedDashboardData } from "@/lib/actions/seed"

export default async function DashboardPage() {
  const data = await getDashboardData()

  // Auto-seed if this is a fresh account with 0 revenue/expenses and user is an admin/owner
  const isAuthorized = ['owner', 'admin'].includes(data.userRole || 'member')
  if (isAuthorized && data.revenue === 0 && data.expenses === 0) {
    await seedDashboardData()
    // Re-fetch after seeding for immediate update
    const freshData = await getDashboardData()
    return <DashboardContent data={freshData} />
  }

  return <DashboardContent data={data} />
}

function DashboardContent({ data }: { data: any }) {
  const isAuthorized = ['owner', 'admin'].includes(data.userRole || 'member')

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-navy">Good morning, {data.userName}.</h1>
          <p className="text-slate-500">Here&apos;s what needs your attention at <span className="text-brand-green-deep font-bold">{data.orgName}</span> today.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-400" suppressHydrationWarning>
          <CalendarDays className="h-4 w-4" />
          {new Date().toLocaleDateString('en-ZM', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <FinanceCard 
          title="Revenue (This Month)" 
          value={isAuthorized ? `ZMW ${data.revenue?.toLocaleString()}` : "••••••"} 
          change={isAuthorized ? "+12.3%" : "Restricted"}
          trend={isAuthorized ? "up" : "neutral"}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <FinanceCard 
          title="Active Modules" 
          value={data.activeModules.toString()} 
          change="Available"
          trend="neutral"
          icon={<FileText className="h-5 w-5" />}
        />
        <FinanceCard 
          title="Expenses (This Month)" 
          value={isAuthorized ? `ZMW ${data.expenses?.toLocaleString()}` : "••••••"} 
          change={isAuthorized ? "-4.1%" : "Restricted"}
          trend={isAuthorized ? "down" : "neutral"}
          icon={<Wallet className="h-5 w-5" />}
        />
        <FinanceCard 
          title="Active Employees" 
          value={data.teamCount.toString()} 
          change="Real-time"
          trend="neutral"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Approvals & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Pending Actions</h3>
                <p className="text-xs text-slate-500">Items that need your attention</p>
              </div>
              <span className="h-6 w-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center">3</span>
            </div>
            <div className="space-y-3">
              {isAuthorized ? (
                <>
                  <TaskItem 
                    title="Review new module activations" 
                    subtitle={`${data.activeModules} modules currently live`} 
                    type="approval"
                    urgent={false}
                  />
                  <TaskItem 
                    title="Verify employee directory" 
                    subtitle={`${data.teamCount} members synced`} 
                    type="approval"
                    urgent={false}
                  />
                  <TaskItem 
                    title="April Payroll needs processing" 
                    subtitle={`Due for ${data.teamCount} employees`} 
                    type="deadline"
                    urgent={true}
                  />
                </>
              ) : (
                <>
                  <TaskItem 
                    title="Complete your profile info" 
                    subtitle="Add skills and bio" 
                    type="approval"
                    urgent={false}
                  />
                  <TaskItem 
                    title="Read company handbook" 
                    subtitle="Latest update: Mar 2026" 
                    type="approval"
                    urgent={false}
                  />
                  <TaskItem 
                    title="Submit weekly check-in" 
                    subtitle="Due by Friday 5 PM" 
                    type="deadline"
                    urgent={true}
                  />
                </>
              )}
            </div>
            <button className="w-full mt-4 py-2.5 text-xs font-black text-brand-green-deep hover:bg-brand-green-pale rounded-xl transition-all flex items-center justify-center gap-1 border border-brand-green-deep/10">
              View All Tasks <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Cash Flow Section */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm relative overflow-hidden">
            {!isAuthorized && (
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
                <div className="max-w-[220px] animate-in fade-in zoom-in duration-500">
                  <Shield className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-brand-navy mb-1 uppercase tracking-tight">Restricted Insight</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Financial health analytics are reserved for Organization Administrators and Owners.</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Cash Flow Overview</h3>
                <p className="text-xs text-slate-500">Income vs. Expenses — Last 6 months</p>
              </div>
              <select className="text-xs font-bold bg-slate-50 border rounded-lg px-3 py-1.5 focus:outline-none">
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="h-[220px] w-full flex items-end gap-3 px-2">
              {(isAuthorized ? data.cashFlowData : [1,2,3,4,5,6]).map((d: any, i: number) => {
                if (!isAuthorized) return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 opacity-20">
                    <div className="w-full flex gap-1 items-end h-[180px]">
                      <div className="flex-1 bg-slate-100 rounded-t-md" style={{ height: `${20 + Math.random() * 40}%` }} />
                      <div className="flex-1 bg-slate-50 rounded-t-md" style={{ height: `${20 + Math.random() * 40}%` }} />
                    </div>
                    <div className="h-2 w-8 bg-slate-100 rounded mt-1" />
                  </div>
                )

                const maxVal = Math.max(...data.cashFlowData.map((m: any) => Math.max(m.income, m.expense)))
                const incomeHeight = (d.income / maxVal) * 100
                const expenseHeight = (d.expense / maxVal) * 100
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-1 items-end h-[180px]">
                      <div className="flex-1 group relative">
                        <div 
                          className="w-full rounded-t-md bg-brand-green-deep/20 group-hover:bg-brand-green-deep/40 transition-all" 
                          style={{ height: `${incomeHeight}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-brand-navy text-white text-[9px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap z-20">
                          ZMW {d.income.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex-1 group relative">
                        <div 
                          className="w-full rounded-t-md bg-orange-200 group-hover:bg-orange-300 transition-all" 
                          style={{ height: `${expenseHeight}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-brand-navy text-white text-[9px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap z-20">
                          ZMW {d.expense.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">{d.month}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2.5 w-2.5 rounded-sm bg-brand-green-deep/30" />
                <span className="text-slate-500 font-bold">Income</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2.5 w-2.5 rounded-sm bg-orange-200" />
                <span className="text-slate-500 font-medium">Expenses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-brand-navy mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-400" /> Upcoming Deadlines
            </h3>
            <div className="space-y-4">
              <DeadlineItem title="NAPSA Contributions" date="15 Apr 2026" daysLeft={3} />
              <DeadlineItem title="ZRA Tax Filing (VAT)" date="18 Apr 2026" daysLeft={6} />
              <DeadlineItem title="Insurance Renewal" date="5 May 2026" daysLeft={22} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-brand-navy mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" /> Recent System Logs
            </h3>
            <div className="space-y-4">
              {data.recentActivity.length > 0 ? data.recentActivity.map((log: any, i: number) => (
                <ActivityItem 
                  key={i}
                  title={log.action} 
                  subtitle={`By ${log.profiles?.full_name || 'System'}`}
                  time={new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  type={log.action.toLowerCase().includes('create') ? 'team' : 'finance'}
                />
              )) : (
                <p className="text-[10px] text-slate-400 italic">No recent activity found</p>
              )}
            </div>
          </div>

          {/* Finance Health - RESTRICTED */}
          {isAuthorized && (
            <div className="rounded-2xl bg-brand-navy/95 text-white p-6 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <BarChart3 className="h-3 w-3" /> Financial Health
              </h3>
              <div className="space-y-4">
                <HealthBar label="Cash Reserves" percent={74} color="bg-brand-teal" />
                <HealthBar label="Budget Utilization" percent={51} color="bg-blue-400" />
                <HealthBar label="System Modules" percent={Math.min((data.activeModules / 20) * 100, 100)} color="bg-brand-teal" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FinanceCard({ title, value, change, trend, icon }: { title: string; value: string; change: string; trend: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
          {icon}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 ${
          trend === 'up' ? 'bg-green-50 text-green-600' : 
          trend === 'down' ? 'bg-green-50 text-green-600' : 
          trend === 'warning' ? 'bg-orange-50 text-orange-600' : 
          'bg-slate-50 text-slate-500'
        }`}>
          {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
          {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
          {change}
        </span>
      </div>
      <h3 className="text-xs font-medium text-slate-500 mb-1">{title}</h3>
      <p className="text-2xl font-black text-brand-navy">{value}</p>
    </div>
  )
}

function TaskItem({ title, subtitle, type, urgent }: { title: string; subtitle: string; type: string; urgent: boolean }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${urgent ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50/50 hover:bg-white'}`}>
      <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
        type === 'overdue' ? 'bg-red-100 text-red-500' :
        type === 'deadline' ? 'bg-orange-100 text-orange-500' :
        'bg-blue-100 text-blue-500'
      }`}>
        {type === 'overdue' ? <AlertCircle className="h-4 w-4" /> :
         type === 'deadline' ? <Clock className="h-4 w-4" /> :
         <CheckCircle2 className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-brand-navy truncate">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      <button className="text-[10px] font-black text-brand-green-deep hover:underline shrink-0 mt-1">
        {type === 'approval' ? 'Review' : type === 'overdue' ? 'Follow Up' : 'Process'}
      </button>
    </div>
  )
}

function DeadlineItem({ title, date, daysLeft }: { title: string; date: string; daysLeft: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
        daysLeft <= 5 ? 'bg-red-100 text-red-600' : 
        daysLeft <= 14 ? 'bg-orange-100 text-orange-600' : 
        'bg-slate-100 text-slate-500'
      }`}>
        {daysLeft}d
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-brand-navy truncate">{title}</p>
        <p className="text-[10px] text-slate-400">{date}</p>
      </div>
    </div>
  )
}

function ActivityItem({ title, subtitle, time, type }: { title: string; subtitle: string; time: string; type: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
        type === 'finance' ? 'bg-brand-green-deep' : 
        type === 'team' ? 'bg-blue-500' : 
        'bg-orange-500'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700 truncate">{title}</p>
        <p className="text-[10px] text-slate-400">{subtitle}</p>
      </div>
      <span className="text-[10px] text-slate-300 shrink-0" suppressHydrationWarning>{time}</span>
    </div>
  )
}

function HealthBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold">{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-brand-green-deep`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
