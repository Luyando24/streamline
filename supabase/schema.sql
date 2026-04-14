-- Profiles table to store public user data
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  onboarded boolean default false,
  avatar_url text,
  org_id uuid references public.organizations(id), -- Reference to active organization
  role text, -- Global or current role
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Organizations table
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  industry text,
  country text default 'Zambia',
  tier text default 'micro',
  billing_cycle text default 'monthly',
  created_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

alter table public.organizations enable row level security;

-- Organization Memberships
create type public.org_role as enum ('owner', 'admin', 'member');

create table if not exists public.organization_members (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  role public.org_role default 'member',
  created_at timestamptz default now(),
  unique(org_id, profile_id)
);

alter table public.organization_members enable row level security;

-- Organization Modules
create table if not exists public.organization_modules (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  module_key text not null,
  status text default 'active',
  trial_ends_at timestamptz,
  created_at timestamptz default now(),
  unique(org_id, module_key)
);

alter table public.organization_modules enable row level security;

-- RLS Policies & Security Functions

-- Function to check if a user is a member of an organization (bypasses RLS)
create or replace function public.is_org_member(org_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.organization_members
    where organization_members.org_id = is_org_member.org_id
    and organization_members.profile_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Function to check if a user is an owner of an organization (bypasses RLS)
create or replace function public.is_org_owner(org_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.organizations
    where id = org_id and created_by = auth.uid()
  ) or exists (
    select 1 from public.organization_members
    where organization_members.org_id = is_org_owner.org_id
    and organization_members.profile_id = auth.uid()
    and organization_members.role = 'owner'
  );
end;
$$ language plpgsql security definer;

-- Profiles
create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Organizations
create policy "Members can view their organization." on public.organizations
  for select using (
    auth.uid() = created_by 
    or 
    exists (select 1 from public.profiles where id = auth.uid() and org_id = public.organizations.id)
  );

create policy "Owners can update their organization." on public.organizations
  for update using (public.is_org_owner(id));

create policy "Creators can create organizations." on public.organizations
  for insert with check (auth.uid() = created_by);

-- Organization Members
create policy "Individuals can view their own memberships." on public.organization_members
  for select using (profile_id = auth.uid());

create policy "Owners can view all org memberships." on public.organization_members
  for select using (public.is_org_owner(org_id));

create policy "Owners can manage memberships." on public.organization_members
  for all using (public.is_org_owner(org_id));

-- Organization Modules
create policy "Members can view active modules." on public.organization_modules
  for select using (public.is_org_member(org_id));

create policy "Owners can manage modules." on public.organization_modules
  for all using (public.is_org_owner(org_id));

-- Transactions
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  type text check (type in ('income', 'expense')),
  category text,
  amount decimal(15, 2) not null,
  description text,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Owners can manage transactions." on public.transactions
  for all using (public.is_org_owner(org_id));

create policy "Members can view transactions." on public.transactions
  for select using (public.is_org_member(org_id));

-- Audit Logs
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table public.audit_logs enable row level security;

create policy "Members can view audit logs." on public.audit_logs
  for select using (public.is_org_member(org_id));

create policy "Admins can manage audit logs." on public.audit_logs
  for all using (public.is_org_owner(org_id));
-- ACCOUNTING MODULE: DOUBLE-ENTRY BOOKKEEPING core

-- 1. Chart of Accounts
create type public.account_category as enum ('asset', 'liability', 'equity', 'revenue', 'expense');

create table if not exists public.accounts (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  code text not null, -- e.g. '1010'
  name text not null, -- e.g. 'Cash at Bank'
  type public.account_category not null,
  normal_balance text check (normal_balance in ('debit', 'credit')),
  description text,
  is_system boolean default false, -- Prevent deletion of core accounts
  created_at timestamptz default now(),
  unique(org_id, code)
);

alter table public.accounts enable row level security;

create policy "Members can view accounts." on public.accounts
  for select using (public.is_org_member(org_id));

create policy "Owners can manage accounts." on public.accounts
  for all using (public.is_org_owner(org_id));

-- 2. Journal Entries (The "What and When")
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  date date not null default current_date,
  description text not null,
  reference_no text, -- Invoice #, Receipt #
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.journal_entries enable row level security;

create policy "Members can view journals." on public.journal_entries
  for select using (public.is_org_member(org_id));

create policy "Owners can manage journals." on public.journal_entries
  for all using (public.is_org_owner(org_id));

-- 3. Ledger Entries (The "How Much and Where" - Debits & Credits)
create table if not exists public.ledger_entries (
  id uuid default gen_random_uuid() primary key,
  journal_entry_id uuid references public.journal_entries(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete restrict,
  amount decimal(15, 2) not null, -- Positive for debits, negative for credits or use type flag?
  -- Industry standard often uses a single amount with type flag or separate DR/CR columns.
  -- We'll use a single amount with 'debit' or 'credit' for maximum clarity in queries.
  entry_type text check (entry_type in ('debit', 'credit')),
  created_at timestamptz default now()
);

alter table public.ledger_entries enable row level security;

-- Ledger entries inherit journal visibility
create policy "Members can view ledger entries." on public.ledger_entries
  for select using (
    exists (
      select 1 from public.journal_entries 
      where id = ledger_entries.journal_entry_id 
      and public.is_org_member(org_id)
    )
  );

create policy "Owners can manage ledger entries." on public.ledger_entries
  for all using (
    exists (
      select 1 from public.journal_entries 
      where id = ledger_entries.journal_entry_id 
      and public.is_org_owner(org_id)
    )
  );

-- Helper: Function to record a balanced journal entry in one go (Industry Standard)
-- This avoids partial postings.
create or replace function public.post_balanced_journal(
  p_org_id uuid,
  p_date date,
  p_description text,
  p_reference_no text,
  p_entries jsonb -- Array of {account_id, amount, entry_type}
) returns uuid as $$
declare
  v_journal_id uuid;
  v_total_debit decimal(15, 2) := 0;
  v_total_credit decimal(15, 2) := 0;
  v_entry record;
begin
  -- 1. Calculate totals to ensure balance
  for v_entry in select * from jsonb_to_recordset(p_entries) as x(account_id uuid, amount decimal, entry_type text) loop
    if v_entry.entry_type = 'debit' then
      v_total_debit := v_total_debit + v_entry.amount;
    else
      v_total_credit := v_total_credit + v_entry.amount;
    end if;
  end loop;

  -- 2. Validate Balance
  if v_total_debit != v_total_credit then
    raise exception 'Journal entry is not balanced. Total Debits: %, Total Credits: %', v_total_debit, v_total_credit;
  end if;

  -- 3. Insert Journal
  insert into public.journal_entries (org_id, date, description, reference_no, created_by)
  values (p_org_id, p_date, p_description, p_reference_no, auth.uid())
  returning id into v_journal_id;

  -- 4. Insert Ledger Entries
  insert into public.ledger_entries (journal_entry_id, account_id, amount, entry_type)
  select v_journal_id, account_id, amount, entry_type
  from jsonb_to_recordset(p_entries) as x(account_id uuid, amount decimal, entry_type text);

  return v_journal_id;
end;
$$ language plpgsql security definer;
-- PAYROLL MODULE: ZAMBIAN STATUTORY COMPLIANCE

-- 1. Employee Payroll Profiles
create table if not exists public.employee_profiles (
  id uuid references public.profiles(id) on delete cascade primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  basic_salary decimal(15, 2) default 0,
  bank_name text,
  account_no text,
  tpin text, -- Zambian Tax Payers Identification Number
  nrc_no text, -- National Registration Card
  napsa_no text, -- Social Security
  nhima_no text, -- National Health Insurance
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.employee_profiles enable row level security;

create policy "Owners can manage employee payroll data." on public.employee_profiles
  for all using (public.is_org_owner(org_id));

-- 2. Payroll Runs (Month-end batches)
create table if not exists public.payroll_runs (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null,
  status text default 'draft' check (status in ('draft', 'finalized')),
  journal_entry_id uuid references public.journal_entries(id), -- Link to Accounting
  created_at timestamptz default now()
);

alter table public.payroll_runs enable row level security;

create policy "Owners can manage payroll runs." on public.payroll_runs
  for all using (public.is_org_owner(org_id));

-- 3. Payslips (Individual records)
create table if not exists public.payslips (
  id uuid default gen_random_uuid() primary key,
  run_id uuid references public.payroll_runs(id) on delete cascade,
  employee_id uuid references public.profiles(id) on delete cascade,
  basic_pay decimal(15, 2) not null,
  allowances jsonb default '[]'::jsonb, -- Array of {name, amount}
  paye_tax decimal(15, 2) default 0,
  napsa_deduction decimal(15, 2) default 0,
  nhima_deduction decimal(15, 2) default 0,
  other_deductions jsonb default '[]'::jsonb,
  net_pay decimal(15, 2) not null,
  created_at timestamptz default now()
);

alter table public.payslips enable row level security;

create policy "Owners can manage all payslips." on public.payslips
  for all using (
    exists (
      select 1 from public.payroll_runs 
      where id = payslips.run_id 
      and public.is_org_owner(org_id)
    )
  );

create policy "Employees can view their own payslips." on public.payslips
  for select using (employee_id = auth.uid());
-- LEAVE MANAGEMENT MODULE

-- 1. Leave Types (Policies)
create table if not exists public.leave_types (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null, -- e.g. 'Annual Leave', 'Sick Leave'
  base_days integer not null, -- e.g. 24
  color text, -- For calendar visualization
  created_at timestamptz default now(),
  unique(org_id, name)
);

alter table public.leave_types enable row level security;

create policy "Members can view leave types." on public.leave_types
  for select using (public.is_org_member(org_id));

create policy "Owners can manage leave types." on public.leave_types
  for all using (public.is_org_owner(org_id));

-- 2. Leave Balances (Tracking)
create table if not exists public.leave_balances (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  employee_id uuid references public.profiles(id) on delete cascade,
  leave_type_id uuid references public.leave_types(id) on delete cascade,
  year integer not null,
  remaining_days decimal(5, 2) not null,
  created_at timestamptz default now(),
  unique(employee_id, leave_type_id, year)
);

alter table public.leave_balances enable row level security;

create policy "Members can view their own balances." on public.leave_balances
  for select using (employee_id = auth.uid());

create policy "Owners can manage all balances." on public.leave_balances
  for all using (public.is_org_owner(org_id));

-- 3. Leave Requests (Workflow)
create table if not exists public.leave_requests (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  employee_id uuid references public.profiles(id) on delete cascade,
  leave_type_id uuid references public.leave_types(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  days_count decimal(5, 2) not null,
  reason text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  manager_note text,
  approved_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.leave_requests enable row level security;

create policy "Individuals can view their requests." on public.leave_requests
  for select using (employee_id = auth.uid());

create policy "Managers can view org requests." on public.leave_requests
  for select using (public.is_org_member(org_id)); -- Allow members to see others for conflict detection? 
  -- Actually, let's restrict full details to owners/admins for now.
  -- Better: Owners can manage all.

create policy "Owners can manage all requests." on public.leave_requests
  for all using (public.is_org_owner(org_id));
-- PROCUREMENT MODULE: GOVERNANCE & SPEND

-- 1. Vendors (Supplied Database)
create table if not exists public.vendors (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  contact_person text,
  email text,
  phone text,
  tpin text, -- Zambian Tax Payers Identification Number
  bank_name text,
  bank_account_no text,
  address text,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(org_id, name)
);

alter table public.vendors enable row level security;

create policy "Members can view vendors." on public.vendors
  for select using (public.is_org_member(org_id));

create policy "Owners can manage vendors." on public.vendors
  for all using (public.is_org_owner(org_id));

-- 2. Purchase Requisitions (Internal Requests)
create table if not exists public.purchase_requisitions (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  requestor_id uuid references public.profiles(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  title text not null,
  total_amount decimal(15, 2) default 0,
  status text default 'draft' check (status in ('draft', 'pending_l1', 'pending_l2', 'pending_l3', 'approved', 'rejected', 'paid')),
  current_level integer default 1, -- Track which approval level we are at
  created_at timestamptz default now()
);

alter table public.purchase_requisitions enable row level security;

create policy "Members can view their own requisitions." on public.purchase_requisitions
  for select using (requestor_id = auth.uid());

create policy "Managers can view org requisitions." on public.purchase_requisitions
  for select using (public.is_org_member(org_id));

create policy "Owners can manage all requisitions." on public.purchase_requisitions
  for all using (public.is_org_owner(org_id));

-- 3. Requisition Line Items
create table if not exists public.requisition_items (
  id uuid default gen_random_uuid() primary key,
  requisition_id uuid references public.purchase_requisitions(id) on delete cascade,
  description text not null,
  quantity decimal(12, 2) not null,
  unit_price decimal(15, 2) not null,
  total_price decimal(15, 2) not null,
  created_at timestamptz default now()
);

alter table public.requisition_items enable row level security;

create policy "Inherit requisition visibility." on public.requisition_items
  for select using (
    exists (
      select 1 from public.purchase_requisitions 
      where id = requisition_items.requisition_id 
      and (requestor_id = auth.uid() or public.is_org_member(org_id))
    )
  );

-- 4. Requisition Approvals (Audit Trail)
create table if not exists public.requisition_approvals (
  id uuid default gen_random_uuid() primary key,
  requisition_id uuid references public.purchase_requisitions(id) on delete cascade,
  approver_id uuid references public.profiles(id),
  level integer not null, -- 1 = Supervisor, 2 = Finance, 3 = Director
  status text not null check (status in ('approved', 'rejected')),
  comments text,
  created_at timestamptz default now()
);

alter table public.requisition_approvals enable row level security;

create policy "Members can view audit trail." on public.requisition_approvals
  for select using (
    exists (
      select 1 from public.purchase_requisitions 
      where id = requisition_approvals.requisition_id 
      and public.is_org_member(org_id)
    )
  );

-- INVENTORY MANAGEMENT MODULE: STOCK & VALUATION

-- 1. Warehouses (Locations)
create table if not exists public.warehouses (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  location_info text,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(org_id, name)
);

alter table public.warehouses enable row level security;

create policy "Members can view warehouses." on public.warehouses
  for select using (public.is_org_member(org_id));

create policy "Owners can manage warehouses." on public.warehouses
  for all using (public.is_org_owner(org_id));

-- 2. Inventory Items (SKU Registry)
create table if not exists public.inventory_items (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  sku text not null,
  name text not null,
  description text,
  category text,
  unit text default 'pcs', -- e.g. pcs, kg, boxes
  reorder_level decimal(12, 2) default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(org_id, sku)
);

alter table public.inventory_items enable row level security;

create policy "Members can view inventory items." on public.inventory_items
  for select using (public.is_org_member(org_id));

create policy "Owners can manage items." on public.inventory_items
  for all using (public.is_org_owner(org_id));

-- 3. Stock Levels (Actual Quantities)
create table if not exists public.stock_levels (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  item_id uuid references public.inventory_items(id) on delete cascade,
  warehouse_id uuid references public.warehouses(id) on delete cascade,
  quantity decimal(15, 2) default 0,
  avg_cost decimal(15, 2) default 0, -- Weighted Average Cost
  last_updated timestamptz default now(),
  unique(item_id, warehouse_id)
);

alter table public.stock_levels enable row level security;

create policy "Members can view stock levels." on public.stock_levels
  for select using (public.is_org_member(org_id));

create policy "Owners can manage stock." on public.stock_levels
  for all using (public.is_org_owner(org_id));

-- 4. Inventory Transactions (Audit Log)
create table if not exists public.inventory_transactions (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  item_id uuid references public.inventory_items(id) on delete cascade,
  warehouse_id uuid references public.warehouses(id) on delete cascade,
  type text not null check (type in ('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT')),
  quantity decimal(15, 2) not null,
  unit_price decimal(15, 2), -- Cost at time of transaction
  reason text,
  reference_no text, -- e.g. PO #, Sales #
  performed_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.inventory_transactions enable row level security;

create policy "Members can view transactions." on public.inventory_transactions
  for select using (public.is_org_member(org_id));

create policy "Owners can manage transactions." on public.inventory_transactions
  for all using (public.is_org_owner(org_id));
