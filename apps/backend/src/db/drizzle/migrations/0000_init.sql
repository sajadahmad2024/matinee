-- Database initialization
-- (DB-level audit tables removed; auditing will be added at the app layer later.)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── UUIDv7 generator (time-ordered primary keys) ───────────────────────────
-- Postgres < 18 has no native uuidv7(); this is a portable, RFC-9562-correct
-- implementation: the high 48 bits carry the unix-millisecond timestamp, so keys
-- are time-sortable → sequential B-tree inserts, far better index locality and
-- less page-split/WAL churn than random uuidv4 (gen_random_uuid).
-- On Postgres 18+ this can be replaced by the native uuidv7() with zero change to
-- the on-disk row format (identical layout).
CREATE OR REPLACE FUNCTION uuidv7() RETURNS uuid AS $$
  SELECT encode(
    set_bit(
      set_bit(
        overlay(uuid_send(gen_random_uuid())
                placing substring(int8send(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3)
                FROM 1 FOR 6),
        52, 1),
      53, 1),
    'hex')::uuid;
$$ LANGUAGE sql VOLATILE;
