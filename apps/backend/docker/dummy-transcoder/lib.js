// Shared scaffolding for the transcoder Lambdas (handler.js = dummy, prod-handler.js =
// MediaConvert). Owns everything that must behave identically whatever the transcoder is:
//
//   * SQS batch handling + partial-batch failure reporting
//   * the ATOMIC claim of a media row (status-guarded UPDATE … RETURNING — no check-then-act)
//   * size enforcement (a presigned PUT can't cap Content-Length)
//   * non-video finalization (no transcode needed; the original is the deliverable)
//   * retry semantics: a row is only marked FAILED on the message's LAST delivery attempt;
//     earlier failures just rethrow so SQS redelivers, and the redelivery re-claims the row
//     because it carries the same messageId as `processing_job_id`
//
// Every write is guarded on `deleted_at IS NULL`, so an asset deleted mid-transcode is never
// resurrected. SQL is tagged (`/* tag */`) for readability in pg logs and so the unit tests'
// fake database can dispatch on intent.

const { Client } = require('pg');

const TRANSCODABLE = 'video';

/** S3 URL-encodes keys in event notifications ('+' for space). Returns null if undecodable. */
function decodeS3Key(rawKey) {
  try {
    return decodeURIComponent(String(rawKey).replace(/\+/g, ' '));
  } catch {
    return null;
  }
}

/** The `ObjectCreated:*` uploads inside one SQS message (S3 → SQS notification body). */
function uploadsIn(sqsRecord) {
  let body;
  try {
    body = JSON.parse(sqsRecord.body);
  } catch {
    return []; // not an S3 event (e.g. manual test message) — nothing to do
  }
  return (body?.Records ?? [])
    .filter((r) => r.eventSource === 'aws:s3' && String(r.eventName || '').startsWith('ObjectCreated'))
    .map((r) => ({
      bucket: r.s3?.bucket?.name,
      key: decodeS3Key(r.s3?.object?.key),
      size: Number(r.s3?.object?.size ?? 0),
    }))
    .filter((u) => u.bucket && u.key);
}

async function withTx(db, fn) {
  await db.query('BEGIN');
  try {
    const result = await fn();
    await db.query('COMMIT');
    return result;
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    throw err;
  }
}

function insertEvent(db, mediaId, status, detail, progress) {
  return db.query(
    `/* insert-event */ INSERT INTO media_status_events (media_id, status, detail, progress)
     VALUES ($1, $2, $3, $4)`,
    [mediaId, status, String(detail).slice(0, 500), progress ?? null],
  );
}

/**
 * Admit one uploaded object. Resolves to:
 *   { kind: 'skip' }                 — not ours / already handled / rejected / non-video done
 *   { kind: 'transcode', row, ... }  — a video row now CLAIMED (status=processing,
 *                                      processing_job_id=messageId) by this invocation
 */
async function admitUpload({ db, s3, DeleteObjectCommand, upload, messageId, provider, log }) {
  const { rows } = await db.query(
    `/* select-media */ SELECT id, status, media_type, file_size_bytes, processing_job_id
     FROM media_metadata WHERE storage_key = $1 AND deleted_at IS NULL LIMIT 1`,
    [upload.key],
  );
  const row = rows[0];
  if (!row) {
    log.warn(`[${upload.key}] no media row — skipping`);
    return { kind: 'skip' };
  }
  const isRedelivery = row.status === 'processing' && row.processing_job_id === messageId;
  if (row.status !== 'pending' && row.status !== 'uploaded' && !isRedelivery) {
    log.info(`[${row.id}] status=${row.status} — already handled, skipping`);
    return { kind: 'skip' };
  }

  // Size enforcement: the presigned PUT pinned Content-Type but not Content-Length.
  const declared = row.file_size_bytes === null || row.file_size_bytes === undefined ? null : Number(row.file_size_bytes);
  if (declared !== null && upload.size > declared) {
    await s3.send(new DeleteObjectCommand({ Bucket: upload.bucket, Key: upload.key }));
    await withTx(db, async () => {
      const r = await db.query(
        `/* fail-oversize */ UPDATE media_metadata
         SET status='failed', processing_error=$2, updated_at=NOW()
         WHERE id=$1 AND deleted_at IS NULL AND status IN ('pending','uploaded','processing')
         RETURNING id`,
        [row.id, `uploaded object is ${upload.size} bytes, declared ${declared}`],
      );
      if (r.rows.length) {
        await insertEvent(db, row.id, 'failed', `oversize upload rejected (${upload.size} > ${declared} bytes)`);
      }
    });
    log.warn(`[${row.id}] oversize upload deleted (${upload.size} > ${declared})`);
    return { kind: 'skip' };
  }

  // Non-video: nothing to transcode. The S3 event proves the bytes landed, so finalize here —
  // otherwise an image whose client never called POST /complete would sit PENDING and be
  // destroyed by the orphan sweep.
  if (row.media_type !== TRANSCODABLE) {
    await withTx(db, async () => {
      const r = await db.query(
        `/* ready-non-video */ UPDATE media_metadata
         SET status='ready', is_hls=false, delivery_prefix=storage_key, file_size_bytes=$2,
             upload_completed_at=COALESCE(upload_completed_at, NOW()), processing_progress=100,
             processed_at=NOW(), updated_at=NOW()
         WHERE id=$1 AND deleted_at IS NULL AND status IN ('pending','uploaded')
         RETURNING id`,
        [row.id, upload.size],
      );
      if (r.rows.length) {
        await insertEvent(db, row.id, 'ready', 'object landed (no transcode needed)', 100);
      }
    });
    return { kind: 'skip' };
  }

  // Atomic claim. Two invocations for the same object (SQS duplicate delivery, S3 overwrite)
  // can't both win: the guard is evaluated under the row lock. A redelivery of THIS message
  // re-claims its own PROCESSING row via the processing_job_id match.
  const claimed = await withTx(db, async () => {
    const r = await db.query(
      `/* claim */ UPDATE media_metadata
       SET status='processing', processing_provider=$3, processing_job_id=$2, processing_progress=0,
           processing_error=NULL, file_size_bytes=$4,
           upload_completed_at=COALESCE(upload_completed_at, NOW()), updated_at=NOW()
       WHERE id=$1 AND deleted_at IS NULL
         AND (status IN ('pending','uploaded') OR (status='processing' AND processing_job_id=$2))
       RETURNING id`,
      [row.id, messageId, provider, upload.size],
    );
    if (r.rows.length && !isRedelivery) {
      await insertEvent(db, row.id, 'processing', `${provider} transcode started`, 0);
    }
    return r.rows.length > 0;
  });
  if (!claimed) {
    log.info(`[${row.id}] claimed by another invocation — skipping`);
    return { kind: 'skip' };
  }

  const assetRoot = upload.key.replace(/\/original\/[^/]*$/, '/');
  return { kind: 'transcode', row, assetRoot, outputPrefix: `${assetRoot}hls/` };
}

