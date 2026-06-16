-- Seed: Admin RBAC — roles, permissions, grants
-- Idempotent — safe to re-run. Extracted from migration 0002 (structure stays in
-- the migration; this data lives here per the seeds-separate-from-migrations rule).
--
-- Customers are identified by users.account_type (guest/customer/admin), NOT a role.
-- Roles + permissions govern the ADMIN panel only.

-- System roles
INSERT INTO roles (name, description, is_system) VALUES
    ('super_admin', 'Full access; can manage admins, roles and permissions', true),
    ('admin',       'Administrative access per assigned permissions',         true)
ON CONFLICT (name) DO NOTHING;

-- Permissions (admin RBAC + per-module permissions added as modules ship)
INSERT INTO permissions (name, description, resource, action) VALUES
    ('admins:read',       'View admin users',                    'admins',      'read'),
    ('admins:write',      'Create and update admins',            'admins',      'write'),
    ('admins:delete',     'Deactivate/revoke admins',            'admins',      'delete'),
    ('roles:read',        'View roles',                          'roles',       'read'),
    ('roles:write',       'Create and update roles',             'roles',       'write'),
    ('roles:delete',      'Delete roles',                        'roles',       'delete'),
    ('permissions:read',  'View permissions',                    'permissions', 'read'),
    ('users:read',        'View customers',                      'users',       'read'),
    ('users:write',       'Update customers',                    'users',       'write'),
    ('users:delete',      'Deactivate customers',                'users',       'delete'),
    ('users:moderate',    'Suspend / ban / reinstate customers', 'users',       'moderate'),
    ('rewards:read',      'View tokenomics config',              'rewards',     'read'),
    ('rewards:write',     'Edit tokenomics config',              'rewards',     'write'),
    ('compliance:read',   'View geo/compliance policy',          'compliance',  'read'),
    ('compliance:write',  'Edit geo/compliance policy',          'compliance',  'write'),
    -- Content module
    ('content:read',      'View content',                        'content',     'read'),
    ('content:write',     'Create and update content',           'content',     'write'),
    ('content:publish',   'Approve, publish and reject content', 'content',     'publish')
ON CONFLICT (name) DO NOTHING;

-- super_admin → ALL permissions. Re-applied on every seed so module-added
-- permissions (content:*, future modules) are always covered.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- admin → manage customers + rewards, read-only on admin/role config
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin'
  AND p.name IN ('admins:read','roles:read','permissions:read',
                 'users:read','users:write','users:delete','users:moderate',
                 'rewards:read','rewards:write','compliance:read')
ON CONFLICT DO NOTHING;
