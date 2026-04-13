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
