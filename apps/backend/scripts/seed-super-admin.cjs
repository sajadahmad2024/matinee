// Seeds (or resets) the first super_admin user.
// Usage: node scripts/seed-super-admin.cjs   (reads DATABASE_URL from .env)
// Override creds with SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
require('dotenv/config');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

(async () => {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const hash = await bcrypt.hash(password, 10);
    const existing = await client.query(
      'SELECT id FROM users WHERE lower(email) = lower($1) AND deleted_at IS NULL',
      [email],
    );
    let userId;
    if (existing.rows.length) {
      userId = existing.rows[0].id;
      await client.query("UPDATE users SET password_hash = $2, status = 'active' WHERE id = $1", [userId, hash]);
    } else {
      const ins = await client.query(
        `INSERT INTO users (account_type, email, password_hash, first_name, primary_auth_method, is_email_verified, status)
         VALUES ('admin', $1, $2, 'Super', 'email', true, 'active') RETURNING id`,
        [email, hash],
      );
      userId = ins.rows[0].id;
    }
    const role = await client.query("SELECT id FROM roles WHERE name = 'super_admin'");
    if (!role.rows.length) {
      throw new Error('super_admin role missing — run migrations first');
    }
    await client.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, role.rows[0].id],
    );
    console.log(`✅ super_admin ready → ${email} / ${password}`);
  } finally {
    await client.end();
  }
})().catch((e) => {
  console.error('seed failed:', e.message);
  process.exit(1);
});
