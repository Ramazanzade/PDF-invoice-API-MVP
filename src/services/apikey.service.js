import crypto from 'crypto';
import { pool } from '../db.js';

function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateApiKey() {
  return 'inv_live_' + crypto.randomBytes(24).toString('hex');
}

export async function createApiKey({ ownerEmail, plan = 'free', monthlyLimit = 100 }) {
  const raw = generateApiKey();
  const keyHash = hashKey(raw);
  const keyPrefix = raw.slice(0, 16);

  await pool.query(
    `INSERT INTO api_keys (key_hash, key_prefix, owner_email, plan, monthly_limit)
     VALUES ($1, $2, $3, $4, $5)`,
    [keyHash, keyPrefix, ownerEmail, plan, monthlyLimit]
  );

  return raw;
}

export async function verifyApiKey(rawKey) {
  const keyHash = hashKey(rawKey);
  const { rows } = await pool.query(
    `SELECT id, plan, monthly_limit, is_active FROM api_keys WHERE key_hash = $1`,
    [keyHash]
  );
  if (rows.length === 0 || !rows[0].is_active) return null;

  const keyRecord = rows[0];
  const month = new Date().toISOString().slice(0, 7);

  const { rows: usageRows } = await pool.query(
    `INSERT INTO usage_log (key_id, month, count)
     VALUES ($1, $2, 1)
     ON CONFLICT (key_id, month) DO UPDATE SET count = usage_log.count + 1
     RETURNING count`,
    [keyRecord.id, month]
  );
  const currentCount = usageRows[0].count;

  if (currentCount > keyRecord.monthly_limit) {
    return { exceeded: true };
  }

  pool.query(`UPDATE api_keys SET last_used_at = now() WHERE id = $1`, [keyRecord.id]).catch(() => {});

  return { ok: true, plan: keyRecord.plan, remaining: keyRecord.monthly_limit - currentCount };
}