/** PROCESSING → FAILED, only if this job still owns the row. */
async function failIfOwned(db, { id, jobId, reason }) {
  await withTx(db, async () => {
    const r = await db.query(
      `/* fail-owned */ UPDATE media_metadata
       SET status='failed', processing_error=$3, updated_at=NOW()
       WHERE id=$1 AND status='processing' AND processing_job_id=$2 AND deleted_at IS NULL
       RETURNING id`,
      [id, jobId, String(reason).slice(0, 2000)],
    );
    if (r.rows.length) {
      await insertEvent(db, id, 'failed', reason);
    }
  });
}

let cachedDatabaseUrl;

/**
 * DATABASE_URL straight from env (local/Floci), or — in prod — read from Secrets Manager via
 * DATABASE_URL_SECRET_ID (the app's JSON secret blob, key `DATABASE_URL`) so the connection
 * string never sits in plaintext Lambda config / Terraform state. Cached per warm container.
 */
async function resolveDatabaseUrl(env = process.env) {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }
  if (cachedDatabaseUrl) {
    return cachedDatabaseUrl;
  }
  if (!env.DATABASE_URL_SECRET_ID) {
    throw new Error('DATABASE_URL or DATABASE_URL_SECRET_ID env is required');
  }
  const { GetSecretValueCommand, SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');
  const sm = new SecretsManagerClient({ region: env.AWS_REGION || 'us-east-1' });
  const { SecretString } = await sm.send(new GetSecretValueCommand({ SecretId: env.DATABASE_URL_SECRET_ID }));
  const url = SecretString ? JSON.parse(SecretString).DATABASE_URL : undefined;
  if (!url) {
    throw new Error(`secret ${env.DATABASE_URL_SECRET_ID} has no DATABASE_URL key`);
  }
  cachedDatabaseUrl = url;
  return url;
}

async function openDatabase() {
  const db = new Client({ connectionString: await resolveDatabaseUrl() });
  await db.connect();
  return db;
}

/**
 * Wrap a per-message processor into an SQS batch handler. One DB connection per invocation;
 * failed messages are reported via batchItemFailures (the event source mapping must have
 * `ReportBatchItemFailures` enabled — it does, see infra/floci/lambda.tf).
 */
function createSqsBatchHandler({ openDb, maxReceiveCount, processMessage, log }) {
  return async function handler(event) {
    const batchItemFailures = [];
    const db = await openDb();
    try {
      for (const sqsRecord of event?.Records ?? []) {
        const receiveCount = Number(sqsRecord.attributes?.ApproximateReceiveCount ?? 1);
        const ctx = {
          db,
          messageId: sqsRecord.messageId,
          finalAttempt: receiveCount >= maxReceiveCount,
        };
        try {
          for (const upload of uploadsIn(sqsRecord)) {
            await processMessage(upload, ctx);
          }
        } catch (err) {
          log.error(`[msg ${sqsRecord.messageId}] attempt ${receiveCount}/${maxReceiveCount} failed:`, err);
          batchItemFailures.push({ itemIdentifier: sqsRecord.messageId });
        }
      }
    } finally {
      await db.end().catch(() => {});
    }
    return { batchItemFailures };
  };
}

function consoleLogger() {
  return { info: console.log, warn: console.warn, error: console.error };
}

module.exports = {
  admitUpload,
  consoleLogger,
  createSqsBatchHandler,
  decodeS3Key,
  failIfOwned,
  insertEvent,
  openDatabase,
  resolveDatabaseUrl,
  uploadsIn,
  withTx,
};
