-- Enable RLS on all tables by default
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;

-- Create tenant table
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
    name TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Tenant access policy (users can only see their own tenant)
CREATE POLICY tenant_access ON public.tenants
    FOR ALL USING (
        slug = COALESCE(
            current_setting('app.current_tenant', true),
            (auth.jwt() ->> 'tenant_slug')
        )
    );

-- Function to set tenant context
CREATE OR REPLACE FUNCTION public.set_tenant_context(tenant_slug TEXT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant', tenant_slug, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current tenant
CREATE OR REPLACE FUNCTION public.get_current_tenant()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('app.current_tenant', true),
        (auth.jwt() ->> 'tenant_slug')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial tenants
INSERT INTO public.tenants (slug, name) VALUES
    ('ces', 'Campaign Effectiveness Suite'),
    ('scout', 'Scout Analytics'),
    ('acme', 'ACME Corporation'),
    ('tenant4', 'Tenant 4'),
    ('tenant5', 'Tenant 5'),
    ('tenant23', 'Tenant 23');

-- Create example tenant-scoped table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects can only be accessed by their tenant
CREATE POLICY projects_tenant_access ON public.projects
    FOR ALL USING (
        tenant_id IN (
            SELECT id FROM public.tenants 
            WHERE slug = public.get_current_tenant()
        )
    );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();