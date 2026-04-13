# STREAMLINE
## Modular Business Automation SaaS Platform
### Project Description & Developer Reference

> **Powered by CodeWave | 2026**  
> *Confidential — Internal Developer Reference*

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Application Route Structure](#3-application-route-structure)
4. [Database Schema](#4-database-schema-supabase)
5. [Platform Modules — Seed Data](#5-platform-modules-seed-data)
6. [Pricing Logic](#6-pricing-logic)
7. [Core Features to Build](#7-core-features-to-build)
8. [Additional Revenue Streams & GTM](#8-additional-revenue-streams--go-to-market)
9. [Scalability & Expansion Roadmap](#9-scalability--expansion-roadmap)

---

## 1. Project Overview

Streamline is a cloud-based, multi-tenant, self-service business automation platform built for African SMEs, NGOs, and enterprises. The core concept is a **"build-your-own ERP ecosystem"** where each organization selects only the modules it needs and pays only for what it uses.

The platform is developed and maintained by **CodeWave**, targeting Zambia as the primary market with expansion plans across Sub-Saharan Africa.

### 1.1 Mission

To put African businesses in control of their growth — one module at a time — through an affordable, locally compliant, and easy-to-use automation platform.

### 1.2 Tagline

> *"Simplify. Integrate. Succeed." — ERP & People Modular*

### 1.3 Core Differentiators

- **Modular Freedom** — clients subscribe only to the modules they need
- **Plug-and-Play** — easy onboarding with minimal IT dependency
- **Local Context** — built for Zambian/African compliance: ZRA, NAPSA, NHIMA, Labour Laws
- **Self-Service First** — clients configure, customize, and scale independently
- **Scalable** — designed to grow from micro-businesses to large enterprises

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | TypeScript, Server Components |
| Database | Supabase (PostgreSQL) | Row Level Security (RLS) enabled |
| Auth | Supabase Auth | Email/password + magic link |
| Hosting | Vercel | Edge functions, CI/CD via GitHub |
| Styling | Tailwind CSS v3 | Utility-first, mobile-first |
| State | Zustand / React Context | Prefer Zustand for global state |
| Forms | React Hook Form + Zod | Type-safe validation |
| File Storage | Supabase Storage | Bucket: `org-assets` |
| Payments | Paystack (preferred) | ZMW-native, Zambian market |

### 2.1 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

### 2.2 Key Conventions

- Use **Server Components** by default; Client Components only for interactive UI
- Use `@supabase/ssr` (not the deprecated `auth-helpers`) for App Router
- Supabase **server client** in Server Components, **browser client** in Client Components
- All currency is in **Zambian Kwacha (ZMW)**
- TypeScript **strict mode** enabled throughout

---

## 3. Application Route Structure

| Route | Description |
|---|---|
| `/(auth)/login` | Email/password login page |
| `/(auth)/register` | New organization registration |
| `/(auth)/onboarding` | Multi-step wizard: org → tier → modules → billing |
| `/(dashboard)/dashboard` | Org overview: modules, costs, alerts |
| `/(dashboard)/modules` | Module marketplace — activate/deactivate |
| `/(dashboard)/billing` | Subscription, invoices, billing cycle |
| `/(dashboard)/team` | Invite/remove members, assign roles |
| `/(dashboard)/settings` | Org profile, logo, preferences |
| `/api/modules` | Module CRUD endpoints |
| `/api/subscriptions` | Subscription management |
| `/api/webhooks` | Paystack billing webhooks |

---

## 4. Database Schema (Supabase)

> All tables use **Row Level Security (RLS)**. Users can only access rows where `org_id` matches their profile. Owners/admins can modify; members are read-only.

### 4.1 `organizations`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | Default: `gen_random_uuid()` |
| `name` | `text` | Organization display name |
| `slug` | `text UNIQUE` | URL-friendly identifier |
| `user_tier` | `text` | `micro \| small \| medium \| large \| enterprise` |
| `subscription_status` | `text` | `active \| trialing \| cancelled \| expired` |
| `billing_cycle` | `text` | `monthly \| quarterly \| annual` |
| `created_at` | `timestamptz` | Default: `now()` |
| `updated_at` | `timestamptz` | Default: `now()` |

### 4.2 `profiles`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | FK → `auth.users.id` |
| `org_id` | `uuid` | FK → `organizations.id` |
| `full_name` | `text` | User display name |
| `role` | `text` | `owner \| admin \| member` |
| `email` | `text` | Mirrors `auth.users.email` |
| `created_at` | `timestamptz` | Default: `now()` |

### 4.3 `modules`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `name` | `text` | e.g. `Payroll Management` |
| `slug` | `text UNIQUE` | e.g. `payroll-management` |
| `category` | `text` | `core \| addon \| premium` |
| `description` | `text` | Short feature summary |
| `monthly_price` | `integer` | ZMW, no decimals |
| `quarterly_price` | `integer` | ZMW |
| `annual_price` | `integer` | ZMW |
| `is_active` | `boolean` | Whether module is available on platform |

### 4.4 `org_modules`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `org_id` | `uuid` | FK → `organizations.id` |
| `module_id` | `uuid` | FK → `modules.id` |
| `activated_at` | `timestamptz` | When org subscribed to module |
| `is_active` | `boolean` | Can be toggled on/off |

### 4.5 `subscriptions`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `org_id` | `uuid` | FK → `organizations.id` |
| `billing_cycle` | `text` | `monthly \| quarterly \| annual` |
| `user_tier` | `text` | `micro \| small \| medium \| large \| enterprise` |
| `amount_zmw` | `integer` | Total calculated fee in ZMW |
| `starts_at` | `timestamptz` | Subscription start |
| `ends_at` | `timestamptz` | Subscription end / renewal date |
| `status` | `text` | `active \| trialing \| cancelled \| expired` |

### 4.6 `audit_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK` | |
| `org_id` | `uuid` | FK → `organizations.id` |
| `user_id` | `uuid` | FK → `profiles.id` |
| `action` | `text` | e.g. `module.activated`, `member.invited` |
| `table_name` | `text` | Affected table |
| `old_values` | `jsonb` | Previous state (nullable) |
| `new_values` | `jsonb` | New state |
| `created_at` | `timestamptz` | Default: `now()` |

### 4.7 Supabase Setup Checklist

- [ ] Enable Email Auth + Magic Link in Supabase dashboard
- [ ] Enable RLS on **all** tables
- [ ] Create `handle_new_user` trigger: auto-create profile on `auth.users` insert
- [ ] Create storage bucket `org-assets` (public: false)
- [ ] Seed `modules` table with all 20 modules and pricing data
- [ ] RLS policy: users read/write only where `org_id` = their profile's `org_id`
- [ ] RLS policy: owners/admins can modify; members read-only

---

## 5. Platform Modules (Seed Data)

> All 20 modules must be seeded into the `modules` table. Prices are in ZMW.  
> **Pricing formula: Total Fee = Module Fee + User Tier Fee**

### 5.1 Category A — Core Modules

| Module | Monthly | Quarterly | Annual | Key Features |
|---|---|---|---|---|
| Finance & Accounting | 1,200 | 3,300 | 12,000 | General ledger, budgeting, ZRA compliance |
| Payroll Management | 800 | 2,200 | 8,000 | PAYE, NAPSA, NHIMA, payslip automation |
| Leave Management | 400 | 1,100 | 4,000 | Leave tracking, approvals, balances |
| Performance Management | 600 | 1,600 | 6,000 | KPI tracking, appraisals, 360 feedback |
| Procurement Management | 700 | 1,900 | 7,000 | Requisitions, approvals, supplier tracking |
| Inventory Management | 700 | 1,900 | 7,000 | Stock tracking, alerts, warehouse mgmt |
| Fleet Management | 600 | 1,600 | 6,000 | Fuel tracking, maintenance, vehicle usage |

### 5.2 Category B — Add-On Modules (Revenue Drivers)

| Module | Monthly | Quarterly | Annual | Key Features |
|---|---|---|---|---|
| HRIS Full Suite | 1,000 | 2,800 | 10,000 | Employee records, onboarding, contracts |
| Project Management | 800 | 2,200 | 8,000 | Task tracking, timelines, donor reporting |
| CRM | 900 | 2,500 | 9,000 | Sales pipeline, customer tracking |
| Asset Management | 500 | 1,400 | 5,000 | Fixed asset tracking, depreciation |
| Document Management | 600 | 1,600 | 6,000 | Secure storage, version control |
| Compliance & Audit | 700 | 1,900 | 7,000 | Internal audits, compliance checklists |
| E-learning & Training | TBD | TBD | TBD | Staff training, onboarding programs |
| Time & Attendance | 500 | 1,400 | 5,000 | Biometric/remote clock-in, shift mgmt |
| Expense Management | 500 | 1,400 | 5,000 | Claims, approvals, reimbursements |
| BI & Analytics Dashboard | 1,000 | 2,800 | 10,000 | Real-time insights, KPI dashboards |

### 5.3 Category C — Premium Modules

| Module | Monthly | Quarterly | Annual | Key Features |
|---|---|---|---|---|
| AI-Powered Insights | 1,500 | 4,200 | 15,000 | Predictive analytics: cash flow, HR performance |
| API Integration Hub | 1,200 | 3,300 | 12,000 | Banks, mobile money, external systems |
| Multi-Entity Management | 1,500 | 4,200 | 15,000 | Multi-branch/location corporates |

---

## 6. Pricing Logic

> **Formula: Total Fee = Module Fee(s) + User Tier Fee**  
> Both components are charged together per billing cycle.

### 6.1 User Tier Pricing (ZMW — added on top of all module fees)

| Tier | Users | Monthly | Quarterly | Annual |
|---|---|---|---|---|
| Micro | 1–5 | 0 | 0 | 0 |
| Small | 6–15 | 300 | 800 | 3,000 |
| Medium | 16–50 | 800 | 2,200 | 8,000 |
| Large | 51–150 | 1,800 | 5,000 | 18,000 |
| Enterprise | 151+ | Custom | Custom | Custom |

### 6.2 Bundle — Full HRIS Suite

*Includes: Payroll, Leave, Performance, Employee Records, Time & Attendance*

| Tier | Monthly | Quarterly | Annual |
|---|---|---|---|
| Micro (1–5) | 1,200 | 3,300 | 12,000 |
| Small (6–15) | 1,500 | 4,100 | 15,000 |
| Medium (16–50) | 2,200 | 6,000 | 22,000 |
| Large (51–150) | 3,800 | 10,500 | 38,000 |

### 6.3 Bundle — ERP Suite (Finance-Focused)

*Includes: Finance & Accounting, Procurement, Inventory, Asset Management, Expense Management*

| Tier | Monthly | Quarterly | Annual |
|---|---|---|---|
| Micro | 1,800 | 5,000 | 18,000 |
| Small | 2,300 | 6,300 | 23,000 |
| Medium | 3,500 | 9,500 | 35,000 |
| Large | 6,000 | 16,500 | 60,000 |

### 6.4 Bundle — Full Business Suite (All Modules)

*Includes: HRIS, ERP, CRM, Fleet, BI, AI Insights, Compliance*

| Tier | Monthly | Quarterly | Annual |
|---|---|---|---|
| Micro | 3,000 | 8,200 | 30,000 |
| Small | 4,200 | 11,500 | 42,000 |
| Medium | 6,500 | 18,000 | 65,000 |
| Large | 11,000 | 30,000 | 110,000 |
| Enterprise | Custom | Custom | Custom |

---

## 7. Core Features to Build

### 7.1 Authentication & Onboarding

- Supabase Auth: email + password and magic link
- **Multi-step onboarding wizard:**
  1. Org name & country
  2. User tier selection
  3. Module selection
  4. Billing cycle
  5. Go live
- Role-based access control: `owner`, `admin`, `member`
- Team member invite by email — sends Supabase invite link
- `handle_new_user` trigger auto-creates profile on registration

### 7.2 Dashboard

- Active modules summary with usage indicators
- Current subscription: tier, billing cycle, renewal date, monthly cost
- Freemium/trial banner (14–30 days) for new organizations
- Notifications panel for system alerts and billing reminders
- Quick-add module CTA button

### 7.3 Module Marketplace

- Card grid showing all 20 modules, tabbed by category (Core / Add-On / Premium)
- Each card: name, description, price (ZMW), activate/deactivate toggle
- Bundle pricing cards for HRIS Suite, ERP Suite, Full Business Suite
- **Real-time cost calculator:** updates total as modules are toggled on/off
- Visual indicator for currently active modules

### 7.4 Billing & Subscription

- User tier selector with clear user count ranges
- Billing cycle selector: monthly / quarterly / annual (show savings %)
- Cost breakdown: list of module fees + user tier fee = total ZMW
- Invoice/receipt generation with PDF export
- Paystack integration for payment processing
- Webhook handler to update subscription status on payment events

### 7.5 Settings

- Organization profile: name, logo upload (Supabase Storage), industry, country
- Team management: invite, remove, change roles
- Module activation log with timestamps
- Billing history and invoice downloads

### 7.6 UI/UX Standards

- **Brand colors:** teal `#0F6E56` primary, navy `#1A2B3C` secondary
- Mobile-first, fully responsive sidebar navigation
- Collapsed sidebar on mobile with icon-only mode
- Toast notifications for all state-changing actions
- Loading skeletons for all async data fetching
- Empty states on every list and table view
- Error boundaries with user-friendly fallback messages

---

## 8. Additional Revenue Streams & Go-To-Market

### 8.1 Additional Revenue Streams

- Implementation & onboarding fees (one-time, per client)
- Customization services (bespoke module development)
- Training packages (online or on-site)
- Data migration services (from Excel or legacy systems)
- Paid API integrations (custom connectors)
- White-label solutions for technology partners

### 8.2 Go-To-Market Strategy

- **Free trial:** 14–30 days, full feature access
- **Freemium version:** limited users and modules (permanent free tier)
- **Channel partners:** accounting firms, HR consultants, NGO networks
- **Digital marketing:** demos, webinars, LinkedIn/Facebook campaigns
- **Industry bundles:** NGO Bundle, SME Starter Bundle

### 8.3 Target Market Segments

| Segment | Primary Need |
|---|---|
| SMEs (Primary) | Replace Excel with affordable automation |
| Growing Mid-Sized Firms | Cross-department integration |
| NGOs & Donor-Funded Projects | Compliance, audit trails, donor reporting |
| Corporate Enterprises | Customizable multi-entity solutions |

---

## 9. Scalability & Expansion Roadmap

### 9.1 Expansion Markets (Phase 2+)

- Malawi
- Zimbabwe
- Botswana
- Kenya
- Democratic Republic of Congo

### 9.2 Platform Integrations (Roadmap)

- Mobile money: MTN Momo, Airtel Money, ZAMTEL Kwacha
- Banking APIs: local Zambian bank integrations
- Government systems: ZRA, NAPSA, NHIMA (where APIs are available)
- Biometric devices: Time & Attendance hardware integration

### 9.3 Recommended Build Order

| Step | Task |
|---|---|
| 1 | Next.js scaffold + Tailwind + Supabase SSR setup |
| 2 | Database tables creation + seed 20 modules |
| 3 | Auth flow: register, login, magic link |
| 4 | Onboarding wizard (5 steps) |
| 5 | Dashboard layout + sidebar navigation |
| 6 | Module marketplace with real-time cost calculator |
| 7 | Billing & subscription management |
| 8 | Team management + settings |
| 9 | Paystack integration + webhook handler |
| 10 | Audit logs, notifications, PDF export |

---

*Streamline — Project Description v1.0 | CodeWave | 2026*
