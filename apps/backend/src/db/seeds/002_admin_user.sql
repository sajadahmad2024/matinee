-- Seed: Default super-admin user
-- Idempotent — skips if admin@example.com already exists.
--
-- Default credentials:
--   Email:    admin@example.com
--   Password: Admin@123456
--
-- password_hash below is bcrypt($2b$10$) for "Admin@123456".
-- Regenerate with: node -e "require('bcrypt').hash('Admin@123456',10).then(console.log)"
-- Requires 001_roles_permissions.sql (super_admin role) to have run first.

DO $$
DECLARE
  v_admin_id UUID;
  v_role_id  UUID;
  v_hash     TEXT := '$2b$10$wAHn/5vn3.QH65czdOXa5OvdyzFCIdbM/n.cXdvEBiRNrb41iy0ba';
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com') THEN
    RAISE NOTICE 'Admin user already exists, skipping';
    RETURN;
  END IF;

  INSERT INTO users (email, password_hash, first_name, last_name,
                     account_type, status, is_email_verified)
  VALUES ('admin@example.com', v_hash, 'Super', 'Admin',
          'admin', 'active', true)
  RETURNING id INTO v_admin_id;

  SELECT id INTO v_role_id FROM roles WHERE name = 'super_admin';
  IF v_role_id IS NULL THEN
    RAISE WARNING 'super_admin role not found — run 001_roles_permissions.sql first';
    RETURN;
  END IF;

  INSERT INTO user_roles (user_id, role_id)
  VALUES (v_admin_id, v_role_id)
  ON CONFLICT DO NOTHING;
  RAISE NOTICE 'Super-admin user created and assigned super_admin role';
END $$;
