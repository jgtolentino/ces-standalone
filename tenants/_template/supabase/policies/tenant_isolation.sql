-- Tenant isolation policies for template
-- These policies ensure data is properly scoped to the tenant

-- Enable RLS on tenant-specific tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_content ENABLE ROW LEVEL SECURITY;

-- Create tenant-scoped policies for projects table
CREATE POLICY "tenant_projects_access" ON public.projects
    FOR ALL USING (
        tenant_id = (
            SELECT id FROM public.tenants 
            WHERE slug = COALESCE(
                current_setting('app.current_tenant', true),
                (auth.jwt() ->> 'tenant_slug')
            )
        )
    );

-- Create tenant-scoped policies for analytics_events table
CREATE POLICY "tenant_analytics_access" ON public.analytics_events
    FOR ALL USING (
        tenant_id = (
            SELECT id FROM public.tenants 
            WHERE slug = COALESCE(
                current_setting('app.current_tenant', true),
                (auth.jwt() ->> 'tenant_slug')
            )
        )
    );

-- Create tenant-scoped policies for tenant_content table
CREATE POLICY "tenant_content_access" ON public.tenant_content
    FOR ALL USING (
        tenant_id = (
            SELECT id FROM public.tenants 
            WHERE slug = COALESCE(
                current_setting('app.current_tenant', true),
                (auth.jwt() ->> 'tenant_slug')
            )
        )
    );

-- Template-specific data seeding (if needed)
-- INSERT INTO public.tenants (slug, name, settings) VALUES 
--     ('template', 'Template Client', '{"theme": "default", "features": ["analytics", "reports"]}')
-- ON CONFLICT (slug) DO NOTHING;

-- Example: Create sample project for template tenant
-- INSERT INTO public.projects (tenant_id, name, description, status)
-- SELECT 
--     t.id,
--     'Sample Project',
--     'This is a sample project for the template tenant',
--     'active'
-- FROM public.tenants t 
-- WHERE t.slug = 'template'
-- ON CONFLICT DO NOTHING;