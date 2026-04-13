-- STREAMLINE INITIAL SCHEMA

-- 1. Create table for Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'free',
    user_tier TEXT DEFAULT 'micro',
    subscription_status TEXT DEFAULT 'trialing',
    billing_cycle TEXT DEFAULT 'monthly',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create table for Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id),
    full_name TEXT,
    role TEXT DEFAULT 'member',
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create table for Modules
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- core | addon | premium
    description TEXT,
    monthly_price INTEGER DEFAULT 0,
    quarterly_price INTEGER DEFAULT 0,
    annual_price INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- 4. Create table for Org Modules (Subscription tracking)
CREATE TABLE IF NOT EXISTS org_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    activated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(org_id, module_id)
);

-- 5. Create table for Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    billing_cycle TEXT NOT NULL,
    user_tier TEXT NOT NULL,
    amount_zmw INTEGER NOT NULL,
    starts_at TIMESTAMPTZ DEFAULT now(),
    ends_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    next_billing_date TIMESTAMPTZ
);

-- 6. Create table for Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ENABLE RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES

-- Organizations: Only members of the same org can read
CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Owners and admins can update their organization"
    ON organizations FOR UPDATE
    USING (id IN (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')));

-- Profiles: Members of the same org can view each other
CREATE POLICY "Users can view profiles in the same organization"
    ON profiles FOR SELECT
    USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- Modules: Everyone can read
CREATE POLICY "Modules are viewable by everyone"
    ON modules FOR SELECT
    USING (true);

-- Org Modules: Only members can read/modify
CREATE POLICY "Users can view their organization's modules"
    ON org_modules FOR SELECT
    USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- Subscriptions: Only owners/admins can view/update
CREATE POLICY "Admins can view organization subscriptions"
    ON subscriptions FOR SELECT
    USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')));

-- Audit Logs: Only owners/admins can view
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')));

-- 9. FUNCTIONS & TRIGGERS

-- Trigger for profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'owner');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. SEED DATA FOR MODULES
INSERT INTO modules (name, slug, category, description, monthly_price, quarterly_price, annual_price)
VALUES 
-- Category A - Core
('Finance & Accounting', 'finance-accounting', 'core', 'General ledger, budgeting, ZRA compliance', 1200, 3300, 12000),
('Payroll Management', 'payroll-management', 'core', 'PAYE, NAPSA, NHIMA, payslip automation', 800, 2200, 8000),
('Leave Management', 'leave-management', 'core', 'Leave tracking, approvals, balances', 400, 1100, 4000),
('Performance Management', 'performance-management', 'core', 'KPI tracking, appraisals, 360 feedback', 600, 1600, 6000),
('Procurement Management', 'procurement-management', 'core', 'Requisitions, approvals, supplier tracking', 700, 1900, 7000),
('Inventory Management', 'inventory-management', 'core', 'Stock tracking, alerts, warehouse mgmt', 700, 1900, 7000),
('Fleet Management', 'fleet-management', 'core', 'Fuel tracking, maintenance, vehicle usage', 600, 1600, 6000),

-- Category B - Add-On
('HRIS Full Suite', 'hris-suite', 'addon', 'Employee records, onboarding, contracts', 1000, 2800, 10000),
('Project Management', 'project-management', 'addon', 'Task tracking, timelines, donor reporting', 800, 2200, 8000),
('CRM', 'crm', 'addon', 'Sales pipeline, customer tracking', 900, 2500, 9000),
('Asset Management', 'asset-management', 'addon', 'Fixed asset tracking, depreciation', 500, 1, 1), -- Prices TBD or corrected below
('Document Management', 'document-management', 'addon', 'Secure storage, version control', 600, 1600, 6000),
('Compliance & Audit', 'compliance-audit', 'addon', 'Internal audits, compliance checklists', 700, 1900, 7000),
('E-learning & Training', 'learning-training', 'addon', 'Staff training, onboarding programs', 500, 1400, 5000), -- Suggested price
('Time & Attendance', 'time-attendance', 'addon', 'Biometric/remote clock-in, shift mgmt', 500, 1400, 5000),
('Expense Management', 'expense-management', 'addon', 'Claims, approvals, reimbursements', 500, 1400, 5000),
('BI & Analytics Dashboard', 'bi-analytics', 'addon', 'Real-time insights, KPI dashboards', 1000, 2800, 10000),

-- Category C - Premium
('AI-Powered Insights', 'ai-insights', 'premium', 'Predictive analytics: cash flow, HR performance', 1500, 4200, 15000),
('API Integration Hub', 'api-hub', 'premium', 'Banks, mobile money, external systems', 1200, 3300, 12000),
('Multi-Entity Management', 'multi-entity', 'premium', 'Multi-branch/location corporates', 1500, 4200, 15000)
ON CONFLICT (slug) DO NOTHING;

-- Correct Asset Management price
UPDATE modules SET quarterly_price = 1400, annual_price = 5000 WHERE slug = 'asset-management';
-- 11. Create table for Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'income' | 'expense'
    category TEXT,
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's transactions"
    ON transactions FOR SELECT
    USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage organization transactions"
    ON transactions FOR ALL
    USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')));
